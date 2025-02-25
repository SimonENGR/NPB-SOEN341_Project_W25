import React, { useState } from 'react';
import axios from 'axios';
import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import logo from '../assets/chat.webp';
import password_icon from '../assets/password.png';
<<<<<<< Updated upstream
import '../Styling/LoginPage.module.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
=======
import styles from '../Styling/LoginPage.module.css';
import { useNavigate } from 'react-router-dom';
>>>>>>> Stashed changes

function LoginPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [action, setAction] = useState("Login");
    const [errorMessage, setErrorMessage] = useState('');
<<<<<<< Updated upstream
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate(); // For redirection on successful login

    // Handle login
    const handleLogin = async (e) => {
      e.preventDefault(); // Prevent form submission from refreshing the page
      try {
          console.log('Attempting login with:', { username, password }); // Debugging log
  
          console.log('Sending login request to http://localhost:3001/login');
          const response = await axios.post('http://localhost:3001/login', {username,password}, { withCredentials: true });
  
          console.log('Login response:', response); // Debugging log

  
          if (response.status === 200) {
              setIsLoggedIn(true); // Set login state
              alert(response.data.message); // Show success message
              navigate('/chat'); // Redirect to chat page
          }
      } catch (error) {
          console.error('Login error:', error); // Log the error
          setErrorMessage(error.response?.data?.sqlMessage || 'An error occurred');
      }
  };
  

    // Handle registration
=======
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

>>>>>>> Stashed changes
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
<<<<<<< Updated upstream
            const response = await axios.post('http://localhost:3001/register', { 
                username, 
                email, 
                password,
                role: userRole
            });
            alert(response.data); // "User registered"
            
            // After successful registration, reset form and navigate to login page
=======
            const response = await axios.post('http://localhost:3001/register', { username, email, password, role: role || "User" });
            alert(response.data);
>>>>>>> Stashed changes
            setUsername('');
            setEmail('');
            setPassword('');
            setRole('');
            setAction("Login");
<<<<<<< Updated upstream
            navigate('/'); // Redirect to the login page
=======
            navigate('/');
>>>>>>> Stashed changes
        } catch (error) {
            setErrorMessage(error.response?.data?.sqlMessage || 'An error occurred');
        }
    };

    return (
<<<<<<< Updated upstream
        <div className="login-container">
        {/* Left side - Logo */}
        <div className="logo-container">
            <img src={logo} alt="App Logo" className="logo" />
        </div>

        {/* Right side - Login form */}
        <div className="container">
            <div className="header">
            <h2 className="title">{action}</h2>

            {errorMessage && <div className="error-message text-red-500 text-sm mb-2">{errorMessage}</div>}

            <div className="inputs">
                <form onSubmit={action === "Login" ? handleLogin : handleRegister} className="flex flex-col">
=======
        <div className={styles["login-wrapper"]}>
            <div className={styles["login-container"]}>
>>>>>>> Stashed changes
                
                
                <div className={styles["left-pane"]}>
                    <h1 className={styles["title"]}>ChatHaven</h1>
                    <div className={styles["logo-container"]}>
                        <img src={logo} alt="ChatHaven Logo" className={styles["logo"]} />
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
<<<<<<< Updated upstream
                {action === "Sign Up" && (
                <div className="checkbox-container">
                    <div className="checkbox">
                    <input
                        type="checkbox"
                        checked={role === "Admin"}
                        onChange={(e) => setRole(e.target.checked ? "Admin" : "User")}
                    /> 
                    <label className="checkbox-label">Admin privileges</label>
                    </div>
                </div>
                )}

                {/* Submit Button */}
                {action === "Sign Up" && (
                    <button type="submit" className="submit">
                    Register
                    </button>
                )}

                {action === "Login" && (
                    <button type="submit" className="submit">
                    Connect
                    </button>
                )}
                </form>

                {/* Display error message if login or registration fails */}
            </div>

            {action === "Login" && (
                <div className="forgot-password">
                Forgot Password? <span>Click here!</span>
                </div>
            )}

            <div className="submit-container">
                <div
                className={action === "Login" ? "submit gray" : "submit"}
                onClick={() => setAction("Sign Up")}
                >
                Sign Up
                </div>
                <div
                className={action === "Sign Up" ? "submit gray" : "submit"}
                onClick={() => setAction("Login")}
                >
                Login
                </div>
            </div>
=======
>>>>>>> Stashed changes
            </div>
        </div>
    );
}

<<<<<<< Updated upstream
        {isLoggedIn && (
            <div className="chatbox">
            <h3>Welcome to the Chat!</h3>
            {/* You can add your chat functionality here */}
            </div>
        )}
        </div>

    )};
=======
>>>>>>> Stashed changes
export default LoginPage;
