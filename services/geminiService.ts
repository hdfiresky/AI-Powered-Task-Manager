
/*
// --- UNCOMMENT AND REPLACE ENTIRE FILE FOR BACKEND INTEGRATION: START ---

import { AISubTaskSuggestion } from '../types';

// The URL of your new backend server
const BACKEND_API_URL = 'http://127.0.0.1:8000/api/breakdown-task';

export const breakDownTaskWithAI = async (taskTitle: string, taskDescription?: string): Promise<AISubTaskSuggestion[]> => {
  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
      }),
    });

    if (!response.ok) {
      // Try to get a detailed error message from the backend's response body
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const suggestions: AISubTaskSuggestion[] = await response.json();
    return suggestions;

  } catch (error) {
    console.error("Error breaking down task via backend:", error);
    let errorMessage = "Failed to get sub-task suggestions.";
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
};

// --- UNCOMMENT AND REPLACE ENTIRE FILE FOR BACKEND INTEGRATION: END ---
*/

// --- REMOVE FOR BACKEND INTEGRATION: START ---
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { AISubTaskSuggestion } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY && API_KEY !== "") {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    // ai remains null, features requiring it will be disabled or throw error
  }
} else {
  console.warn("Gemini API key is not configured. AI features will be unavailable. Please set the API_KEY environment variable (e.g., in index.html for this demo).");
}

export const breakDownTaskWithAI = async (taskTitle: string, taskDescription?: string): Promise<AISubTaskSuggestion[]> => {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. API key might be missing or invalid.");
  }

  const prompt = `
    You are an expert project manager. Break down the following task into 2 to 5 smaller, actionable sub-tasks.
    Main Task Title: "${taskTitle}"
    ${taskDescription ? `Main Task Description: "${taskDescription}"` : ''}

    For each sub-task, provide a concise title and an optional short description (1-2 sentences).
    Focus on creating actionable and distinct sub-tasks.
    Do not include the original task itself in the sub-tasks.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The concise title of the sub-task.",
        },
        description: {
          type: Type.STRING,
          description: "An optional, brief description of the sub-task.",
        },
      },
      required: ["title"],
    },
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item.title === 'string' && (typeof item.description === 'string' || typeof item.description === 'undefined'))) {
        return parsedData as AISubTaskSuggestion[];
    } else {
        console.error("AI response was not in the expected format. Received:", parsedData);
        throw new Error("AI response format error. Could not parse sub-tasks. Ensure the response is an array of objects with a 'title' string and optional 'description' string.");
    }

  } catch (error) {
    console.error("Error breaking down task with AI:", error);
    let errorMessage = "Failed to get sub-task suggestions from AI.";
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}. Check browser console for more info. Make sure your API key is valid and the model name '${GEMINI_MODEL_TEXT}' is correct.`;
    }
    throw new Error(errorMessage);
  }
};
// --- REMOVE FOR BACKEND INTEGRATION: END ---