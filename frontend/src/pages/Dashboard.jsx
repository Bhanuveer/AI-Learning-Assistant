import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import AppShell, { PageHeader } from "../components/AppShell";
import LearnerOverview from "../components/LearnerOverview";
import { Card, Empty } from "../components/ui";
import Icon from "../components/icons";
import useAsync from "../hooks/useAsync";
import { uploadDocument, getDocuments, deleteDocument } from "../services/documentService";
import { getAnalytics } from "../services/analyticsService";
import { getProfile } from "../services/profileService";
import { getOverview } from "../services/learnerService";

function DocumentAnalytics({ analytics }) {

    if (analytics.total_quizzes === 0) {
        return <p className="li-muted li-mt-8">No quiz attempts for this document yet.</p>;
    }

    return (
        <div className="li-mt-12">
            <div className="li-kpis">
                <div className="li-kpi"><div className="li-kpi-label">Quizzes taken</div><div className="li-kpi-value">{analytics.total_quizzes}</div></div>
                <div className="li-kpi"><div className="li-kpi-label">Average score</div><div className="li-kpi-value">{analytics.average_score}%</div></div>
                <div className="li-kpi"><div className="li-kpi-label">Best score</div><div className="li-kpi-value">{analytics.best_score}%</div></div>
            </div>
            <ResponsiveContainer width="100%" height={170}>
                <LineChart data={analytics.history}>
                    <CartesianGrid stroke="var(--grid)" />
                    <XAxis dataKey="attempt" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2} dot />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function Dashboard() {

    const navigate = useNavigate();
    const fileInput = useRef(null);

    const profile = useAsync(getProfile);
    const overview = useAsync(getOverview);
    const docs = useAsync(getDocuments);

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [openDoc, setOpenDoc] = useState(null);
    const [docAnalytics, setDocAnalytics] = useState(null);

    const documents = docs.data?.documents ?? [];
    const firstName = profile.data?.name?.split(" ")[0];

    const upload = async () => {

        if (!file) return;

        setUploading(true);
        setUploadError("");

        try {

            await uploadDocument(file);
            setFile(null);
            if (fileInput.current) fileInput.current.value = "";
            await docs.reload();
            overview.reload();

        } catch (e) {

            setUploadError(e?.response?.data?.detail || "Upload failed");

        } finally {

            setUploading(false);

        }
    };

    const remove = async (name) => {

        if (!window.confirm(`Delete "${name}"?`)) return;

        await deleteDocument(name);
        if (localStorage.getItem("selected_pdf") === name) localStorage.removeItem("selected_pdf");
        if (openDoc === name) setOpenDoc(null);
        await docs.reload();

    };

    const toggleAnalytics = async (name) => {

        if (openDoc === name) {
            setOpenDoc(null);
            return;
        }

        setOpenDoc(name);
        setDocAnalytics(null);

        try {
            setDocAnalytics(await getAnalytics(name));
        } catch {
            setDocAnalytics({ total_quizzes: 0 });
        }
    };

    const open = (name, path) => {
        localStorage.setItem("selected_pdf", name);
        navigate(path);
    };

    return (
        <AppShell>

            <PageHeader
                eyebrow="From what should I learn? To what should I do next?"
                title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
                subtitle="Your learner state is built from every quiz, practice task and revision you complete."
            />

            {overview.loading || overview.error
                ? <p className={overview.error ? "li-error" : "li-muted"}>{overview.error || "Loading your learner overview…"}</p>
                : <LearnerOverview overview={overview.data} compact onChange={overview.reload} />}

            <div className="li-grid" style={{ marginTop: 24 }}>

                <Card className="li-span-4" title="Add study material" subtitle="PDFs are indexed so answers stay grounded in them.">
                    <div className="dash-dropzone">
                        <input
                            ref={fileInput}
                            id="pdf-input"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0] ?? null)}
                        />
                        <label htmlFor="pdf-input" className="li-btn li-btn-ghost" style={{ display: "inline-block", cursor: "pointer" }}>
                            <Icon name="upload" style={{ verticalAlign: "-3px", marginRight: 6 }} />
                            Choose a PDF
                        </label>
                        {file && <div className="dash-file">{file.name}</div>}
                    </div>
                    <button className="li-btn li-mt-12" style={{ width: "100%" }} onClick={upload} disabled={!file || uploading}>
                        {uploading ? "Processing PDF…" : "Upload"}
                    </button>
                    {uploadError && <p className="li-error li-mt-12">{uploadError}</p>}
                </Card>

                <Card className="li-span-8" title="Your documents" subtitle="Pick one to study, or open its quiz history.">
                    {docs.loading ? <p className="li-muted">Loading…</p>
                        : docs.error ? <p className="li-error">{docs.error}</p>
                            : documents.length === 0 ? <Empty>No documents yet. Upload a PDF to begin.</Empty>
                                : documents.map((d) => (
                                    <div key={d.file_name}>
                                        <div className="dash-doc">
                                            <button className="dash-doc-name" onClick={() => toggleAnalytics(d.file_name)} title="Show quiz history">
                                                {d.file_name}
                                            </button>
                                            <div className="dash-doc-actions">
                                                <button className="li-btn li-btn-sm" onClick={() => open(d.file_name, "/chat")}>Chat</button>
                                                <button className="li-btn li-btn-ghost li-btn-sm" onClick={() => open(d.file_name, "/summary")}>Summary</button>
                                                <button className="li-btn li-btn-ghost li-btn-sm" onClick={() => open(d.file_name, "/notes")}>Notes</button>
                                                <button className="li-btn li-btn-ghost li-btn-sm" onClick={() => open(d.file_name, "/quiz")}>Quiz</button>
                                                <button className="li-btn li-btn-ghost li-btn-sm li-btn-danger" onClick={() => remove(d.file_name)}>Delete</button>
                                            </div>
                                        </div>
                                        {openDoc === d.file_name && (
                                            docAnalytics
                                                ? <DocumentAnalytics analytics={docAnalytics} />
                                                : <p className="li-muted">Loading quiz history…</p>
                                        )}
                                    </div>
                                ))}
                </Card>

            </div>

        </AppShell>
    );
}

export default Dashboard;
