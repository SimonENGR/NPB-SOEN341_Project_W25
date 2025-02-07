import React, { useState } from 'react';
import axios from 'axios';
import user_icon from 'C:/Users/Simon PC/Documents/Concordia 2023 2026/Winter 2025/SOEN 341/NPB-SOEN341_Project_W25-main_modified/chatapp/client/src/assets/person.png';
import email_icon from 'C:/Users/Simon PC/Documents/Concordia 2023 2026/Winter 2025/SOEN 341/NPB-SOEN341_Project_W25-main_modified/chatapp/client/src/assets/email.png';
import password_icon from 'C:/Users/Simon PC/Documents/Concordia 2023 2026/Winter 2025/SOEN 341/NPB-SOEN341_Project_W25-main_modified/chatapp/client/src/assets/password.png';
import 'C:/Users/Simon PC/Documents/Concordia 2023 2026/Winter 2025/SOEN 341/NPB-SOEN341_Project_W25-main_modified/chatapp/client/src/Styling/LoginPage.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function LoginPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [action, setAction] = useState("Login");
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate(); // For redirection on successful login

    // Handle login
    const handleLogin = async (e) => {
      e.preventDefault(); // Prevent form submission from refreshing the page
      try {
          console.log('Attempting login with:', { username, password }); // Debugging log
  
          console.log('Sending login request to http://localhost:3001/login');
          const response = await axios.post('http://localhost:3001/login', {
    username,
    password
          });
  
          console.log('Login response:', response); // Debugging log
  
          if (response.status === 200) {
              setIsLoggedIn(true); // Set login state
              alert(response.data.message); // Show success message
              navigate('/chat'); // Redirect to chat page
          }
      } catch (error) {
          console.error('Login error:', error); // Log the error
          setErrorMessage(error.response ? error.response.data : 'An error occurred');
      }
  };
  

    // Handle registration
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/register', { 
                username, 
                email, 
                password 
            });
            alert(response.data); // "User registered"
            
            // After successful registration, reset form and navigate to login page
            setUsername('');
            setEmail('');
            setPassword('');
            setAction("Login");
            navigate('/'); // Redirect to the login page
        } catch (error) {
            setErrorMessage(error.response ? error.response.data : 'An error occurred');
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h2 className="title">{action}</h2>

                <div className="inputs">
                    <form onSubmit={action === "Login" ? handleLogin : handleRegister} className="flex flex-col">
                        {action === "Sign Up" && (
                            <div className="input">
                                <img src={user_icon} alt="User Icon" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="input">
                            <img src={email_icon} alt="Email Icon" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input">
                            <img src={password_icon} alt="Password Icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

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
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                </div>

                {action === "Login" ? (
                    <div className="forgot-password">
                        Forgot Password? <span>Click here!</span>
                    </div>
                ) : null}

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
            </div>

            {isLoggedIn && (
                <div className="chatbox">
                    <h3>Welcome to the Chat!</h3>
                    {/* You can add your chat functionality here */}
                </div>
            )}
        </div>
    );
}

export default LoginPage;
