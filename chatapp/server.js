// Load environment variables based on the current environment (test or production)
require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // Ensure that the body parser is configured correctly

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',  // Use environment variable or default to localhost
    user: process.env.DB_USER || 'root',      // Use environment variable or default to 'root'
    password: process.env.DB_PASSWORD || 'password',  // Use environment variable or default to 'password'
    database: process.env.DB_NAME || 'chatapp'  // Use environment variable or default to 'chatapp'
});

const sessionStore = new MySQLStore({}, db);

app.use(session({
        secret: 'we-do-procrastinate', //'your-secret-key'
        resave: false,
        store: sessionStore,
        saveUninitialized: false,
        cookie: { secure: false, sameSite: 'lax' },
    })
);

const authMiddleware = (req, res, next) => {
    console.log('Session Data:', req.session);
    if (!req.session.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    next();
};

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Register a new user
app.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.status(201).send('User registered');
        }
    );
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Debugging log

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) {
            console.log('User not found');
            return res.status(400).send('User not found');
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password comparison error:', err);
                return res.status(500).send('Server error');
            }
            if (!isMatch) {
                return res.status(400).send('Username or password is incorrect');
            }

            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.save(err => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send('Server error');
                }
                console.log('Session ID:', req.session.id);
                console.log('Stored Session Data:', req.session);
                res.status(200).send({ message: 'Login successful', userId: user.id, username: user.username });
            });

        });
    });
});

// Logout route
app.post('/logout', (req, res) => {
    console.log("Before logout:", req.session);
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Failed to log out");
        }
        console.log("After logout:", req.session);
        res.status(200).send("Logged out successfully");
    });
});

// Additional routes here...

// Start the server
if (process.env.NODE_ENV !== 'test') {
    app.listen(3001, () => {
        console.log('Server is running on port 3001');
    });
}

module.exports = app; // Export for testing if necessary
