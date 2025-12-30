
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Study, StatisticalDataPoint, PresentationSlide, SpecimenProcedure, SpecimenLogistics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const HIPAA_SYSTEM_INSTRUCTION = `
  IMPORTANT: You are operating in a HIPAA-compliant clinical environment. 
  1. NEVER request, use, or store real patient names, social security numbers, or addresses.
  2. Use ONLY Participant IDs or Subject Codes (e.g., SUB-001).
  3. If provided with PII (Personally Identifiable Information), immediately redact it and notify the user to follow protocol.
  4. Focus strictly on clinical trial logistics, medical data analysis, and protocol adherence.
`;

export const getStudyInsight = async (study: Study, query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        ${HIPAA_SYSTEM_INSTRUCTION}
        Context: You are a senior clinical trial research analyst.
        Study Data: ${JSON.stringify(study)}
        User Question: ${query}
        
        Please provide a concise, data-driven insight based strictly on the study data provided.
      `,
    });
    return response.text || "I'm sorry, I couldn't generate an insight for that query.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the AI Research Assistant.";
  }
};

export const analyzeProtocol = async (pdfBase64: string): Promise<{ 
  text: string, 
  screeningItems: string[], 
  aeGuidelines: string,
  summary: string,
  algorithm: string,
  drugFeatures: string,
  prepRequirements: string,
  statisticalAnalysis: StatisticalDataPoint[],
  presentationSlides: PresentationSlide[],
  specimenProcedures: SpecimenProcedure[],
  specimenLogistics: SpecimenLogistics
}> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64,
          },
        },
        {
          text: `${HIPAA_SYSTEM_INSTRUCTION}
          You are an expert Clinical Research Coordinator and Lab Manager. Analyze this study protocol PDF and extract:
          
          1. **Protocol Summary**: A layman's summary.
          2. **Study Algorithm**: Step-by-step logic flow.
          3. **Drug/Device Features**: Tech details.
          4. **Preparation Requirements**: Pharm prep steps.
          5. **Statistical Analysis Data**: Alpha, Power, Effect Size, Sample Size.
          6. **Presentation Slides**: Bullets for 5 slides.
          7. **Specimen Processing & Handling**: A list of tasks for lab techs (e.g., centrifugation, storage temp).
          8. **Shipping Logistics**: Shipping address, Courier name, and Courier contact information/phone.
          
          I need you to encapsulate specific sections for the UI using these exact tags:
          - 'SCREENING_LIST_START' ... 'SCREENING_LIST_END'
          - 'AE_GUIDELINES_START' ... 'AE_GUIDELINES_END'
          - 'TRIAL_SUMMARY_START' ... 'TRIAL_SUMMARY_END'
          - 'STUDY_ALGORITHM_START' ... 'STUDY_ALGORITHM_END'
          - 'DRUG_FEATURES_START' ... 'DRUG_FEATURES_END'
          - 'PREP_REQS_START' ... 'PREP_REQS_END'
          - 'STAT_DATA_JSON_START' ... 'STAT_DATA_JSON_END' (JSON array of {label, value})
          - 'SLIDES_JSON_START' ... 'SLIDES_JSON_END' (JSON array of {title, bullets: string[]})
          - 'SPECIMEN_TASKS_JSON_START' ... 'SPECIMEN_TASKS_JSON_END' (JSON array of {task, details})
          - 'SHIPPING_JSON_START' ... 'SHIPPING_JSON_END' (JSON object of {address, courier, courierContact})
          `,
        },
      ],
    });

    const text = response.text || "Failed to analyze the protocol.";
    
    const extractSection = (startTag: string, endTag: string) => {
      const regex = new RegExp(`${startTag}([\\s\\S]*?)${endTag}`);
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const screeningItems = extractSection('SCREENING_LIST_START', 'SCREENING_LIST_END')
      .split('\n')
      .map(item => item.trim().replace(/^-\s*|^\[\s*\]\s*/, ''))
      .filter(Boolean);

    const rawStatData = extractSection('STAT_DATA_JSON_START', 'STAT_DATA_JSON_END');
    const rawSlidesData = extractSection('SLIDES_JSON_START', 'SLIDES_JSON_END');
    const rawSpecimenTasks = extractSection('SPECIMEN_TASKS_JSON_START', 'SPECIMEN_TASKS_JSON_END');
    const rawShipping = extractSection('SHIPPING_JSON_START', 'SHIPPING_JSON_END');

    let statisticalAnalysis: StatisticalDataPoint[] = [];
    let presentationSlides: PresentationSlide[] = [];
    let specimenProcedures: SpecimenProcedure[] = [];
    let specimenLogistics: SpecimenLogistics = { address: "", courier: "", courierContact: "" };

    try {
      if (rawStatData) statisticalAnalysis = JSON.parse(rawStatData);
      if (rawSlidesData) presentationSlides = JSON.parse(rawSlidesData);
      if (rawSpecimenTasks) specimenProcedures = JSON.parse(rawSpecimenTasks);
      if (rawShipping) specimenLogistics = JSON.parse(rawShipping);
    } catch (e) {
      console.warn("JSON parsing for extracted protocol fields failed.", e);
    }

    return { 
      text: text.replace(/([A-Z_]+_START[\s\S]*?[A-Z_]+_END)/g, '').trim(), 
      screeningItems: screeningItems.length > 0 ? screeningItems : ["Standard Screening"],
      aeGuidelines: extractSection('AE_GUIDELINES_START', 'AE_GUIDELINES_END') || "Follow GCP guidelines.",
      summary: extractSection('TRIAL_SUMMARY_START', 'TRIAL_SUMMARY_END'),
      algorithm: extractSection('STUDY_ALGORITHM_START', 'STUDY_ALGORITHM_END'),
      drugFeatures: extractSection('DRUG_FEATURES_START', 'DRUG_FEATURES_END'),
      prepRequirements: extractSection('PREP_REQS_START', 'PREP_REQS_END'),
      statisticalAnalysis,
      presentationSlides,
      specimenProcedures,
      specimenLogistics
    };
  } catch (error) {
    console.error("Gemini Protocol Analysis Error:", error);
    throw error;
  }
};
