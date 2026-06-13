import os
import faiss

def save_index(
    index,
    user_email,
    file_name
):

    user_folder = os.path.join(
        "vector_store",
        user_email
    )

    os.makedirs(
        user_folder,
        exist_ok=True
    )

    index_path = os.path.join(
        user_folder,
        f"{file_name}.index"
    )

    faiss.write_index(
        index,
        index_path
    )

    return index_path


def load_index(
    index_path
):

    return faiss.read_index(
        index_path
    )