import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Link } from "react-router-dom";

function Login() {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const navigate =
        useNavigate();

    const handleLogin =
        async () => {

            try {

                const response =
                    await loginUser({
                        email,
                        password
                    });

                if (
                    response.access_token
                ) {

                    localStorage.setItem(
                        "token",
                        response.access_token
                    );

                    navigate(
                        "/dashboard"
                    );

                } else {

                    localStorage.removeItem(
                        "token"
                    );

                    setError(
                        "Invalid Credentials"
                    );

                }

            } catch {

                localStorage.removeItem(
                    "token"
                );

                setError(
                    "Invalid Credentials"
                );

            }

        };

    return (

        <div className="login-container">

            <div className="login-card">

                <h1>
                    AI Learning Assistant
                </h1>

                <input
                    className="login-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(
                            e.target.value
                        )
                    }
                />

                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }
                />

                {
                    error && (
                        <p
                            style={{
                                color: "red"
                            }}
                        >
                            {error}
                        </p>
                    )
                }

                <button
                    className="login-btn"
                    onClick={
                        handleLogin
                    }
                >
                    Login
                </button>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "15px"
                    }}
                >
                    Don't have an account?

                    <Link
                        to="/register"
                    >
                        Register
                    </Link>
                </p>

            </div>

        </div>

    );
}

export default Login;
