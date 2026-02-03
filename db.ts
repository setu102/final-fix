
import { GoogleGenAI } from "@google/genai";
import { RAJBARI_DATA } from './constants.tsx';

export const db = {
  extractJSON: (text: string) => {
    if (!text) return null;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return null;
    } catch (e) { return null; }
  },

  /**
   * Direct Gemini API Call from Client Side
   */
  callAI: async (params: { 
    contents: any; 
    systemInstruction?: string; 
    tools?: any[]; 
    model?: string;
    responseMimeType?: string;
    responseSchema?: any;
  }) => {
    try {
      // Create a new instance right before call as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: params.model || 'gemini-3-flash-preview',
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction || "আপনি রাজবাড়ী জেলার একজন ডিজিটাল সহকারী।",
          tools: params.tools || [{ googleSearch: {} }],
          temperature: 0.7,
          responseMimeType: params.responseMimeType,
          responseSchema: params.responseSchema,
        },
      });

      return {
        text: response.text || "",
        groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
        mode: 'client_direct_v3'
      };
    } catch (e: any) {
      console.error("Gemini API Client Error:", e.message);
      
      // Handle quota or key issues gracefully
      if (e.message.includes("API_KEY_INVALID")) {
        throw new Error("API Key টি সঠিক নয়। দয়া করে সেটিংস চেক করুন।");
      }
      
      throw new Error(e.message || "এআই সার্ভার সাড়া দিচ্ছে না।");
    }
  },

  getCategory: async (category: string) => {
    return (RAJBARI_DATA as any)[category] || [];
  }
};
