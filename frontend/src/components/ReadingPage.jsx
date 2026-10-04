import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import StudyLayout from "./StudyLayout";
import useAsync from "../hooks/useAsync";

function Generated({ doc, generate, field, label, extra }) {

    const loader = useCallback(
        async () => (await generate(doc))[field],
        [doc, generate, field]
    );
    const { data, error, loading, reload } = useAsync(loader);

    return (
        <div className="st-doc-card">

            <div className="st-toolbar">
                <div>
                    <div className="li-eyebrow">{label}</div>
                    <h2>{doc.replace(/\.pdf$/i, "")}</h2>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="li-btn li-btn-ghost" onClick={reload} disabled={loading}>
                        Regenerate
                    </button>
                    {extra?.(loading || Boolean(error))}
                </div>
            </div>

            {loading ? (
                <div className="st-skeleton" aria-label={`Generating ${label.toLowerCase()}`}>
                    <p className="li-muted">Generating {label.toLowerCase()} from your document…</p>
                    {Array.from({ length: 7 }).map((_, i) => <div key={i} />)}
                </div>
            ) : error ? (
                <p className="li-error">{error}</p>
            ) : (
                <div className="st-prose">
                    <ReactMarkdown>{data}</ReactMarkdown>
                </div>
            )}

        </div>
    );
}

// Shared page for the Summary and Notes tabs.
function ReadingPage({ label, generate, field, extra }) {

    return (
        <StudyLayout>
            {(doc) => (
                <Generated
                    key={doc}
                    doc={doc}
                    generate={generate}
                    field={field}
                    label={label}
                    extra={extra}
                />
            )}
        </StudyLayout>
    );
}

export default ReadingPage;
