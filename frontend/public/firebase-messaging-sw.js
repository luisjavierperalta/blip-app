// [START initialize_firebase_in_sw]
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAg6SwC5kbj1ysZojQ4TMnjV4g4p0knLxY",
  authDomain: "blip-cc1f9.firebaseapp.com",
  projectId: "blip-cc1f9",
  storageBucket: "blip-cc1f9.appspot.com",
  messagingSenderId: "315439687670",
  appId: "1:315439687670:web:81831e4b709083483789d7",
  measurementId: "G-8L0V3V46KV"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
// [END initialize_firebase_in_sw] 