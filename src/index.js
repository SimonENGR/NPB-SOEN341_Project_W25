import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css';
import App from './App.tsx';
import {BrowserRouter} from "react-router-dom";  // App.tsx is imported here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
