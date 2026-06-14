import API from "./api";

export const getAnalytics =
    async (
        fileName
    ) => {

        const response =
            await API.get(
                "/analytics/",
                {
                    params:
                        fileName
                            ? {
                                file_name:
                                    fileName
                            }
                            : undefined
                }
            );

        return response.data;
    };
