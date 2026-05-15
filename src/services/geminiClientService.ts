import { GoogleGenAI, Type } from "@google/genai";

// Schema for Gemini
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
          status: { type: Type.STRING, enum: ["fail", "pass", "warning"] },
          whyItMatters: { type: Type.STRING },
          location: { type: Type.STRING },
          fixStrategy: { type: Type.STRING },
        },
        required: ["title", "description", "impact", "status", "whyItMatters", "location", "fixStrategy"],
      },
    },
  },
  required: ["score", "points"],
};

export async function runClientAudit(url: string, apiKey: string) {
  const genAI = new GoogleGenAI({ apiKey });

  const prompt = `Perform an ultra-elite audit for: ${url}. 
  TONE: Analytical, Sophisticated. Output JSON.`;

  const result = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          businessDomain: { type: Type.STRING },
          summary: { type: Type.STRING },
          persuasiveCallToAction: { type: Type.STRING },
          strategicVision: { type: Type.STRING },
          psychologicalImpact: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ["critical", "elevated", "stable"] },
          industryBenchmark: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              description: { type: Type.STRING },
              competitorGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["score", "description", "competitorGaps"],
          },
          conversionFunnel: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              leaks: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["status", "leaks"],
          },
          remediationPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["phase", "tasks"],
            },
          },
          swotAnalysis: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"],
          },
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
        required: [
          "overallScore", "summary", "categories", "businessDomain", 
          "persuasiveCallToAction", "strategicVision", "psychologicalImpact", 
          "riskLevel", "swotAnalysis", "industryBenchmark", "conversionFunnel", "remediationPlan"
        ],
      },
    },
  });

  const responseText = result.text;
  if (!responseText) {
    throw new Error("No response from Gemini");
  }
  return JSON.parse(responseText);
}
