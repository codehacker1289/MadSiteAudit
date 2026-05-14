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
}

export async function performAudit(url: string): Promise<AuditReport> {
  const response = await axios.post("/api/audit", { url });
  
  return {
    ...response.data,
    url,
    timestamp: new Date().toISOString(),
  };
}
