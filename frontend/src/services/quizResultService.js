import API from "./api";

export const saveQuizResult =
    async (
        fileName,
        score,
        total,
        extra = {}
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
                        total,

                    // Optional question-level data that powers the learner state.
                    answers:
                        extra.answers,

                    difficulty:
                        extra.difficulty,

                    mode:
                        extra.mode
                }
            );

        return response.data;
    };
