import {
    useState,
    useEffect
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    generateNotes
} from "../services/notesService";

import {
    downloadNotes
} from "../services/exportService";

import ReactMarkdown
    from "react-markdown";

import "./Summary.css";

function Notes() {

    const navigate =
        useNavigate();

    const fileName =
        localStorage.getItem(
            "selected_pdf"
        );

    const [notes,
        setNotes] =
        useState("");

    const [loading,
        setLoading] =
        useState(true);

    const fetchNotes =
        async () => {

            setLoading(
                true
            );

            try {

                const response =
                    await generateNotes(
                        fileName
                    );

                setNotes(
                    response.notes
                );

            } catch (error) {

                setNotes(
                    error?.response?.data?.detail
                    || "Something went wrong"
                );

            } finally {

                setLoading(false);

            }

        };

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotes();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDownload =
        async () => {

            try {

                const blob =
                    await downloadNotes(
                        fileName
                    );

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href = url;
                link.download = "notes.pdf";

                document.body.appendChild(
                    link
                );

                link.click();
                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                alert(
                    error?.response?.data?.detail
                    || "Something went wrong"
                );

            }

        };

    return (

        <div className="summary-container">

            <div className="summary-card">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                >
                    Back
                </button>

                <h1 className="summary-title">
                    Study Notes
                </h1>

                <p className="summary-file">
                    <span>{fileName}</span>
                </p>

                <div className="summary-content">

                    {
                        loading

                            ?

                            (
                                <div>
                                    <p className="loading-label">
                                        Generating Notes...
                                    </p>

                                    <div className="summary-loading">
                                        <div className="shimmer-line"></div>
                                        <div className="shimmer-line"></div>
                                        <div className="shimmer-line"></div>
                                        <div className="shimmer-line"></div>
                                        <div className="shimmer-line"></div>
                                        <div className="shimmer-line"></div>
                                    </div>
                                </div>
                            )

                            :

                            <ReactMarkdown>
                                {notes}
                            </ReactMarkdown>
                    }

                </div>

                <button
                    onClick={handleDownload}
                    disabled={loading}
                >
                    Download PDF
                </button>

            </div>

        </div>

    );

}

export default Notes;
