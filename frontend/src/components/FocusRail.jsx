import { Link } from "react-router-dom";
import useAsync from "../hooks/useAsync";
import { getOverview } from "../services/learnerService";
import { Card, StatusBadge } from "./ui";
import { pct } from "./uiHelpers";

// Side panel for study pages: what to focus on, driven by the learner state.
function FocusRail({ onPickTopic }) {

    const { data } = useAsync(getOverview);

    if (!data) return <aside className="st-rail" />;

    const action = data.next.next_action;
    const gaps = data.gaps.gaps.slice(0, 4);

    return (
        <aside className="st-rail">

            <Card>
                <h4>Next best step</h4>
                {action ? (
                    <>
                        <div className="st-rail-action">
                            {action.action.replace("_", " ").toLowerCase()}: <span className="mark">{action.topic}</span>
                        </div>
                        <p className="li-muted">{action.reason}</p>
                        <p className="li-mt-12">
                            <Link to="/intelligence">See full plan</Link>
                        </p>
                    </>
                ) : <p className="li-muted">Take a quiz to get a recommendation.</p>}
            </Card>

            <Card>
                <h4>Your weak spots</h4>
                {gaps.length === 0
                    ? <p className="li-muted">None yet. Quiz results will show them here.</p>
                    : gaps.map((g) => (
                        <div className="li-row" key={g.topic_key}>
                            <button
                                className="li-link-btn"
                                style={{ flex: 1, textAlign: "left", color: "inherit", textDecoration: "none", fontWeight: 500 }}
                                title={onPickTopic ? "Ask about this topic" : undefined}
                                onClick={() => onPickTopic?.(g.topic)}
                            >
                                {g.topic}
                            </button>
                            <span className="li-muted">{pct(g.mastery)}</span>
                            <StatusBadge status={g.status} />
                        </div>
                    ))}
            </Card>

            <Card>
                <h4>Shortcuts</h4>
                <Link className="st-chip" to="/quiz?mode=adaptive" style={{ textDecoration: "none", color: "inherit" }}>
                    Adaptive quiz
                </Link>
                <Link className="st-chip" to="/skill-evidence" style={{ textDecoration: "none", color: "inherit" }}>
                    Practical task
                </Link>
                <Link className="st-chip" to="/career" style={{ textDecoration: "none", color: "inherit" }}>
                    Career roadmap
                </Link>
            </Card>

        </aside>
    );
}

export default FocusRail;
