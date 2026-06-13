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

from app.rag.chat_engine import (
    generate_answer
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

question = input(
    "Ask Question: "
)

retrieved_chunks = retrieve_chunks(
    question,
    index,
    chunks
)

answer = generate_answer(
    question,
    retrieved_chunks
)

print("\nANSWER:\n")
print(answer)