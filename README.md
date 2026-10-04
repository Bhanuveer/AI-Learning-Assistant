# Adaptive AI Learning & Employability Intelligence Platform

> **From "What should I learn?" to "What should I do next?"**

Most AI study tools answer questions. This platform tries to *understand the learner*: it measures what they know from their own quiz answers, finds and explains their skill gaps, decides the next best learning step with transparent rules, verifies skills with practical tasks, and connects the result to a target career role.

Built with **FastAPI, React, MongoDB Atlas, LangChain, FAISS and Groq**.

```
Assess → Diagnose → Personalise → Practice → Verify → Align to career → Adapt → repeat
```

---

## Features

### Study tools (RAG over your own PDFs)
- **Authentication:** registration, login, JWT-protected routes, bcrypt password hashing, per-user data isolation.
- **Document library:** upload and delete PDFs. Text is extracted, chunked, embedded and stored in a per-user FAISS index.
- **Chat with PDF:** retrieval-augmented answers grounded in the selected document.
- **Summary and Notes:** generated from the document, with notes downloadable as a PDF.
- **Quiz:** 10 multiple-choice questions per document, each tagged with a topic, skill and difficulty.

### Learner intelligence
- **Learner state:** topic and skill mastery computed from stored question-level answers. Recent answers count more, harder questions count slightly more, and a small neutral prior stops a single answer from producing 0% or 100%. Nothing is hardcoded.
  - `< 50%` Weak · `50–70%` Needs Practice · `70–85%` Good · `≥ 85%` Strong
- **Skill gaps:** per-topic chart plus a plain-language reason for every label (for example *"Backpropagation is Weak because 2 of the last 2 items were answered incorrectly"*), with trend and repeated-mistake detection. Low-data results are flagged as low confidence.
- **Next-best-action engine:** rule based. `REVISE → PRACTICE → ASSESS → BUILD_PROJECT → ADVANCE → READ` is chosen from the learner state. The LLM is used only for the optional "Explain with AI" wording, never to choose the action.
- **Adaptive quiz:** difficulty follows the average of your last three quizzes (`< 50%` easier, `50–75%` same, `≥ 75%` harder) and questions focus on your weakest topics, using FAISS to retrieve the relevant passages. A "Why this quiz" card explains each plan.

### Practical verification and career mapping
- **Practical tasks:** 8 short coding tasks (Python, Algorithms, Statistics, Machine Learning, Deep Learning, NLP) scored on test cases (80%) and efficiency (20%).
- **Skill evidence:** per skill, `Knowledge 40% + Quiz 20% + Practical 40%` using the components available. A skill without a practical task is shown as *unverified*.
- **Career mapping:** compare demonstrated skills with the requirements of AI Engineer, ML Engineer, Data Scientist, Python Developer or Software Developer, with a readiness percentage and per-skill gaps.
- **Adaptive roadmap:** ordered steps (assess, revise, practice, practical task, project) built from the target role, gaps and evidence, each with a reason, estimated hours and prerequisite. Verification steps complete automatically when you pass a task; completing a revision step updates the next recommendation.

### Interface
- Study workspace with Chat / Summary / Notes / Quiz tabs, a document picker and a focus panel (next step and weak spots).
- Home dashboard that answers: what do I know, what am I weak at, what next, how close am I to my target role.
- Light and dark themes with a toggle (follows the system setting by default and remembers your choice).

---

## Honest limitations

- **Skill Evidence is not a certification.** It reflects results inside this app only.
- **Career data is a prototype dataset** (`backend/app/data/career_roles.json`), hand-written and illustrative. It is not taken from real job postings.
- **The practical-task runner is not a hardened sandbox.** Submissions run in a separate isolated-mode Python process with an empty environment, time and CPU limits, an import allow-list and an AST pre-check. All execution goes through `run_tests` in `backend/app/services/code_runner.py` so a real sandbox (container or remote runner) can replace it.
- Topic and skill tags on quiz questions are produced by the LLM, so wording can vary between quizzes.
- A new learner needs one or two quizzes before the learner state becomes meaningful.
- `/summary` and `/notes` do not yet verify document ownership per user.
- Access tokens expire after 1 hour.

---

## Architecture

```
backend/
├── app/
│   ├── database/        MongoDB connection
│   ├── data/            career_roles.json, practical_tasks.json (prototype data)
│   ├── models/          Pydantic request models
│   ├── rag/             PDF loading, chunking, embeddings, FAISS, LLM client
│   ├── routes/          One router per feature
│   ├── services/        Business logic
│   │   ├── learner_state_service.py        mastery, topics, skills, snapshots
│   │   ├── skill_gap_service.py            gap analysis with reasons
│   │   ├── next_best_action_engine.py      rule-based recommendations
│   │   ├── adaptive_assessment_service.py  difficulty and focus planning
│   │   ├── skill_evidence_service.py       evidence scoring, practical tasks
│   │   ├── code_runner.py                  isolated evaluator (prototype)
│   │   ├── career_service.py               role requirements and gaps
│   │   └── roadmap_service.py              roadmap generation and completion
│   ├── utils/           JWT, hashing, auth dependency
│   └── main.py
├── uploads/ chunks/ vector_store/ exports/   (generated, git-ignored)
└── requirements.txt

frontend/
├── src/
│   ├── components/      AppShell, StudyLayout, FocusRail, LearnerOverview, ThemeToggle, ...
│   ├── hooks/           useAsync, useDocuments, useTheme
│   ├── pages/           Dashboard, Chat, Summary, Notes, Quiz, Analytics,
│   │                    LearnerIntelligence, SkillGaps, SkillEvidence, CareerRoadmap, Login, Register
│   ├── routes/          App routes and ProtectedRoute
│   ├── services/        Axios API clients
│   └── styles/theme.css Design system (light and dark tokens)
└── package.json
```

### MongoDB collections
| Collection | Purpose |
|---|---|
| `users`, `documents` | Accounts and uploaded PDFs |
| `quiz_attempts` | One record per quiz (score, total, difficulty, mode) |
| `question_attempts` | Question-level answers with topic, skill, difficulty and score. This is the source of truth for the learner state |
| `topic_performance`, `learner_state` | Snapshots refreshed whenever new evidence arrives |
| `practical_submissions` | Practical task attempts and scores |
| `recommendations`, `adaptive_plans` | Stored next-best-action decisions and quiz plans |
| `user_career`, `roadmap_completions` | Target role and completed roadmap steps |

---

## API overview

All routes except `/auth/register` and `/auth/login` require a bearer token.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` |
| Documents | `POST /documents/upload`, `GET /documents/`, `DELETE /documents/{file_name}` |
| Study | `POST /chat/`, `POST /summary/`, `POST /notes/`, `GET /export/notes/{file_name}` |
| Quiz | `POST /quiz/` (optional `difficulty`, `focus_topics`), `POST /quiz-result/` (optional question-level `answers`), `GET /analytics/` |
| Learner | `GET /learner/state`, `/learner/skills`, `/learner/gaps`, `/learner/next-action` (`?explain=true`), `/learner/overview` |
| Adaptive | `GET /assessment/plan`, `POST /assessment/adaptive` |
| Skill evidence | `GET /skill-evidence`, `GET /skill-evidence/tasks`, `POST /skill-evidence` |
| Career | `GET /career/roles`, `GET/POST /career/target`, `GET /career/{role}/skills`, `GET /career/{role}/gaps` |
| Roadmap | `GET /roadmap`, `POST /roadmap/action/complete` |

Interactive docs are available at `http://127.0.0.1:8000/docs` while the backend runs.

---

## Getting started

### Prerequisites
- Python 3.11+ (developed and tested on 3.13) and a current Node.js (developed on 24; Vite 8 needs Node 20+)
- A MongoDB Atlas cluster (or a local MongoDB)
- A [Groq](https://console.groq.com) API key

### 1. Clone
```bash
git clone https://github.com/Bhanuveer/AI-Learning-Assistant.git
cd AI-Learning-Assistant
```

### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` (it is git-ignored):

```env
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<app>
DATABASE_NAME=ai_learning_assistant
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=a_long_random_string
ALGORITHM=HS256
```

Notes:
- Replace `<password>` with the real password, without the angle brackets. URL-encode special characters (`@` becomes `%40`).
- In Atlas, allow your IP address under Network Access.
- Generate a secret with `openssl rand -hex 32`.
- The LLM model is set in `backend/app/rag/chat_engine.py` (currently `openai/gpt-oss-120b`). If Groq retires a model, pick one from `client.models.list()`.

Run it:
```bash
uvicorn app.main:app --reload
```
The first start downloads the embedding model, so it takes a moment.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`). The frontend talks to `http://127.0.0.1:8000`, set in `frontend/src/services/api.js` and `summaryService.js`. If the backend runs elsewhere, change it there. CORS already allows any `localhost` / `127.0.0.1` port.

### Trying the full flow
1. Register, log in and upload a PDF (a Machine Learning one shows the most).
2. Chat with it, then open Summary and Notes.
3. Take a quiz. Answer some topics wrong on purpose.
4. Open **Skill gaps** to see weak topics with reasons, then **Home** for the next best action.
5. Take an **Adaptive** quiz, then complete a task under **Skill evidence**.
6. Pick a target role under **Career roadmap** and follow the roadmap.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Recharts, react-markdown |
| Backend | FastAPI, Uvicorn, Pydantic |
| Database | MongoDB Atlas (PyMongo) |
| AI / RAG | LangChain, Groq LLM, sentence-transformers, FAISS |
| Auth | JWT (python-jose), bcrypt / passlib |
| PDF | PyPDF (reading), ReportLab (notes export) |

---

## Future work
- Real job-posting data for career requirements
- Hardened code sandbox and a larger practical task library
- Multi-PDF chat and flashcards
- Per-user ownership checks on summary and notes
- Configurable token lifetime and refresh tokens

---

## Developer

**Bhanuveer Singh** · MCA (AI & ML) · Python Developer | AI Enthusiast | Full Stack Developer
GitHub: https://github.com/Bhanuveer
