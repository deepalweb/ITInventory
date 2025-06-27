
import { GoogleGenAI } from "@google/genai";
import { Device, Repair } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    // In a real app, this would be a fatal error.
    // For this environment, we'll log a warning and proceed,
    // as the variable is expected to be injected at runtime.
    console.warn("VITE_API_KEY environment variable not set. The application will not be able to connect to the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

export const generateReport = async (
    devices: Device[], 
    repairs: Repair[],
    userQuery: string
): Promise<string> => {
    
    const today = new Date().toISOString().split('T')[0];

    const systemInstruction = `
You are an expert IT Inventory Analyst. Your task is to analyze the provided JSON data about device inventory and repair logs to answer the user's question.

- Today's date is ${today}.
- Provide clear, concise, and accurate answers based ONLY on the data provided.
- If the data is insufficient to answer the question, state that clearly.
- Format your response in a readable way, using markdown for lists, bolding, etc. when appropriate.
- When asked about costs or financials, always format numbers with commas (e.g., $1,234.56).
- CapEx (Capital Expenditure) comes from the 'cost' of devices.
- OpEx (Operational Expenditure) comes from the 'cost' of repairs.
`;

    const prompt = `
Here is the IT inventory data in JSON format:

**Device Inventory:**
${JSON.stringify(devices, null, 2)}

**Repair Logs:**
${JSON.stringify(repairs, null, 2)}

---

**User's Question:**
"${userQuery}"

---

Please provide the analysis based on the data and the user's question.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
            }
        });

        if (!response.text) {
             throw new Error("Received an empty response from the AI model.");
        }
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate report from AI. Please check your API key and network connection.");
    }
};
