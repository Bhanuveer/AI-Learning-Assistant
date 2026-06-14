import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {generateQuiz} from "../services/quizService";
import "./Summary.css";
import {saveQuizResult}from "../services/quizResultService";

function Quiz() {

    const navigate =
        useNavigate();

    const fileName =
        localStorage.getItem(
            "selected_pdf"
        );

    const [quiz,
        setQuiz] =
        useState([]);

    const [loading,
        setLoading] =
        useState(true);

    const [error,
        setError] =
        useState("");

    const [selectedAnswers,
        setSelectedAnswers] =
        useState({});

    const fetchQuiz =
        async () => {

            setLoading(
                true
            );

            setError(
                ""
            );

            try {

                const response =
                    await generateQuiz(
                        fileName
                    );

                try {

                    const quizData =
                        JSON.parse(
                            response.quiz
                        );

                    setQuiz(
                        quizData
                    );

                } catch {

                    setError(
                        response.quiz
                        || "Invalid quiz response"
                    );

                }

            } catch (requestError) {

                setError(
                    requestError?.response?.data?.detail
                    || "Something went wrong"
                );

            } finally {

                setLoading(false);

            }

        };

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchQuiz();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmitQuiz =
        async () => {

            let score = 0;

            quiz.forEach(

                (
                    question,
                    index
                ) => {

                    if (

                        selectedAnswers[
                            index
                        ] ===

                        question.answer

                    ) {

                        score++;

                    }

                }

            );

            try {

                await saveQuizResult(

                    fileName,

                    score,

                    quiz.length

                );

                alert(

                    `Your Score:
        ${score}/${quiz.length}`

                );

            } catch (requestError) {

                alert(
                    requestError?.response?.data?.detail
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
                    Quiz Generator
                </h1>

                <p className="summary-file">
                    {fileName}
                </p>

                <div className="summary-content">

                    {
                        loading

                            ?

                            "Generating Quiz..."

                            : error

                            ?

                            error

                            :

                            quiz.map(
                                (
                                    question,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        style={{
                                            marginBottom:
                                                "30px"
                                        }}
                                    >

                                        <h3>

                                            Q{index + 1}.

                                            {" "}

                                            {
                                                question.question
                                            }

                                        </h3>

                                        {
                                            question.options.map(
                                                (
                                                    option,
                                                    optionIndex
                                                ) => (

                                                    <div
                                                        key={optionIndex}
                                                    >

                                                        <label>

                                                            <input
                                                                type="radio"
                                                                name={`q${index}`}
                                                                value={option}
                                                                onChange={() =>

                                                                    setSelectedAnswers(

                                                                        {
                                                                            ...selectedAnswers,

                                                                            [index]:
                                                                            option
                                                                        }

                                                                    )

                                                                }
                                                            />

                                                            {" "}

                                                            {option}

                                                        </label>

                                                    </div>

                                                )
                                            )
                                        }

                                        <hr />

                                    </div>

                                )
                            )
                    }

                </div>

                <button
                    onClick={
                        handleSubmitQuiz
                    }
                    disabled={
                        loading
                        || Boolean(error)
                        || quiz.length === 0
                    }
                >
                    {
                        loading
                            ? "Generating Quiz..."
                            : "Submit Quiz"
                    }
                </button>

            </div>

        </div>

    );

}

export default Quiz;
