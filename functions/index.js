/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Email/Password Signup
exports.createUser = onCall(async (data, context) => {
  try {
    const { email, password, username, phoneNumber } = data;

    // Create user with email and password
    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber,
      displayName: username,
    });

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      username,
      phoneNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      verified: false,
      profileComplete: false,
      available: true,
      active: true,
      coolPointsBalance: 500,  // Default cool points balance
      coolPointsPublic: 0      // Public cool points start at 0
    });

    return {
      success: true,
      uid: userRecord.uid
    };
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Phone Verification
exports.verifyPhoneNumber = onCall(async (data, context) => {
  try {
    const { phoneNumber, verificationCode } = data;
    const uid = context.auth.uid;

    // Verify the phone number
    const userRecord = await admin.auth().getUser(uid);
    
    if (userRecord.phoneNumber === phoneNumber) {
      // Update user verification status in Firestore
      await admin.firestore().collection('users').doc(uid).update({
        verified: true,
        phoneVerified: true
      });

      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    } else {
      throw new Error('Phone number does not match');
    }
  } catch (error) {
    logger.error('Error verifying phone number:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Update User Profile
exports.updateUserProfile = onCall(async (data, context) => {
  try {
    const { username, phoneNumber, available, active } = data;
    const uid = context.auth.uid;

    // Build update object
    const updateObj = {
      username,
      phoneNumber,
      profileComplete: true
    };
    if (typeof available === 'boolean') updateObj.available = available;
    if (typeof active === 'boolean') updateObj.active = active;

    // Update user profile in Firestore
    await admin.firestore().collection('users').doc(uid).update(updateObj);

    // Update user in Auth
    await admin.auth().updateUser(uid, {
      displayName: username,
      phoneNumber
    });

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    logger.error('Error updating profile:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Delete User Account
exports.deleteUserAccount = onCall(async (data, context) => {
  try {
    const uid = context.auth.uid;

    // Delete user from Auth
    await admin.auth().deleteUser(uid);

    // Delete user data from Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    logger.error('Error deleting account:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Utility to calculate distance between two lat/lon points in meters
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Callable function to get user counts by range
exports.getUserCountsByRange = onCall(async (data, context) => {
  try {
    const { filter, lat, lon } = data;
    const uid = context.auth.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'User must be authenticated');
    if (!lat || !lon || !filter) throw new HttpsError('invalid-argument', 'Missing lat/lon/filter');

    // Define filter radius in meters
    let filterRadius = 300;
    if (filter === '25km') filterRadius = 25000;
    else if (filter === '1000km') filterRadius = 1000000;

    // Query all users except the current user
    const usersSnap = await admin.firestore().collection('users').where('uid', '!=', uid).get();
    let available = 0;
    let active = 0;
    usersSnap.forEach(doc => {
      const user = doc.data();
      if (!user.location || typeof user.location.latitude !== 'number' || typeof user.location.longitude !== 'number') return;
      const d = getDistanceFromLatLonInMeters(lat, lon, user.location.latitude, user.location.longitude);
      if (d > filterRadius) return;
      if (user.available) available++;
      if (user.active) active++;
    });
    return { available, active };
  } catch (error) {
    logger.error('Error in getUserCountsByRange:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Gift Cool Point Callable Function
exports.giftCoolPoint = onCall(async (data, context) => {
  try {
    const senderId = context.auth && context.auth.uid;
    const recipientId = data.recipientId;
    if (!senderId) throw new HttpsError('unauthenticated', 'User must be authenticated');
    if (!recipientId || senderId === recipientId) throw new HttpsError('invalid-argument', 'Invalid recipient');

    const senderRef = admin.firestore().collection('users').doc(senderId);
    const recipientRef = admin.firestore().collection('users').doc(recipientId);
    const senderSnap = await senderRef.get();
    if (!senderSnap.exists) throw new HttpsError('not-found', 'Sender not found');
    const senderData = senderSnap.data();
    const senderBalance = senderData.coolPointsBalance || 0;
    if (senderBalance < 1) throw new HttpsError('failed-precondition', 'Insufficient Cool Points balance');

    // Use a transaction for atomicity
    await admin.firestore().runTransaction(async (t) => {
      // Re-fetch inside transaction
      const freshSenderSnap = await t.get(senderRef);
      const freshSenderBalance = (freshSenderSnap.data().coolPointsBalance || 0);
      if (freshSenderBalance < 1) throw new HttpsError('failed-precondition', 'Insufficient Cool Points balance');
      t.update(senderRef, { coolPointsBalance: admin.firestore.FieldValue.increment(-1) });
      t.update(recipientRef, { coolPointsPublic: admin.firestore.FieldValue.increment(1) });
      t.set(admin.firestore().collection('coolPointsTransactions').doc(), {
        from: senderId,
        to: recipientId,
        type: 'gift',
        amount: 1,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return { success: true };
  } catch (error) {
    logger.error('Error gifting cool point:', error);
    throw new HttpsError(error.code || 'internal', error.message);
  }
});
