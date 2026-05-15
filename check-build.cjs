var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  const ai = new import_genai.GoogleGenAI(process.env.GEMINI_API_KEY || "");
  app.post("/api/audit", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash"
        // Using a stable model alias
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
        type: import_genai.SchemaType.OBJECT,
        properties: {
          score: { type: import_genai.SchemaType.NUMBER },
          points: {
            type: import_genai.SchemaType.ARRAY,
            items: {
              type: import_genai.SchemaType.OBJECT,
              properties: {
                title: { type: import_genai.SchemaType.STRING },
                description: { type: import_genai.SchemaType.STRING },
                impact: { type: import_genai.SchemaType.STRING, enum: ["high", "medium", "low"] },
                status: { type: import_genai.SchemaType.STRING, enum: ["pass", "fail", "warning"] }
              },
              required: ["title", "description", "impact", "status"]
            }
          }
        },
        required: ["score", "points"]
      };
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.SchemaType.OBJECT,
            properties: {
              overallScore: { type: import_genai.SchemaType.NUMBER },
              businessDomain: { type: import_genai.SchemaType.STRING },
              summary: { type: import_genai.SchemaType.STRING },
              persuasiveCallToAction: { type: import_genai.SchemaType.STRING },
              categories: {
                type: import_genai.SchemaType.OBJECT,
                properties: {
                  vitalSigns: categorySchema,
                  prestigeFactor: categorySchema,
                  communicationHealth: categorySchema,
                  operationalFriction: categorySchema,
                  communityCompliance: categorySchema
                },
                required: ["vitalSigns", "prestigeFactor", "communicationHealth", "operationalFriction", "communityCompliance"]
              }
            },
            required: ["overallScore", "summary", "categories", "businessDomain", "persuasiveCallToAction"]
          }
        }
      });
      const responseText = result.response.text();
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("Audit error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
