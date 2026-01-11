import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const prompt = `Summarize the following lecture transcript into 5-7 key points for students:
    
    ${transcript}
    
    Format as bullet points. Make it easy to understand:`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "• Unable to generate summary at the moment.\n• Please review the main points yourself.\n• Focus on key concepts mentioned.";
  }
}

export async function helpBotResponse(message: string, studentName: string): Promise<string> {
  try {
    const prompt = `You are a helpful educational assistant named "HelpBot". 
    Student ${studentName} is asking: "${message}"
    
    Respond in a supportive, encouraging way. If it's a technical question, provide clear explanations.
    Keep response concise and friendly:`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("HelpBot error:", error);
    return "I'm here to help! Could you rephrase your question?";
  }
}

export async function analyzeDifficulty(topic: string, wrongAnswers: number): Promise<string> {
  try {
    const prompt = `Topic: ${topic}
    Number of students struggling: ${wrongAnswers}
    
    Provide a brief analysis of why students might be struggling with this topic and suggest teaching strategies:`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Students are finding this topic challenging. Consider reviewing it with examples.";
  }
}