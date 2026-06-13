from app.rag.pdf_loader import (
    load_pdf
)

from app.rag.text_splitter import (
    split_text
)

from app.rag.embeddings import (
    create_embeddings
)

from app.rag.vector_store import (
    create_vector_store
)

from app.rag.retriever import (
    retrieve_chunks
)

text = load_pdf(
    "uploads/test@gmail.com/AIDev-resume.pdf"
)

chunks = split_text(
    text
)

embeddings = create_embeddings(
    chunks
)

index = create_vector_store(
    embeddings
)

results = retrieve_chunks(
    "Whose resume is this?",
    index,
    chunks
)

print(
    "\nRetrieved Chunks:\n"
)

for chunk in results:

    print(chunk)
    print("-" * 50)