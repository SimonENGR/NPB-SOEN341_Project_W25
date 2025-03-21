import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styling/DMPage.css";

function DMPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('You');
  const navigate = useNavigate();

  // Fetch recent DM users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/getUsers", { withCredentials: true });
        console.log("Fetched users:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
          navigate("/");
        }
      }
    };
    fetchUsers();
  }, [navigate]);

  // Fetch current username
  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await fetch('http://localhost:3001/getUsername', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (data.username) {
          setCurrentUsername(data.username);
        } else {
          setCurrentUsername('You');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        setCurrentUsername('You');
      }
    }
    fetchUsername();
  }, []);

  // Search for users
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await axios.get(`http://localhost:3001/searchUsers?query=${query}`, { 
        withCredentials: true 
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
  };

  // Handle selecting a user from search results
  const handleSelectSearchResult = (user) => {
    // Check if user is already in the users list
    const existingUser = users.find(u => u.id === user.id);
    
    if (!existingUser) {
      // Add user to the list if not already there
      setUsers(prevUsers => [...prevUsers, user]);
    }
    
    // Clear search
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    
    // Select the user
    setSelectedUser(user);
  };

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        // Fetch DMs between current user and selected user
        const response = await axios.get(
          `http://localhost:3001/getDMs/${selectedUser.username}`, 
          { withCredentials: true }
        );
        
        if (response.data) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Error sending DM:", error);
        if (error.response) {
          console.log("Error response data:", error.response.data);
          alert(`Failed to send message: ${error.response.data.error || error.response.statusText}`);
        } else {
          alert("Failed to send message. Network error occurred.");
        }
      }
    };
    
    fetchMessages();
    
    // Set up interval to refresh messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "" && selectedUser) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      
      // Format datetime in MySQL-compatible format
      const timestampDB = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      try {
        // Send message to backend
        const response = await axios.post(
          "http://localhost:3001/sendMessage", 
          {
            channelName: null,
            username: currentUsername,
            chat_content: newMessage,
            chat_time: timestampDB,
            dm: 1, // Use integer 1 instead of boolean true
            receiver: selectedUser.username
          },
          { withCredentials: true }
        );
  
        if (response.data.success) {
          // Add message to local state for immediate display
          setMessages([...messages, { 
            text: newMessage, 
            sender: "You .", 
            timestamp,
            username: currentUsername
          }]);
          
          // Clear input field
          setNewMessage("");
        }
      } catch (error) {
        console.error("Error sending DM:", error);
        if (error.response) {
          console.log("Error response:", error.response.data);
          alert(`Failed to send message: ${error.response.data.error || error.response.statusText}`);
        } else {
          alert("Failed to send message. Network error occurred.");
        }
      }
    }
  };

  

  // Handle key press for sending messages with Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3001/logout", {}, { withCredentials: true });
      alert("Logged out successfully!");
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Go to channels page
  const goToChannels = () => {
    navigate("/chat");
  };

  // Function to scroll to bottom of messages when new ones arrive
  const messagesEndRef = React.useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="brand-container">
          <h1 className="app-brand">ChatHaven</h1>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={goToChannels}>Channels</button>
          <button className="nav-link active">Messages</button>
        </div>
        <div className="user-controls">
          <span className="current-user">{currentUsername}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {isSearching && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="search-result-item"
                    onClick={() => handleSelectSearchResult(user)}
                  >
                    <span className="item-icon">@</span>
                    <span className="item-name">{user.username}</span>
                  </div>
                ))}
              </div>
            )}
            {isSearching && searchResults.length === 0 && searchQuery.trim() !== "" && (
              <div className="search-results">
                <div className="no-results">No users found</div>
              </div>
            )}
          </div>
          <div className="channels-section">
            <div className="section-header">
              <h3>Direct Messages</h3>
            </div>
            <div className="channels-list">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className={`list-item ${selectedUser?.id === user.id ? "active" : ""}`}
                    onClick={() => handleUserClick(user)}
                  >
                    <span className="item-icon">@</span>
                    <span className="item-name">{user.username}</span>
                  </div>
                ))
              ) : (
                <div className="empty-users">
                  <p>No recent conversations</p>
                  <p>Search for users to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Box */}
        <div className="chat-box">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <h3><span className="header-icon">@</span> {selectedUser.username}</h3>
                <div className="private-indicator">
                  <span className="lock-icon">🔒</span>
                  <span>Private conversation</span>
                </div>
              </div>
              <div className="messages-container">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.sender === "You" ? "user-message" : "other-message"}`}
                    >
                      <div className="message-header">
                        <span className="message-sender">{msg.sender}</span>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                      <div className="message-body">
                        {msg.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No messages with this user yet.</p>
                    <p>Start the conversation with {selectedUser.username}!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  placeholder={`Message ${selectedUser.username}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="send-button" 
                  onClick={handleSendMessage}
                  disabled={newMessage.trim() === ""}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state welcome">
              <h2>Welcome to Direct Messages</h2>
              <p>Search for users in the sidebar to start a private conversation.</p>
              <p>Your messages are private and only visible to you and the recipient.</p>
              <p>Use the Channels button in the top navigation to join group discussions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DMPage;
