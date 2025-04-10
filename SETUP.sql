-- Create Database and Tables
CREATE DATABASE IF NOT EXISTS chatapp;
USE chatapp;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('User', 'Admin') NOT NULL DEFAULT 'User',
    isOnline TINYINT DEFAULT 0,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channelName VARCHAR(255) NOT NULL,
    channelMembers JSON,
    isDefault TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS all_chats_in_haven (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dm BOOL NOT NULL,
    channelName VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    chat_content TEXT NOT NULL,
    chat_time VARCHAR(255) NOT NULL,
    receiver VARCHAR(255),
    isImage TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add Index to 'users' table
ALTER TABLE users ADD INDEX idx_isOnline (isOnline);

-- Modify 'chat_content' column in 'all_chats_in_haven' table
ALTER TABLE all_chats_in_haven MODIFY COLUMN chat_content TEXT NOT NULL;

-- Add unique constraint to 'channels' table
ALTER TABLE channels ADD CONSTRAINT unique_channel_name UNIQUE (channelName);

-- Delete duplicate rows in 'channels' based on 'channelName'
DELETE c1 FROM channels c1
JOIN channels c2
  ON c1.channelName = c2.channelName
WHERE c1.id > c2.id;

-- Disable safe updates (if needed for DELETE/UPDATE statements)
SET SQL_SAFE_UPDATES = 0;

-- Create MySQL User and Grant Permissions
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON chatapp.* TO 'user'@'%';
FLUSH PRIVILEGES;
