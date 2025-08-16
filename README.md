
# AI-Powered Task Manager

![AI Task Manager](https://storage.googleapis.com/project-avis/Task-Manager-Banner.png)

A modern, responsive task management application built with React, TypeScript, and Tailwind CSS. This app helps users organize their tasks with status tracking, priority setting, and a powerful AI-driven feature to break down complex tasks into smaller, manageable sub-tasks using the **Google Gemini API**.

---

## ✨ Key Features

- **📝 Full CRUD Operations**: Create, Read, Update, and Delete tasks seamlessly.
- **📌 Status Columns**: Organize tasks into `To Do`, `In Progress`, and `Done` columns.
- **🖐️ Drag & Drop**: Intuitively move tasks between columns to update their status.
- **🔍 Task Details**: Add rich details to your tasks, including descriptions, due dates, and priority levels (`Low`, `Medium`, `High`).
- **🤖 AI-Powered Sub-tasks**: Leverage the Google Gemini API to automatically break down a large task into actionable sub-tasks, boosting productivity.
- **📱 Responsive Design**: A clean, mobile-first interface that works beautifully on any device.
- **💾 Local Storage Persistence**: Your tasks are automatically saved to your browser's local storage, so you never lose your progress.
- **🔐 Secure Backend (Optional)**: Includes a guide and full setup for a secure FastAPI backend to protect your API keys in a production-like environment.

---

## 🛠️ Technology Stack

| Area      | Technology                                                                                                                                                                                                                                                                 |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**  | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=for-the-badge) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge) |
| **AI**        | ![Google Gemini](https://img.shields.io/badge/Google-Gemini_API-4285F4?logo=google&logoColor=white&style=for-the-badge)                                                                                                                                                   |
| **Backend**   | ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge) ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=for-the-badge) ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)                     |

---

## 🚀 Getting Started

There are two ways to run this project. For a quick demo, you can run the frontend directly. For a more secure and production-ready setup, it is highly recommended to run the included FastAPI backend.

### Option 1: Frontend-Only (Quick Demo)

This method runs the entire application in the browser. It's fast to set up but requires placing your API key directly in the frontend code, which is **not secure for production**.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Configure API Key:**
    Open the `index.html` file. Find the `<script>` block with `window.process` and replace the empty string with your Google Gemini API key:
    ```html
    <script>
      window.process = { 
        env: { 
          // IMPORTANT: PASTE YOUR GEMINI API KEY HERE
          API_KEY: "YOUR_GEMINI_API_KEY_HERE" 
        } 
      };
    </script>
    ```
    > **⚠️ Security Warning:** Never commit your API key to version control. This method is for local testing only.

3.  **Run the application:**
    Since this project uses ES modules, you'll need a simple local server to run it.
    - If you have Python installed:
      ```bash
      python -m http.server
      ```
    - If you have Node.js and `serve` installed (`npm install -g serve`):
      ```bash
      serve .
      ```
    Now, open your browser and navigate to `http://localhost:8000` (or the URL provided by your server).

---

### Option 2: Frontend + Secure Backend (Recommended)

This approach uses a Python-based FastAPI server to handle all communication with the Gemini API. Your API key remains secure on the server, and the frontend communicates with your backend.

For detailed instructions, please refer to the backend setup guide:
**➡️ [Guide: Creating a Secure FastAPI Backend](fastapi_backend.md)**

A summary of the steps is below:

1.  **Set up the Backend:**
    - Navigate to the `task-manager-backend` directory (or create one as per the guide).
    - Create and activate a Python virtual environment.
    - Install dependencies: `pip install -r requirements.txt`
    - Create a `.env` file and add your API key: `GEMINI_API_KEY="YOUR_KEY_HERE"`
    - Run the server: `uvicorn main:app --reload` (or use `docker-compose up --build`). The backend will run on `http://127.0.0.1:8000`.

2.  **Prepare the Frontend:**
    - **No API key is needed in the frontend code!** You can remove the `window.process` script block from `index.html`.
    - The `services/geminiService.ts` file is already configured to send requests to `http://127.0.0.1:8000`.

3.  **Run the Frontend:**
    - Start a local server for the frontend files as described in Option 1.
    - Open the frontend in your browser. All AI features will now be securely powered by your backend.

---

## 🖼️ Screenshots

*(Coming Soon!)*

*A screenshot of the main task board view.*
*A screenshot of the "Add Task" modal.*
*A screenshot of the "AI Suggestions" modal with a list of generated sub-tasks.*

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or find any issues, feel free to open an issue or submit a pull request.

1.  **Fork** the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  **Commit** your changes (`git commit -m 'Add some feature'`).
5.  **Push** to the branch (`git push origin feature/your-feature-name`).
6.  Open a **Pull Request**.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
