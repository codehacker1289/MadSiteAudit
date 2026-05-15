import { collection, addDoc, query, where, orderBy, getDocs, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { AuditReport } from "./auditService";

const AUDITS_COLLECTION = "audits";
const SETTINGS_COLLECTION = "settings";

export async function getAdminSettings() {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "admin");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/admin`);
  }
}

export async function updateAdminSettings(settings: any) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "admin");
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/admin`);
  }
}

export async function saveAudit(report: AuditReport) {
  if (!auth.currentUser) return;

  try {
    const docRef = await addDoc(collection(db, AUDITS_COLLECTION), {
      ...report,
      userId: auth.currentUser.uid,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, AUDITS_COLLECTION);
  }
}

export async function getAuditHistory(maxResults: number = 5) {
  if (!auth.currentUser) return [];

  try {
    const q = query(
      collection(db, AUDITS_COLLECTION),
      where("userId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc"),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as AuditReport,
      id: doc.id
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, AUDITS_COLLECTION);
  }
}

export async function getAllAudits(maxResults: number = 100) {
  try {
    const q = query(
      collection(db, AUDITS_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as AuditReport,
      id: doc.id
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, AUDITS_COLLECTION);
  }
}
