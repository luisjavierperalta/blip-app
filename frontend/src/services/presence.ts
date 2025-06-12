import { database } from '../config/firebase';
import { ref, onDisconnect, serverTimestamp, onValue } from 'firebase/database';
import { auth } from '../config/firebase';

export const setupPresence = () => {
  if (!auth.currentUser) return;

  const userStatusRef = ref(database, `status/${auth.currentUser.uid}`);
  const isOfflineForDatabase = {
    state: 'offline',
    lastChanged: serverTimestamp(),
  };
  const isOnlineForDatabase = {
    state: 'online',
    lastChanged: serverTimestamp(),
  };

  // Create a reference to the special '.info/connected' path in Firebase Realtime Database
  const connectedRef = ref(database, '.info/connected');
  
  onValue(connectedRef, (snap) => {
    if (snap.val() === false) {
      return;
    }

    // If we're connected, set up the presence system
    onDisconnect(userStatusRef).set(isOfflineForDatabase).then(() => {
      // When we're online, set the status to online
      userStatusRef.set(isOnlineForDatabase);
    });
  });
};

export const subscribeToUserStatus = (userId: string, callback: (isOnline: boolean) => void) => {
  const userStatusRef = ref(database, `status/${userId}`);
  
  return onValue(userStatusRef, (snapshot) => {
    const status = snapshot.val();
    callback(status?.state === 'online');
  });
}; 