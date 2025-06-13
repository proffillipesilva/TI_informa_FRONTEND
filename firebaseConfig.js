// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByZJ5AyuPrJ_26VK5eINVh3Vvam57qpRA",
  authDomain: "ti-informa.firebaseapp.com",
  projectId: "ti-informa",
  storageBucket: "ti-informa.firebasestorage.app",
  messagingSenderId: "317224524006",
  appId: "1:317224524006:web:fc53a1fbd9ec153b060327",
  measurementId: "G-2CYS5JZX0T"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { app, analytics };
