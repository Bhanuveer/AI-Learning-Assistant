from app.database.mongodb import db

from app.rag.faiss_manager import (load_index)
from app.rag.chunk_manager import (load_chunks)
from app.rag.retriever import (retrieve_chunks)
from app.rag.chat_engine import (generate_answer)

def ask_question(file_name,question,
                 current_user):

    documents_collection = (db["documents"])

    document = (
        documents_collection.find_one(
            {
                "file_name":
                file_name,

                "user_email":
                current_user["email"]
            }
        )
    )

    if not document:

        return {
            "success": False,
            "message":
            "Document not found"
        }

    index = load_index(
        document["index_path"]
    )

    chunks = load_chunks(
        document["chunk_path"]
    )

    retrieved_chunks = (
        retrieve_chunks(
            question,
            index,
            chunks
        )
    )

    answer = generate_answer(
        question,
        retrieved_chunks
    )

    return {
        "success": True,
        "answer": answer
    }