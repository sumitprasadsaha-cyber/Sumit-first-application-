import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyASbswlD6JRb_jEoYE4JVcMsolPyR6t5to",
  authDomain: "academy-connect-500d1.firebaseapp.com",
  projectId: "academy-connect-500d1",
  storageBucket: "academy-connect-500d1.firebasestorage.app",
  messagingSenderId: "835356071946",
  appId: "1:835356071946:web:5450b3be3cb3ee79aa67f3",
  measurementId: "G-Q8LJ49FNCK"
};

let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let storageInstance: any = null;

if (getApps().length > 0) {
  appInstance = getApp();
} else {
  appInstance = initializeApp(firebaseConfig);
}

if (!appInstance) {
  throw new Error("Firebase app initialization failed.");
}

authInstance = getAuth(appInstance);
if (!authInstance) {
  throw new Error("Firebase Auth initialization failed.");
}

dbInstance = getFirestore(appInstance);
if (!dbInstance) {
  throw new Error("Firebase Firestore initialization failed.");
}

storageInstance = getStorage(appInstance);
if (!storageInstance) {
  throw new Error("Firebase Storage initialization failed.");
}

/**
 * Creates a new Auth user via a secondary Firebase app instance.
 * This prevents the current active user (admin) from being signed out on the client.
 */
export async function createNewUserAuth(email: string, password: string): Promise<string> {
  const secondaryAppName = `secondary-app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    // We can also send email verification immediately to this new user!
    try {
      const { sendEmailVerification } = await import("firebase/auth");
      await sendEmailVerification(cred.user);
    } catch (verifErr) {
      console.warn("Could not send immediate email verification from secondary instance:", verifErr);
    }
    // Clean up secondary auth
    await secondaryAuth.signOut();
    return uid;
  } finally {
    // We don't delete the app dynamically as it is lightweight, but signing out is sufficient.
  }
}

export async function getFirebaseApp() {
  return appInstance;
}

export async function getFirebaseAuth() {
  return authInstance;
}

export async function getFirebaseDb() {
  return dbInstance;
}

export async function getFirebaseStorage() {
  return storageInstance;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
