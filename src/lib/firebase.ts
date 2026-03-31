import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, browserLocalPersistence, setPersistence } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { Exercise, WorkoutTemplate, WorkoutLog } from '../types';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const auth = getAuth(app);

// ── Auth ───────────────────────────────────────────────────────────────────

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const LOGIN_TIME_KEY = 'workout-app:login-time';
const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL as string;

setPersistence(auth, browserLocalPersistence);

export function isSessionExpired(): boolean {
  const t = localStorage.getItem(LOGIN_TIME_KEY);
  if (!t) return true;
  return Date.now() - Number(t) > SESSION_DURATION_MS;
}

export async function loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  // Set login time BEFORE the popup resolves so onAuthStateChanged
  // doesn't see an expired session and immediately sign the user out.
  localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
  try {
    const result = await signInWithPopup(auth, provider);
    if (ALLOWED_EMAIL && result.user.email !== ALLOWED_EMAIL) {
      localStorage.removeItem(LOGIN_TIME_KEY);
      await signOut(auth);
      throw new Error('Access denied.');
    }
  } catch (err) {
    localStorage.removeItem(LOGIN_TIME_KEY);
    throw err;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem(LOGIN_TIME_KEY);
  await signOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function docToObj<T>(snapshot: { id: string; data: () => Record<string, unknown> }): T {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

// ── Exercises ──────────────────────────────────────────────────────────────

export async function getExercises(): Promise<Exercise[]> {
  const snap = await getDocs(collection(db, 'exercises'));
  return snap.docs.map((d) => docToObj<Exercise>(d));
}

export async function createExercise(data: Omit<Exercise, 'id'>): Promise<Exercise> {
  const ref = await addDoc(collection(db, 'exercises'), data);
  return { id: ref.id, ...data };
}

export async function updateExercise(id: string, data: Partial<Omit<Exercise, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'exercises', id), data as Record<string, unknown>);
}

export async function deleteExercise(id: string): Promise<void> {
  await deleteDoc(doc(db, 'exercises', id));
}

// ── Templates ──────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<WorkoutTemplate[]> {
  const snap = await getDocs(collection(db, 'templates'));
  return snap.docs.map((d) => docToObj<WorkoutTemplate>(d));
}

export async function createTemplate(data: Omit<WorkoutTemplate, 'id'>): Promise<WorkoutTemplate> {
  const ref = await addDoc(collection(db, 'templates'), data);
  return { id: ref.id, ...data };
}

export async function updateTemplate(id: string, data: Partial<Omit<WorkoutTemplate, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'templates', id), data as Record<string, unknown>);
}

export async function deleteTemplate(id: string): Promise<void> {
  await deleteDoc(doc(db, 'templates', id));
}

// ── Workout Logs ───────────────────────────────────────────────────────────

export async function getLogs(): Promise<WorkoutLog[]> {
  const q = query(collection(db, 'workoutLogs'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToObj<WorkoutLog>(d));
}

export async function createLog(data: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> {
  const ref = await addDoc(collection(db, 'workoutLogs'), data);
  return { id: ref.id, ...data };
}

export async function deleteLog(id: string): Promise<void> {
  await deleteDoc(doc(db, 'workoutLogs', id));
}
