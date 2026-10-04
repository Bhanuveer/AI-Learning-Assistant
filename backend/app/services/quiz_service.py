import json

from app.database.mongodb import db

from app.rag.chunk_manager import (load_chunks)
from app.rag.faiss_manager import (load_index)
from app.rag.retriever import (retrieve_chunks)
from app.rag.chat_engine import (generate_answer)

from app.services.topic_service import (
    CANONICAL_SKILLS,
    parse_quiz
)


def build_quiz_prompt(
    difficulty=None,
    focus_topics=None
):

    if difficulty:
        difficulty_rule = (
            f'Every question must have difficulty "{difficulty}".'
        )
    else:
        difficulty_rule = (
            'Mix difficulties ("easy", "medium", "hard").'
        )

    focus_rule = ""

    if focus_topics:
        focus_rule = (
            "Prioritise these concepts (at least 6 of the "
            "10 questions): "
            + ", ".join(focus_topics)
            + ".\n"
        )

    return f"""
Generate exactly 10 MCQs.

{difficulty_rule}
{focus_rule}
Tag every question with:
- "topic": the specific concept tested, 1-4 words, e.g. "Convolution".
  Reuse the same wording for questions on the same concept.
- "skill": the broader skill area, exactly one of:
  {", ".join(CANONICAL_SKILLS)}, General
- "difficulty": easy, medium or hard

Return ONLY valid JSON, no markdown.

Format:

[
 {{
   "question": "...",
   "options": ["option text 1", "option text 2", "option text 3", "option text 4"],
   "answer": "the exact text of the correct option",
   "topic": "...",
   "skill": "...",
   "difficulty": "medium"
 }}
]
"""


def generate_quiz(
    file_name,
    user_email,
    difficulty=None,
    focus_topics=None
):

    documents_collection = (
        db["documents"]
    )

    document = (
        documents_collection.find_one(
            {
                "file_name":
                file_name,

                "user_email":
                user_email
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

    context_chunks = chunks[:7]

    if focus_topics:

        # Pull the passages most relevant to the weak concepts.
        index = load_index(
            document["index_path"]
        )

        context_chunks = retrieve_chunks(
            " ".join(focus_topics),
            index,
            chunks,
            top_k=min(7, len(chunks))
        )

    raw_quiz = generate_answer(
        build_quiz_prompt(
            difficulty,
            focus_topics
        ),
        context_chunks
    )

    try:

        questions = parse_quiz(
            raw_quiz,
            difficulty or "medium"
        )

    except (ValueError, TypeError):

        # Same contract as before: the frontend shows this text as the error.
        return {
            "success": True,
            "quiz": raw_quiz
        }

    return {

        "success": True,

        "quiz":
        json.dumps(
            questions
        )

    }
