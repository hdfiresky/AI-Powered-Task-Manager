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
*   **(Optional) Docker**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) if you plan to follow the containerization steps.

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
*   `uvicorn`: The ASGI server that runs our app.
*   `gunicorn`: A production-grade process manager.
*   `google-generativeai`: The official Python SDK for the Gemini API.
*   `python-dotenv`: To manage environment variables (like our API key).

Install them all with pip:

```bash
pip install "fastapi[all]" uvicorn gunicorn google-generativeai python-dotenv
```

---

### Step 2.5: Create a Requirements File

To make your project's dependencies portable (especially for Docker later), create a `requirements.txt` file.

Run this command in your terminal (with your virtual environment active):

```bash
pip freeze > requirements.txt
```

This captures the exact versions of the packages you installed, ensuring your application runs consistently everywhere.

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
    from google.generativeai.types import GenerationConfig
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
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")

            prompt = f"""
                You are an expert project manager. Break down the following task into 2 to 5 smaller, actionable sub-tasks.
                Main Task Title: "{request.title}"
                {f'Main Task Description: "{request.description}"' if request.description else ''}

                For each sub-task, provide a concise title and an optional short description (1-2 sentences).
                Focus on creating actionable and distinct sub-tasks.
                Do not include the original task itself in the sub-tasks.
                
                Respond with a valid JSON array of objects, where each object has a "title" key (string) and an optional "description" key (string).
            """
            
            # Create a generation config to ensure the response is in JSON format.
            generation_config = GenerationConfig(
                response_mime_type="application/json"
            )
            
            # Generate content using the Gemini API
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )

            # The API should return a JSON string directly.
            sub_tasks = json.loads(response.text)

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
# For development
uvicorn main:app --reload
```

You should see output indicating the server is running, usually at `http://127.0.0.1:8000`.

### Testing the Endpoint Locally

Once the server is running, you can test the `/api/breakdown-task` endpoint directly to ensure it's working correctly without needing the frontend.

Open a **new terminal window** (leave the `uvicorn` server running) and use a command-line tool like `curl` to send a test request. The command is different for macOS/Linux vs. Windows.

**For macOS and Linux (and Git Bash on Windows):**

Use single quotes around the JSON data.

```bash
curl -X POST "http://127.0.0.1:8000/api/breakdown-task" \
-H "Content-Type: application/json" \
-d '{
    "title": "Plan a company offsite event",
    "description": "Organize a three-day offsite for 50 employees, including travel, accommodation, and activities."
}'
```

**For Windows Command Prompt (cmd.exe):**

Use double quotes around the JSON data and escape the inner double quotes with a backslash `\`.

```bash
curl -X POST "http://127.0.0.1:8000/api/breakdown-task" -H "Content-Type: application/json" -d "{\"title\": \"Plan a company offsite event\", \"description\": \"Organize a three-day offsite for 50 employees, including travel, accommodation, and activities.\"}"
```

#### Expected Response

If your API key is correct and the server is working, you should get a JSON response back in your terminal that looks something like this (the exact content will vary based on the AI's response):

```json
[
  {
    "title": "Finalize budget and get approval",
    "description": "Create a detailed budget covering all expenses and submit it for management approval."
  },
  {
    "title": "Book venue and accommodation",
    "description": "Research and book a suitable venue that can accommodate 50 people for three days."
  },
  {
    "title": "Arrange travel and transportation",
    "description": "Coordinate flights or other transportation for all employees attending the offsite."
  }
]
```

If you see an error, check the terminal where `uvicorn` is running for more detailed logs. A common issue is a missing or invalid `GEMINI_API_KEY` in your `.env` file.

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

3.  **Clean up `App.tsx` and other components**:
    *   In `App.tsx`, you can remove the `isApiKeyMissing` state and all related logic (the `useEffect` hook and the warning banner).
    *   In `TaskItem.tsx` and `TaskFormModal.tsx`, you can remove any conditional rendering that was based on the API key's presence.

---

## Step 7: Containerizing with Docker (Production-Ready)

Containerizing your backend provides a consistent, isolated, and portable environment. This is the standard for modern deployment.

### 1. Create a `Dockerfile`

This file is the blueprint for building your application's Docker image. For production, we will use **Gunicorn** to manage **Uvicorn workers**. This combination is robust and fully utilizes multi-core CPUs.

**File: `Dockerfile`**
```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the dependency list
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# --- PRODUCTION COMMAND ---
# Use Gunicorn as the process manager to run multiple Uvicorn workers.
# This is the recommended setup for production to handle concurrent requests
# and leverage multiple CPU cores.
#
# A good starting point for the number of workers is (2 * CPU_CORES) + 1.
# Example for a 2-core CPU: -w 5
#
# -k uvicorn.workers.UvicornWorker: Specifies that Gunicorn should use Uvicorn's worker class.
# --bind 0.0.0.0:8000: Binds the server to port 8000 on all network interfaces.
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
```

### 2. Create a `.dockerignore` File

To keep your Docker image small and clean, exclude unnecessary files.

**File: `.dockerignore`**
```
venv
__pycache__
*.pyc
.env
.git
.vscode
```

### 3. Using Docker Compose

Docker Compose simplifies managing your container's configuration and lifecycle.

Create a file named `docker-compose.yml` in your backend's root directory.

**File: `docker-compose.yml`**
```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: task-manager-api
    ports:
      # Map port 8000 on your host machine to port 8000 in the container
      - "8000:8000"
    env_file:
      # This tells Docker Compose to load environment variables from the .env file
      - .env
    # The following volume mount is useful for development.
    # It syncs local code changes into the container instantly.
    # However, Gunicorn does not auto-reload. For development with Docker,
    # you might temporarily change the CMD in the Dockerfile back to `uvicorn --reload`.
    volumes:
      - .:/app
```

### 4. Running the Backend with Docker Compose

1.  **Build and run the container:**
    Open your terminal in the `task-manager-backend` directory and run:
    ```bash
    docker-compose up --build
    ```
    *   `--build`: This flag tells Docker Compose to build the image before starting the container. You only need it the first time or when you change the `Dockerfile` or `requirements.txt`. For subsequent runs, `docker-compose up` is sufficient.

2.  **Accessing the API:**
    Your backend is now running inside a Docker container, accessible on `http://127.0.0.1:8000`.

3.  **Stopping the application:**
    To stop the container, press `Ctrl+C` in the terminal where it's running. To stop and remove the container, run:
    ```bash
    docker-compose down
    ```

---

## Conclusion

Congratulations! You have successfully refactored your application to use a secure backend. Your API key is now safe on the server, and your architecture is robust, secure, and ready for production deployment.