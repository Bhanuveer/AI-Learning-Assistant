from dotenv import load_dotenv
import os

from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)

def generate_answer(
    question,
    retrieved_chunks
):

    context = "\n\n".join(
        retrieved_chunks
    )

    prompt = f"""
You are an AI Learning Assistant.

Use ONLY the provided context.

Context:
{context}

Question:
{question}

Answer:
"""

    response = llm.invoke(
        prompt
    )

    return response.content