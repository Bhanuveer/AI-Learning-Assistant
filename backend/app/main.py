from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import (router as auth_router)
from app.routes.document import (router as document_router)
from app.routes.chat import (router as chat_router)
from app.routes.summary import (router as summary_router)
from app.routes.notes import (router as notes_router)
from app.routes.quiz import (router as quiz_router)
from app.routes.quiz_result import (router as quiz_result_router)
from app.routes.analytics import (router as analytics_router)
from app.routes.export import (router as export_router)
from app.routes.learner import (router as learner_router)
from app.routes.assessment import (router as assessment_router)
from app.routes.skill_evidence import (router as skill_evidence_router)
from app.routes.career import (router as career_router)
from app.routes.roadmap import (router as roadmap_router)

app = FastAPI(
    title="AI Learning Assistant API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(document_router)
app.include_router(chat_router)
app.include_router(summary_router)
app.include_router(notes_router)
app.include_router(quiz_router)
app.include_router(quiz_result_router)
app.include_router(analytics_router)
app.include_router(export_router)
app.include_router(learner_router)
app.include_router(assessment_router)
app.include_router(skill_evidence_router)
app.include_router(career_router)
app.include_router(roadmap_router)



@app.get("/")
def home():

    return {
        "message":
        "AI Learning Assistant API Running"
    }
