# 🚀 AI Learning Assistant

An AI-powered Learning Platform that enables students to upload PDFs, interact with documents using AI, generate summaries, create study notes, attempt quizzes, and track learning progress through analytics.

Built using **FastAPI, React, MongoDB, LangChain, FAISS, and Groq LLM**.

---

# 📌 Features

## 🔐 Authentication System

* User Registration
* User Login
* JWT Authentication
* Protected Routes
* User Profile Management
* Secure Password Hashing

---

## 📄 PDF Document Management

Users can:

* Upload PDF documents
* View uploaded documents
* Delete documents
* Manage personal document library

Each user's documents are stored separately.

---

## 🤖 AI Chat with PDF (RAG)

The system allows users to chat with uploaded PDFs using Retrieval-Augmented Generation (RAG).

### Workflow

1. Upload PDF
2. Extract Text
3. Split into Chunks
4. Generate Embeddings
5. Store Embeddings in FAISS Vector Database
6. Retrieve Relevant Chunks
7. Generate Context-Aware Answers using Groq LLM

### Technologies Used

* LangChain
* FAISS
* Groq LLM
* Vector Search

---

## 📝 AI Summary Generator

Generate concise summaries of uploaded PDFs.

### Features

* Automatic content analysis
* AI-generated summary
* Easy-to-read format
* Separate summary page

---

## 📚 AI Notes Generator

Generate study notes from uploaded documents.

### Features

* Structured notes
* Important concepts highlighted
* Revision-friendly format
* Downloadable notes support

---

## 🧠 Quiz Generator

Automatically generate quizzes from uploaded PDFs.

### Features

* Multiple-choice questions
* AI-generated questions
* Answer options
* Correct answer identification

---

## 🎯 Interactive Quiz System

Students can:

* Attempt quizzes
* Select answers
* Submit quizzes
* Get instant scores

### Features

* Real-time evaluation
* Score calculation
* Result storage

---

## 📊 Student Analytics Dashboard

Track learning performance through analytics.

### Metrics

* Total Quizzes Attempted
* Average Score
* Best Score
* Quiz Performance History

### Visualizations

* Performance Trend Chart
* Learning Progress Monitoring

---

## 📥 Notes Export

Students can download generated notes as PDF files.

---

# 🏗️ Project Architecture

## Backend

FastAPI-based REST API

### Modules

* Authentication
* Documents
* Chat
* Summary
* Notes
* Quiz
* Quiz Results
* Analytics
* Export

### Structure

backend/
├── app/
│ ├── database/
│ ├── models/
│ ├── rag/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ └── main.py
├── uploads/
├── chunks/
├── vector_store/
├── exports/
├── requirements.txt
└── .env

---

## Frontend

React + Vite

### Features

* Modern UI
* Protected Routes
* Dashboard
* Chat Interface
* Summary Page
* Notes Page
* Quiz Page
* Analytics Section

### Structure

frontend/
├── src/
│ ├── pages/
│ ├── routes/
│ ├── services/
│ ├── assets/
│ ├── App.jsx
│ └── main.jsx
├── package.json
└── vite.config.js

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Axios
* React Router
* Recharts

## Backend

* FastAPI
* Uvicorn
* Python

## Database

* MongoDB Atlas

## AI & Machine Learning

* LangChain
* FAISS
* Groq LLM
* Vector Embeddings

## Authentication

* JWT
* Passlib

## PDF Processing

* PyPDF
* ReportLab

---

# 🔄 System Workflow

User Uploads PDF
↓
Text Extraction
↓
Chunk Creation
↓
Embedding Generation
↓
FAISS Index Storage
↓
Chat / Summary / Notes / Quiz
↓
Analytics Tracking

---

# 📸 Application Screens

### Login Page

* Modern authentication UI
* Error handling
* JWT integration

### Dashboard

* PDF Upload
* Document Management
* Analytics Overview

### Chat Page

* Conversational AI interface
* Context-aware answers

### Summary Page

* AI-generated PDF summary

### Notes Page

* Structured study notes

### Quiz Page

* Interactive MCQ system

---

# 🔒 Security Features

* Password Hashing
* JWT Authentication
* Protected API Endpoints
* User-wise Document Isolation
* Environment Variable Management

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Bhanuveer/AI-Learning-Assistant.git
cd AI-Learning-Assistant
```

## Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Create `.env`

```env
MONGODB_URL=your_mongodb_url
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
```

Run Backend

```bash
uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:8000
```

Run Frontend

```bash
npm run dev
```

---

# 📈 Future Enhancements

* Multi-PDF Chat
* Flashcard Generator
* AI Study Planner
* Leaderboard System
* PDF Highlighting
* Voice-Based Learning Assistant
* Cloud Storage Integration
* Mobile Application

---

# 👨‍💻 Developer

**Bhanuveer Singh**

MCA (AI & ML)

Python Developer | AI Enthusiast | Full Stack Developer

GitHub:
https://github.com/Bhanuveer

---

# ⭐ Project Highlights

* Full Stack AI Application
* Retrieval-Augmented Generation (RAG)
* Vector Database Integration
* Real-Time Analytics
* Interactive Learning Experience
* Production-Ready Architecture

If you find this project useful, please consider giving it a ⭐ on GitHub.
