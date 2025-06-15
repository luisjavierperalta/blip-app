export const getActivityInfo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    // Get the user's active activity from Firestore
    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null; // No active activity found
    }

    const activityDoc = snapshot.docs[0];
    const activityData = activityDoc.data();

    return {
      id: activityDoc.id,
      type: activityData.type,
      location: activityData.location,
      desc: activityData.desc,
      photos: activityData.photos || [],
      icon: activityData.icon,
      timestamp: activityData.timestamp,
      expiresAt: activityData.expiresAt,
      participants: activityData.participants || [],
      maxParticipants: activityData.maxParticipants || 4,
      isActive: activityData.isActive
    };
  } catch (error) {
    console.error('Error fetching activity info:', error);
    throw new functions.https.HttpsError('internal', 'Error fetching activity information');
  }
});

export const joinActivity = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { activityId, userId, currentUserLocation } = data;
  const currentUserId = context.auth.uid;

  try {
    // Get the activity document
    const activityRef = db.collection('activities').doc(activityId);
    const activityDoc = await activityRef.get();

    if (!activityDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Activity not found');
    }

    const activityData = activityDoc.data();

    // Check if activity is active
    if (!activityData?.isActive) {
      throw new functions.https.HttpsError('failed-precondition', 'Activity is not active');
    }

    // Check if user is already a participant
    if (activityData.participants?.includes(currentUserId)) {
      throw new functions.https.HttpsError('already-exists', 'User is already a participant');
    }

    // Check if activity is full
    if (activityData.participants?.length >= activityData.maxParticipants) {
      throw new functions.https.HttpsError('resource-exhausted', 'Activity is full');
    }

    // Create a join request
    const requestRef = await db.collection('joinRequests').add({
      activityId,
      requesterId: currentUserId,
      requesterLocation: currentUserLocation,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create a notification for the activity creator
    await db.collection('notifications').add({
      userId,
      type: 'activity_join_request',
      message: `${context.auth.token.name || 'Someone'} wants to join your activity`,
      activityId,
      requestId: requestRef.id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      requestId: requestRef.id
    };
  } catch (error) {
    console.error('Error creating join request:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create join request');
  }
});

export const checkJoinRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { requestId } = data;

  try {
    const requestRef = db.collection('joinRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Join request not found');
    }

    const requestData = requestDoc.data();

    // Check if the request is for the current user
    if (requestData?.requesterId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to check this request');
    }

    if (requestData.status === 'approved') {
      // Get the route data if approved
      const routeRef = await db.collection('privateRoutes').doc(requestData.routeId);
      const routeDoc = await routeRef.get();
      const routeData = routeDoc.data();

      return {
        status: 'approved',
        routeData
      };
    }

    return {
      status: requestData.status
    };
  } catch (error) {
    console.error('Error checking join request:', error);
    throw new functions.https.HttpsError('internal', 'Failed to check join request status');
  }
});

// Add function to handle join request approval/rejection
export const handleJoinRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { requestId, action } = data;

  try {
    const requestRef = db.collection('joinRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Join request not found');
    }

    const requestData = requestDoc.data();

    // Check if the user is the activity creator
    const activityRef = db.collection('activities').doc(requestData.activityId);
    const activityDoc = await activityRef.get();
    const activityData = activityDoc.data();

    if (activityData.creatorId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to handle this request');
    }

    if (action === 'approve') {
      // Get the requester's location
      const requesterLocation = requestData.requesterLocation;

      // Get the creator's location
      const creatorRef = db.collection('users').doc(context.auth.uid);
      const creatorDoc = await creatorRef.get();
      const creatorData = creatorDoc.data();

      if (!creatorData?.location) {
        throw new functions.https.HttpsError('failed-precondition', 'Creator location not available');
      }

      // Create a private route
      const routeData = {
        start: {
          lat: requesterLocation.latitude,
          lng: requesterLocation.longitude
        },
        end: {
          lat: creatorData.location.latitude,
          lng: creatorData.location.longitude
        },
        participants: [requestData.requesterId, context.auth.uid],
        activityId: requestData.activityId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const routeRef = await db.collection('privateRoutes').add(routeData);

      // Update the request status
      await requestRef.update({
        status: 'approved',
        routeId: routeRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update activity participants
      await activityRef.update({
        participants: admin.firestore.FieldValue.arrayUnion(requestData.requesterId)
      });

      // Create notification for requester
      await db.collection('notifications').add({
        userId: requestData.requesterId,
        type: 'activity_join_approved',
        message: `${creatorData.displayName} approved your join request`,
        activityId: requestData.activityId,
        routeId: routeRef.id,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        status: 'approved',
        routeData
      };
    } else if (action === 'reject') {
      // Update the request status
      await requestRef.update({
        status: 'rejected',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create notification for requester
      await db.collection('notifications').add({
        userId: requestData.requesterId,
        type: 'activity_join_rejected',
        message: `${creatorData.displayName} rejected your join request`,
        activityId: requestData.activityId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        status: 'rejected'
      };
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid action');
    }
  } catch (error) {
    console.error('Error handling join request:', error);
    throw new functions.https.HttpsError('internal', 'Failed to handle join request');
  }
});

// Cool Points Functions
export const getCoolPointsBalance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    return {
      balance: userData?.coolPoints || 0
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error fetching balance');
  }
});

export const getCoolPointsTransactions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const transactionsSnapshot = await admin.firestore()
      .collection('coolPointsTransactions')
      .where('participants', 'array-contains', context.auth.uid)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const transactions = await Promise.all(transactionsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const senderDoc = await admin.firestore().collection('users').doc(data.senderId).get();
      const recipientDoc = await admin.firestore().collection('users').doc(data.recipientId).get();

      return {
        id: doc.id,
        type: data.senderId === context.auth.uid ? 'sent' : 'received',
        amount: data.amount,
        senderName: senderDoc.data()?.displayName || 'Unknown User',
        recipientName: recipientDoc.data()?.displayName || 'Unknown User',
        timestamp: data.timestamp.toDate()
      };
    }));

    return { transactions };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error fetching transactions');
  }
});

export const sendCoolPoints = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { recipientId, amount } = data;

  if (!recipientId || !amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid recipient or amount');
  }

  const db = admin.firestore();
  const batch = db.batch();

  try {
    // Get sender's document
    const senderDoc = await db.collection('users').doc(context.auth.uid).get();
    const senderData = senderDoc.data();

    if (!senderData) {
      throw new functions.https.HttpsError('not-found', 'Sender not found');
    }

    // Check if sender has enough points
    if ((senderData.coolPoints || 0) < amount) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient Cool Points');
    }

    // Get recipient's document
    const recipientDoc = await db.collection('users').doc(recipientId).get();
    const recipientData = recipientDoc.data();

    if (!recipientData) {
      throw new functions.https.HttpsError('not-found', 'Recipient not found');
    }

    // Update sender's balance
    batch.update(senderDoc.ref, {
      coolPoints: admin.firestore.FieldValue.increment(-amount)
    });

    // Update recipient's balance
    batch.update(recipientDoc.ref, {
      coolPoints: admin.firestore.FieldValue.increment(amount)
    });

    // Create transaction record
    const transactionRef = db.collection('coolPointsTransactions').doc();
    batch.set(transactionRef, {
      senderId: context.auth.uid,
      recipientId,
      amount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      participants: [context.auth.uid, recipientId]
    });

    // Commit the batch
    await batch.commit();

    // Send notification to recipient
    await admin.firestore().collection('notifications').add({
      userId: recipientId,
      type: 'coolPoints',
      title: 'Received Cool Points',
      message: `${senderData.displayName} sent you ${amount} Cool Points`,
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error sending Cool Points');
  }
}); 