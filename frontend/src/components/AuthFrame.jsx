import ThemeToggle from "./ThemeToggle";

const LOOP = [
    ["1", "Assess", "Quizzes tag every question with a topic."],
    ["2", "Diagnose", "Gaps are scored from your own answers, with reasons."],
    ["3", "Practice", "The next best step is chosen by rules, not guesswork."],
    ["4", "Verify", "Practical tasks turn knowledge into demonstrated skill."]
];

// Two-column frame shared by Login and Register.
function AuthFrame({ children }) {

    return (
        <div className="auth">

            <section className="auth-story">

                <div className="li-brand">
                    <div className="li-brand-mark">L</div>
                    <div>
                        <strong>Learning Assistant</strong>
                        <span>Adaptive learning &amp; careers</span>
                    </div>
                </div>

                <div>
                    <h1>From <span className="mark">what should I learn?</span> to what should I do next?</h1>
                    <div className="auth-loop">
                        {LOOP.map(([n, title, text]) => (
                            <div key={n}>
                                <b>{n}</b>
                                <span><strong style={{ color: "#fffdf9" }}>{title}.</strong> {text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <small>Skill evidence is demonstrated inside this app. It is not a certification.</small>

            </section>

            <section className="auth-form-wrap">
                <ThemeToggle className="auth-toggle" />
                <div className="auth-form">{children}</div>
            </section>

        </div>
    );
}

export default AuthFrame;
