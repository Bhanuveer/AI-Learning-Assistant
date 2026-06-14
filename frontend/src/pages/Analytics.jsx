import {
    useState,
    useEffect
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getAnalytics
}
    from "../services/analyticsService";

import "./Summary.css";

function Analytics() {

    const navigate =
        useNavigate();

    const [analytics,
        setAnalytics] =
        useState(null);

    useEffect(() => {

        loadAnalytics();

    }, []);

    const loadAnalytics =
        async () => {

            const data =
                await getAnalytics();

            setAnalytics(
                data
            );

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
                    Student Analytics
                </h1>

                {

                    analytics && (

                        <div
                            className="summary-content"
                        >

                            <h3>

                                Total Quizzes:
                                {" "}
                                {
                                    analytics.total_quizzes
                                }

                            </h3>

                            <h3>

                                Average Score:
                                {" "}
                                {
                                    analytics.average_score
                                }%

                            </h3>

                            <h3>

                                Best Score:
                                {" "}
                                {
                                    analytics.best_score
                                }%

                            </h3>

                        </div>

                    )

                }

            </div>

        </div>

    );

}

export default Analytics;