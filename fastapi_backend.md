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
*   `uvicorn`: The server that runs our FastAPI application.
*   `google-generativeai`: The official Python SDK for the Gemini API.
*   `python-dotenv`: To manage environment variables (like our API key).
*   `pydantic`: For data validation (comes with FastAPI, but good to be explicit).

Install them all with pip:

```bash
pip install "fastapi[all]" uvicorn google-generativeai python-dotenv
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

## Step 7: (Optional) Containerizing with Docker and Docker Compose

Containerizing your backend with Docker provides a consistent, isolated, and portable environment for your application. This makes development easier and deployment much more reliable. Docker Compose further simplifies managing the container's configuration and lifecycle.

### 1. Create a `Dockerfile`

This file is the blueprint for building your application's Docker image. Create a file named `Dockerfile` (no extension) in your `task-manager-backend` root directory.

**File: `Dockerfile`**
```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependency list
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run your app using uvicorn
# We use --host 0.0.0.0 to make it accessible from outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Create a `.dockerignore` File

To keep your Docker image small and clean, you should exclude unnecessary files. Create a `.dockerignore` file in the same directory.

**File: `.dockerignore`**
```
venv
__pycache__
*.pyc
.env
.git
.vscode
```

### 3. Using Docker Compose (Recommended)

Docker Compose is the standard tool for defining and running multi-container Docker applications. It uses a YAML file to configure your application's services, making it very easy to manage.

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
    # It syncs your local code with the code inside the container,
    # so you don't have to rebuild the image for every code change.
    # Uvicorn's --reload flag will automatically restart the server.
    volumes:
      - .:/app
```

### 4. Running the Backend with Docker Compose

With the `Dockerfile` and `docker-compose.yml` files in place, running your application is simple.

1.  **Build and run the container:**
    Open your terminal in the `task-manager-backend` directory and run:
    ```bash
    docker-compose up --build
    ```
    *   `--build`: This flag tells Docker Compose to build the image before starting the container. You only need it the first time or when you change the `Dockerfile` or `requirements.txt`. For subsequent runs, `docker-compose up` is sufficient.

2.  **Accessing the API:**
    Your backend is now running inside a Docker container, but it's accessible exactly as before on `http://127.0.0.1:8000` because of the `ports: - "8000:8000"` mapping. Your React frontend can continue to call this URL without any changes.

3.  **Stopping the application:**
    To stop the container, press `Ctrl+C` in the terminal where it's running. To stop and remove the container, run:
    ```bash
    docker-compose down
    ```

This setup gives you a professional, reproducible development environment and is the first step toward deploying your application to the cloud.

---

## Step 8: Scaling with a Load Balancer (Nginx)

Once your application is containerized, the next step is to prepare it for higher traffic and improve its reliability. A single instance of your backend can only handle a limited number of requests. If that instance crashes, your entire application goes down.

**Load balancing** solves this by distributing incoming traffic across multiple instances (replicas) of your backend service.

### How it Works:

1.  We will run multiple containers of our FastAPI application.
2.  We will introduce **Nginx** as a "reverse proxy" and "load balancer".
3.  The frontend will send all requests to Nginx.
4.  Nginx will then forward each request to one of the available backend containers, cycling through them to distribute the load.
5.  If one backend container fails, Nginx will automatically send requests to the healthy ones, providing **high availability**.

![Load Balancer Diagram](https://storage.googleapis.com/project-avis/LoadBalancerDiagram.png)

Let's implement this using Docker Compose.

### 8.1 Create the Nginx Configuration

Nginx needs a configuration file to know where to send the traffic.

1.  In your `task-manager-backend` directory, create a new folder named `nginx`.
2.  Inside the `nginx` folder, create a file named `nginx.conf`.

    **File: `nginx/nginx.conf`**
    ```nginx
    # This block defines settings for handling events. 'worker_connections' sets
    # the maximum number of simultaneous connections that can be opened by a worker process.
    events {
        worker_connections 1024;
    }

    # This block defines the settings for handling HTTP requests.
    http {
        # 'upstream' defines a group of servers that we can proxy requests to.
        # We'll call our group 'backend_servers'.
        upstream backend_servers {
            # 'least_conn' is a load balancing method that sends requests to the
            # server with the fewest active connections, ensuring a balanced load.
            least_conn;

            # 'server backend:8000' adds a server to the group.
            # 'backend' is the name of our FastAPI service in docker-compose.yml.
            # Docker's internal DNS will resolve 'backend' to the IP addresses of
            # our running backend containers. We will run multiple containers for this service.
            # '8000' is the port our FastAPI app listens on inside the container.
            server backend:8000;
        }

        # This block defines a virtual server that will handle incoming requests.
        server {
            # Nginx will listen on port 8000 for incoming connections.
            listen 8000;

            # This 'location' block matches any request path ('/').
            location / {
                # 'proxy_pass' is the magic directive. It forwards the request to
                # our 'backend_servers' upstream group. Nginx will handle picking
                # which specific container gets the request.
                proxy_pass http://backend_servers;

                # These headers are important for passing information about the
                # original request to the backend service.
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
    }
    ```

### 8.2 Update Docker Compose for Scalability

Now we update our `docker-compose.yml` to include the Nginx service and prepare the backend service for scaling.

Replace the content of your `docker-compose.yml` with the following:

**File: `docker-compose.yml` (Updated)**
```yaml
version: '3.8'

services:
  # This is our FastAPI backend service.
  backend:
    build: .
    # We no longer need a container_name as we will have multiple instances.
    env_file:
      - .env
    volumes:
      - .:/app
    # IMPORTANT: We remove the 'ports' section from the backend.
    # We do not want to expose the backend containers directly to the host machine.
    # Only Nginx should be publicly accessible. It will communicate with the
    # backend containers over Docker's internal network.

  # This is our new Nginx load balancer service.
  nginx:
    # Use the official stable Nginx image from Docker Hub.
    image: nginx:stable-alpine
    container_name: task-manager-load-balancer
    ports:
      # Map port 8000 on the host machine to port 8000 in the Nginx container.
      # This is now the single entry point for all frontend traffic.
      - "8000:8000"
    volumes:
      # Mount our custom nginx.conf into the container, overwriting the default one.
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      # This ensures that Nginx will only start after the backend service is started.
      - backend
```

### 8.3 Run the Scaled Application

With the new configuration, you can now run multiple instances of your backend and have Nginx balance the load.

1.  **Build and run the services:**
    Open your terminal in the `task-manager-backend` directory and run:
    ```bash
    docker-compose up --build --scale backend=3
    ```
    - `--scale backend=3`: This is the key command. It tells Docker Compose to create and run **3 instances** (containers) of our `backend` service.
    - `--build`: Rebuilds the images if anything in the `Dockerfile` or source code has changed.

2.  **Verify it's working:**
    - Your frontend application should work exactly as before by calling `http://127.0.0.1:8000/api/breakdown-task`. The user is completely unaware of the complex architecture behind this single URL.
    - In your terminal, you will see logs from all three backend containers (e.g., `backend_1`, `backend_2`, `backend_3`) and the `nginx` container. When you make requests from the frontend, you will see the `POST /api/breakdown-task` logs appear in different backend containers, confirming that Nginx is distributing the traffic.

3.  **Stopping the application:**
    Press `Ctrl+C` in the terminal, then run `docker-compose down` to stop and remove all containers.

---

## Conclusion

Congratulations! You have successfully refactored your application to use a secure backend. Your API key is now safe on the server, and your frontend is cleaner and more focused on the user interface. Furthermore, by implementing a load balancer, you've built a scalable and resilient architecture that is ready for future expansion and can handle a significantly higher number of concurrent users.
