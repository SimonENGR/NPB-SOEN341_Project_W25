//App.tsx
import LoginPage from "./login_page.jsx";
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterPage from "./register_page.jsx";
import WelcomePage from "./home_page.jsx";

function App() {
    return (
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<WelcomePage />} />
            </Routes>
    );
}

export default App;
