import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/AuthFrame";
import { registerUser } from "../services/authService";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState({ ok: false, text: "" });
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (event) => {

        event.preventDefault();
        setBusy(true);
        setMessage({ ok: false, text: "" });

        try {

            await registerUser({ name, email, password });
            setMessage({ ok: true, text: "Account created. Taking you to the login page…" });
            setTimeout(() => navigate("/"), 1500);

        } catch (e) {

            setBusy(false);
            setMessage({ ok: false, text: e?.response?.data?.detail || "Registration failed" });

        }
    };

    return (
        <AuthFrame>
            <form onSubmit={handleRegister}>
                <h2>Create your account</h2>
                <p className="li-muted">Your learner profile starts empty and grows with every quiz.</p>

                <label htmlFor="name">Name</label>
                <input id="name" className="li-input" autoComplete="name"
                    value={name} onChange={(e) => setName(e.target.value)} required />

                <label htmlFor="email">Email</label>
                <input id="email" className="li-input" type="email" autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="password">Password</label>
                <input id="password" className="li-input" type="password" autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />

                {message.text && (
                    <p className={message.ok ? "li-notice li-mt-12" : "li-error li-mt-12"}>{message.text}</p>
                )}

                <button className="li-btn" type="submit" disabled={busy}>
                    {busy ? "Creating…" : "Create account"}
                </button>

                <p className="auth-alt">Already registered? <Link to="/">Log in</Link></p>
            </form>
        </AuthFrame>
    );
}

export default Register;
