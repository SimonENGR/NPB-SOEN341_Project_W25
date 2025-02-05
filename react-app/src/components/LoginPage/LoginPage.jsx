import React, { useState } from "react";
import './LoginPage.css';


import googleIcon from '../Assets/google.png';
import facebookIcon from '../Assets/facebook.png';
import linkedinIcon from '../Assets/linkedin.png';
import logo from '../Assets/logo.png';
import mail from '../Assets/mail.png';
import pers from '../Assets/pers.png';
import psswd from '../Assets/psswd.png';

const LoginPage = () => {
  const [step, setAction] = useState("Login");

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {}
        <div className="login-image">
  <img src={logo} alt="Chat App Logo" className="chat-app-logo" />
  <div className="chat-app-title">Chat App</div>
  <div className="chat-app-message">Welcome! Please login or sign up to start chatting.</div>
</div>

        {}
        <div className="login-form">
          <div className="header">
            <div className="text">{step}</div>  
            <div className="underline"></div>
          </div>
          <div className="fields">
            {step === "Login" ? null : (
              <div className="input">
                <img src={pers} alt="" />
                <input type="text" placeholder="Username"/>
              </div>
            )}
            <div className="input">
              <img src={mail} alt="" />
              <input type="email" placeholder="Email" />
            </div>
            <div className="input">
              <img src={psswd} alt="" />
              <input type="password" placeholder="Password"/>
            </div>
          </div>
          {step === "Sign Up" ? null : (
            <div className="forgot-pass">Forgot Password? <span>Reset Here</span></div>
          )}
          <div className="submission-container">
            <div 
              className={step === "Login" ? "submit gray" : "submit"} 
              onClick={() => setAction("Sign Up")}
            >
              Sign Up
            </div>
            <div 
              className={step === "Sign Up" ? "submit gray" : "submit"} 
              onClick={() => setAction("Login")}
            >
              Login
            </div>
          </div>
          <div className="social-login">
            <p>Or {step === "Login" ? "Login" : "Sign Up"} Using</p>
            <div className="social-icons">
              <a href="https://accounts.google.com/signin" target="_blank" rel="noopener noreferrer">
                <img src={googleIcon} alt="Google" />
              </a>
              <a href="https://www.facebook.com/login" target="_blank" rel="noopener noreferrer">
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a href="https://www.linkedin.com/login" target="_blank" rel="noopener noreferrer">
                <img src={linkedinIcon} alt="LinkedIn" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
