import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import StudyLayout from "../components/StudyLayout";
import Icon from "../components/icons";
import { askQuestion } from "../services/chatService";

const STARTERS = [
    "Summarise the key ideas in this document",
    "Which terms should I remember for an exam?",
    "Give me a real-world example of the main concept"
];

function ChatPane({ doc, draft, setDraft }) {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const ask = async (text) => {

        const question = text.trim();
        if (!question || loading) return;

        setDraft("");
        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setLoading(true);

        try {

            const response = await askQuestion(doc, question);

            setMessages((prev) => [...prev, { role: "assistant", content: response.answer }]);

        } catch (error) {

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: error?.response?.data?.detail || "Something went wrong" }
            ]);

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="st-chat">

            <div className="st-chat-scroll">

                {messages.length === 0 && (
                    <div className="st-welcome">
                        <h2>Ask <span className="mark">{doc.replace(/\.pdf$/i, "")}</span> anything</h2>
                        <p className="li-muted">
                            Answers come only from this document, so you can trust where they came from.
                        </p>
                        <div className="st-chips">
                            {STARTERS.map((s) => (
                                <button key={s} className="st-chip" onClick={() => ask(s)}>{s}</button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "st-msg st-msg-user" : "st-msg st-msg-ai"}>
                        {m.role === "user" ? m.content : <ReactMarkdown>{m.content}</ReactMarkdown>}
                    </div>
                ))}

                {loading && (
                    <div className="st-msg st-msg-ai st-typing" aria-label="Thinking">
                        <span /><span /><span />
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div className="st-composer">
                <textarea
                    rows={1}
                    placeholder="Ask about this document…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            ask(draft);
                        }
                    }}
                />
                <button className="li-btn" onClick={() => ask(draft)} disabled={loading || !draft.trim()}>
                    <Icon name="send" style={{ verticalAlign: "-3px", marginRight: 6 }} />
                    Send
                </button>
            </div>

        </div>
    );
}

function Chat() {

    // Lifted so the rail's weak-topic buttons can prefill the composer.
    const [draft, setDraft] = useState("");

    return (
        <StudyLayout onPickTopic={(topic) => setDraft(`Explain ${topic} with a simple example`)}>
            {(doc) => <ChatPane key={doc} doc={doc} draft={draft} setDraft={setDraft} />}
        </StudyLayout>
    );
}

export default Chat;
