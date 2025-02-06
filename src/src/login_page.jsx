// LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/login", {//url to send login info
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            console.log("Login successful!");
            navigate("/home");//below works too
            //window.location.href = "/home_page"; // Redirect to home page
        } catch (error) {
            console.error("Login failed:", error.message);
            //setErrorMessage(error.message); // Show error message
        }
    };


    return (
        <div>
            <div className="top">
                <h1>Welcome to chat haven</h1>
            </div>

            <form onSubmit={handleLogin} className="form-horizontal">
                <div className="wrapper">
                    <div className="login-input-box">
                        <label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                <div className="wrapper1">
                    <div className="password-input-box">
                        <label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                <div className="login">
                    <button type="submit">Login</button>
                </div>

                <div className="remember-password">
                    <a href="#">Forgot password?</a>
                </div>

                <div className="register-link">
                    <p>No account? <a href="/register">Register</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
