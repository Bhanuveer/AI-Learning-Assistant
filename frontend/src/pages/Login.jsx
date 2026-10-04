import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/AuthFrame";
import { loginUser } from "../services/authService";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event) => {

        event.preventDefault();
        setBusy(true);
        setError("");

        try {

            const response = await loginUser({ email, password });

            if (response.access_token) {
                localStorage.setItem("token", response.access_token);
                navigate("/dashboard");
            } else {
                localStorage.removeItem("token");
                setError("Invalid credentials");
            }

        } catch {

            localStorage.removeItem("token");
            setError("Invalid credentials");

        } finally {

            setBusy(false);

        }
    };

    return (
        <AuthFrame>
            <form onSubmit={handleLogin}>
                <h2>Welcome back</h2>
                <p className="li-muted">Log in to pick up where you left off.</p>

                <label htmlFor="email">Email</label>
                <input id="email" className="li-input" type="email" autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="password">Password</label>
                <input id="password" className="li-input" type="password" autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />

                {error && <p className="li-error li-mt-12">{error}</p>}

                <button className="li-btn" type="submit" disabled={busy}>
                    {busy ? "Logging in…" : "Log in"}
                </button>

                <p className="auth-alt">New here? <Link to="/register">Create an account</Link></p>
            </form>
        </AuthFrame>
    );
}

export default Login;
