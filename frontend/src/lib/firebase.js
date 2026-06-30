import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkgN3ni_EK4WB0VUjw2nPjf8Fzz_FWJVo",
  authDomain: "ai-code-review-assistant-7433a.firebaseapp.com",
  projectId: "ai-code-review-assistant-7433a",
  storageBucket: "ai-code-review-assistant-7433a.firebasestorage.app",
  messagingSenderId: "942610062107",
  appId: "1:942610062107:web:14a6ac9dcc3a9c1dd8d1be",
  measurementId: "G-WW7QTD5WED"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export default app;
