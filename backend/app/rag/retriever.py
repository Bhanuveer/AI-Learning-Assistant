import numpy as np

from app.rag.embeddings import (
    model
)

def retrieve_chunks(
    question,
    index,
    chunks,
    top_k=3
):

    question_embedding = (
        model.encode(
            [question]
        )
    )

    distances, indices = (
        index.search(
            np.array(
                question_embedding,
                dtype="float32"
            ),
            top_k
        )
    )

    results = []

    for idx in indices[0]:

        results.append(
            chunks[idx]
        )

    return results