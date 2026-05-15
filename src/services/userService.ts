import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, where, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  tier: 'free' | 'specialist' | 'strategic_agent';
  auditQuota: number; // -1 for unlimited
  auditsUsed: number;
  isBanned?: boolean;
  createdAt: string;
}

const ADMIN_EMAILS = ['friendswatchgotforfree@gmail.com'];

export async function getOrCreateProfile(uid: string, email: string): Promise<UserProfile> {
  const userDoc = doc(db, 'users', uid);
  const snapshot = await getDoc(userDoc);

  if (snapshot.exists()) {
    const data = snapshot.data();
    // Self-heal: Ensure admin emails always have the admin role in the DB
    if (ADMIN_EMAILS.includes(email) && data.role !== 'admin') {
      await updateDoc(userDoc, { role: 'admin' });
      return { uid, ...data, role: 'admin' } as UserProfile;
    }
    return { uid, ...data } as UserProfile;
  }

  // Create new profile
  const isDefaultAdmin = ADMIN_EMAILS.includes(email);
  const newProfile: Omit<UserProfile, 'uid'> = {
    email,
    role: isDefaultAdmin ? 'admin' : 'user',
    tier: 'free',
    auditQuota: 5,
    auditsUsed: 0,
    isBanned: false,
    createdAt: new Date().toISOString()
  };

  await setDoc(userDoc, newProfile);
  return { uid, ...newProfile } as UserProfile;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  quota: number; // -1 for unlimited
  features: string[];
  isVariable?: boolean;
}

export interface SystemSettings {
  googlePayId: string;
  merchantName: string;
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free operative',
    price: 'Rs. 0',
    description: 'Essential toolkit for basic reconnaissance.',
    quota: 5,
    features: ['Standard Analysis', 'PDF Export (Basic)', 'Audit History'],
  },
  {
    id: 'specialist',
    name: 'Specialist',
    price: 'Rs. 10000',
    description: 'Unhinge the standard constraints with unlimited power.',
    quota: -1,
    features: ['Unlimited Audits', 'Deep Analysis', 'High-Res PDF Export', 'Priority Support'],
  },
  {
    id: 'strategic_agent',
    name: 'Strategic Agent',
    price: 'Rs. 500',
    description: 'Scalable surveillance based on your requirements.',
    quota: 50,
    features: ['Pay-as-you-go Audits', 'Custom Branding', 'API Access (Alpha)', 'Dynamic Scaling'],
    isVariable: true
  }
];

export async function getTiers(): Promise<PricingTier[]> {
  const tiersCol = collection(db, 'tiers');
  const snapshot = await getDocs(tiersCol);
  if (snapshot.empty) {
    for (const tier of DEFAULT_TIERS) {
      await setDoc(doc(db, 'tiers', tier.id), tier);
    }
    return DEFAULT_TIERS;
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PricingTier));
}

export async function getSettings(): Promise<SystemSettings> {
  const settingsDoc = doc(db, 'settings', 'admin');
  const snapshot = await getDoc(settingsDoc);
  if (snapshot.exists()) {
    return snapshot.data() as SystemSettings;
  }
  return { googlePayId: 'friendswatchgotforfree@okaxis', merchantName: 'MadSiteAudit Admin' };
}

export async function updateSettings(settings: SystemSettings) {
  const settingsDoc = doc(db, 'settings', 'admin');
  await setDoc(settingsDoc, settings);
}

export async function updateTier(tier: PricingTier) {
  const tierDoc = doc(db, 'tiers', tier.id);
  await setDoc(tierDoc, tier);
}

export async function updateUserTier(uid: string, tierId: string, customQuota?: number) {
  const userDoc = doc(db, 'users', uid);
  const tiers = await getTiers();
  const tier = tiers.find(t => t.id === tierId);
  if (tier) {
    await updateDoc(userDoc, { 
      tier: tierId, 
      auditQuota: customQuota !== undefined ? customQuota : tier.quota 
    });
  }
}

export async function incrementAuditsUsed(uid: string) {
  const userDoc = doc(db, 'users', uid);
  const snapshot = await getDoc(userDoc);
  if (snapshot.exists()) {
    const data = snapshot.data();
    await updateDoc(userDoc, { auditsUsed: (data.auditsUsed || 0) + 1 });
  }
}

// Admin only functions
export async function getAllUsers(): Promise<UserProfile[]> {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
}

export async function updateAuditQuota(uid: string, newQuota: number) {
  const userDoc = doc(db, 'users', uid);
  await updateDoc(userDoc, { auditQuota: newQuota });
}

export async function setUserBanStatus(uid: string, isBanned: boolean) {
  const userDoc = doc(db, 'users', uid);
  await updateDoc(userDoc, { isBanned });
}

export async function toggleUserRole(uid: string, currentRole: 'user' | 'admin') {
  const userDoc = doc(db, 'users', uid);
  await updateDoc(userDoc, { role: currentRole === 'admin' ? 'user' : 'admin' });
}

export async function deleteUserAccount(uid: string) {
  const userDoc = doc(db, 'users', uid);
  await deleteDoc(userDoc);
}
