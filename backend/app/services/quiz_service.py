from app.database.mongodb import db

from app.rag.chunk_manager import (load_chunks)
from app.rag.chat_engine import (generate_answer)


def generate_quiz(
    file_name
):

    documents_collection = (
        db["documents"]
    )

    document = (
        documents_collection.find_one(
            {
                "file_name":
                file_name
            }
        )
    )

    if not document:

        return {
            "success": False,
            "message":
            "Document not found"
        }

    chunks = load_chunks(
        document["chunk_path"]
    )

    prompt = """
Generate exactly 10 MCQs.

Return ONLY valid JSON.

Format:

[
 {
   "question": "...",
   "options": [
      "A",
      "B",
      "C",
      "D"
   ],
   "answer": "A"
 }
]
"""

    quiz = generate_answer(
        prompt,
        chunks[:7]
    )

    return {

        "success": True,

        "quiz":
        quiz

    }