import API from "./api";

export const askQuestion =
    async (
        fileName,
        question
    ) => {

        const response =
            await API.post(
                "/chat/",
                {
                    file_name:
                        fileName,

                    question:
                        question
                }
            );

        return response.data;
    };