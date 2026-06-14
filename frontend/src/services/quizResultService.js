import API from "./api";

export const saveQuizResult =
    async (
        fileName,
        score,
        total
    ) => {

        const response =
            await API.post(
                "/quiz-result/",
                {
                    file_name:
                        fileName,

                    score:
                        score,

                    total:
                        total
                }
            );

        return response.data;
    };