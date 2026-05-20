# Numiq AI

«AI-powered math solver with step-by-step explanations, graph visualization, image solving, and a modern interactive UI.»

"Numiq Banner" (https://img.shields.io/badge/AI-Math%20Solver-6366f1?style=for-the-badge)

---

## 🚀 Live Demo

### 🌐 https://numiq-ai.vercel.app

---

## ✨ Features

- 🧠 AI-generated step-by-step math explanations
- 📈 Interactive graph visualization
- 📷 Solve math problems from images
- 🎯 Clean textbook-style formatting
- 🌙 Dark / Light theme support
- 📱 Fully responsive UI
- ⚡ Smooth animated interactions
- 📝 Session & history management
- 🎨 Modern cinematic design system

---

## 🛠 Tech Stack

Frontend

- HTML5
- CSS3
- Vanilla JavaScript

Backend

- FastAPI
- Python

AI / Utilities

- Gemini API
- SymPy
- Plotly

Deployment

- Frontend: Vercel
- Backend: Render

---

## 📸 Screenshots

### Main Workspace
![Main UI] (C:\Math-Solver-AI\assests\focus-mode.png)

### Step Focus Mode
![Focus Mode] (C:\Math-Solver-AI\assests\focus-mode.png)

### Graph Visualization
![Graph] (C:\Math-Solver-AI\assests\graph-view.png)

---

## ⚙️ Local Setup

1️⃣ Clone the repository

git clone https://github.com/Sumit-342/AI-MATH-SOLVER
cd Math-Solver-AI

2️⃣ Create virtual environment

python -m venv venv

3️⃣ Activate virtual environment

Windows

venv\Scripts\activate

Mac/Linux

source venv/bin/activate

4️⃣ Install dependencies

pip install -r requirements.txt

5️⃣ Add environment variables

Create a ".env" file:

GEMINI_API_KEY=your_api_key_here

6️⃣ Run backend

uvicorn backend.main:app --reload

7️⃣ Open frontend

Open "index.html" in browser.

---

## 📂 Project Structure

Math-Solver-AI/
│
├── backend/
│   ├── main.py
│   ├── app.py
│   ├── prompts.py
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── ...
│
├── requirements.txt
└── README.md

---

### 💡 Future Improvements

- Better symbolic math rendering
- Voice-based solving
- PDF homework solving
- Multi-language support
- Better graph interaction
- User authentication

---

### 👨‍💻 Developer

Built by Sumit 

---

### 📜 License

This project is licensed under the MIT License.

---

### ❤️ Acknowledgements

Special thanks to:

- OpenAI
- Claude
- Gemini
- Plotly
- FastAPI community

For helping make this project possible.