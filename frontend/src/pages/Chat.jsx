import "./Chat.css";
import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../services/chatService";
import { useNavigate } from "react-router-dom";

function Chat() {

    const fileName =
        localStorage.getItem(
            "selected_pdf"
        );

    const [question,setQuestion] =useState("");
    const [messages,setMessages] =useState([]);
    const [loading,setLoading] =useState(false);    
    const navigate = useNavigate();

    const bottomRef = useRef(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);

    const handleAsk =
        async () => {

            if (!question.trim())
                return;

            try {

                setLoading(true);

                const response =
                    await askQuestion(
                        fileName,
                        question
                    );

                setMessages(
                    (prev) => [

                        ...prev,

                        {
                            role: "user",
                            content: question
                        },

                        {
                            role: "assistant",
                            content:
                                response.answer
                        }

                    ]
                );

                setQuestion("");

            } catch (error) {

                setMessages(
                    (prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content:
                                error?.response?.data?.detail
                                || "Something went wrong"
                        }
                    ]
                );

            } finally {

                setLoading(false);

            }

        };

    return (

        <div className="chat-container">

            <div className="chat-card">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    Back
                </button>

                <div className="chat-header">

                    <h1>
                        Chat With PDF
                    </h1>

                    <p className="chat-file">
                        {fileName}
                    </p>

                </div>

                <div className="chat-history">

                    {
                        messages.map(
                            (msg, index) => (

                                <div
                                    key={index}
                                    className={
                                        msg.role === "user"
                                            ?
                                            "user-message"
                                            :
                                            "ai-message"
                                    }
                                >

                                    {msg.content}

                                </div>

                            )
                        )
                    }

                    {
                        loading && (

                            <div
                                className="ai-message"
                            >
                                🤖 Thinking...
                            </div>

                        )
                    }

                    <div ref={bottomRef}></div>

                </div>

                <div className="chat-input-area">

                    <input
                        className="chat-input"
                        placeholder="Ask a question..."
                        value={question}
                        onChange={(e) =>
                            setQuestion(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                handleAsk();

                            }

                        }}
                    />

                    <button
                        className="ask-btn"
                        onClick={handleAsk}
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Thinking..."
                                : "Ask"
                        }
                    </button>

                </div>

            </div>

        </div>
    )

}   

export default Chat;
