import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TaskStatus, TaskPriority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const projectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A professional 2-sentence description of the project.",
    },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          assignee: { type: Type.STRING, description: "Suggested role for this task (e.g., Coordinator, Field Officer)" }
        },
        required: ["title", "priority", "assignee"],
      },
    },
    kpi: {
        type: Type.OBJECT,
        properties: {
            beneficiaries: { type: Type.INTEGER, description: "Estimated number of beneficiaries" },
            volunteers: { type: Type.INTEGER, description: "Estimated number of volunteers needed" },
        },
        required: ["beneficiaries", "volunteers"]
    }
  },
  required: ["description", "tasks", "kpi"],
};

export const generateProjectPlan = async (projectTitle: string, goal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a structured project plan for an NGO project titled "${projectTitle}".
      The goal is: "${goal}".
      Create a description, a list of 5-8 initial tasks, and estimated KPIs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema,
        systemInstruction: "You are an expert NGO project manager helping to structure new social impact initiatives.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeImpact = async (stats: any) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze these impact statistics for an NGO and provide a brief, encouraging summary (max 50 words) emphasizing the key achievements. Stats: ${JSON.stringify(stats)}`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Unable to generate analysis at this time.";
    }
}
