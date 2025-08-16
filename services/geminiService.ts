/**
 * @file geminiService.ts
 * @description This service module is responsible for all communication related to the Gemini AI.
 * It contains two implementations: one for client-side demo mode and one for a secure backend.
 *
 * INSTRUCTIONS FOR BACKEND INTEGRATION:
 * 1. Comment out or delete the "CLIENT-SIDE IMPLEMENTATION" section below.
 * 2. Uncomment the "BACKEND IMPLEMENTATION" section.
 * 3. Ensure your FastAPI backend is running at the specified URL.
 */

import { AISubTaskSuggestion } from '../types';


// --- CLIENT-SIDE IMPLEMENTATION (For Demo Mode - Insecure) ---
// --- REMOVE OR COMMENT OUT THIS ENTIRE SECTION FOR BACKEND INTEGRATION: START ---

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';

// Retrieve the API key from the `window.process` shim defined in index.html.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

// Initialize the GoogleGenAI client only if an API key is provided.
if (API_KEY && API_KEY !== "") {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    // ai remains null, features requiring it will be disabled.
  }
} else {
  // Log a warning if the API key is missing.
  console.warn("Gemini API key is not configured. AI features will be unavailable. Please set the API_KEY environment variable (e.g., in index.html for this demo).");
}

/**
 * Calls the Gemini API directly from the client to get sub-task suggestions.
 * @param {string} taskTitle The title of the task.
 * @param {string} [taskDescription] The optional description.
 * @returns {Promise<AISubTaskSuggestion[]>} A promise that resolves to an array of suggestions.
 */
export const breakDownTaskWithAI = async (taskTitle: string, taskDescription?: string): Promise<AISubTaskSuggestion[]> => {
  // Guard clause to prevent API calls if the client wasn't initialized.
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. API key might be missing or invalid.");
  }

  // Construct a detailed prompt for the AI model.
  const prompt = `
    You are an expert project manager. Break down the following task into 2 to 5 smaller, actionable sub-tasks.
    Main Task Title: "${taskTitle}"
    ${taskDescription ? `Main Task Description: "${taskDescription}"` : ''}

    For each sub-task, provide a concise title and an optional short description (1-2 sentences).
    Focus on creating actionable and distinct sub-tasks.
    Do not include the original task itself in the sub-tasks.
  `;

  // Define the expected JSON schema for the AI's response.
  // This helps ensure the AI returns data in a structured format.
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
    // Call the Gemini API's generateContent method.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    // Extract the text part of the response, which should be a JSON string.
    const jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr);

    // Validate the parsed data to ensure it matches the expected structure.
    if (Array.isArray(parsedData) && parsedData.every(item => typeof item.title === 'string' && (typeof item.description === 'string' || typeof item.description === 'undefined'))) {
        return parsedData as AISubTaskSuggestion[];
    } else {
        // If the data is not in the expected format, throw an error.
        console.error("AI response was not in the expected format. Received:", parsedData);
        throw new Error("AI response format error. Could not parse sub-tasks. Ensure the response is an array of objects with a 'title' string and optional 'description' string.");
    }

  } catch (error) {
    // Catch any errors from the API call or parsing.
    console.error("Error breaking down task with AI:", error);
    let errorMessage = "Failed to get sub-task suggestions from AI.";
    // Provide a more detailed, user-friendly error message.
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}. Check browser console for more info. Make sure your API key is valid and the model name '${GEMINI_MODEL_TEXT}' is correct.`;
    }
    throw new Error(errorMessage);
  }
};

// --- REMOVE OR COMMENT OUT THIS ENTIRE SECTION FOR BACKEND INTEGRATION: END ---



// --- BACKEND IMPLEMENTATION (For Production - Secure) ---
// --- UNCOMMENT THIS SECTION FOR BACKEND INTEGRATION: START ---
/*
// The URL of your FastAPI backend server.
const BACKEND_API_URL = 'http://127.0.0.1:8000/api/breakdown-task';

// Note: No imports from "@google/genai" are needed here because the frontend
// no longer communicates directly with the Gemini API.

export const breakDownTaskWithAI = async (taskTitle: string, taskDescription?: string): Promise<AISubTaskSuggestion[]> => {
  try {
    // Make a POST request to our secure backend endpoint.
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the task details in the request body.
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
      }),
    });

    // If the backend returns an error (e.g., 500), parse the error detail and throw it.
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
    }

    // If the response is successful, parse the JSON body which contains the suggestions.
    const suggestions: AISubTaskSuggestion[] = await response.json();
    return suggestions;

  } catch (error) {
    // Handle network errors or errors thrown from the response check.
    console.error("Error breaking down task via backend:", error);
    let errorMessage = "Failed to get sub-task suggestions from the backend.";
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
    }
    // Re-throw the error so it can be caught by the component and displayed to the user.
    throw new Error(errorMessage);
  }
};
*/
// --- UNCOMMENT THIS SECTION FOR BACKEND INTEGRATION: END ---
