import React, { useState, useEffect } from "react";
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

  const navigate = useNavigate();

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
    
    try {
      const response = await axios.post(
        "http://localhost:3001/sendMessage", 
        {
          channelName: selectedChannel.channelName,
          username: username,
          chat_content: newMessage,
          chat_time: dbTime,
          dm: 0,
          receiver: null
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Optimistically add message to UI
        const newChatMessage = {
          username: username,
          chat_content: newMessage,
          chat_time: displayTime
        };
        
        setChats(prevChats => [...prevChats, newChatMessage]);
        setNewMessage("");
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
          <button onClick={leaveChannel}>Leave Channel</button>
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
            </div>
            <div className="channels-list">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`list-item ${
                    selectedChannel?.id === channel.id ? "active" : ""
                  }`}
                  onClick={() => handleChannelClick(channel)}
                >
                  <span className="item-icon">#</span>
                  <span className="item-name">{channel.channelName}</span>
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
                <h3><span className="header-icon">#</span> {selectedChannel.channelName}</h3>
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
              </div>
              <div className="input-container">
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
              <div>
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
