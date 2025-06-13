import { db } from '../config/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export async function giftCoolPoint(senderId: string, recipientId: string) {
  if (senderId === recipientId) throw new Error('Cannot gift to yourself');
  // Check sender's balance
  const senderDoc = await getDoc(doc(db, 'users', senderId));
  if (!senderDoc.exists() || (senderDoc.data().coolPointsBalance ?? 0) < 1) {
    throw new Error('Insufficient Cool Points balance');
  }
  // Decrease sender's balance
  await updateDoc(doc(db, 'users', senderId), {
    coolPointsBalance: increment(-1)
  });
  // Increase recipient's public points
  await updateDoc(doc(db, 'users', recipientId), {
    coolPointsPublic: increment(1)
  });
  // Log transaction
  await addDoc(collection(db, 'coolPointsTransactions'), {
    from: senderId,
    to: recipientId,
    type: 'gift',
    amount: 1,
    timestamp: serverTimestamp()
  });
} 