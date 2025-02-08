require('dotenv').config();
const express = require('express');

const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
app.use(cors());
app.use(express.json()); // Ensure that the body parser is configured correctly


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if needed
    password: 'DegioSD1806!',  // Add MySQL password if set
    database: 'chatapp'
});

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

            console.log('Login successful');
            res.status(200).send({ message: 'Login successful' });
        });
    });
});

app.post('/addChannel', async (req, res) => {
    const {channelName, channelMembers} = req.body;
    console.log('Channel Addition attempt: ', {channelName, channelMembers});

    if(!channelName){
        return(res.status(400).send('Channel name is required.'))
    }
    try {
        const memberUsernames = channelMembers;

        const [existingUsers] = await db.promise().query(
            'SELECT username FROM users WHERE username IN (?)',
            [memberUsernames]
        );

        // Find any usernames that don’t exist
        const missingUsers = memberUsernames.filter(name => !existingUsernames.includes(name));

        if (missingUsers.length > 0) {
            return res.status(400).json({ message: `User(s) not found: ${missingUsers.join(", ")}` });
        }

        // Insert the channel into the database
        await db.promise().query(
            'INSERT INTO channels (channelName, channelMembers) VALUES (?, ?)',
            [channelName, JSON.stringify(existingUsers)]
        );

        return res.send({ message: "Channel created successfully.", channelName, channelMembers: existingUsers });

    } catch (error) {
        return res.status(500).send({ message: 'Error creating channel', error: error.message });
    }
});

app.get('/getUserRole', async (req, res) => {
    const userId = req.user.id;
    try{
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
    const userId = req.user.id;
    try{
        const [channels] = await db.promise().query('SELECT * FROM channels WHERE JSON_CONTAINS(channelMembers, ?)',[JSON.stringify(userId)]);
        return res.send(channels);
    } catch (error) {
        return res.status(500).send('Error fetching channels');
    }
});


// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});