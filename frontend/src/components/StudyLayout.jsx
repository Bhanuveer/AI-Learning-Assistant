import { Link, useLocation } from "react-router-dom";
import AppShell from "./AppShell";
import FocusRail from "./FocusRail";
import useDocuments from "../hooks/useDocuments";

const TABS = [
    ["/chat", "Chat"],
    ["/summary", "Summary"],
    ["/notes", "Notes"],
    ["/quiz", "Quiz"]
];

// Shared frame for Chat / Summary / Notes / Quiz: document picker, mode tabs,
// main pane and the focus rail. `children` receives the selected document.
function StudyLayout({ children, rail = true, onPickTopic }) {

    const { pathname } = useLocation();
    const docs = useDocuments();

    let body;

    if (docs.loading) {
        body = <p className="li-muted">Loading your documents…</p>;
    } else if (docs.error) {
        body = <p className="li-error">{docs.error}</p>;
    } else if (!docs.selected) {
        body = (
            <div className="st-empty">
                <h2>Add a document to start studying</h2>
                <p className="li-muted li-mb-8">
                    Upload a PDF and you can chat with it, summarise it, make notes and take adaptive quizzes.
                </p>
                <Link className="li-btn" to="/dashboard" style={{ textDecoration: "none", display: "inline-block" }}>
                    Upload a PDF
                </Link>
            </div>
        );
    } else {
        body = (
            <div className={rail ? "st-grid" : undefined}>
                <div>{children(docs.selected)}</div>
                {rail && <FocusRail onPickTopic={onPickTopic} />}
            </div>
        );
    }

    return (
        <AppShell>
            <div className="st-bar">
                <div className="st-doc">
                    <label htmlFor="doc-select">Studying</label>
                    <select
                        id="doc-select"
                        value={docs.selected ?? ""}
                        onChange={(e) => docs.select(e.target.value)}
                        disabled={!docs.documents.length}
                    >
                        {docs.documents.length === 0 && <option value="">No documents</option>}
                        {docs.documents.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <nav className="st-tabs">
                    {TABS.map(([to, label]) => (
                        <Link
                            key={to}
                            to={to}
                            className={pathname === to ? "st-tab st-tab-active" : "st-tab"}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
            {body}
        </AppShell>
    );
}

export default StudyLayout;
