import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });

export interface AIInsightResponse {
    summary: string;
    keyInsights: string[];
    suggestedActions: {
        label: string;
        type: 'schedule' | 'email' | 'travel' | 'info';
        payload: any;
    }[];
}

export const analyzeEmailContent = async (content: string): Promise<AIInsightResponse> => {
    const prompt = `
        Analyze the following email content and provide a professional summary, 3 key insights (deadlines, action items, or critical info), and suggested actions.
        Return the result as a JSON object with the following structure:
        {
            "summary": "string",
            "keyInsights": ["string", "string", "string"],
            "suggestedActions": [
                { "label": "string", "type": "schedule|email|travel|info", "payload": {} }
            ]
        }

        Email Content:
        "${content}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up JSON if it contains markdown formatting
        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("AI Analysis failed:", error);
        return {
            summary: "I'm having trouble analyzing this message right now.",
            keyInsights: ["Error connecting to AI service."],
            suggestedActions: []
        };
    }
};

export const generateScheduleInsights = async (events: any[]): Promise<string> => {
    const context = JSON.stringify(events.map(e => ({ title: e.title, start: e.start, end: e.end })));
    const prompt = `
        Look at my calendar events and provide one sharp, professional insight about my schedule for today. 
        Focus on things like: busy blocks, deep work opportunities, or back-to-back stresses.
        Keep it to 2 sentences max.
        
        Schedule: ${context}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        return "Stay focused and stay productive!";
    }
};

export const extractScheduleFromImage = async (base64Image: string, currentDate: Date): Promise<any[]> => {
    const dateContext = `Today's date is ${currentDate.toDateString()}. Please extract events for the week containing or starting after this date.`;
    const prompt = `
        Look at this photo of a student/work timetable.
        ${dateContext}
        Extract all scheduled events (Title, Start Time, End Time, and Day).
        Format the result as a JSON array of objects:
        [
            { "title": "string", "start": "ISO String for the correct date", "end": "ISO String for the correct date", "type": "meeting|work|personal" }
        ]
        Only return the JSON.
    `;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image.split(',')[1],
                    mimeType: "image/png"
                }
            }
        ]);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Timetable OCR failed:", error);
        return [];
    }
};
