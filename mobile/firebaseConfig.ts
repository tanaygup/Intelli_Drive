// mobile/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhiu-R1Zt7PyRHPh5u2yKFRVjQoe1gvVg",
  authDomain: "intellidrive-4483a.firebaseapp.com",
  projectId: "intellidrive-4483a",
  storageBucket: "intellidrive-4483a.firebasestorage.app",
  messagingSenderId: "657200573675",
  appId: "1:657200573675:web:cdca4f1b94e654f139a2ae",
  measurementId: "G-SV8H57W5VM",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);