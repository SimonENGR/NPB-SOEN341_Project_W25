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
    password: 'password',  // Add MySQL password if set
    database: 'chatapp'
});

const sessionStore = new MySQLStore({}, db);

app.use(session({
        secret: 'your-secret-key',
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
    //Check if username already exists in the database
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) =>{
        if (err){
            console.error('Database query error: ', err)
            return res.status(500).send('Server error');
        }
        //If username already exists, send error message
        if (results.length > 0){
            return res.status(400).send('Username already exists');
        }
    })

    //Hash password and add user to database if username does not already exist 
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
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Failed to log out');
      }
      console.log('Session destroyed');
      res.status(200).send('Logged out successfully');
    });
  });

app.post('/addChannel', async (req, res) => {
    const {channelName, channelMembers} = req.body;
    console.log('Channel Addition attempt: ', {channelName, channelMembers});

    //requires a channel name
    if(!channelName){
        return(res.status(400).send('Channel name is required.'))
    }

    //requires at least 2 members to create a channel
    if (!channelMembers || channelMembers.length === 0){
        return res.status(400).send('At least two channel members are required.')
    }

    try {
        const [existingUsers] = await db.promise().query(
            'SELECT username FROM users WHERE username IN (?)',
            [channelMembers]
        );
        
        console.log('Existing users in DB: ', existingUsers);

        const existingUsernames = existingUsers.map(user => user.username);

        console.log('Existing usernames: ', existingUsernames);

        // Find any usernames that don’t exist
        const missingUsers = channelMembers.filter(name => !existingUsernames.includes(name));
        console.log('Missing user: ', missingUsers);

        if (missingUsers.length > 0) {
            console.log("Returning error response: User(s) not found:", missingUsers);
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


// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});