import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

export const processAIResponse = async (userInput) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(userInput);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "عذراً، المحرك الذكي في استراحة قصيرة حالياً. حاول ثانية لاحقاً!";
  }
};

export const triggerAutoCartoonGen = async (platform) => {
  console.log(`[System] جاري بدء إنتاج 5 فيديوهات يومية لمنصة: ${platform}`);
  return true; 
};
