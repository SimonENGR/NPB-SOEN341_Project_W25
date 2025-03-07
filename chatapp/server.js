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

//Gets users for chat selection 
app.get('/getUsers', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.promise().query('SELECT id, username FROM users');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});

// Register a new user
app.post('/register', async (req, res) => {

    console.log(req.body);  // Log the incoming request data
    const { username, email, password, role } = req.body;

    // Validate incoming data
    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
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
    const { channelName, channelMembers } = req.body;
    console.log('Channel Addition attempt: ', { channelName, channelMembers });

     //requires a channel name
    if(!channelName){
        return(res.status(400).send('Channel name is required.'))
    }

    //requires at least 2 members to create a channel
    if (!channelMembers || channelMembers.length === 0){
        return res.status(400).send('At least two channel members are required.')
    }

    try {
        // Query to check if all channel members exist in the database
        const [existingUsers] = await db.promise().query(
            'SELECT username FROM users WHERE username IN (?)',
            [channelMembers]
        );
        
        console.log('Existing users in DB: ', existingUsers);

        const existingUsernames = existingUsers.map(user => user.username);

        console.log('Existing usernames: ', existingUsernames);

        // Find any usernames that donÃ¢ÂÂt exist
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

        // Send response with 201 status code if the channel is successfully created
        return res.status(201).json({
            message: "Channel created successfully.",
            channelName,
            channelMembers: existingUsernames
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error creating channel', error: error.message });
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
        const [user] = await db.promise().query('SELECT role FROM users WHERE username = ?', [username]);
        const userRole = user[0].role;
        
        let channels;
        if (userRole === "Admin"){
            [channels] = await db.promise().query('SELECT * FROM channels');
        }
        else{
            [channels] = await db.promise().query('SELECT * FROM channels WHERE JSON_CONTAINS(channelMembers, ?)',[JSON.stringify(username)]);
        }
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
app.get("/getCurrentUser", (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ userId: req.session.userId });
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
});

app.post("/sendDM", async (req, res) => {
    const {sender_id, receiver_id, message} = req.body;
    try {
        await db.promise().query("INSERT INTO dms (sender_id, receiver_id, message) VALUES (?, ?, ?)", [sender_id,receiver_id,message]);
        res.status(200).json({message: "DM sent successfully."});
    } catch (error){
        console.error("Error sending DM: ", error);
        res.status(500).json({error: "Failed to send DM"});
    }
});

app.get("/getDMs/:user1/:user2", async (req,res) => {
    const {user1,user2} = req.params;
    try {
        const [messages] = await db.promise().query("SELECT * FROM dms WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp", [user1, user2, user2, user1]);
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching DMs: ", error);
        res.status(500).json({error: "Failed to fetch DMs"});
    }
});

app.get("/getConversations/:userId", (req, res) => {
    const { userId } = req.params;
  
    db.query(`SELECT DISTINCT u.id, u.username FROM dms m JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id) WHERE m.sender_id = ? OR m.receiver_id = ?`,
      [userId, userId],
      (err, results) => {
        if (err) res.status(500).json({ error: err });
        else res.json(results.map(row => ({ id: row.id, user: { id: row.id, username: row.username } })));
      }
    );
  });

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

module.exports = app; // For testing purposes
