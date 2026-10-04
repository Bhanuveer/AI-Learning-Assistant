import API from "./api";

export const generateQuiz =
    async (
        fileName,
        options = {}
    ) => {

        const response =
            await API.post(
                "/quiz/",
                {
                    file_name:
                        fileName,

                    difficulty:
                        options.difficulty,

                    focus_topics:
                        options.focusTopics
                }
            );

        return response.data;
    };
