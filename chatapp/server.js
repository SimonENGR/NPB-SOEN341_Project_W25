// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // Ensure that the body parser is configured correctly

let activeDB; // We'll assign this based on the environment

if (process.env.CI_ENV === 'github') {
    // CI (GitHub Actions) database configuration
    activeDB = mysql.createConnection({
        host: '127.0.0.1',
        user: 'user',
        password: 'password',
        database: 'chatapp'
    });

    activeDB.connect((err) => {
        if (err) {
            console.error("GitHub MySQL connection failed:", err);
            return;
        }
        console.log("GitHub MySQL connection successful!");
        activeDB.query("SHOW TABLES;", (err, results) => {
            if (err) {
                console.error("Error listing tables:", err);
            } else {
                console.log("Tables in database:", results);
            }
        });
    });

    // Set up session middleware using the CI DB connection
    const sessionStore = new MySQLStore({}, activeDB);
    app.use(
        session({
            secret: 'we-do-procrastinate',
            resave: false,
            store: sessionStore,
            saveUninitialized: false,
            cookie: { secure: false, sameSite: 'lax' },
        })
    );
} else {
    // Local database configuration
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root', // WHEN RUNNING LOCALLY USE 'root', WHEN COMMITING TO RUN INSIDE GITHUB ACTIONS, CHANGE THIS TO 'user'
        password: 'password',
        database: 'chatapp'
    });
    db.connect((err) => {
        if (err) {
            console.error('Database connection failed:', err);
            return;
        }
        console.log('Connected to MySQL database');
    });
    activeDB = db;

    // Set up session middleware using the local DB connection
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
        // Use the active DB connection
        console.log("Environment CI_ENV:", process.env.CI_ENV);
        console.log("Database connection in use:", process.env.CI_ENV === 'github' ? "GitHub DB" : "Local DB");

        await activeDB.promise().query(
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
        const [rows] = await activeDB.promise().query(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        );
        console.log("Query result for login:", rows);
        const user = rows[0];
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Username or password is incorrect');
        }

        await activeDB.promise().query( `UPDATE users SET isOnline = 1 WHERE id = ?`, [user.id]);

        // Assign session values (now safe because session middleware is mounted in all environments)
        req.session.userId = user.id;
        req.session.username = user.username;
        res.status(200).send({ message: 'Login successful', userId: user.id, username: user.username, isOnline: 1 });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Logout route
// app.post('/logout', (req, res) => {
//     console.log("Before logout:", req.session);
//     req.session.destroy((err) => {
//         if (err) {
//             console.error("Error destroying session:", err);
//             return res.status(500).send("Failed to log out");
//         }
//         console.log("After logout:", req.session);
//         res.status(200).send("Logged out successfully");
//     });
// });

app.post('/logout', async (req, res) => {
    const userId = req.session.userId;
    try {
        // Update the user's status to offline (0)
        await activeDB.promise().query(
            `UPDATE users SET isOnline = 0 WHERE id = ?`,
            [userId]
        );
    } catch (updateError) {
        console.error("Error updating status on logout:", updateError);
        // Optional: You can decide how to handle this error (e.g., continue or abort logout)
    }
    
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


// Get all users for DM functionality
app.get('/getUsers', authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        
        // Get all users except the current user
        const [users] = await activeDB.promise().query(
            'SELECT id, username, isOnline, last_active FROM users WHERE id <> ?',
            [currentUserId]
        );
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Search for users by username
app.get('/searchUsers', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.session.userId;
        
        if (!query) {
            return res.json([]);
        }
        
        // Search for users whose username contains the query string
        const [users] = await activeDB.promise().query(
            'SELECT id, username FROM users WHERE id <> ? AND username LIKE ?',
            [currentUserId, `%${query}%`]
        );
        
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

// Get direct messages between current user and selected user
app.get('/getDMs/:receiver', authMiddleware, async (req, res) => {
    try {
        const currentUsername = req.session.username;
        const { receiver } = req.params;
        
        // Get messages where either user is sender or receiver
        const [messages] = await activeDB.promise().query(
            `SELECT * FROM all_chats_in_haven 
             WHERE dm = 1 AND 
             ((username = ? AND receiver = ?) OR (username = ? AND receiver = ?))
             ORDER BY chat_time ASC`,
            [currentUsername, receiver, receiver, currentUsername]
        );
        
        // Format messages for frontend
        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            text: msg.chat_content,
            sender: msg.username === currentUsername ? "You" : msg.username,
            timestamp: new Date(msg.chat_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            username: msg.username
        }));
        
        res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching DMs:', error);
        res.status(500).json({ error: 'Failed to fetch direct messages' });
    }
});

// Improved channel creation endpoint
app.post('/addChannel', authMiddleware, async (req, res) => {
    const { channelName, channelMembers, isDefault } = req.body;
    const currentUsername = req.session.username;
    
    console.log('Channel Addition attempt: ', { channelName, channelMembers, isDefault });
  
    if (!channelName) {
      return res.status(400).json({ message: 'Channel name is required.' });
    }
    
    try {
      // Check if channel already exists
      const [existingChannels] = await activeDB.promise().query(
        'SELECT * FROM channels WHERE channelName = ?',
        [channelName]
      );
      
      if (existingChannels.length > 0) {
        return res.status(400).json({ message: 'A channel with this name already exists.' });
      }
      
      // Validate users exist
      const [existingUsers] = await activeDB.promise().query(
        'SELECT username FROM users WHERE username IN (?)',
        [channelMembers]
      );
      
      const existingUsernames = existingUsers.map(user => user.username);
      
      // Find any usernames that don't exist
      const missingUsers = channelMembers.filter(name => !existingUsernames.includes(name));
      
      if (missingUsers.length > 0) {
        return res.status(400).json({ message: `User(s) not found: ${missingUsers.join(", ")}` });
      }
      
      // Make sure current user is included in members
      let finalMembers = [...existingUsernames];
      if (!finalMembers.includes(currentUsername)) {
        finalMembers.push(currentUsername);
      }
      
      // Insert the channel into the database
      const [result] = await activeDB.promise().query(
        'INSERT INTO channels (channelName, channelMembers, isDefault) VALUES (?, ?, ?)',
        [channelName, JSON.stringify(finalMembers), isDefault ? 1 : 0]
      );
      
      // Return the new channel information
      return res.json({ 
        message: "Channel created successfully.", 
        id: result.insertId,
        channelName, 
        channelMembers: finalMembers,
          isDefault
      });
    } catch (error) {
      console.error("Error creating channel:", error);
      return res.status(500).json({ message: 'Error creating channel', error: error.message });
    }
  });

  app.get('/getUserRole', authMiddleware, async (req, res) => {
    try{
        const userId = req.session.userId;

        const [rows] = await activeDB.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) {
            return res.send({ role: rows[0].role });
        }   else {
            return res.status(404).send('User not found');
        }
    }   catch (error) {
        return res.status(500).send('Error fetching user role');
    }
});

// Improved endpoint for getting channels the user belongs to
app.get("/getChannels", authMiddleware, async (req, res) => {
    try {
        const username = req.session.username;
  
        if (!username) {
            return res.status(401).json({ error: "User not authenticated" });
        }
  
        // Fetch channels where the user is a member
        const [userChannels] = await activeDB.promise().query(
            'SELECT * FROM channels WHERE JSON_CONTAINS(channelMembers, ?)',
            [JSON.stringify(username)]
        );
  
        // Fetch default channels (e.g., General, Announcements, Random)
        const [defaultChannels] = await activeDB.promise().query(
            "SELECT * FROM channels WHERE isDefault = 1"
        );
  
        // Merge the two lists, ensuring no duplicates
        const allChannels = [...userChannels, ...defaultChannels.filter(
            (defaultChannel) => !userChannels.some(userChannel => userChannel.id === defaultChannel.id)
        )];
  
        res.json(allChannels);
    } catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  // Improved send message endpoint to handle channel messages better

app.post("/sendMessage", authMiddleware, async (req, res) => {
    const { channelName, chat_content, chat_time, dm, receiver } = req.body;
    const username = req.session.username;
    // Validate based on message type (DM or channel message)
    if (dm && (!chat_content || !receiver)) {
      return res.status(400).json({ error: "Message content and receiver are required for DMs." });
    } else if (!dm && (!channelName || !chat_content)) {
      return res.status(400).json({ error: "Channel name and message content are required." });
    }
    
    try {
      // Format the date in MySQL compatible format (YYYY-MM-DD HH:MM:SS)
      let messageTime;
      if (chat_time) {
        const date = new Date(chat_time);
        messageTime = date.toISOString().slice(0, 19).replace('T', ' ');
      } else {
        const date = new Date();
        messageTime = date.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      const query = "INSERT INTO all_chats_in_haven (channelName, username, chat_content, chat_time, dm, receiver) VALUES (?, ?, ?, ?, ?, ?)";
      await activeDB.promise().query(
        query, 
        [channelName || null, username, chat_content, messageTime, dm ? 1 : 0, receiver || null]
      );
      
      res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
      console.error("Error inserting message:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Endpoint to fetch messages for a specific channel
app.get("/getMessages/:channelName", authMiddleware, async (req, res) => {
    const { channelName } = req.params;
  
    try {
      console.log(`Fetching messages for channel: ${channelName}`); // Debug log
      
      const query = `
        SELECT id, username, chat_content, chat_time 
        FROM all_chats_in_haven 
        WHERE channelName = ? AND dm = 0
        ORDER BY chat_time ASC
      `;
      
      const [messages] = await activeDB.promise().query(query, [channelName]);
      console.log(`Found ${messages.length} messages`);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Database error" });
    }
  });
  
  app.get('/getUsername', (req, res) => {// sends usename to frontend database gets the right username
      //console.log(req.session.username);
      if (req.session.username) {
          res.json({ username: req.session.username });  // Sends username if it exists in the session
      } else {
          res.status(401).json({ error: "Not logged in" });
      }
  });
  
  app.post('/leaveChannel', authMiddleware, async (req, res) => {
    const { channelName } = req.body;
    const username = req.session.username;
    
    if (!channelName) {
        return res.status(400).json({ message: 'Could not fetch channel name.' });
    }
  
    try {
        const [rows] = await activeDB.promise().query(
            'SELECT channelMembers, isDefault FROM channels WHERE channelName = ?',
            [channelName]
        );
  
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Channel not found.' });
        }
        
        // Parse the JSON string to get the array of members
        let members;
        try {
            members = JSON.parse(rows[0].channelMembers || '[]');
        } catch (e) {
            // If it's already an object, use it directly
            members = rows[0].channelMembers || [];
        }
        
        console.log("Current members:", members);
        console.log("Removing user:", username);
        
        // Remove the user from the members array
        members = members.filter(member => member !== username);
        console.log("Updated members:", members);
        
        const isDefaultChannel = rows[0].isDefault === 1;
        
        // If no members left and not a default channel, delete the channel
        if (members.length === 0 && !isDefaultChannel) {
            await activeDB.promise().query('DELETE FROM channels WHERE channelName = ?', [channelName]);
            return res.json({ message: 'No one left in channel. Channel has been deleted as no members remain.' });
        }
  
        // Update the channel with the new members list
        await activeDB.promise().query(
            'UPDATE channels SET channelMembers = ? WHERE channelName = ?',
            [JSON.stringify(members), channelName]
        );
  
        res.json({ message: 'You have left the channel successfully.' });
    } catch (error) {
        console.error("Error leaving channel:", error);
        res.status(500).json({ message: 'Error leaving channel', error: error.message });
    }
  });
  
  
    const createDefaultChannels = async () => {
      const defaultChannels = ['All General', 'Announcements', 'Random']; // Define all three default channels
      
      for (const channelName of defaultChannels) {
          try {
              // Check if channel exists
              activeDB.query(
                  'SELECT COUNT(*) AS count FROM channels WHERE channelName = ?',
                  [channelName],
                  (error, results) => {
                      if (error) {
                          console.error(`Error checking channel ${channelName}:`, error);
                          return;
                      }
  
                      const channelExists = results[0].count > 0;
  
                      // Insert if not exist
                      if (!channelExists) {
                        activeDB.query(
                              "INSERT INTO channels (channelName, channelMembers, isDefault) VALUES (?, '[]', 1) ON DUPLICATE KEY UPDATE isDefault = 1",
                              [channelName],
                              (insertError) => {
                                  if (insertError) {
                                      console.error(`Error creating channel ${channelName}:`, insertError);
                                  } else {
                                      console.log(`Created channel: ${channelName}`);
                                  }
                              }
                          );
                      } else {
                          console.log(`Channel already exists: ${channelName}`);
                      }
                  }
              );
          } catch (error) {
              console.error(`Error checking/creating channel ${channelName}:`, error);
          }
      }
  };
// Export the Express app and the active database connection
module.exports = { app, activeDB };

// Start the server only if not in a test environment
if (process.env.NODE_ENV !== 'test') {
    createDefaultChannels();//makes channels accessible before server can respond
    app.listen(3001, () => {
        console.log('Server is running on port 3001');
    });
}
