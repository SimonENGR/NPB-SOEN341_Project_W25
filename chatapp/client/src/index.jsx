import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


//npm install cors in chatapp
//npm install concurrency in chatapp
// add     "start": "concurrently \"npm run server\" \"npm run client\"",
    //     "server": "node server.js",
    //     "client": "cd client && npm start" to chatapp package.json
//add proxy to package.json in client   "proxy": "http://localhost:3001",
//change my password
//add channels sql code