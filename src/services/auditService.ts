import axios from "axios";

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
  const response = await axios.post("/api/audit", { url });
  
  return {
    ...response.data,
    url,
    timestamp: new Date().toISOString(),
    generatedBy: userName,
    userEmail: userEmail,
  };
}
