// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxU2E_vnEHRb5jrwA1u_ANO-LjCFWa_nw",
  authDomain: "nakoda-455e3.firebaseapp.com",
  databaseURL: "https://nakoda-455e3-default-rtdb.firebaseio.com",
  projectId: "nakoda-455e3",
  storageBucket: "nakoda-455e3.appspot.com",
  messagingSenderId: "184815183843",
  appId: "1:184815183843:web:b67e8fd2df765cbdc1e2d6",
  measurementId: "G-J6Z8BFFQDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);