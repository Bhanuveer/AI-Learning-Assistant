import { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import {uploadDocument,getDocuments,deleteDocument
} from "../services/documentService";
import { getAnalytics } from "../services/analyticsService";
import { getProfile } from "../services/profileService";
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";


function Dashboard() {

    const [file, setFile] =useState(null);
    const [uploading, setUploading] =useState(false);
    const [documents, setDocuments] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentAnalytics, setDocumentAnalytics] = useState(null);
    const [documentAnalyticsLoading, setDocumentAnalyticsLoading] =
        useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const loadDocuments =
        async () => {

            const response =
                await getDocuments();

            setDocuments(
                response.documents
            );
        };

    const loadAnalytics =
        async () => {

            const data =
                await getAnalytics();

            setAnalytics(
                data
            );

        };

    const loadProfile =
        async () => {

            const profile =
                await getProfile();

            setUser(
                profile
            );

        };

    const handleDocumentSelect =
        async (fileName) => {

            setSelectedDocument(
                fileName
            );

            setDocumentAnalyticsLoading(
                true
            );

            try {

                const data =
                    await getAnalytics(
                        fileName
                    );

                setDocumentAnalytics(
                    data
                );

            } catch (error) {

                setDocumentAnalytics(
                    null
                );

                alert(
                    error?.response?.data?.detail
                    || "Something went wrong"
                );

            } finally {

                setDocumentAnalyticsLoading(
                    false
                );

            }

        };

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDocuments();
        loadAnalytics();
        loadProfile();

    }, []);

    const handleUpload =
        async () => {

            if (!file) return;

            try {

                setUploading(true);

                await uploadDocument(
                    file
                );

                await loadDocuments();

                alert(
                    "PDF Uploaded Successfully"
                );

                setFile(null);

                document.querySelector(
                    'input[type="file"]'
                ).value = "";

            } catch (error) {

                alert(
                    error?.response?.data?.detail
                    || "Something went wrong"
                );

            } finally {

                setUploading(false);

            }
        };

    const handleDelete =
        async (fileName) => {

            const confirmed =
                window.confirm(
                    "Delete this document?"
                );

            if (!confirmed)
                return;

            await deleteDocument(
                fileName
            );

            await loadDocuments();

            if (
                selectedDocument === fileName
            ) {

                setSelectedDocument(
                    null
                );

                setDocumentAnalytics(
                    null
                );

            }
        };
    
    return (

        <div className="dashboard-container">

            <div className="dashboard-card">

                {
                    user && (

                        <div className="welcome-banner">

                            <div className="welcome-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="welcome-info">
                                <span className="welcome-greeting">
                                    Welcome back,
                                </span>
                                <span className="welcome-name">
                                    {user.name} 👋
                                </span>
                                <span className="welcome-sub">
                                    Ready to learn something new today?
                                </span>
                            </div>

                        </div>

                    )
                }

                <h1 className="dashboard-title">
                    AI Learning Assistant
                </h1>

                <div className="upload-section">

                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                            setFile(
                                e.target.files[0]
                            )
                        }
                    />

                    <button
                        className="upload-btn"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {
                            uploading
                                ?
                                "Processing PDF..."
                                :
                                "Upload PDF"
                        }
                    </button>

                </div>

                <p
                    style={{
                        textAlign: "center",
                        color: "#6b7280"
                    }}
                >
                    Upload a PDF and chat with its contents using AI
                </p>

                <h2 className="documents-title">
                    Your Documents
                </h2>

                {
                    documents.length === 0
                        ?
                        (
                            <p className="empty-text">
                                No documents uploaded yet
                            </p>
                        )
                        :
                        (
                            documents.map(
                                (doc) => (

                                    <div
                                        key={doc.file_name}
                                        className={
                                            selectedDocument === doc.file_name
                                                ? "document-item document-item-selected"
                                                : "document-item"
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="document-name-btn"
                                            onClick={() =>
                                                handleDocumentSelect(
                                                    doc.file_name
                                                )
                                            }
                                        >
                                            📚 {doc.file_name}
                                        </button>

                                        <div className="document-actions">

                                            <button
                                                className="summary-btn"
                                                onClick={() => {

                                                    localStorage.setItem(
                                                        "selected_pdf",
                                                        doc.file_name
                                                    );

                                                    navigate(
                                                        "/summary"
                                                    );

                                                }}
                                            >
                                                Summary
                                            </button>

                                            <button
                                                className="notes-btn"
                                                onClick={() => {

                                                    localStorage.setItem(
                                                        "selected_pdf",
                                                        doc.file_name
                                                    );

                                                    navigate(
                                                        "/notes"
                                                    );

                                                }}
                                            >
                                                Notes
                                            </button>

                                            <button
                                                className="chat-btn"
                                                onClick={() => {

                                                    localStorage.setItem(
                                                        "selected_pdf",
                                                        doc.file_name
                                                    );

                                                    navigate(
                                                        "/chat"
                                                    );

                                                }}
                                            >
                                                Chat
                                            </button>

                                            <button
                                                className="chat-btn"
                                                onClick={() => {

                                                    localStorage.setItem(
                                                        "selected_pdf",
                                                        doc.file_name
                                                    );

                                                    navigate(
                                                        "/quiz"
                                                    );

                                                }}
                                            >
                                                Quiz
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        doc.file_name
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                )
                            )
                        )
                }

                {
                    analytics && (

                        <div className="analytics-section">

                            <h2 className="documents-title">
                                All Quiz Analytics
                            </h2>

                            <div className="analytics-grid">

                                <div className="analytics-item">
                                    <span className="analytics-label">Total Quizzes</span>
                                    <span className="analytics-value">{analytics.total_quizzes}</span>
                                </div>

                                <div className="analytics-item">
                                    <span className="analytics-label">Average Score</span>
                                    <span className="analytics-value">{analytics.average_score}%</span>
                                </div>

                                <div className="analytics-item">
                                    <span className="analytics-label">Best Score</span>
                                    <span className="analytics-value">{analytics.best_score}%</span>
                                </div>

                            </div>

                        </div>

                    )
                }

                {
                    selectedDocument && (

                        <div className="document-analytics-section">

                            <div className="document-analytics-header">

                                <div>
                                    <span className="analytics-eyebrow">
                                        Selected document
                                    </span>

                                    <h2 className="document-analytics-title">
                                        {selectedDocument}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="close-analytics-btn"
                                    onClick={() => {
                                        setSelectedDocument(null);
                                        setDocumentAnalytics(null);
                                    }}
                                >
                                    Close
                                </button>

                            </div>

                            {
                                documentAnalyticsLoading
                                    ? (
                                        <p className="analytics-status">
                                            Loading document analytics...
                                        </p>
                                    )
                                    : documentAnalytics && (

                                        <>
                                            <div className="analytics-grid">

                                                <div className="analytics-item">
                                                    <span className="analytics-label">Total Quizzes</span>
                                                    <span className="analytics-value">{documentAnalytics.total_quizzes}</span>
                                                </div>

                                                <div className="analytics-item">
                                                    <span className="analytics-label">Average Score</span>
                                                    <span className="analytics-value">{documentAnalytics.average_score}%</span>
                                                </div>

                                                <div className="analytics-item">
                                                    <span className="analytics-label">Best Score</span>
                                                    <span className="analytics-value">{documentAnalytics.best_score}%</span>
                                                </div>

                                            </div>

                                            {
                                                documentAnalytics.total_quizzes === 0
                                                    ? (
                                                        <p className="analytics-status">
                                                            No quiz attempts for this PDF yet.
                                                        </p>
                                                    )
                                                    : (
                                                        <>
                                                            <h3 className="recent-title">
                                                                Quiz Performance Trend
                                                            </h3>

                                                            <ResponsiveContainer width="100%" height={220}>
                                                                <LineChart data={documentAnalytics.history}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                                    <XAxis
                                                                        dataKey="attempt"
                                                                        stroke="#64748b"
                                                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                                                        label={{ value: "Attempt", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 12 }}
                                                                    />
                                                                    <YAxis
                                                                        domain={[0, 100]}
                                                                        stroke="#64748b"
                                                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                                                        tickFormatter={(value) => `${value}%`}
                                                                    />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            background: "rgba(15,23,42,0.95)",
                                                                            border: "1px solid rgba(99,102,241,0.3)",
                                                                            borderRadius: "10px",
                                                                            color: "#e2e8f0"
                                                                        }}
                                                                        formatter={(value) => [`${value}%`, "Score"]}
                                                                        labelFormatter={(label) => `Attempt ${label}`}
                                                                    />
                                                                    <Line
                                                                        type="monotone"
                                                                        dataKey="percentage"
                                                                        stroke="#6366f1"
                                                                        strokeWidth={2.5}
                                                                        dot={{ fill: "#6366f1", r: 4 }}
                                                                        activeDot={{ r: 6, fill: "#a5b4fc" }}
                                                                    />
                                                                </LineChart>
                                                            </ResponsiveContainer>

                                                            <h3 className="recent-title">
                                                                Recent Attempts
                                                            </h3>

                                                            <div className="recent-list">

                                                                {
                                                                    documentAnalytics.recent_attempts.map(
                                                                        (attempt, index) => (

                                                                            <div
                                                                                key={`${attempt.file_name}-${index}`}
                                                                                className="recent-item"
                                                                            >
                                                                                <span className="recent-rank">
                                                                                    #{index + 1}
                                                                                </span>

                                                                                <span className="recent-file">
                                                                                    {attempt.file_name}
                                                                                </span>

                                                                                <span className="recent-score">
                                                                                    {attempt.score}/{attempt.total}
                                                                                </span>

                                                                                <span className="recent-pct">
                                                                                    {Math.round((attempt.score / attempt.total) * 100)}%
                                                                                </span>
                                                                            </div>

                                                                        )
                                                                    )
                                                                }

                                                            </div>
                                                        </>
                                                    )
                                            }
                                        </>
                                    )
                            }

                        </div>

                    )
                }

                <button
                    className="logout-btn"
                    onClick={() => {

                        localStorage.removeItem(
                            "token"
                        );

                        window.location.href =
                            "/";

                    }}
                >
                    Logout
                </button>

            </div>

        </div>

    );
}

export default Dashboard;
