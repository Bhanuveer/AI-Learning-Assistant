import { useState } from "react";
import "./Login.css";
import {Link,useNavigate} from "react-router-dom";
import { registerUser } from "../services/authService";


function Register() {

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const navigate =
        useNavigate();

    const handleRegister =
        async () => {

            try {

                await registerUser({
                    name,
                    email,
                    password
                });

                setMessage(
                    "Registration Successful"
                );

                setTimeout(() => {
                    navigate("/");
                }, 2000);

            } catch {

                setMessage(
                    "Registration Failed"
                );

            }

        };

    return (

        <div className="login-container">

            <div className="login-card">

                <h1>
                    Create Account
                </h1>

                <input
                    className="login-input"
                    placeholder="Name"
                    value={name}
                    onChange={(e) =>
                        setName(
                            e.target.value
                        )
                    }
                />

                <input
                    className="login-input"
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
                    message && (
                        <p
                            style={{
                                textAlign: "center",
                                color:
                                    message.includes(
                                        "Successful"
                                    )
                                        ? "green"
                                        : "red"
                            }}
                        >
                            {message}
                        </p>
                    )
                }

                <button
                    className="login-btn"
                    onClick={
                        handleRegister
                    }
                >
                    Register
                </button>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "15px"
                    }}
                >
                    Already have an account?

                    <Link to="/">
                        Login
                    </Link>

                </p>

            </div>

        </div>

    );
}

export default Register;
