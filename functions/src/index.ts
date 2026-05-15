import * as functions from "firebase-functions";
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const api = express();
api.use(express.json());

const geminiApiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key || "";

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

api.post("/api/audit", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const prompt = `Perform an ultra-elite, 360-degree digital intelligence audit for: ${url}.
      
      You are not just a tool; you are a High-Level Strategic Advisor. This report must be exceptionally detailed, long-form, and profound. 
      
      IMPORTANT: For every single audit point (finding), you MUST precisely identify:
      1. THE WHAT: What is the issue? (title/description)
      2. THE WHY: Why does this specific issue matter for their business? (whyItMatters)
      3. THE WHERE: Where exactly on the site did you find this? (location)
      4. THE HOW: How can we specifically fix this to improve the ROI? (fixStrategy)
      
      COMPREHENSIVE AUDIT ARCHITECTURE:
      
      1. VITAL SIGNS (Infrastructure & Speed):
         Deep-dive into SSL, load speed, mobile fluidity (FID, LCP, CLS), SEO architecture, and technical debt.
         
      2. PRESTIGE FACTOR (Brand & Ethos):
         Analyze visual authority, font pairings, founder's presence, and the "Luxury Gap" in their branding.
         
      3. COMMUNICATION HEALTH (Relevance & Pulse):
         Evaluate content rhythm, transparency of qualifications, and the depth of their digital archive.
         
      4. OPERATIONAL FRICTION (Growth Tools):
         Test lead magnets, payment security signals, and the efficiency of the user journey.
         
      5. COMMUNITY & COMPLIANCE (Safety & Trust):
         Review social proof density, legal shielding, and local SEO dominance.
      
      ELABORATE SECTIONS (MAXIMUM DETAIL):
      
      - SWOT MATRIX: Detailed Strengths, Weaknesses, Opportunities, and Threats (at least 4-5 items each).
      - PSYCHOLOGICAL IMPRESSION: A paragraph on the "Instant Perception" a visitor has.
      - INDUSTRY BENCHMARK: Explicit comparison to industry leaders. What are the "Gaps" they must close?
      - CONVERSION FUNNEL: Identify where the users 'leak' out of the sales process.
      - 12-MONTH REMEDIATION PLAN: Break down the fix into 3 logical phases (Immediate, Operational, Strategic).
      
      TONE: Analytical, Sophisticated, High-Stakes. Use professional terminology like 'Friction Points', 'Cognitive Load', 'Authority Signaling', and 'ROI Leakage'.
      
      Format as a JSON object matching the exhaustive schema provided.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
                vitalSigns: {
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
                },
                prestigeFactor: {
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
                },
                communicationHealth: {
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
                },
                operationalFriction: {
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
                },
                communityCompliance: {
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
                },
              },
              required: ["vitalSigns", "prestigeFactor", "communicationHealth", "operationalFriction", "communityCompliance"],
            },
          },
          required: [
            "overallScore",
            "summary",
            "categories",
            "businessDomain",
            "persuasiveCallToAction",
            "strategicVision",
            "psychologicalImpact",
            "riskLevel",
            "swotAnalysis",
            "industryBenchmark",
            "conversionFunnel",
            "remediationPlan"
          ],
        },
      },
    });

    const responseText = result.text;
    if (!responseText) {
      throw new Error("No response from Gemini");
    }

    try {
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (parseError: any) {
      console.error("JSON Parse Error. Raw Response:", responseText);
      throw new Error("The AI provided an invalid data structure. Please try again.");
    }
  } catch (error: any) {
    console.error("Audit error details:", error);
    res.status(500).json({
      error: error.message || "Unknown audit engine error",
      details: error.response?.data || error.stack,
    });
  }
});

export const app = functions.https.onRequest(api);
