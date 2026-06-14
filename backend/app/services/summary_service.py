from app.database.mongodb import db

from app.rag.chunk_manager import (
    load_chunks
)

from app.rag.chat_engine import (
    generate_answer
)


def generate_summary(
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

    context = "\n\n".join(
        chunks[:10]
    )

    prompt = f"""
    Create a concise summary
    of the document.

    Include:

    1. Main topics
    2. Important concepts
    3. Key takeaways

    Document:

    {context}
    """

    summary = generate_answer(
        prompt,
        chunks[:5]
    )

    return {

        "success": True,

        "summary":
        summary

    }