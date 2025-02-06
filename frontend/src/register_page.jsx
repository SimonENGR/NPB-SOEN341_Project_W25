// RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async(e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Tell the server we're sending JSON
            },
            body: JSON.stringify({ name, email, password }), // Send the form data
        });
        const data = await response.json();
        if (response.status === 201) {
            console.log(data.message); // Registration successful
            navigate("/");//sends user back to login page
        } else {
            console.log("Registration failed:", data.message); // Error message from server
        }
    };

    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleRegister} className="form-horizontal">
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="username"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">Register</button>
            </form>

            <a href="/">Login</a>
        </div>
    );
};

export default RegisterPage;
