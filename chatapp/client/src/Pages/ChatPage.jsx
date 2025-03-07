import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styling/ChatPage.css";

function ChatPage() {
  const [showChannelAdd, setChannelAdd] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelMembers, setChannelMembers] = useState("");
  const [channels, setChannels] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  //const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('You');
//modification
  const [chats, setChats] = useState([]);
  //const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!channelName) return;

    const interval = setInterval(() => {
      axios.get(`http://localhost:3001/channelContent/${channelName}`)
          .then((response) => {
            const reversedChats = response.data.reverse().map(msg => ({
              ...msg,
              chat_time: new Date(msg.chat_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }), // Convert chat_time to ezy to read format
            }));

            setChats(reversedChats);
          })
          .catch((error) => {
            console.error("Error fetching chats:", error);
          });
    }, 1000);

    return () => clearInterval(interval);

  }, [channelName]);

//modification
  useEffect(() => {
    async function fetchUsername() {
      try {
        // Make a GET request to the backend to get the username
        const response = await fetch('http://localhost:3001/getUsername',{
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        console.log(data);

        // If the backend returns a username, update the state
        if (data.username) {
          setUsername(data.username);
        } else {
          setUsername('Guest'); // defaults to "Guest" if no username
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Guest'); // Fallback if there's an error
      }
    }
    fetchUsername(); // Call the function on component mount
  }, []);

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
    setChannelName(channel.channelName);
    setSelectedChannel(channel);
    //setMessages([]);

  };

  const handleChannelMessage = async () => {
    if (newMessage.trim() !== "") {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newChatMessage = {
        username: username,
        chat_content: newMessage,
        chat_time: timestamp,
      };


      const timestampDB = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",}).replace(",", "");
      try {
        const response = await fetch("http://localhost:3001/sendMessage", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            channelName: selectedChannel.channelName,
            username: username,
            chat_content: newMessage,
            chat_time: timestampDB,
            dm: 0,//"0" indicates false
            receiver: null
          }),
        });

        const data = await response.json();
        if (data.success) {
          // Append the new message to chats immediately
          setChats((prevChats) => [...prevChats, newChatMessage]);

          // Clear input field
          setNewMessage("");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };


  const handleChannelAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/addChannel",
        {
          channelName,
          channelMembers: channelMembers
            .split(",")
            .map((member) => member.trim()),
        },
        { withCredentials: true }
      );
      alert(response.data.message || "Channel created successfully!");

      setChannels((prevChannels) => [...prevChannels, response.data]);
      setChannelName("");
      setChannelMembers("");
      setChannelAdd(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
      <div className="chat-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>ChatHaven</h2>
            {userRole === "Admin" && (
                <button
                    onClick={() => setChannelAdd(true)}
                    className="add-channel-button"
                >
                  + Add Channel
                </button>
            )}
          </div>
          <div className="channels-list">
            {channels.map((channel) => (
                <button
                    key={channel.id}
                    className={`channel-button ${
                        selectedChannel?.id === channel.id ? "active" : ""
                    }`}
                    onClick={() => handleChannelClick(channel)}
                >
                  <span className="channel-name">{channel.channelName}</span>
                </button>
            ))}
          </div>
          {showChannelAdd && (
              <div className="create-channel-modal">
                <form className="create-channel-form" onSubmit={handleChannelAdd}>
                  <input
                      type="text"
                      placeholder="Channel Name"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      required
                  />
                  <input
                      type="text"
                      placeholder="Channel Members (comma-separated)"
                      value={channelMembers}
                      onChange={(e) => setChannelMembers(e.target.value)}
                      required
                  />
                  <button type="submit">Create</button>
                  <button type="button" onClick={() => setChannelAdd(false)}>
                    Cancel
                  </button>
                </form>
              </div>
          )}
        </div>

        {/* Chat Box */}
        <div className="chat-box">
          {selectedChannel ? (
              <>
                <div className="chat-header">
                  <h3>{selectedChannel.channelName}</h3>
                </div>
                {/*<div className="messages">*/}
                {/*  {messages.map((msg, index) => (*/}
                {/*      <div*/}
                {/*          key={index}*/}
                {/*          className={`message ${msg.sender === "You" ? "user" : "other"}`}*/}
                {/*      >*/}
                {/*        <span className="message-sender">{msg.username}:</span>*/}
                {/*        <span className="message-text">{msg.text}</span>*/}
                {/*        <span className="message-timestamp">{msg.timestamp}</span>*/}
                {/*      </div>*/}
                {/*  ))}*/}
                {/*</div>*/}
                <div className="messages">
                  {chats.length > 0 ? (
                      chats.map((msg, index) => (
                          <div
                              key={index}
                              className={`message ${msg.username === username ? "user" : "other"}`}
                          >
                            <span className="message-sender">{msg.username}:</span>
                            <span className="message-text">{msg.chat_content}</span>
                            <span className="message-timestamp">{msg.chat_time}</span>
                          </div>
                      ))
                  ) : (
                      <p>No messages yet.</p>
                  )}
                </div>
                <div className="message-input">
                  <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button className="send-button" onClick={handleChannelMessage}>
                    Send
                  </button>
                </div>
              </>
          ) : (
              <div className="placeholder">
                <h2>Select a Channel</h2>
                <p>Pick a channel from the left to start chatting.</p>
              </div>
          )}
        </div>
      </div>
  );
}

export default ChatPage;