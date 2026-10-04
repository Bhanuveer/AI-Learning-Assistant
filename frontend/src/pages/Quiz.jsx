import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudyLayout from "../components/StudyLayout";
import useAsync from "../hooks/useAsync";
import { generateQuiz } from "../services/quizService";
import { createAdaptiveAssessment } from "../services/learnerService";
import { saveQuizResult } from "../services/quizResultService";

const LETTERS = ["A", "B", "C", "D", "E"];

async function loadQuiz(doc, adaptive) {

    const response = adaptive
        ? await createAdaptiveAssessment(doc)
        : await generateQuiz(doc);

    if (response.success === false) {
        throw new Error(response.message || "Could not create the quiz");
    }

    let questions;
    try {
        questions = JSON.parse(response.quiz);
    } catch {
        // The service returns the model's raw text when it could not be parsed.
        throw new Error(response.quiz || "Invalid quiz response");
    }

    return { questions, plan: response.plan || null };
}

function Plan({ plan }) {

    return (
        <div className="q-plan">
            <strong>Why this quiz</strong>
            <p>
                Last score {plan.previous_score ?? "n/a"}{plan.previous_score !== null && "%"}.
                Difficulty {plan.previous_difficulty ? `${plan.previous_difficulty} → ` : ""}{plan.difficulty}.
                Focus: {plan.focus.join(", ")}.
            </p>
            <p className="li-muted">{plan.rationale}</p>
        </div>
    );
}

function Result({ questions, answers, score, onRetry }) {

    const navigate = useNavigate();

    const byTopic = useMemo(() => {
        const map = {};
        questions.forEach((q, i) => {
            const t = (map[q.topic] ??= { right: 0, total: 0 });
            t.total += 1;
            if (answers[i] === q.answer) t.right += 1;
        });
        return Object.entries(map);
    }, [questions, answers]);

    return (
        <div className="q-card">

            <div className="li-eyebrow">Your result</div>
            <div className="q-score">{score}<span className="li-muted"> / {questions.length}</span></div>
            <p className="li-muted li-mb-8">Your learner state has been updated with these answers.</p>

            <h3 className="li-mt-12">By topic</h3>
            {byTopic.map(([topic, t]) => (
                <div className="li-row" key={topic}>
                    <span className="li-row-label">{topic}</span>
                    <div className="li-meter">
                        <div
                            className="li-meter-fill"
                            style={{ width: `${(t.right / t.total) * 100}%`, background: t.right === t.total ? "var(--strong)" : "var(--practice)" }}
                        />
                    </div>
                    <span className="li-row-value">{t.right}/{t.total}</span>
                </div>
            ))}

            <div style={{ display: "flex", gap: 8, margin: "18px 0", flexWrap: "wrap" }}>
                <button className="li-btn" onClick={() => navigate("/skill-gaps")}>See skill gaps</button>
                <button className="li-btn li-btn-ghost" onClick={() => navigate("/intelligence")}>Learner overview</button>
                <button className="li-btn li-btn-ghost" onClick={onRetry}>New quiz</button>
            </div>

            <h3>Review</h3>
            {questions.map((q, i) => {
                const ok = answers[i] === q.answer;
                return (
                    <div className="q-review" key={i}>
                        <strong>{i + 1}. {q.question}</strong>
                        <div className={ok ? "q-ok" : "q-bad"}>
                            {ok ? "Correct" : `Your answer: ${answers[i] ?? "not answered"}`}
                        </div>
                        {!ok && <div className="li-muted">Correct answer: {q.answer}</div>}
                    </div>
                );
            })}

        </div>
    );
}

function QuizRunner({ doc, adaptive }) {

    const [round, setRound] = useState(0);
    const loader = useCallback(() => loadQuiz(doc, adaptive), [doc, adaptive, round]); // eslint-disable-line react-hooks/exhaustive-deps
    const { data, error, loading } = useAsync(loader);

    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const retry = () => {
        setRound((r) => r + 1);
        setIdx(0);
        setAnswers({});
        setResult(null);
    };

    if (loading) {
        return (
            <div className="q-card st-skeleton">
                <p className="li-muted">
                    {adaptive ? "Building a quiz around your weak topics…" : "Generating your quiz…"}
                </p>
                {Array.from({ length: 5 }).map((_, i) => <div key={i} />)}
            </div>
        );
    }

    if (error) return <p className="li-error">{error}</p>;

    const { questions, plan } = data;

    if (result) {
        return <Result questions={questions} answers={answers} score={result.score} onRetry={retry} />;
    }

    const q = questions[idx];
    const answered = Object.keys(answers).length;

    const submit = async () => {

        const score = questions.filter((x, i) => answers[i] === x.answer).length;

        setSubmitting(true);
        setSubmitError("");

        try {

            await saveQuizResult(doc, score, questions.length, {
                answers: questions.map((x, i) => ({
                    question: x.question,
                    topic: x.topic,
                    skill: x.skill,
                    difficulty: x.difficulty,
                    selected: answers[i] ?? null,
                    correct_answer: x.answer
                })),
                difficulty: plan?.difficulty,
                mode: adaptive ? "adaptive" : "standard"
            });

            setResult({ score });

        } catch (e) {

            setSubmitError(e?.response?.data?.detail || "Could not save your result");

        } finally {

            setSubmitting(false);

        }
    };

    return (
        <div>

            {plan && <Plan plan={plan} />}

            <div className="q-progress"><div style={{ width: `${(answered / questions.length) * 100}%` }} /></div>

            <div className="q-card">

                <div>
                    <span className="li-tag">Question {idx + 1} of {questions.length}</span>
                    {q.topic && <span className="li-tag">{q.topic}</span>}
                    {q.difficulty && <span className="li-tag">{q.difficulty}</span>}
                </div>

                <div className="q-text">{q.question}</div>

                {q.options.map((option, i) => (
                    <button
                        key={option}
                        className={answers[idx] === option ? "q-option q-option-on" : "q-option"}
                        onClick={() => setAnswers({ ...answers, [idx]: option })}
                    >
                        <span className="q-letter">{LETTERS[i]}</span>
                        {option}
                    </button>
                ))}

                <div className="q-nav">
                    <button className="li-btn li-btn-ghost" onClick={() => setIdx(idx - 1)} disabled={idx === 0}>
                        Back
                    </button>
                    {idx < questions.length - 1 ? (
                        <button className="li-btn" onClick={() => setIdx(idx + 1)}>Next</button>
                    ) : (
                        <button
                            className="li-btn"
                            onClick={submit}
                            disabled={submitting || answered < questions.length}
                            title={answered < questions.length ? "Answer every question to submit" : undefined}
                        >
                            {submitting ? "Saving…" : "Submit quiz"}
                        </button>
                    )}
                </div>

                {submitError && <p className="li-error li-mt-12">{submitError}</p>}

                <div className="q-dots">
                    {questions.map((_, i) => (
                        <button
                            key={i}
                            className={`q-dot ${answers[i] ? "q-dot-done" : ""} ${i === idx ? "q-dot-here" : ""}`}
                            onClick={() => setIdx(i)}
                            aria-label={`Go to question ${i + 1}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                {idx === questions.length - 1 && answered < questions.length && (
                    <p className="li-muted li-mt-12">
                        {questions.length - answered} question(s) still unanswered.
                    </p>
                )}

            </div>

        </div>
    );
}

function Quiz() {

    const navigate = useNavigate();
    const [params] = useSearchParams();
    const adaptive = params.get("mode") === "adaptive";

    return (
        <StudyLayout>
            {(doc) => (
                <>
                    <div className="q-toolbar">
                        <div className="q-seg">
                            <button className={adaptive ? "" : "on"} onClick={() => navigate("/quiz")}>Standard</button>
                            <button className={adaptive ? "on" : ""} onClick={() => navigate("/quiz?mode=adaptive")}>Adaptive</button>
                        </div>
                        <span className="li-muted">
                            {adaptive
                                ? "Difficulty and topics are chosen from your results."
                                : "A balanced 10-question quiz on this document."}
                        </span>
                    </div>
                    <QuizRunner key={`${doc}|${adaptive}`} doc={doc} adaptive={adaptive} />
                </>
            )}
        </StudyLayout>
    );
}

export default Quiz;
