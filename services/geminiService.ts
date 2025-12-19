import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile, Service } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAIResponse = async (
  userMessage: string,
  history: { role: string; parts: { text: string }[] }[],
  profile: BusinessProfile,
  services: Service[]
): Promise<string> => {
  if (!apiKey) {
    return "Simulated AI Response: API Key is missing. Please configure process.env.API_KEY to test the real AI logic. (Functionality is simulated for demo purposes).";
  }

  try {
    const serviceList = services.map(s => `- ${s.name}: ${s.priceRange}`).join('\n');
    
    const systemInstruction = `
      You are an automated receptionist for ${profile.name}, owned by ${profile.ownerName}.
      Your goal is to be polite, helpful, and book appointments.
      
      Here are the services we offer and their prices:
      ${serviceList}
      
      Standard Deposit: $${profile.depositAmount}.
      
      Guidelines:
      1. If the user asks for a service, give them a price estimate from the list.
      2. If the user confirms, ask for a preferred time.
      3. If a time is agreed, ask for the deposit.
      4. Be concise and friendly.
      5. If a request is outside the list, say you will have the owner (${profile.ownerName}) call them back.
    `;

    const model = 'gemini-3-flash-preview';
    
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service. Please try again later.";
  }
};

export const generateVoicemailTranscript = async (): Promise<string> => {
  if (!apiKey) {
    return "Hi, this is a simulated voicemail. I have a plumbing issue and would like a call back as soon as possible. Thanks.";
  }

  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: "Generate a short, natural voicemail transcript (20-40 words) from a homeowner calling 'Mike's Plumbing'. The caller should sound slightly urgent but polite. They should state their name (make one up), describe a common plumbing issue (e.g., leaking water heater, clogged kitchen sink, running toilet), and ask for a call back at their number. Output ONLY the transcript text.",
      config: {
        temperature: 0.9,
      }
    });
    return response.text || "Voicemail transcription unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating voicemail transcript.";
  }
};

// 1. FAST AI RESPONSES: Low-latency suggestions using gemini-2.5-flash-lite
export const generateQuickReplies = async (
  lastMessage: string
): Promise<string[]> => {
  if (!apiKey) return ["Yes, I can help.", "Please call me.", "What is your address?"];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `The last message from a customer was: "${lastMessage}". Suggest 3 short, professional, and distinct quick replies for a tradesman (plumber). Return ONLY a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    // Safety check for parsing
    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return [];
  } catch (error) {
    console.error("Quick Reply Error:", error);
    return [];
  }
};

// 2. TRANSCRIBE AUDIO: Using gemini-3-flash-preview
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  if (!apiKey) return "[Simulated Transcription: I need a plumber urgently.]";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm', // Assuming standard browser recording format
              data: base64Audio
            }
          },
          { text: "Transcribe this audio exactly." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "Error transcribing audio.";
  }
};

// 3. THINKING MODE: Deep analysis using gemini-3-pro-preview with thinkingBudget
export const analyzeConversationStrategy = async (
  history: string
): Promise<string> => {
  if (!apiKey) return "Simulated Strategy: The customer seems interested but price-sensitive. Recommend emphasizing the warranty and long-term value of the repair.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following conversation history between a tradesman (Mike) and a customer. 
      Identify the customer's intent, their urgency level, and any potential blockers. 
      Then, provide a specific negotiation strategy for Mike to close the deal.
      
      Conversation:
      ${history}`,
      config: {
        thinkingConfig: {
            thinkingBudget: 32768, // Max budget for deep reasoning
        }
      }
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Error performing deep analysis.";
  }
};

// 4. EXTRACT BOOKING DETAILS: Check if message confirms a booking
export const extractBookingDetails = async (message: string): Promise<{ isBooking: boolean; service?: string; date?: string } | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this text sent to a customer: "${message}". 
      Does it confirm an appointment? 
      If yes, return JSON with "isBooking": true, "service": string (infer if missing), "date": string (ISO 8601 format, assuming today is ${new Date().toISOString()}). 
      If no, return { "isBooking": false }.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isBooking: { type: Type.BOOLEAN },
            service: { type: Type.STRING },
            date: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Extraction Error:", error);
    return null;
  }
};