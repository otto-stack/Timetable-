
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a concise, professional summary of the classroom schedule.
 * @param bookings Array of booking objects
 * @param locationName The name of the current location (e.g., Yuen Long)
 * @returns A string containing the AI-generated summary
 */
export const getScheduleSummary = async (bookings: any[], locationName: string): Promise<string> => {
  if (!bookings || bookings.length === 0) {
    return `${locationName} 分校目前尚無待處理的預約申請。`;
  }

  // Prepare a condensed version of the schedule for the prompt
  const scheduleData = bookings.map(b => ({
    title: b.title,
    tutor: b.teacherName,
    time: `${b.startTime} - ${b.endTime}`,
    date: b.date
  })).slice(0, 15); // Limit to 15 entries to keep prompt concise

  const prompt = `You are an operations assistant for ClassFlow, a Hong Kong tutoring center. 
  Analyze the following classroom booking schedule for our ${locationName} campus:
  ${JSON.stringify(scheduleData)}
  
  Provide a professional, energetic summary in Traditional Chinese (Hong Kong style). 
  Focus on the bookings and classroom utilization. Max 100 words.
  Use terms like "預約" or "課表" instead of "佔用".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "目前無法生成摘要。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 助理正在休息中，請稍後再查看課表分析。";
  }
};
