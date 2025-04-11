## SOEN341 GROUP PROJECT

# Objective
<p align="justify">
Our objective in this project is to develop a middle -fidelity prototype of a message exchanging platform over the span of 4 sprints, where each sprint has a duration of 2 weeks. The development of the product is done in groups of 6 following the Agile development apporach. Github is used as the platform of choice for version control, access control, bug tracking, software feature requests, task management, and continuous integration.
</p>

# Project detail
<p align="justify">
Communication is a must when it comes to working on large projects, maintaining relationships, and connecting communities. One of the tools that can facilitate team collaboration is a communication platform. The goal of our project “ChatHaven” is a communication platform which provides an intuitive and organized environment to stay connected. Users in the platform are either an admin or a member. Admins can create or delete messages and moderate channels. Members can send private messages among themselves and send messages which are visible to all users in a channel. 
</p>

# How to run the code
<p align="justify">
Setting up MySQL
  
  1) Create a new schema, set "safe_update" to '0' and execute it:
  ```
     SET SQL_SAFE_UPDATES = 0;
  ```
  2) Make the necessary tables with the following lines of MySQL commands:
     
    CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('User', 'Admin') NOT NULL DEFAULT 'User',
    isOnline TINYINT DEFAULT 0,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    ALTER TABLE users ADD INDEX idx_isOnline (isOnline);
    SELECT * FROM users;
    DROP TABLE users;

    CREATE TABLE channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channelName VARCHAR(255) NOT NULL,
    channelMembers JSON,
    isDefault TINYINT(1) DEFAULT 0
    );
    ALTER TABLE channels ADD COLUMN isDefault TINYINT(1) DEFAULT 0;
    ALTER TABLE channels ADD CONSTRAINT unique_channel_name UNIQUE (channelName);
    SELECT * FROM channels;
    TRUNCATE TABLE channels;
    DROP TABLE channels;

    CREATE TABLE all_chats_in_haven (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dm bool NOT NULL,
    channelName VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    chat_content VARCHAR(255) NOT NULL,
    chat_time VARCHAR(255) NOT NULL,
    receiver VARCHAR(255)
    );
    -- Add isImage column to all_chats_in_haven table
    ALTER TABLE all_chats_in_haven ADD COLUMN isImage TINYINT(1) DEFAULT 0;

    -- Update chat_content column to handle larger data for image paths
    ALTER TABLE all_chats_in_haven MODIFY COLUMN chat_content TEXT NOT NULL;
    
    SELECT * FROM all_chats_in_haven;
    TRUNCATE TABLE all_chats_in_haven;
    DROP TABLE all_chats_in_haven;


    INSERT INTO users (username, email, password, role)
    VALUES ('simon666', 'simon666@hotmail.com', 'hashed_password_here', 'User');
    UPDATE users SET isOnline = 1 WHERE id = ?;

  3) Execute all "Create Table" and "Alter Table" commands.

  4) Change local database configuration.
     Go to "chatapp" => "server.js".
     On line 61 and 62 replace the values in "database" and "password" to the ones you have.
     ```
     const db = mysql.createConnection({
        host: 'localhost',
        user: 'root', // WHEN RUNNING LOCALLY USE 'root', WHEN COMMITING TO RUN INSIDE GITHUB ACTIONS, CHANGE THIS TO 'user'
        password: 'password',
        database: 'chatapp'
     });
    

  5) Running the code.
     Go back to "chatapp", then open the terminal.
     Run the command below:
     ```
     npm start
     
</p>

# Team members
Simon Guidon(Backend, Database) Github ID: SimonENGR  
Emily Ng Youn Chen(Frontend, Documentation) Github ID: enyc24  
Diego Samanez Denis(Backend, Database, Documentation) Github ID: DiegoSamanezDenis  
George Nashed(Frontend, Documentation) Github ID: georgenashed234  
Rohan Kumar(Backend, Database) Github ID: deadxrk  
Muthui Mureithi(Backend) Github ID: Montoy22  

# Technologies
React.js  
Node.js  
MySQL  
