import React, { useState, useEffect, useRef} from "react";
import axios from "axios";
import "../Styling/ChatPage.css";
import { useNavigate } from "react-router-dom";

function ChatPage() {
  const [showChannelAdd, setChannelAdd] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelMembers, setChannelMembers] = useState("");
  const [channels, setChannels] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState('You');
  const [chats, setChats] = useState([]);
  const [isDefault, setIsDefault] = useState(false);
  // New state for channel filtering
  const [channelFilter, setChannelFilter] = useState("all"); // "all", "default", or "custom"
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null); // New ref for the emoji button
  const [quotedMessage, setQuotedMessage] = useState(null);

  const navigate = useNavigate();

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

  // Handle emoji click
  const handleEmojiClick = (emoji) => {
    console.log("Emoji clicked:", emoji);
    setNewMessage(prevMsg => prevMsg + emoji);
    setShowEmojiPicker(false);
  };

  // Fetch channel messages when a channel is selected
  useEffect(() => {
    if (!selectedChannel) return;

    // Initial fetch
    fetchChannelMessages(selectedChannel.channelName);

    // Set up polling
    const interval = setInterval(() => {
      fetchChannelMessages(selectedChannel.channelName);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedChannel]);

  // Function to fetch channel messages
  const fetchChannelMessages = async (channelName) => {
    try {
      const response = await axios.get(`http://localhost:3001/getMessages/${channelName}`, {
        withCredentials: true  // Add this line to ensure credentials are sent
      });

      // Format the messages for display
      const formattedMessages = response.data.map(msg => ({
        ...msg,
        chat_time: new Date(msg.chat_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      }));

      console.log("Fetched messages:", formattedMessages); // Debug log to check what's being returned
      setChats(formattedMessages);
    } catch (error) {
      console.error("Error fetching channel messages:", error);
    }
  };

  // Fetch username on component mount
  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await axios.get('http://localhost:3001/getUsername', {
          withCredentials: true
        });

        if (response.data.username) {
          setUsername(response.data.username);
        } else {
          setUsername('Guest');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Guest');
      }
    }
    fetchUsername();
  }, []);

  // Fetch user role and available channels
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const roleResponse = await axios.get(
            "http://localhost:3001/getUserRole",
            { withCredentials: true }
        );
        setUserRole(roleResponse.data.role);

        const channelsResponse = await axios.get(
            "http://localhost:3001/getChannels",
            { withCredentials: true }
        );
        setChannels(channelsResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Filter channels based on selected filter
  useEffect(() => {
    if (channelFilter === "all") {
      setFilteredChannels(channels);
    } else if (channelFilter === "default") {
      setFilteredChannels(channels.filter(channel => channel.isDefault === 1));
    } else if (channelFilter === "custom") {
      setFilteredChannels(channels.filter(channel => channel.isDefault === 0));
    }
  }, [channels, channelFilter]);

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
  };

  const handleChannelMessage = async () => {
    if (newMessage.trim() === "" || !selectedChannel) return;

    const currentTime = new Date();
    // Format for display
    const displayTime = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Format for database (using ISO format for consistency)
    const dbTime = currentTime.toISOString();

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
      const response = await axios.post(
          "http://localhost:3001/sendMessage",
          {
            channelName: selectedChannel.channelName,
            username: username,
            chat_content: messageJSON, // Send the JSON string
            chat_time: dbTime,
            dm: 0, // Indicating this is not a DM
            receiver: null // No receiver for channels
          },
          { withCredentials: true }
      );

      if (response.data.success) {
        // Optimistically add message to UI
        const newChatMessage = {
          username: username,
          chat_content: messageJSON,
          chat_time: displayTime
        };

        setChats(prevChats => [...prevChats, newChatMessage]);
        setNewMessage("");
        setQuotedMessage(null); // Clear quoted message after sending
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleChannelAdd = async (e) => {
    e.preventDefault();

    if (!channelName.trim()) {
      alert("Please enter a channel name");
      return;
    }

    try {
      // Make sure to include the current user in the channel members
      let membersList = channelMembers
          .split(",")
          .map(member => member.trim())
          .filter(member => member);

      // Add current user if not already in the list
      if (!membersList.includes(username)) {
        membersList.push(username);
      }

      const response = await axios.post(
          "http://localhost:3001/addChannel",
          {
            channelName: channelName.trim(),
            channelMembers: membersList,
            isDefault: isDefault
          },
          { withCredentials: true }
      );

      alert(response.data.message || "Channel created successfully!");

      // Refresh the channels list
      const channelsResponse = await axios.get(
          "http://localhost:3001/getChannels",
          { withCredentials: true }
      );
      setChannels(channelsResponse.data);

      // Reset form
      setChannelName("");
      setChannelMembers("");
      setChannelAdd(false);
      setIsDefault(false);
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Error creating channel: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3001/logout", {}, { withCredentials: true });
      alert("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const goToDMs = () => {
    navigate("/dm");
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChannelMessage();
    }
  };

  const leaveChannel = async()=>{
    if (!selectedChannel) {
      alert("No channel selected to leave.");
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/leaveChannel', {
        channelName: selectedChannel.channelName,
      }, { withCredentials: true });
      alert(response.data.message || "Left the channel successfully!");

      // refreshes the channel list after leaving
      const updatedChannels = await axios.get('http://localhost:3001/getChannels', { withCredentials: true });
      setChannels(updatedChannels.data);
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  }

  const handleQuoteMessage = (msg) => {
    // Extract just the text content if the message has quoteData
    let messageToQuote = msg;

    // Check if the message text is in JSON format
    if (typeof msg.chat_content === 'string' && msg.chat_content.startsWith('{')) {
      try {
        const parsedMsg = JSON.parse(msg.chat_content);
        messageToQuote = {
          ...msg,
          chat_content: parsedMsg.text, // Extract text from the parsed JSON
        };
      } catch (e) {
        console.error("Error parsing quoted message:", e);
      }
    }

    // Set the quoted message state
    setQuotedMessage(messageToQuote);

    // Optionally, focus the input field after quoting
    const inputField = document.querySelector('.input-container input');
    if (inputField) {
      inputField.focus();
    }

    // Set the quoted message text in the input field
    setNewMessage(`> ${messageToQuote.chat_content}`); // Adds the quoted message to the input field
  };

  const handleDeleteMessage = async (messageId) => {
    if (userRole !== "Admin") return;  // Check if the user is an admin

    try {
      const response = await axios.delete(
          `http://localhost:3001/deleteMessage/${messageId}`,
          { withCredentials: true }
      );

      if (response.data.success) {
        alert("Message deleted successfully");
        setChats(chats.filter((msg) => msg.id !== messageId));
      }else {
        alert("Error deleting message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message.");
    }
  };

  // Function to clear quoted message
  const clearQuotedMessage = () => {
    setQuotedMessage(null);
    // Remove the quote from the message input if it starts with a quote
    if (newMessage.startsWith('>')) {
      const lines = newMessage.split('\n\n');
      if (lines.length > 1) {
        setNewMessage(lines.slice(1).join('\n\n'));
      } else {
        setNewMessage('');
      }
    }
  };

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
  }, [chats]);

  const toggleEmojiPicker = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    console.log("Toggle emoji picker clicked!");
    console.log("Current state:", showEmojiPicker);
    setShowEmojiPicker(prevState => !prevState);
  };

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


  return (
      <div className="app-container">
        {/* Top Navigation Bar */}
        <header className="top-navbar">
          <div className="brand-container">
            <h1 className="app-brand">ChatHaven</h1>
          </div>
          <div className="nav-links">
            <button className="nav-link active">Channels</button>
            <button className="nav-link" onClick={goToDMs}>Messages</button>
            {userRole === "Admin" && (
                <button
                    onClick={() => setChannelAdd(true)}
                    className="nav-link add-channel"
                >
                  Add Channel
                </button>
            )}
            <button onClick={leaveChannel} className="nav-link add-channel">Leave Channel</button>
          </div>
          <div className="user-controls">
            <span className="current-user">{username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>

        <div className="main-content">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="channels-section">
              <div className="section-header">
                <h3>Channels</h3>
                {/* Add channel filter dropdown */}
                <div className="channel-filter">
                  <select
                      value={channelFilter}
                      onChange={(e) => setChannelFilter(e.target.value)}
                      className="filter-dropdown"
                  >
                    <option value="all">All Channels</option>
                    <option value="default">Default Channels</option>
                    <option value="custom">Custom Channels</option>
                  </select>
                </div>
              </div>
              <div className="channels-list">
                {filteredChannels.map((channel) => (
                    <div
                        key={channel.id}
                        className={`list-item ${
                            selectedChannel?.id === channel.id ? "active" : ""
                        }`}
                        onClick={() => handleChannelClick(channel)}
                    >
                      <span className="item-icon">#</span>
                      <span className="item-name">
                    {channel.channelName}
                        {channel.isDefault === 1 && <span className="channel-badge default-badge">Default</span>}
                  </span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Box */}
          <div className="chat-box">
            {selectedChannel ? (
                <>
                  <div className="chat-header">
                    <h3>
                      <span className="header-icon">#</span> {selectedChannel.channelName}
                      {selectedChannel.isDefault === 1 && <span className="header-badge">Default</span>}
                    </h3>
                  </div>
                  <div className="messages-container">
                    {chats.length > 0 ? (
                        chats.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.username === username ? "user-message" : "other-message"}`}
                            >
                              <div className="message-header">
                                <span className="message-sender">{msg.username}</span>
                                <span className="message-time">{msg.chat_time}</span>
                                <div className="message-actions">
                                  {/* Quote button */}
                                  <button className="quote-button" onClick={() => handleQuoteMessage(msg)} title="Quote this message">
                                    💬
                                  </button>
                                  {/* Delete button (visible only for admin) */}
                                  {userRole === "Admin" && (
                                      <button className="delete-button" onClick={() => handleDeleteMessage(msg.id)} title="Delete this message">
                                        🗑️
                                      </button>
                                  )}
                                </div>
                              </div>
                              <div className="message-body">
                                {msg.chat_content}
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                          <p>No messages in this channel yet.</p>
                          <p>Be the first to send a message!</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="input-container">
                    {quotedMessage && (
                        <div className="quoted-message">
                          {/* Displaying quoted message with sender and message content */}
                          <div className="quoted-reply">
                            <div className="quoted-reply-sender">
                              {quotedMessage.username === username ? "You" : quotedMessage.username}
                            </div>
                            <div className="quoted-reply-text">{quotedMessage.chat_content}</div>
                          </div>

                          {/* Close button to clear the quoted message */}
                          <button className="close-quote" onClick={clearQuotedMessage} title="Remove quote">
                            ✕
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
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />

                    <button className="send-button" onClick={handleChannelMessage}>
                      Send
                    </button>
                  </div>
                </>
            ) : (
                <div className="empty-state welcome">
                  <h2>Welcome to Channels</h2>
                  <p>Select a channel from the left sidebar to start chatting.</p>
                  <p>Use the Messages button in the top navigation to chat privately with other users.</p>
                </div>
            )}
          </div>
        </div>

        {/* Modal for adding channels */}
        {showChannelAdd && (
            <div className="modal-overlay">
              <div className="modal-content">
                <form className="form" onSubmit={handleChannelAdd}>
                  <h3>Create New Channel</h3>
                  <div className="form-group">
                    <label>Channel Name</label>
                    <input
                        type="text"
                        placeholder="Enter channel name"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label>Members</label>
                    <input
                        type="text"
                        placeholder="Enter usernames (comma-separated)"
                        value={channelMembers}
                        onChange={(e) => setChannelMembers(e.target.value)}
                        required
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                          type="checkbox"
                          checked={isDefault}
                          onChange={(e) => setIsDefault(e.target.checked)}
                      />
                      Make this a default channel
                    </label>
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="primary-button">Create</button>
                    <button type="button" className="secondary-button" onClick={() => setChannelAdd(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}

export default ChatPage;
