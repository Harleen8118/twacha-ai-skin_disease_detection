import { GoogleGenAI, Type } from "@google/genai";
import { SkinAnalysisResult, Message } from "../types";

// Initialize Gemini Client
// Note: In a production environment, never expose API keys on the client side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSkinImage = async (base64Image: string): Promise<SkinAnalysisResult> => {
  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `Analyze this skin condition image. You are an expert dermatologist system using Finetuned Qwen 2 VL architecture. 
            Identify the condition, estimate confidence (0-100), assess severity, list observed symptoms, provide recommendations, and potential treatments.
            
            Return ONLY raw JSON. Do not use Markdown code blocks.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition_name: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER, description: "Confidence score between 0 and 100" },
            severity: { type: Type.STRING, enum: ["Mild", "Moderate", "Severe"] },
            description: { type: Type.STRING },
            symptoms_observed: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            treatment_options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
          required: ["condition_name", "confidence_score", "severity", "description", "symptoms_observed", "recommendations", "treatment_options"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response generated from AI model.");
    }

    const result = JSON.parse(response.text) as SkinAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

export const sendChatQuery = async (history: Message[], currentPrompt: string): Promise<string> => {
  try {
    // Construct the history for the model
    // We convert previous analysis results into context text so the model understands what was discussed
    const contents = history.map(msg => {
      let textContent = msg.content;
      
      // If the message has an analysis result attached, include it in the context
      if (msg.role === 'assistant' && msg.analysis) {
        textContent += `\n\n[System Context - Previous Analysis Result]: ${JSON.stringify(msg.analysis)}`;
      }

      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: textContent }]
      };
    });

    // Add the current prompt
    contents.push({
      role: 'user',
      parts: [{ text: currentPrompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are Twacha AI, a friendly and professional medical assistant powered by Finetuned Qwen 2 VL. You help users understand their skin conditions based on previous analysis. Be concise, empathetic, and always remind users to consult a doctor for definitive diagnosis.",
      }
    });

    return response.text || "I apologize, I couldn't process that request.";

  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error("Failed to send message.");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
