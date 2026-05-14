import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const prompt = `Perform a high-stakes, ruthless website audit for the URL: ${url}.

Step 1: Identify the business domain (e.g., School, E-commerce, SaaS, Professional Services, etc.).
Step 2: Evaluate the website against these 5 specific categories of the "Digital Infrastructure Audit Checklist":

Category 1: Vital Signs (Technical & Security)
- SSL Certificate, Mobile Responsiveness, Home Page Load Speed (target <3s), Internal Page Speed, Custom Domain, Favicon, Broken Links (404s), Browser Compatibility, SEO Title, Meta Description.

Category 2: The "Prestige" Factor (Design & Branding)
- Logo Quality, Principal's/Founder's Photo, Message/Value Prop effectiveness, Color Consistency with brand, Font Readability, Navigation Menu organization, Hero Banner quality, Vision & Mission clarity, Recent Gallery/Infrastructure photos, Video/Campus tour.

Category 3: Communication Health (Content & Updates)
- News Ticker/Latest Updates, Academic/Operational Calendar (e.g., 2026-27), Holiday List, Working/School Timings, Staff/Team Directory with Qualifications, Uniform/Dress Code/Protocol instructions, Alumni/Success Stories, Awards & Recognition, Real User/Student work samples, Recent Events recap.

Category 4: Operational Friction (Functional Tools)
- Online Admission/Booking Form, Transparent Fee/Pricing structure, Online Payment portals, Customer/Member Login area, Downloadable Syllabus/Brochures, Resource/Book lists, Circulars/Notices archive, Legal Verification/TC Search, Inquiry Lead forms, WhatsApp/Chat integration.

Category 5: Community & Compliance (Safety & Search)
- Google Maps integration, Social Media links (FB/IG/YT), Live Social feeds, Board/Regulatory Affiliations, Mandatory Disclosures/Legal Docs, Safety/Compilance Certifications (Fire/Building/Child Safety), Safety Policies, Google Review health (10+ positive), SEO keyword ranking for "Best [Business Type] in [City]".

LANGUAGE STYLE:
The report must use strong, professional, yet alarming language. You must make the owner realize the gravity of their digital negligence. Use a "Ruthless but Expert" tone. Explain WHY their current condition is failing them and HOW it is hurting their reputation/revenue.

CONCLUSION:
Include a persuasive "Call to Action" explaining why they MUST hire us (the audit platform/agency) to fix these issues and "make their digital presence great again".

Format the response as a JSON object matching the provided schema.`;

  const categorySchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      points: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ["high", "medium", "low"] },
            status: { type: Type.STRING, enum: ["pass", "fail", "warning"] },
          },
          required: ["title", "description", "impact", "status"],
        },
      },
    },
    required: ["score", "points"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          businessDomain: { type: Type.STRING },
          summary: { type: Type.STRING },
          persuasiveCallToAction: { type: Type.STRING },
          categories: {
            type: Type.OBJECT,
            properties: {
              vitalSigns: categorySchema,
              prestigeFactor: categorySchema,
              communicationHealth: categorySchema,
              operationalFriction: categorySchema,
              communityCompliance: categorySchema,
            },
            required: ["vitalSigns", "prestigeFactor", "communicationHealth", "operationalFriction", "communityCompliance"],
          },
        },
        required: ["overallScore", "summary", "categories", "businessDomain", "persuasiveCallToAction"],
      },
    },
  });

  const reportData = JSON.parse(response.text);
  
  return {
    ...reportData,
    url,
    timestamp: new Date().toISOString(),
  };
}
