//version 03.19
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [action, setAction] = useState("Login");
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            const response = await axios.post('http://localhost:3001/login', {
                username,
                password
            }, { withCredentials: true });

            if (response.status === 200) {
                navigate('/chat');
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage(error.response?.data?.message || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        
        const userRole = role || "User";
        
        try {
            // Step 1: Register the user
            const registerResponse = await axios.post('http://localhost:3001/register', {
                username,
                email,
                password,
                role: userRole
            });
            
            if (registerResponse.status === 200) {
                console.log("Registration successful:", registerResponse.data);
                
                // Step 2: Automatic login - ensure we're using the correct credentials
                const savedUsername = username; // Save these before any state changes
                const savedPassword = password;
                
                try {
                    console.log("Attempting auto-login for:", savedUsername);
                    const loginResponse = await axios.post('http://localhost:3001/login', {
                        username: savedUsername,
                        password: savedPassword
                    }, { withCredentials: true });
                    
                    console.log("Login response:", loginResponse);
                    
                    if (loginResponse.status === 200) {
                        // Step 3: Navigate to chat page
                        console.log("Login successful, navigating to chat");
                        navigate('/chat');
                        return; // Exit early to prevent state changes below
                    }
                } catch (loginError) {
                    console.error("Auto-login error:", loginError);
                    setErrorMessage('Account created! Please log in manually.');
                    setAction("Login");
                    // Don't reset form fields to make manual login easier
                    setIsLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            setErrorMessage(error.response?.data?.message || 'Registration failed. User may already exist.');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-content">
                {/* Brand Section */}
                <div className="brand-section">
                    <h1 className="brand-title">ChatHaven</h1>
                    <p className="brand-tagline">Connect with friends and the world around you</p>
                </div>

                <div className="login-columns">
                    {/* Left Feature Section - Only visible on larger screens */}
                    {windowWidth > 768 && (
                        <div className="feature-section">
                            <div className="feature-card">
                                <div className="feature-icon">💬</div>
                                <div className="feature-text">
                                    <h3>Real-time Messaging</h3>
                                    <p>Connect instantly with friends and colleagues</p>
                                </div>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🔒</div>
                                <div className="feature-text">
                                    <h3>Secure Communication</h3>
                                    <p>Your conversations are protected and private</p>
                                </div>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📱</div>
                                <div className="feature-text">
                                    <h3>Works Everywhere</h3>
                                    <p>Access your chats from any device</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Auth Form */}
                    <div className="auth-form-container">
                        <div className="auth-form">
                            <h2 className="auth-title">
                                {action === "Login" ? "Welcome Back" : "Create Account"}
                            </h2>

                            {errorMessage && (
                                <div className="error-message">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={action === "Login" ? handleLogin : handleRegister}>
                                <div className="form-group">
                                    <div className="input-wrapper">
                                        <img src={user_icon} alt="User" className="input-icon" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            placeholder="Username"
                                            className="auth-input"
                                        />
                                    </div>
                                </div>

                                {action === "Sign Up" && (
                                    <div className="form-group">
                                        <div className="input-wrapper">
                                            <img src={email_icon} alt="Email" className="input-icon" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="Email"
                                                className="auth-input"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <div className="input-wrapper">
                                        <img src={password_icon} alt="Password" className="input-icon" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Password"
                                            className="auth-input"
                                        />
                                    </div>
                                </div>

                                {action === "Sign Up" && (
                                    <div className="admin-toggle-container">
                                        <span className="toggle-label">Admin Privileges</span>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={role === "Admin"}
                                                onChange={(e) => setRole(e.target.checked ? "Admin" : "User")}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <p className="toggle-description">
                                            Enable this option if you require administrative capabilities
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        "Processing..."
                                    ) : action === "Login" ? (
                                        "Log In"
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>

                            {action === "Login" && (
                                <div className="forgot-password">
                               <button
                                onClick={() => {/* Handle forgot password */}}
                                 className="inline-block underline hover:no-underline focus:outline-none"
                                style={{ background: "none", border: "none", padding: "0", margin: "0", cursor: "pointer", color: "#D1A0F1" }}>
                                 Forgot your password?
                                </button>

                            </div>
                            
                            )}

                            <div className="auth-switch">
                                {action === "Login" ? (
                                    <div className="create-account">
                                        <p>Don't have an account?</p>
                                        <button
                                            onClick={() => setAction("Sign Up")}
                                            className="switch-button"
                                        >
                                            Create New Account
                                        </button>
                                    </div>
                                ) : (
                                    <div className="login-instead">
                                        <p>Already have an account?</p>
                                        <button
                                            onClick={() => setAction("Login")}
                                            className="switch-button secondary"
                                        >
                                            Log In
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
