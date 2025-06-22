import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLajgrkgr5ux8PU4QZeL2HOQdEDAQqumE",
  authDomain: "jendral-le-veteran.firebaseapp.com",
  projectId: "jendral-le-veteran",
  storageBucket: "jendral-le-veteran.appspot.com",
  messagingSenderId: "943113910198",
  appId: "1:943113910198:web:fdd2ee6f02fc06ba10f317",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export {
  app,
  auth,
  db,
  provider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
};
