CREATE DATABASE IF NOT EXISTS chatapp;
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON chatapp.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON chatapp.* TO 'user'@'%' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
