//making changes
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(express.json()); // Ensure that the body parser is configured correctly


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if needed
    password: '1q2w3e4r5tMySQL',  // Add MySQL password if set
    database: 'chatapp'
});

const sessionStore = new MySQLStore({}, db);

app.use(session({
        secret: 'we-do-procrastinate',//'your-secret-key'
        resave: false,
        store: sessionStore,
        saveUninitialized: false,
        cookie: { secure: false,
            sameSite: 'lax'
        },
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
                res.status(200).send({ message: 'Login successful', userId: user.id, username: user.username});
            });

        });
    });
});

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

app.post('/addChannel', async (req, res) => {
    const {channelName, channelMembers} = req.body;
    console.log('Channel Addition attempt: ', {channelName, channelMembers});

    if(!channelName){
        return(res.status(400).send('Channel name is required.'))
    }
    try {
        const [existingUsers] = await db.promise().query(
            'SELECT username FROM users WHERE username IN (?)',
            [channelMembers]
        );
        const existingUsernames = existingUsers.map(user => user.username);

        // Find any usernames that don’t exist
        const missingUsers = channelMembers.filter(name => !existingUsernames.includes(name));

        if (missingUsers.length > 0) {
            return res.status(400).json({ message: `User(s) not found: ${missingUsers.join(", ")}` });
        }

        // Insert the channel into the database
        await db.promise().query(
            'INSERT INTO channels (channelName, channelMembers) VALUES (?, ?)',
            [channelName, JSON.stringify(existingUsernames)]
        );

        return res.send({ message: "Channel created successfully.", channelName, channelMembers: existingUsernames });

    } catch (error) {
        return res.status(500).send({ message: 'Error creating channel', error: error.message });
    }
});

app.get('/getUserRole', authMiddleware, async (req, res) => {
    try{
        const userId = req.session.userId;

        const [rows] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) {
            return res.send({ role: rows[0].role });
        }   else {
            return res.status(404).send('User not found');
        }
    }   catch (error) {
        return res.status(500).send('Error fetching user role');
    }
});

app.get('/getChannels', async (req, res) => {
    try{
        const username = req.session.username;

        const [channels] = await db.promise().query('SELECT * FROM channels WHERE JSON_CONTAINS(channelMembers, ?)',[JSON.stringify(username)]);
        return res.send(channels);
    } catch (error) {
        return res.status(500).send('Error fetching channels');
    }
});

app.post("/sendMessage", async (req, res) => {
    const { channelName, username, chat_content, chat_time, dm, receiver  } = req.body;

    if (!dm=== undefined || !username || !chat_content || !chat_time) {//channelName and receiver couldbe empty
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const query = "INSERT INTO all_chats_in_haven (channelName, username, chat_content, chat_time, dm, receiver) VALUES (?, ?, ?, ?, ?, ?)";
        await db.promise().query(query, [channelName||null, username, chat_content, chat_time, dm?1:0, receiver||null]);

        res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error inserting message:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// Endpoint to fetch messages for a specific channel
app.get("/getMessages/:channelName", async (req, res) => {
    const { channelName } = req.params;

    try {
        const query = "SELECT username, chat_content, chat_time FROM all_chats_in_haven WHERE channelName = ? ORDER BY chat_time ASC";
        const [messages] = await db.promise().query(query, [channelName]);
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Database error" });
    }
});
app.get('/getUsername', (req, res) => {// sends usename to frontend
    //console.log(req.session.username);
    if (req.session.username) {
        res.json({ username: req.session.username });  // Sends username if it exists in the session
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
});
//MODIFICATION
app.get("/channelContent/:channelName", (req, res) => {
    const channelName = req.params.channelName; // Get channel name from URL
    const sql = "SELECT * FROM all_chats_in_haven WHERE channelName = ? ORDER BY chat_time DESC LIMIT 10";
    console.log('Running the SQL query:', sql);
    console.log('Channel Name:', channelName);

    db.query(sql, [channelName], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log("Backend query results:", results);
        if (!results || results.length === 0) {
            console.log('No results found for channel:', channelName);
        }
        res.json(results); // Send data to frontend
    });
});
//MODIFICATION
module.exports = app;

// Start the server
if (process.env.NODE_ENV !== 'test') {
    app.listen(3001, () => {
        console.log('Server is running on port 3001');
    });
}