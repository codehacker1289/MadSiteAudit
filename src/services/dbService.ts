import { collection, addDoc, query, where, orderBy, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { AuditReport } from "./auditService";

const AUDITS_COLLECTION = "audits";

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
