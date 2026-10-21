import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  limit,
  where, // Tambahan: untuk filter komentar berdasarkan epId
} from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!config.apiKey;

function getFirebase() {
  if (!isFirebaseConfigured) return null;
  const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  return { auth: getAuth(app), db: getFirestore(app) };
}

async function getDbAndUid() {
  const fb = getFirebase();
  if (!fb) return null;
  if (fb.auth.currentUser) return { db: fb.db, uid: fb.auth.currentUser.uid };

  try {
    const cred = await signInAnonymously(fb.auth);
    return { db: fb.db, uid: cred.user.uid };
  } catch {
    return null;
  }
}

// Tipe data komentar agar TypeScript tidak protes
export interface CommentData {
  id: string;
  text: string;
  userId: string;
  createdAt: { seconds: number } | null;
}

export async function syncFavorite(id: number, isFav: boolean, snap: Record<string, unknown>) {
  const conn = await getDbAndUid();
  if (!conn) return;
  const ref = doc(conn.db, "users", conn.uid, "favorites", String(id));
  if (isFav) await setDoc(ref, { ...snap, addedAt: serverTimestamp() });
  else await deleteDoc(ref);
}

export async function syncStatus(id: number, status: string | null, snap: Record<string, unknown>) {
  const conn = await getDbAndUid();
  if (!conn) return;
  const ref = doc(conn.db, "users", conn.uid, "watchlist", String(id));
  if (status) await setDoc(ref, { ...snap, status, updatedAt: serverTimestamp() });
  else await deleteDoc(ref);
}

export async function syncHistory(animeId: number, ep: number, title: string, poster: string) {
  const conn = await getDbAndUid();
  if (!conn) return;
  const ref = doc(conn.db, "users", conn.uid, "history", String(animeId));
  await setDoc(ref, { animeId, ep, title, poster, updatedAt: serverTimestamp() });
}

export async function syncWatched(epId: string, isWatched: boolean) {
  const conn = await getDbAndUid();
  if (!conn) return;
  const ref = doc(conn.db, "users", conn.uid, "watched", epId);
  if (isWatched) await setDoc(ref, { watched: true, updatedAt: serverTimestamp() });
  else await deleteDoc(ref);
}

export async function sendReport(epId: string, animeId: number, reason: string) {
  const conn = await getDbAndUid();
  if (!conn) return;
  await addDoc(collection(conn.db, "reports"), {
    epId, animeId, reason, userId: conn.uid, createdAt: serverTimestamp()
  });
}

export async function sendComment(epId: string, text: string) {
  const conn = await getDbAndUid();
  if (!conn) return;
  await addDoc(collection(conn.db, "comments"), {
    epId, text, userId: conn.uid, createdAt: serverTimestamp()
  });
}

// Diperbaiki: Mengembalikan Promise<CommentData[]> agar sesuai dengan state di page.tsx
export async function fetchComments(epId: string): Promise<CommentData[]> {
  const conn = await getDbAndUid();
  if (!conn) return [];
  
  const q = query(
    collection(conn.db, "comments"),
    where("epId", "==", epId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentData));
}
