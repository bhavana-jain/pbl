// Import the functions you need from the SDKs you need
import {firebase, initializeApp} from "firebase/app";
import "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxU2E_vnEHRb5jrwA1u_ANO-LjCFWa_nw",
  authDomain: "nakoda-455e3.firebaseapp.com",
  databaseURL: "https://nakoda-455e3-default-rtdb.firebaseio.com",
  projectId: "nakoda-455e3",
  storageBucket: "nakoda-455e3.appspot.com",
  messagingSenderId: "184815183843",
  appId: "1:184815183843:web:2073ab18c5f12ef1c1e2d6",
  measurementId: "G-090RHN3ZW5"
};

// Initialize Firebase
const firebaseCo = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default firebaseCo;


