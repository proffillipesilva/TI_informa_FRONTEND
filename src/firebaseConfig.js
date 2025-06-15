// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {getMessaging, getToken, onMessage} from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // ou process.env.REACT_APP_FIREBASE_API_KEY
    authDomain: "tcc-ti-informa.firebaseapp.com",
    projectId: "tcc-ti-informa",
    storageBucket: "tcc-ti-informa.firebasestorage.app",
    messagingSenderId: "324379151752",
    appId: "1:324379151752:web:91aa1c55c4bc20c2737e3d",
    measurementId: "G-S5YRSQJ5QN"
  };
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const myGetToken = (setTokenFound) => {
//    return getToken(messaging, {vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY}).then((currentToken) => {   // isso pega os dados de fcmToken do Firebase
  return getToken(messaging, {vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY}).then((currentToken) => {   // isso pega os dados de fcmToken do Firebase
      if (currentToken) {
          console.log('current token for client: ', currentToken);
          setTokenFound(true);
          return currentToken;
      } else {
          console.log('No registration token available. Request permission to generate one.');
          setTokenFound(false);
          // shows on the UI that permission is required
      }
      
  }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      // catch error while creating client token
  });
}

export const onMessageListener = () =>
  new Promise((resolve) => {
      onMessage(messaging, (payload) => {
          console.log('Message received:', payload);
          /* Caso quiser toast quando a notificacao do Firebase chegar
          toast.success(payload.notification.body, {
              duration: 4000,
              position: "top-center",
          })
              */
             /* Caso quiser modal quando a notificacao do Firebase chegar
          modal.success(payload.notification.body, {
              duration: 4000,
              position: "top-center",
          })
              */
          resolve(payload);
          
      });
  });

const analytics = getAnalytics(firebaseApp);


export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export { firebaseApp, analytics };
