import {
    useState,
    useEffect
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    generateSummary
}
    from "../services/summaryService";

import ReactMarkdown
    from "react-markdown";

import "./Summary.css";

function Summary() {

    const navigate =
        useNavigate();

    const fileName =
        localStorage.getItem(
            "selected_pdf"
        );

    const [summary,
        setSummary] =
        useState("");

    const [loading,
        setLoading] =
        useState(true);

    const fetchSummary =
        async () => {

            setLoading(
                true
            );

            try {

                const response =
                    await generateSummary(
                        fileName
                    );

                setSummary(
                    response.summary
                );

            } catch (error) {

                setSummary(
                    error?.response?.data?.detail
                    || "Something went wrong"
                );

            } finally {

                setLoading(false);

            }

        };

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSummary();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    PDF Summary
                </h1>

                <p className="summary-file">
                    <span>{fileName}</span>
                </p>

                <div
                    className="summary-content"
                >

                    {
                        loading

                            ?

                            (
                                <div>
                                    <p className="loading-label">
                                        Generating Summary...
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
                                {summary}
                            </ReactMarkdown>
                    }

                </div>

            </div>

        </div>

    );
}

export default Summary;
