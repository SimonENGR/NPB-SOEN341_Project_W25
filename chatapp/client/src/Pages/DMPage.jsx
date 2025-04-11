import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styling/DMPage.css";
import { upload } from "@testing-library/user-event/dist/cjs/utility/upload.js";

function DMPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('You');
  const [isAdmin, setIsAdmin] = useState(false); // Added admin state
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null); // New ref for the emoji button
  const [currentStatus, setCurrentStatus] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null); 

  // Common emoji categories and their emojis
  const emojiCategories = [
    {
      name: "Smileys",
      emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎"]
    },
    {
      name: "Emotions",
      emojis: ["😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥"]
    },
    {
      name: "Gestures",
      emojis: ["👋", "🤚", "✋", "🖐️", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🙏"]
    },
    {
      name: "Animals",
      emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🦅", "🦆", "🦉", "🐺", "🐗", "🐴", "🦄"]
    },
    {
      name: "Food",
      emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🍟", "🍕", "🌭", "🍔", "🍗"]
    }
  ];

  const getMentions = (text) => {
    const regex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = regex.exec(text)) !== null){
      mentions.push(match[1]);
    }
    return mentions;
  };
  
  //Handle file selection for image upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    //limit size of image 
    if(file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);

    //Create preview 
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  //Cancel image upload 
  const cancelImageUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //Upload image and send 
  const uploadAndSendImage = async () => {
    if (!selectedImage || !selectedUser){
      return;
    }

    setIsUploading(true);

    try {
      //Create form data 
      const formData = new FormData();
      formData.append('image', selectedImage);

      //Upload image 
      const uploadResponse = await axios.post(
        'http://localhost:3001/uploadImage', 
        formData,
        {
          withCredentials: true, 
          headers: {
            'Content-Type' : 'multipart/form-data'
          }
        }
      );

      if (uploadResponse.data.success) {
        const imagePath = uploadResponse.data.filePath; 
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const timestampDB = new Date().toISOString().slice(0,19).replace('T', ' ');

        //Send message with image path 
        const response = await axios.post(
          "http://localhost:3001/sendMessage",
          {
            channelName: null, 
            chat_content: imagePath,
            chat_time: timestampDB, 
            dm: 1, 
            receiver: selectedUser.username,
            isImage: 1
          },
          {withCredentials: true}
        );

        if (response.data.success) {
          setMessages([...messages, {
            text: imagePath, 
            sender: "You",
            timestamp,
            username: currentUsername, 
            isImage: true
          }]);

          //Clear image selection
          setSelectedImage(null);
          setImagePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    }catch (error) {
      console.error("Error uploading image: ", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle emoji click
  const handleEmojiClick = (emoji) => {
    console.log("Emoji clicked:", emoji);
    setNewMessage(prevMsg => prevMsg + emoji);
    setShowEmojiPicker(false);
  };

  // Handle quoting a message
  const handleQuoteMessage = (message) => {
    // Extract just the text content if the message has quoteData
    let messageToQuote = message;
    
    if (typeof message.text === 'string' && message.text.startsWith('{')) {
      try {
        const parsedMsg = JSON.parse(message.text);
        messageToQuote = {
          ...message,
          text: parsedMsg.text
        };
      } catch (e) {
        console.error("Error parsing quoted message:", e);
      }
    }
    
    setQuotedMessage(messageToQuote);
    
    // Focus the input field after quoting
    const inputField = document.querySelector('.input-container input');
    if (inputField) {
      inputField.focus();
    }
  };

  // Handle deleting a message (admin only)
  const handleDeleteMessage = async (messageId) => {
    if (!isAdmin) return;
    
    try {
      const response = await axios.delete(
        `http://localhost:3001/deleteMessage/${messageId}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Remove the message from the local state
        setMessages(messages.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message.");
    }
  };

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
    //update real time status 
    const interval = setInterval(fetchUsers, 2000);
    return () => clearInterval(interval);
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

  // Fetch user role to check if admin
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const response = await axios.get('http://localhost:3001/getUserRole', {
          withCredentials: true,
        });
        
        if (response.data.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }
    fetchUserRole();
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
        console.error("Error fetching messages:", error);
        if (error.response) {
          console.log("Error response data:", error.response.data);
          alert(`Failed to fetch messages: ${error.response.data.error || error.response.statusText}`);
        } else {
          alert("Failed to fetch messages. Network error occurred.");
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
      
      const mentions = getMentions(newMessage);
      mentions.forEach(userName => {
       if (userName !== selectedUser) {
         console.log(`Alert: ${userName}, you were mentioned by ${selectedUser}`);
         alert(`${userName}, you were mentioned!`);
        }
      })
      // Format datetime in MySQL-compatible format
      const timestampDB = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      // Store quoted message data in a structured way instead of text formatting
      let messageData = {
        text: newMessage,
        quoteData: quotedMessage ? {
          sender: quotedMessage.username || quotedMessage.sender,
          text: quotedMessage.text
        } : null
      };
      
      // Convert to JSON string for storage in the database
      const messageJSON = JSON.stringify(messageData);
      
      try {
        // Send message to backend
        const response = await axios.post(
          "http://localhost:3001/sendMessage", 
          {
            channelName: null,
            username: currentUsername,
            chat_content: messageJSON, // Send the JSON string
            chat_time: timestampDB,
            dm: 1, // Use integer 1 instead of boolean true
            receiver: selectedUser.username
          },
          { withCredentials: true }
        );
  
        if (response.data.success) {
          // Add message to local state for immediate display
          setMessages([...messages, { 
            text: messageData.text,
            quoteData: messageData.quoteData,
            sender: "You", 
            timestamp,
            username: currentUsername
          }]);
          
          // Clear input field and quoted message
          setNewMessage("");
          setQuotedMessage(null);
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
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  // Modified emoji picker toggle function with debugging
  const toggleEmojiPicker = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    console.log("Toggle emoji picker clicked!");
    console.log("Current state:", showEmojiPicker);
    setShowEmojiPicker(prevState => !prevState);
  };

  //Open file picker
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is outside both the emoji picker and the emoji button
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) && 
        emojiButtonRef.current && 
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    }

    // Only add the event listener if the emoji picker is shown
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  useEffect(() => {
    let timeout;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      setCurrentStatus(1);
      axios.post('http://localhost:3001/status', { status: 1 }, {withCredentials:true});
      timeout = setTimeout(async () => {
        setCurrentStatus(2); // Away
        await axios.post('http://localhost:3001/status', { status: 2 }, {withCredentials:true});
      }, 60000); // 5 minutes idle
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    
    resetTimer(); // Start the timer when component mounts
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, []);  

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
                    <button className={`status-button ${user.isOnline === 1 ? "online" : user.isOnline === 2 ? "away" : "offline"}`}
                    title={user.isOnline === 1 ? "Online" : user.isOnline === 2 ? "Away" : "Offline"}></button>
                    <span className="last-active">
                      {user.isOnline === 0 && user.last_active 
                        ? `Last active: ${new Date(user.last_active).toLocaleString()}`
                        : ''}
                    </span>
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
                  messages.map((msg, index) => {
                    //Check if image
                    if (msg.isImage) {
                      return (
                        <div
                        key={index}
                        className={`message ${msg.username === currentUsername ? "user-message" : "other-message"}`}
                      >
                        <div className="message-header">
                          <span className="message-sender">
                            {msg.username === currentUsername ? "You" : msg.username || msg.sender}
                          </span>
                          <span className="message-time">{msg.timestamp}</span>
                          <div className="message-actions">
                            {isAdmin && (
                              <button
                                className="delete-button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Delete this message"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="message-body image-message">
                          <img
                            src={`http://localhost:3001${msg.text}`}
                            alt="Shared image"
                            className="shared-image"
                            onClick={() => window.open(`http://localhost:3001${msg.text}`, '_blank')}></img>
                          
                        </div>
                      </div>
                      )
                    }
                    // Try to parse the message content if it's in JSON format
                    let messageText = msg.text;
                    let quoteData = null;
                    
                    try {
                      // Check if the message is already in our new format (object with quoteData)
                      if (msg.quoteData) {
                        quoteData = msg.quoteData;
                      } 
                      // Try to parse the message as JSON (for messages from the database)
                      else if (typeof msg.text === 'string' && msg.text.startsWith('{') && msg.text.includes('quoteData')) {
                        const parsedMsg = JSON.parse(msg.text);
                        messageText = parsedMsg.text;
                        quoteData = parsedMsg.quoteData;
                      }
                      // Check for legacy format with '> sender: text\n\n' pattern
                      else if (typeof msg.text === 'string' && msg.text.startsWith('> ') && msg.text.includes('\n\n')) {
                        const parts = msg.text.split('\n\n');
                        const quotePart = parts[0].substring(2); // Remove '> '
                        const quoteParts = quotePart.split(': ');
                        
                        if (quoteParts.length >= 2) {
                          quoteData = {
                            sender: quoteParts[0],
                            text: quoteParts.slice(1).join(': ')
                          };
                          messageText = parts.slice(1).join('\n\n');
                        }
                      }
                    } catch (e) {
                      console.error("Error parsing message:", e);
                      // If parsing fails, use the original text
                      messageText = msg.text;
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`message ${msg.username === currentUsername ? "user-message" : "other-message"}`}
                      >
                        <div className="message-header">
                          <span className="message-sender">
                            {msg.username === currentUsername ? "You" : msg.username || msg.sender}
                          </span>
                          <span className="message-time">{msg.timestamp}</span>
                          <div className="message-actions">
                            <button 
                              className="quote-button" 
                              onClick={() => handleQuoteMessage({
                                ...msg,
                                text: messageText // Make sure we quote just the actual message
                              })}
                              title="Quote this message"
                            >
                              💬
                            </button>
                            {isAdmin && (
                              <button
                                className="delete-button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Delete this message"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        <div className={`message-body ${quoteData ? 'message-body-with-quote' : ''}`}>
                          {quoteData && (
                            <div className="quoted-reply">
                              <div className="quoted-reply-sender">{quoteData.sender}</div>
                              <div className="quoted-reply-text">{quoteData.text}</div>
                            </div>
                          )}
                          {messageText}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <p>No messages with this user yet.</p>
                    <p>Start the conversation with {selectedUser.username}!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
                {/*Image Preview*/}
                {imagePreview && (
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview "></img>
                      <div className="image-preview-actions">
                        <button
                          className="cancel-upload"
                          onClick={cancelImageUpload}
                          disabled={isUploading}
                          >
                          Cancel
                        </button>
                        <button
                          className="send-image"
                          onClick={uploadAndSendImage}
                          disabled={isUploading}
                          >
                            {isUploading ? 'Sending...' : 'Send Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              <div className="input-container">
                {quotedMessage && (
                  <div className="quoted-message">
                    <div className="quoted-content">
                      <span className="quoted-sender">
                        {quotedMessage.username === currentUsername ? "You" : quotedMessage.username || quotedMessage.sender}
                      </span>
                      <div>{quotedMessage.text}</div>
                    </div>
                    <button 
                      className="remove-quote" 
                      onClick={() => setQuotedMessage(null)}
                      title="Remove quote"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="input-tools">
                  <button 
                    ref={emojiButtonRef}
                    className="emoji-button" 
                    onClick={toggleEmojiPicker}
                  >
                    😊
                  </button>
                  {/*Image upload button*/}
                  <button
                    className="image-upload-button"
                    onClick={openFilePicker}
                    title="Send an image"
                    >
                    📷
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{display : 'none'}}
                    accept="image/*"
                    onChange={handleFileSelect}
                    >
                  </input>
                </div>
                {showEmojiPicker && (
                  <div className="emoji-picker-container" ref={emojiPickerRef}>
                    <div className="emoji-picker-custom">
                      <div className="emoji-categories">
                        {emojiCategories.map((category, catIndex) => (
                          <div key={catIndex} className="emoji-category">
                            <div className="category-name">{category.name}</div>
                            <div className="emoji-grid">
                              {category.emojis.map((emoji, emojiIndex) => (
                                <button
                                  key={emojiIndex}
                                  className="emoji-item"
                                  onClick={() => handleEmojiClick(emoji)}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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