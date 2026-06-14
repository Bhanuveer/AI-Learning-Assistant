from app.database.mongodb import db

from app.rag.chunk_manager import (
    load_chunks
)

from app.rag.chat_engine import (
    generate_answer
)

def generate_notes(
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
Create detailed study notes.

Requirements:

1. Use headings
2. Use sub-headings
3. Explain concepts simply
4. Include key points
5. Include important definitions
6. Use bullet points

Make notes suitable for students.
"""

    notes = generate_answer(
        prompt,
        chunks[:7]
    )

    return {

        "success": True,

        "notes":
        notes

    }