    // sw-build.js
    const fs = require('fs');
    const path = require('path');
    require('dotenv').config()


const firebaseConfig = {
    apiKey: `${process.env.VITE_FIREBASE_API_KEY}`,
    authDomain: "tcc-ti-informa.firebaseapp.com",
    projectId: "tcc-ti-informa",
    storageBucket: "tcc-ti-informa.firebasestorage.app",
    messagingSenderId: "324379151752",
    appId: "1:324379151752:web:91aa1c55c4bc20c2737e3d",
    measurementId: "G-S5YRSQJ5QN"
  };

    const swContent = `
importScripts("https://cdnjs.cloudflare.com/ajax/libs/firebase/10.11.1/firebase-app-compat.min.js");
importScripts("https://cdnjs.cloudflare.com/ajax/libs/firebase/10.11.1/firebase-messaging-compat.min.js");
const firebaseConfig = ${JSON.stringify(firebaseConfig)};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage (function(payload) {
    console.log(payload);
   
    const notification = JSON.parse(payload);
    const notificationOption = {
        body: notification.body,
        icon: notification.icon
    };
    return self.registration.showNotification(payload.notification.title, notificationOption);
});

    `;

    fs.writeFileSync(path.join(__dirname, 'public', 'firebase-messaging-sw.js'), swContent);