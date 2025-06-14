import { db } from '../config/firebase';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

export type ConnectionStatus = 'pending' | 'connected' | 'none';

export async function sendConnectionRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) throw new Error('Cannot connect with yourself');

  // Check if connection already exists
  const connectionStatus = await getConnectionStatus(senderId, receiverId);
  if (connectionStatus !== 'none') {
    throw new Error('Connection request already exists');
  }

  // Add to pending connections
  await updateDoc(doc(db, 'users', receiverId), {
    pendingConnections: arrayUnion(senderId)
  });

  // Create notification
  await addDoc(collection(db, 'notifications'), {
    type: 'connection_request',
    from: senderId,
    to: receiverId,
    status: 'unread',
    timestamp: serverTimestamp()
  });
}

export async function acceptConnectionRequest(acceptorId: string, senderId: string) {
  // Remove from pending
  await updateDoc(doc(db, 'users', acceptorId), {
    pendingConnections: arrayRemove(senderId)
  });

  // Add to connections for both users
  await updateDoc(doc(db, 'users', acceptorId), {
    connections: arrayUnion(senderId)
  });
  await updateDoc(doc(db, 'users', senderId), {
    connections: arrayUnion(acceptorId)
  });

  // Create notification for sender
  await addDoc(collection(db, 'notifications'), {
    type: 'connection_accepted',
    from: acceptorId,
    to: senderId,
    status: 'unread',
    timestamp: serverTimestamp()
  });
}

export async function rejectConnectionRequest(rejectorId: string, senderId: string) {
  await updateDoc(doc(db, 'users', rejectorId), {
    pendingConnections: arrayRemove(senderId)
  });
}

export async function removeConnection(userId: string, connectionId: string) {
  // Remove connection from both users
  await updateDoc(doc(db, 'users', userId), {
    connections: arrayRemove(connectionId)
  });
  await updateDoc(doc(db, 'users', connectionId), {
    connections: arrayRemove(userId)
  });
}

export async function getConnectionStatus(userId: string, otherUserId: string): Promise<ConnectionStatus> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();

  if (!userData) return 'none';

  if (userData.connections?.includes(otherUserId)) {
    return 'connected';
  }

  if (userData.pendingConnections?.includes(otherUserId)) {
    return 'pending';
  }

  return 'none';
}

export async function getConnectionCount(userId: string): Promise<number> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  return userData?.connections?.length || 0;
}

export async function getPendingConnectionCount(userId: string): Promise<number> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  return userData?.pendingConnections?.length || 0;
}

export async function getConnections(userId: string): Promise<string[]> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  return userData?.connections || [];
}

export async function getPendingConnections(userId: string): Promise<string[]> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  return userData?.pendingConnections || [];
} 