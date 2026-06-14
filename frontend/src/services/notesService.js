import API from "./api";

export const generateNotes =
    async (
        fileName
    ) => {

        const response =
            await API.post(
                "/notes/",
                {
                    file_name:
                        fileName
                }
            );

        return response.data;
    };