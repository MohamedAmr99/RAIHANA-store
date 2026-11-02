import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyArdUDl9W-ME-oQhQ9_SQZ7bxvM3SSKuAU",
  authDomain: "raihanaperfume1.firebaseapp.com",
  projectId: "raihanaperfume1",
  storageBucket: "raihanaperfume1.firebasestorage.app",
  messagingSenderId: "613280478466",
  appId: "1:613280478466:web:e0e078e72c1823cc8afe1b",
  measurementId: "G-03GJ8KRQHX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
