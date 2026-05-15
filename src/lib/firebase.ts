import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer, collection, addDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";
import firebaseConfig from "@/firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize optional services
export let perf: any = null;
export let remoteConfig: any = null;

try {
  if (typeof window !== "undefined") {
    perf = getPerformance(app);
  }
} catch (err) {
  console.warn("Firebase Performance is not available in this environment.");
}

try {
  if (typeof window !== "undefined") {
    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
    remoteConfig.defaultConfig = {
      "maintenance_mode": false,
      "announcement_message": "Welcome to MadSiteAudit!"
    };
    fetchAndActivate(remoteConfig).catch(err => console.error("Remote Config failed:", err));
  }
} catch (err) {
  console.warn("Firebase Remote Config is not available in this environment.");
}

let analytics: any = null;
isAnalyticsSupported().then(supported => {
  if (supported && typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
});

/**
 * Log a custom event to Firebase Analytics
 */
export const trackEvent = (eventName: string, eventParams?: any) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

export { signInWithPopup, signOut };

// Standard error handling as per metadata
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
