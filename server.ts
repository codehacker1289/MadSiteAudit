import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, SchemaType } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

  // API Route for Audit
  app.post("/api/audit", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Using a stable model alias
      });

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
        type: SchemaType.OBJECT,
        properties: {
          score: { type: SchemaType.NUMBER },
          points: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                impact: { type: SchemaType.STRING, enum: ["high", "medium", "low"] },
                status: { type: SchemaType.STRING, enum: ["pass", "fail", "warning"] },
              },
              required: ["title", "description", "impact", "status"],
            },
          },
        },
        required: ["score", "points"],
      };

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              overallScore: { type: SchemaType.NUMBER },
              businessDomain: { type: SchemaType.STRING },
              summary: { type: SchemaType.STRING },
              persuasiveCallToAction: { type: SchemaType.STRING },
              categories: {
                type: SchemaType.OBJECT,
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

      const responseText = result.response.text();
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Audit error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
