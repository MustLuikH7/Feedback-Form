import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

// Vastajad on anonüümsed, aga Firestore reeglid nõuavad sisselogimist,
// seega logime iga külastaja vaikselt anonüümselt sisse.
async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}

export async function saveFeedback({
  subject,
  teacher,
  grade,
  comment,
  firstName,
  lastName,
}) {
  const user = await ensureSignedIn();
  await addDoc(collection(db, "feedback"), {
    subject,
    teacher,
    grade,
    comment,
    firstName,
    lastName,
    uid: user.uid,
    createdAt: serverTimestamp(),
  });
}
