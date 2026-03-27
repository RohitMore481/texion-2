import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0mD35TpYreYs6hmFc-WpLLTeaCZdrlvU",
  authDomain: "hackathon-d3836.firebaseapp.com",
  projectId: "hackathon-d3836",
  storageBucket: "hackathon-d3836.firebasestorage.app",
  messagingSenderId: "777950914190",
  appId: "1:777950914190:web:4306235349a144a13e4bdf",
  measurementId: "G-66TNHBCQ8T"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// This line is needed to use Authentication in the app!
export const auth = getAuth(app);