import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAoOH7TtxrJ-5FI-v3vDtJQnu8IxzRuses",
  authDomain: "masai-44985.firebaseapp.com",
  databaseURL:
    "https://masai-44985-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "masai-44985",
  storageBucket: "masai-44985.firebasestorage.app",
  messagingSenderId: "479552361094",
  appId: "1:479552361094:web:0b8b53a69dedd9e6ed7707",
  measurementId: "G-0ZMXJEKGFW",
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
