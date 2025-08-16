# Frontend Architecture Guide

This document provides a detailed explanation of the AI-Powered Task Manager's frontend architecture. It covers the two primary ways to run the application: as a self-contained, frontend-only demo and as a more robust application connected to a secure FastAPI backend.

---

## 1. Frontend-Only (Demo) Mode

This mode is designed for quick setup and demonstration. All application logic, including calls to the Google Gemini API, happens directly within the user's browser.

### Key Characteristics:

-   **No Build Step**: The application runs directly in the browser using ES modules and an `importmap` in `index.html`. This avoids the need for bundlers like Vite or Webpack.
-   **Client-Side API Key**: The Google Gemini API key is stored and used directly on the client-side. This is **insecure** and should only be used for local testing.
-   **Direct API Communication**: The frontend makes HTTP requests directly to the Google Gemini API endpoints.

### How It Works:

#### a. API Key Configuration (`index.html`)

-   The API key is manually placed into a `<script>` tag in `index.html`.
-   This script creates a `window.process` object, which is a simple shim to mimic the Node.js `process.env` environment variable pattern that the `@google/genai` library can read.
    ```html
    <script>
      window.process = { 
        env: { 
          API_KEY: "YOUR_GEMINI_API_KEY_HERE" 
        } 
      };
    </script>
    ```
-   If `API_KEY` is left empty, the application will run with AI features disabled.

#### b. State Management (`App.tsx`)

-   The main `App.tsx` component is the heart of the application, managing all major states.
-   `const [tasks, setTasks] = useLocalStorage('tasks', []);`
    -   The core `tasks` array is managed using our custom `useLocalStorage` hook, which automatically persists all tasks to the browser's local storage.
-   `const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);`
    -   A dedicated state variable is used to track whether the API key was found.
    -   A `useEffect` hook checks `process.env.API_KEY` on component mount and sets this state accordingly.
    -   This state is used to conditionally render a warning banner and to disable AI-related buttons throughout the UI, providing clear feedback to the user.

#### c. AI Service (`services/geminiService.ts`)

-   This file is responsible for initializing the Gemini API client.
    ```typescript
    import { GoogleGenAI } from "@google/genai";
    const API_KEY = process.env.API_KEY;
    let ai = null;
    if (API_KEY) {
      ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    ```
-   The `breakDownTaskWithAI` function constructs the prompt, defines the expected JSON response schema, and calls `ai.models.generateContent()`.
-   It includes error handling to catch issues related to invalid API keys, network problems, or malformed responses from the AI.

#### d. Data Flow for AI Breakdown:

1.  **User Action**: A user clicks the "AI Breakdown" button in `TaskItem.tsx` or `TaskFormModal.tsx`.
2.  **Event Handler**: The `onTriggerAIBreakdown` prop is called, which traces back to `handleTriggerAIBreakdown` in `App.tsx`.
3.  **API Key Check**: `handleTriggerAIBreakdown` first checks the `isApiKeyMissing` state. If true, it displays an error and stops.
4.  **State Update**: `App.tsx` sets `isLoadingAI` to `true` and opens the `AISuggestionsModal` to show a loading state.
5.  **Service Call**: It calls `breakDownTaskWithAI()` from `geminiService.ts`.
6.  **Direct API Request**: The service sends a `fetch` request directly to the Google Gemini API.
7.  **Response Handling**: The service parses the response. On success, it returns an array of sub-task suggestions. On failure, it throws an error.
8.  **State Update**: `App.tsx` catches the response. It updates `aiSubTaskSuggestions` with the data (or `aiError` with the error message) and sets `isLoadingAI` to `false`.
9.  **UI Update**: The `AISuggestionsModal` re-renders to show either the list of suggestions or the error message.

---

## 2. Secure FastAPI Backend Mode (Recommended)

This is the production-ready architecture. The frontend's responsibility is limited to UI and user interactions, while the backend handles all secure operations and communication with the Gemini API.

### Key Characteristics:

-   **Secure API Key**: The API key is stored securely on the server and is never exposed to the browser.
-   **Separation of Concerns**: The frontend handles presentation, and the backend handles business logic and third-party API communication.
-   **Simplified Frontend Logic**: The frontend no longer needs to manage the API key's state or initialize the Gemini client.

### How It Works:

#### a. API Key Configuration (N/A for Frontend)

-   The entire `<script>` block for `window.process` in `index.html` is **removed**. The frontend has no knowledge of the API key.

#### b. State Management (`App.tsx`)

-   The `isApiKeyMissing` state variable and its associated `useEffect` hook are **removed**.
-   The warning banner for the missing API key is **removed**.
-   UI elements for AI features are no longer rendered conditionally. They are always available, assuming the backend is running.

#### c. AI Service (`services/geminiService.ts`)

-   The file is completely replaced with a much simpler version.
-   It no longer imports or uses `@google/genai`.
-   The `breakDownTaskWithAI` function now uses the browser's `fetch` API to make a `POST` request to our own FastAPI backend endpoint (e.g., `http://127.0.0.1:8000/api/breakdown-task`).
    ```typescript
    const BACKEND_API_URL = 'http://127.0.0.1:8000/api/breakdown-task';

    export const breakDownTaskWithAI = async (taskTitle, taskDescription) => {
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, description: taskDescription }),
      });
      // ... error handling for the backend response
      return response.json();
    };
    ```
-   Error handling is adapted to process HTTP error responses from our own backend, which in turn might pass along errors from the Gemini API.

#### d. Data Flow for AI Breakdown:

1.  **User Action**: A user clicks the "AI Breakdown" button (this is identical to the demo mode).
2.  **Event Handler**: `handleTriggerAIBreakdown` in `App.tsx` is called.
3.  **API Key Check**: This step is **removed**. The function proceeds directly to the next step.
4.  **State Update**: `App.tsx` sets `isLoadingAI` to `true` and opens the `AISuggestionsModal`.
5.  **Service Call**: It calls `breakDownTaskWithAI()` from the **new** `geminiService.ts`.
6.  **Backend Request**: The service sends a `fetch` request to the **FastAPI backend**.
7.  **Backend Processing**: The backend receives the request, constructs the prompt, and securely calls the Google Gemini API using the server-side API key. It then gets the response and forwards it back to the frontend.
8.  **Response Handling**: The frontend service receives the response from its own backend.
9.  **State Update**: `App.tsx` updates `aiSubTaskSuggestions` or `aiError` based on the response from the backend.
10. **UI Update**: The `AISuggestionsModal` re-renders with the results.

This decoupled architecture is more secure, scalable, and maintainable, making it the standard for building real-world applications.
