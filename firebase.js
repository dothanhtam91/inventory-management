// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnHzcBwulDa69xl1PeVe7pSo3m0YyKd2w",
  authDomain: "inventory-management-b0162.firebaseapp.com",
  projectId: "inventory-management-b0162",
  storageBucket: "inventory-management-b0162.appspot.com",
  messagingSenderId: "816943446424",
  appId: "1:816943446424:web:f6a30f2fb21f2419ae13ed",
  measurementId: "G-QZW00X1HBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}