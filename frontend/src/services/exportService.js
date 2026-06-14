import API from "./api";


export const downloadNotes =
    async (
        fileName
    ) => {

        const response =
            await API.get(
                `/export/notes/${encodeURIComponent(
                    fileName
                )}`,
                {
                    responseType:
                        "blob"
                }
            );

        return response.data;
    };
