import React, { useState } from 'react';
import axios from 'axios';
import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import logo from '../assets/chat.webp';
import password_icon from '../assets/password.png';
import styles from '../Styling/LoginPage.module.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [action, setAction] = useState("Login");
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', { username, password }, { withCredentials: true });

            if (response.status === 200) {
                alert(response.data.message);
                navigate('/chat');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.sqlMessage || 'An error occurred');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/register', { username, email, password, role: role || "User" });
            alert(response.data);
            setUsername('');
            setEmail('');
            setPassword('');
            setRole('');
            setAction("Login");
            navigate('/');
        } catch (error) {
            setErrorMessage(error.response?.data?.sqlMessage || 'An error occurred');
        }
    };

    return (
        <div className={styles["login-wrapper"]}>
            <div className={styles["login-container"]}>
                
                <div className={styles["left-pane"]}>
                    <div className={styles["logo-container"]}>
                        <img src={logo} alt="App Logo" className={styles["logo"]} />
                    </div>
                </div>

                <div className={styles["right-pane"]}>
                    <h2 className={styles["title"]}>{action}</h2>
                    {errorMessage && <div className={styles["error-message"]}>{errorMessage}</div>}

                    <div className={styles["inputs"]}>
                        <form onSubmit={action === "Login" ? handleLogin : handleRegister} className={styles["form"]}>
                            <div className={styles["input"]}>
                                <img src={user_icon} alt="User Icon" />
                                <input type="text" placeholder="Name" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>

                            {action === "Sign Up" && (
                                <div className={styles["input"]}>
                                    <img src={email_icon} alt="Email Icon" />
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            )}

                            <div className={styles["input"]}>
                                <img src={password_icon} alt="Password Icon" />
                                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>

                            {action === "Sign Up" && (
                                <div className={styles["checkbox-container"]}>
                                    <label className={styles["toggle-switch"]}>
                                        <input type="checkbox" checked={role === "Admin"} onChange={(e) => setRole(e.target.checked ? "Admin" : "User")} />
                                        <span className={styles["slider"]}></span>
                                    </label>
                                    <span className={styles["checkbox-label"]}>Admin Privileges</span>
                                </div>
                            )}

                            <div className={styles["submit-container"]}>
                                <button type="submit" className={styles["submit"]}>{action}</button>
                            </div>
                        </form>
                    </div>

                    {action === "Login" && <div className={styles["forgot-password"]}>Forgot Password? <span>Click here!</span></div>}

                    <div className={styles["switch-container"]}>
                        <button className={`${styles["switch"]} ${action === "Login" ? styles["gray"] : styles["active"]}`} onClick={() => setAction("Sign Up")}>Sign Up</button>
                        <button className={`${styles["switch"]} ${action === "Sign Up" ? styles["gray"] : styles["active"]}`} onClick={() => setAction("Login")}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
