require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite3');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // Ensure that the body parser is configured correctly
const donotUse = 0;

// Local MySQL database for local testing
const db = mysql.createConnection({
    host: 'localhost',
    user: 'user', // Change if needed (a bit tedious, but set this to 'root' if running locally, change it to 'user' if you're about to commit to github and pass tests)
    password: 'password', // Add MySQL password if set
    database: 'chatapp'
});

// GitHub Actions MySQL database for testing on GitHub
let dbase; // Variable used for SQLite or MySQL in CI environment

if (process.env.CI_ENV === 'github') {
    // Use MySQL for GitHub Actions instead of SQLite
    dbase = mysql.createConnection({
        host: '127.0.0.1',
        user: 'user',
        password: 'password',
        database: 'chatapp'
    });

    dbase.connect((err) => {
        if (err) {
            console.error("GitHub MySQL connection failed:", err);
            return;
        }
        console.log("GitHub MySQL connection successful!");
        dbase.query("SHOW TABLES;", (err, results) => {
            if (err) {
                console.error("Error listing tables:", err);
            } else {
                console.log("Tables in database:", results);
            }
        });
    });
} else {
    // Local MySQL database initialization
    db.connect((err) => {
        if (err) {
            console.error('Database connection failed:', err);
            return;
        }
        console.log('Connected to MySQL database');
    });

    const sessionStore = new MySQLStore({}, db);

    app.use(
        session({
            secret: 'we-do-procrastinate',
            resave: false,
            store: sessionStore,
            saveUninitialized: false,
            cookie: { secure: false, sameSite: 'lax' },
        })
    );
}

const authMiddleware = (req, res, next) => {
    console.log('Session Data:', req.session);
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    next();
};

// Register a new user
app.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log("Register route hit with data:", { username, email, password, role });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    try {
        // Correctly switch between db and dbase
        const dbConnection = process.env.CI_ENV === 'github' ? dbase : db;
        console.log("Environment CI_ENV:", process.env.CI_ENV);
        console.log("Database connection in use:", process.env.CI_ENV === 'github' ? "dbase" : "db");


        await dbConnection.promise().query(
            `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
            [username, email, hashedPassword, role]
        );
        console.log("User inserted into database");

        res.status(201).send('User registered');
    } catch (err) {
        console.error("Error in /register route:", err);
        res.status(500).send(err.message);
    }
});



// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log("Missing username or password");
        return res.status(400).send('Username and password are required');
    }

    try {
        const dbConnection = process.env.CI_ENV === 'github' ? dbase : db; // Use appropriate database
        const [rows] = await dbConnection.promise().query(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        );
        const user = rows[0];
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Username or password is incorrect');
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        res.status(200).send({ message: 'Login successful', userId: user.id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Use the same logic for other endpoints to dynamically select `db` or `dbase`
// by checking `process.env.CI_ENV`

module.exports = app;

// Start the server
if (process.env.NODE_ENV !== 'test') {
    app.listen(3001, () => {
        console.log('Server is running on port 3001');
    });
}
