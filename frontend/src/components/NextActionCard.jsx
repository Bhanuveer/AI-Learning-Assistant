import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Empty } from "./ui";
import { getNextAction } from "../services/learnerService";
import { getDocuments } from "../services/documentService";

const ROUTE_FOR = {
    ASSESS: "/quiz?mode=adaptive",
    PRACTICE: "/quiz?mode=adaptive",
    ADVANCE: "/quiz?mode=adaptive",
    REVISE: "/chat",
    READ: "/dashboard",
    BUILD_PROJECT: "/skill-evidence"
};

const LABEL_FOR = {
    ASSESS: "Start assessment",
    PRACTICE: "Practice now",
    ADVANCE: "Take harder quiz",
    REVISE: "Open chat to revise",
    READ: "Go to documents",
    BUILD_PROJECT: "Open practical tasks"
};

function NextActionCard({ next }) {

    const navigate = useNavigate();
    const [explanation, setExplanation] = useState("");
    const [busy, setBusy] = useState(false);

    const action = next?.next_action;

    const go = async () => {

        // Quiz and chat pages work on the PDF stored in localStorage.
        if (!localStorage.getItem("selected_pdf")) {
            try {
                const docs = (await getDocuments()).documents;
                if (docs.length) {
                    localStorage.setItem("selected_pdf", docs[0].file_name);
                }
            } catch { /* page will show its own error */ }
        }

        navigate(ROUTE_FOR[action.action]);
    };

    const explain = async () => {
        setBusy(true);
        try {
            const result = await getNextAction(true);
            setExplanation(result.next_action?.explanation || "");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card title="Next best action" subtitle="Chosen by rules from your learner state">
            {!action
                ? <Empty>No recommendation yet.</Empty>
                : (
                    <>
                        <span className={`li-priority-${action.priority}`}>
                            <strong>{action.priority} priority</strong>
                        </span>
                        <div className="li-action-title">
                            {action.action.replace("_", " ")}: {action.topic}
                        </div>
                        <p className="li-reason">{explanation || action.reason}</p>

                        <ol className="li-steps">
                            {action.steps.map((s) => <li key={s}>{s}</li>)}
                        </ol>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="li-btn" onClick={go}>
                                {LABEL_FOR[action.action]}
                            </button>
                            <button className="li-btn li-btn-ghost" onClick={explain} disabled={busy}>
                                {busy ? "Explaining…" : "Explain with AI"}
                            </button>
                        </div>

                        {next.actions.length > 1 && (
                            <p className="li-muted li-mt-12">
                                Then: {next.actions.slice(1, 3).map((a) => `${a.action.replace("_", " ")} ${a.topic}`).join(" → ")}
                            </p>
                        )}
                    </>
                )}
        </Card>
    );
}

export default NextActionCard;
