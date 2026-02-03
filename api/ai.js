
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // API Key check from Environment Variables
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API_KEY_MISSING',
      details: 'Vercel ড্যাশবোর্ডে "API_KEY" সেট করা নেই। সেটিংস > এনভায়রনমেন্ট ভেরিয়েবল চেক করুন।' 
    });
  }

  try {
    const { contents, systemInstruction, tools, model, responseMimeType, responseSchema } = req.body;
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-3-flash-preview for maximum speed and search capability
    const response = await ai.models.generateContent({
      model: model || 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "আপনি রাজবাড়ী জেলার একজন ডিজিটাল সহকারী। গুগল সার্চ ব্যবহার করে সব সময় লেটেস্ট তথ্য দিন।",
        tools: tools || [{ googleSearch: {} }],
        temperature: 0.7,
        responseMimeType,
        responseSchema,
      },
    });

    // Access the .text property directly
    const textOutput = response.text || "দুঃখিত, কোনো তথ্য খুঁজে পাওয়া যায়নি।";

    return res.status(200).json({
      text: textOutput,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
      mode: 'live_cloud_v2'
    });

  } catch (error) {
    console.error("Vercel AI Bridge Error:", error.message);
    
    // Handle specific API errors
    let errorMessage = "এআই সার্ভারে সমস্যা হয়েছে।";
    if (error.message.includes("403")) errorMessage = "এপিআই কী (API Key) অবৈধ বা পারমিশন নেই।";
    if (error.message.includes("429")) errorMessage = "অতিরিক্ত রিকোয়েস্ট পাঠানো হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।";

    return res.status(500).json({ 
      error: 'AI_GATEWAY_ERROR',
      details: errorMessage,
      raw: error.message
    });
  }
}
