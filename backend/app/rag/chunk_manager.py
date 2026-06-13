import os
import pickle


def save_chunks(
    chunks,
    user_email,
    file_name
):

    user_folder = os.path.join(
        "chunks",
        user_email
    )

    os.makedirs(
        user_folder,
        exist_ok=True
    )

    chunk_path = os.path.join(
        user_folder,
        f"{file_name}.pkl"
    )

    with open(
        chunk_path,
        "wb"
    ) as f:

        pickle.dump(
            chunks,
            f
        )

    return chunk_path


def load_chunks(
    chunk_path
):

    with open(
        chunk_path,
        "rb"
    ) as f:

        return pickle.load(
            f
        )
