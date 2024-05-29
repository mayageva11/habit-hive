// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDW74ENS7ffAePchiRKQZe7AS5xtH49sbY",
  authDomain: "habithive-92885.firebaseapp.com",
  projectId: "habithive-92885",
  storageBucket: "habithive-92885.appspot.com",
  messagingSenderId: "564782985155",
  appId: "1:564782985155:web:039fcc4df765ad86bb5776",
  measurementId: "G-E00G86RKE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = firebase.auth();
const firestore = firebase.firestore();

export { auth, firestore };