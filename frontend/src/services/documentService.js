import API from "./api";

export const uploadDocument =
    async (file) => {

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        const response =
            await API.post(
                "/documents/upload",
                formData
            );

        return response.data;
    };

export const getDocuments =
    async () => {

        const response =
            await API.get(
                "/documents/"
            );

        return response.data;
    };

export const deleteDocument =
    async (fileName) => {

        const response =
            await API.delete(
                `/documents/${fileName}`
            );

        return response.data;
    };