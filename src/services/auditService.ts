import axios from "axios";
import { runClientAudit } from "./geminiClientService";
import { getAdminSettings } from "./dbService";

export interface AuditReport {
  overallScore: number;
  url: string;
  timestamp: string;
  businessDomain: string;
  categories: {
    vitalSigns: CategoryResult;
    prestigeFactor: CategoryResult;
    communicationHealth: CategoryResult;
    operationalFriction: CategoryResult;
    communityCompliance: CategoryResult;
  };
  summary: string;
  persuasiveCallToAction: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategicVision: string;
  psychologicalImpact: string;
  riskLevel: 'critical' | 'elevated' | 'stable';
  generatedBy: string;
  userEmail: string;
  industryBenchmark: {
    score: number;
    description: string;
    competitorGaps: string[];
  };
  conversionFunnel: {
    status: string;
    leaks: string[];
  };
  remediationPlan: {
    phase: string;
    tasks: string[];
  }[];
}

export interface CategoryResult {
  score: number;
  points: AuditPoint[];
}

export interface AuditPoint {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  status: "pass" | "fail" | "warning";
  whyItMatters: string;
  location: string;
  fixStrategy: string;
}

export async function performAudit(url: string, userName: string, userEmail: string): Promise<AuditReport> {
  const settings = await getAdminSettings();
  const firestoreApiKey = settings?.geminiApiKey;
  const clientApiKey = firestoreApiKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  let data;
  if (clientApiKey && clientApiKey !== "MY_GEMINI_API_KEY_FOR_CLIENT") {
    // Client-side execution (Free Firebase Spark plan path)
    data = await runClientAudit(url, clientApiKey);
  } else {
    // Server-side execution (Standard platform path)
    const response = await axios.post("/api/audit", { url });
    data = response.data;
  }
  
  return {
    ...data,
    url,
    timestamp: new Date().toISOString(),
    generatedBy: userName,
    userEmail: userEmail,
  };
}
