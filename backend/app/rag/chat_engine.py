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

    try:

        response = llm.invoke(
            prompt
        )

        return response.content

    except Exception as e:

        error = str(e)

        if (
            "rate_limit_exceeded"
            in error
        ):

            return (
                "⚠️ AI daily limit reached. "
                "Please try again later."
            )

        return (
            "⚠️ AI service temporarily unavailable."
        )
