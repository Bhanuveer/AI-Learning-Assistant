from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import (
    router as auth_router
)

from app.routes.document import (
    router as document_router
)

app = FastAPI(
    title="AI Learning Assistant API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(document_router)

@app.get("/")
def home():

    return {
        "message":
        "AI Learning Assistant API Running"
    }