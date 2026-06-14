import API from "./api";

export const generateQuiz =
    async (
        fileName
    ) => {

        const response =
            await API.post(
                "/quiz/",
                {
                    file_name:
                        fileName
                }
            );

        return response.data;
    };