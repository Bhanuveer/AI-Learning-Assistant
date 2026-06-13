import os

from app.rag.pdf_loader import (load_pdf)
from app.rag.text_splitter import (split_text)
from app.rag.embeddings import (create_embeddings)
from app.rag.vector_store import (create_vector_store)
from app.rag.faiss_manager import (save_index)
from app.rag.chunk_manager import (save_chunks)
from app.database.mongodb import db


def save_document(
    file,
    current_user
):

    user_email = (
        current_user["email"]
    )

    user_folder = os.path.join(
        "uploads",
        user_email
    )

    os.makedirs(
        user_folder,
        exist_ok=True
    )

    file_path = os.path.join(
        user_folder,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(
            file.file.read()
        )

    pdf_name = (
        os.path.splitext(
            file.filename
        )[0]
    )

    # PDF -> Text

    text = load_pdf(
        file_path
    )

    # Text -> Chunks

    chunks = split_text(
        text
    )

    chunk_path = save_chunks(
        chunks,
        user_email,
        pdf_name
    )

    # Chunks -> Embeddings

    embeddings = create_embeddings(
        chunks
    )

    # Embeddings -> FAISS

    index = create_vector_store(
        embeddings
    )

    index_path = save_index(
        index,
        user_email,
        pdf_name
    )

    documents_collection = (
        db["documents"]
    )

    documents_collection.insert_one(
        {
            "user_email":
            user_email,

            "file_name":
            file.filename,

            "file_path":
            file_path,

            "index_path":
            index_path,

            "chunk_path":
            chunk_path
        }
    )

    return {
        "success": True,
        "message":
        "PDF Uploaded Successfully"
    }


def get_documents(
    current_user
):

    documents_collection = (db["documents"])

    documents = list(
        documents_collection.find(
            {
                "user_email":
                current_user["email"]
            },
            {
                "_id": 0,
                "file_name": 1
            }
        )
    )

    return {
        "success": True,
        "documents": documents
    }


def delete_document(
    file_name,
    current_user
):

    documents_collection = (db["documents"])

    document = (
        documents_collection.find_one(
            {
                "file_name":file_name,
                "user_email":current_user["email"]
            }
        )
    )

    if not document:

        return {
            "success": False,
            "message":
            "Document not found"
        }

    if os.path.exists(
        document["file_path"]
    ):
        os.remove(
            document["file_path"]
        )

    if os.path.exists(
        document["index_path"]
    ):
        os.remove(
            document["index_path"]
        )

    if os.path.exists(
        document["chunk_path"]
    ):
        os.remove(
            document["chunk_path"]
        )

    documents_collection.delete_one(
        {
            "file_name":
            file_name,

            "user_email":
            current_user["email"]
        }
    )

    return {
        "success": True,
        "message":
        "Document Deleted Successfully"
    }
