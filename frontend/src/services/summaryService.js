import axios from "axios";

const API_URL =
    "http://127.0.0.1:8000";

export const generateSummary =
    async (fileName) => {

        const token =
            localStorage.getItem(
                "token"
            );

        const response =
            await axios.post(

                `${API_URL}/summary/`,

                {
                    file_name:
                        fileName
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );

        return response.data;
    };