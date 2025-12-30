import { GoogleGenAI, Type } from "@google/genai";
import { Finding, RiskLevel } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Interface for the structured response we expect from Gemini
interface CorrectionResponse {
  blockagePercentage: number;
  riskLevel: string;
  confidence: number;
  reasoning: string;
}

export const analyzeMedicalCorrection = async (
  currentFinding: Finding,
  doctorInput: string
): Promise<Partial<Finding>> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock correction.");
    return {
      blockagePercentage: 45,
      confidence: 99,
      notes: "Corrected manually by doctor (Mock Mode)"
    };
  }

  try {
    const prompt = `
      You are an expert AI assistant for cardiologists.
      A doctor is reviewing an angiography finding and wants to correct the AI's initial assessment.
      
      Current Finding Data:
      - Artery: ${currentFinding.arteryName}
      - Estimated Blockage: ${currentFinding.blockagePercentage}%
      - AI Confidence: ${currentFinding.confidence}%
      
      Doctor's Correction/Feedback: "${doctorInput}"
      
      Based on the doctor's feedback, strictly estimate the new blockage percentage and risk level.
      If the doctor says "mild", blockage is usually < 50%. "Moderate" is 50-70%. "Severe" is > 70%.
      If the doctor specifies a number, use it.
      
      Return a JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            blockagePercentage: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, enum: [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    const result = JSON.parse(jsonText) as CorrectionResponse;

    return {
      blockagePercentage: result.blockagePercentage,
      confidence: result.confidence,
      notes: `AI Adjusted: ${result.reasoning}`
    };

  } catch (error) {
    console.error("Gemini correction failed:", error);
    // Fallback if AI fails
    return {
      notes: `Manual correction recorded: "${doctorInput}"`
    };
  }
};

export const refineMedicalTranscript = async (rawTranscript: string): Promise<string> => {
  // Simulating smart cleanup if no API key
  if (!apiKey) {
    // Basic mock cleanup: removing repeats and common filler
    return rawTranscript
      .replace(/\b(um|uh|er|like|you know)\b/gi, "")
      .replace(/\b(\w+)\s+\1\b/gi, "$1") // Remove double words like "the the"
      .trim();
  }

  try {
    const prompt = `
      You are a medical scribe AI. 
      Clean up the following raw voice transcript from a cardiologist.
      Remove stuttering, filler words, and repetitions. 
      Keep valid medical terminology and clinical intent strictly intact.
      
      Raw Input: "${rawTranscript}"
      
      Output only the cleaned text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text?.trim() || rawTranscript;
  } catch (error) {
    console.error("Transcript cleanup failed", error);
    return rawTranscript;
  }
};

export const extractInsightsFromVoiceNote = async (transcript: string) => {
    return `Voice note recorded. Findings noted regarding ${transcript.slice(0, 20)}...`;
}