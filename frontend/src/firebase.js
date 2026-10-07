import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(config);

const auth = getAuth(app);
auth.languageCode = "et";
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

// Õpetajavaade

export function onUserChanged(callback) {
  return onAuthStateChanged(auth, (user) =>
    callback(user && !user.isAnonymous ? user : null),
  );
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function getStaff(uid) {
  const snapshot = await getDoc(doc(db, "staff", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function listFeedback(staff) {
  const feedback = collection(db, "feedback");
  const snapshot = await getDocs(
    staff.role === "admin"
      ? feedback
      : query(feedback, where("teacher", "==", staff.teacher)),
  );
  return snapshot.docs
    .map((entry) => ({
      ...entry.data(),
      id: entry.id,
      createdAt: entry.data().createdAt?.toDate() ?? null,
    }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function deleteFeedback(id) {
  return deleteDoc(doc(db, "feedback", id));
}

export async function listStaff() {
  const snapshot = await getDocs(collection(db, "staff"));
  return snapshot.docs
    .map((entry) => ({ ...entry.data(), id: entry.id }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

// Konto luuakse eraldi Firebase'i rakenduse kaudu, et admin ei logiks
// uue kasutaja loomisel ise välja. Õpetaja saab e-kirja parooli määramiseks.
let secondaryAuth;

export async function createStaffAccount({ email, teacher, role }) {
  secondaryAuth ??= getAuth(initializeApp(config, "account-creation"));
  const password = crypto.randomUUID() + crypto.randomUUID();
  const { user } = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    password,
  );
  await firebaseSignOut(secondaryAuth);
  await setDoc(doc(db, "staff", user.uid), { email, teacher, role });
  await sendPasswordResetEmail(auth, email);
}
