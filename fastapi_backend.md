# Guide: Creating a Secure FastAPI Backend for the AI Task Manager

This guide walks you through the process of creating a simple and secure backend using FastAPI. The primary goal is to move the Gemini API key and AI logic from the client-side (your React app) to a server-side application. This is the standard and most secure way to build applications that use paid or protected APIs.

### Why Do This?

1.  **Security**: Your `API_KEY` is never exposed to the user's browser. This prevents theft and unauthorized use, protecting you from unexpected costs and service suspension.
2.  **Control**: You can add logging, rate-limiting, and other controls on your server.
3.  **Scalability**: A backend can manage more complex logic and connections to other services (like databases) in the future.

---

## Prerequisites

Before you start, make sure you have the following installed:

*   **Python 3.7+**: [Download Python](https://www.python.org/downloads/)
*   **pip**: Python's package installer (usually comes with Python).
*   A code editor like VS Code.

---

## Step 1: Set Up Your Backend Project

First, let's create a new directory for our backend code and set up a virtual environment.

1.  **Create a project folder** (you can place this next to your frontend app's folder).
    ```bash
    mkdir task-manager-backend
    cd task-manager-backend
    ```

2.  **Create and activate a Python virtual environment**. This isolates your project's dependencies.
    ```bash
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```
    You'll know it's active when you see `(venv)` at the beginning of your terminal prompt.

---

## Step 2: Install Dependencies

We need a few Python packages to build our server.

*   `fastapi`: The web framework itself.
*   `uvicorn`: The server that runs our FastAPI application.
*   `google-generativeai`: The official Python SDK for the Gemini API.
*   `python-dotenv`: To manage environment variables (like our API key).
*   `pydantic`: For data validation (comes with FastAPI, but good to be explicit).

Install them all with pip:

```bash
pip install "fastapi[all]" uvicorn google-generativeai python-dotenv
```

---

## Step 3: Securely Store Your API Key

1.  Inside your `task-manager-backend` directory, create a file named `.env`.

2.  Add your Gemini API key to this file. This file should **never** be committed to version control (add it to your `.gitignore` file).

    **File: `.env`**
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

---

## Step 4: Create the FastAPI Application

Now, let's write the server code.

1.  Create a file named `main.py` in the `task-manager-backend` directory.

2.  Add the following code to `main.py`. The comments explain what each part does.

    **File: `main.py`**
    ```python
    import os
    import json
    from dotenv import load_dotenv
    import google.generativeai as genai
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
    from typing import List, Optional

    # --- 1. INITIAL SETUP ---

    # Load environment variables from the .env file
    load_dotenv()

    # Create the FastAPI app instance
    app = FastAPI(
        title="AI Task Manager Backend",
        description="Handles secure calls to the Gemini API.",
        version="1.0.0",
    )

    # Configure CORS (Cross-Origin Resource Sharing)
    # This allows your React frontend (running on a different port) to communicate with this backend.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # In production, restrict this to your frontend's domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- 2. CONFIGURE GEMINI API ---

    # Get the API key from environment variables
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    # Check if the API key is available
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY environment variable not set.")

    # Configure the Gemini client
    genai.configure(api_key=GEMINI_API_KEY)

    # --- 3. DEFINE DATA MODELS (using Pydantic) ---
    # These models ensure that the data sent to and from your API is in the correct format.

    class TaskBreakdownRequest(BaseModel):
        """ The request body for the /breakdown-task endpoint. """
        title: str = Field(..., description="The main title of the task.")
        description: Optional[str] = Field(None, description="The optional description of the task.")

    class SubTaskSuggestion(BaseModel):
        """ The structure for a single AI-generated sub-task. """
        title: str
        description: Optional[str] = None

    # --- 4. CREATE THE API ENDPOINT ---

    @app.post("/api/breakdown-task", response_model=List[SubTaskSuggestion])
    async def breakdown_task(request: TaskBreakdownRequest):
        """
        Receives a task title and description, calls the Gemini API to break it down,
        and returns a list of sub-task suggestions.
        """
        try:
            # This is the same logic you had in the frontend's `geminiService.ts`
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")

            prompt = f"""
                You are an expert project manager. Break down the following task into 2 to 5 smaller, actionable sub-tasks.
                Main Task Title: "{request.title}"
                {f'Main Task Description: "{request.description}"' if request.description else ''}

                For each sub-task, provide a concise title and an optional short description (1-2 sentences).
                Focus on creating actionable and distinct sub-tasks.
                Do not include the original task itself in the sub-tasks.
            """
            
            # Define the expected JSON output format for the model
            response_schema = [
                {
                    "title": "string",
                    "description": "string (optional)"
                }
            ]

            # Generate content using the Gemini API
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=response_schema
                )
            )

            # Parse the JSON string from the response
            # The response text might have markdown backticks, so we clean it
            cleaned_json_str = response.text.strip().replace("```json", "").replace("```", "").strip()
            sub_tasks = json.loads(cleaned_json_str)

            # Validate and return the data using our Pydantic model
            return [SubTaskSuggestion(**task) for task in sub_tasks]

        except Exception as e:
            print(f"An error occurred: {e}")
            # If anything goes wrong, return a detailed HTTP error to the frontend
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get sub-task suggestions from AI. Error: {str(e)}"
            )

    # --- 5. HEALTH CHECK ENDPOINT (Optional but good practice) ---
    @app.get("/")
    def read_root():
        return {"status": "AI Task Manager Backend is running!"}

    ```

---

## Step 5: Run the Backend Server

With your virtual environment active, run the server from your terminal:

```bash
uvicorn main:app --reload
```

*   `main`: Refers to the `main.py` file.
*   `app`: Refers to the `app = FastAPI()` object inside `main.py`.
*   `--reload`: Makes the server restart automatically after you change the code.

You should see output indicating the server is running, usually at `http://127.0.0.1:8000`. You can visit this URL in your browser to see the health check message.

---

## Step 6: Update the Frontend to Use the Backend

Now, you need to modify your React application to call your new backend endpoint instead of the Gemini API directly.

1.  **Modify `services/geminiService.ts`**:
    Replace the entire content of this file with the code below. It now makes a `fetch` request to your FastAPI server.

    ```typescript
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
    ```

2.  **Clean up `index.html`**:
    You can now completely remove the `window.process` script block from `index.html`. Your API key is no longer needed on the client-side.

    ```html
    <!-- REMOVE THIS ENTIRE SCRIPT BLOCK -->
    <script>
      window.process = { 
        env: { 
          API_KEY: "" 
        } 
      };
    </script>
    ```

3.  **Clean up `App.tsx` and other components**:
    *   In `App.tsx`, you can remove the `isApiKeyMissing` state and all related logic (the `useEffect` hook and the warning banner).
    *   In `TaskItem.tsx` and `TaskFormModal.tsx`, you can remove any conditional rendering that was based on the API key's presence. The AI features will now always be available as long as your backend is running correctly.

---

## Conclusion

Congratulations! You have successfully refactored your application to use a secure backend. Your API key is now safe on the server, and your frontend is cleaner and more focused on the user interface. This architecture is robust, secure, and ready for future expansion.
