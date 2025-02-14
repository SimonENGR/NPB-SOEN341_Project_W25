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
  const [messages, setMessages] = useState([]);

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
    setMessages([]); // Reset messages when switching channels
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages([
        ...messages,
        { text: newMessage, sender: "You", timestamp },
      ]);
      setNewMessage("");
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
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === "You" ? "user" : "other"
                  }`}
                >
                  <span className="message-text">{msg.text}</span>
                  <span className="message-timestamp">{msg.timestamp}</span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="send-button" onClick={handleSendMessage}>
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



// import React, { useState, useEffect}from 'react';
// import axios from 'axios';
// import '../Styling/ChatPage.css';

// function ChatPage() {
//   const [showChannelAdd, setChannelAdd] = useState(false);
//   const [channelName, setChannelName] = useState('');
//   const [channelLogo, setChannelLogo] = useState('');
//   const [channelMembers, setChannelMembers] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [channels, setChannels] = useState([]);
//   const [userRole, setUserRole] = useState('');

//   useEffect( () => {
//     const fetchUserData = async () => {
//       try{
//         const roleResponse = await axios.get('http://localhost:3001/getUserRole', {withCredentials: true});
//         console.log('User role:', roleResponse.data.role); 
//         setUserRole(roleResponse.data.role);

//         const channelsResponse = await axios.get('http://localhost:3001/getChannels', {withCredentials: true});
//         setChannels(channelsResponse.data);
//       }
//       catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };
//     fetchUserData();
//   }, []);

//   const handleChannelAdd = async (e) => {
//       e.preventDefault();
//       try{
//           const response = await axios.post('http://localhost:3001/addChannel', { 
//               channelName: channelName,
//               channelMembers: channelMembers.split(",").map(member => member.trim()),
//           }, {withCredentials: true});
//           alert(response.data.message || "Channel created successfully!");

//           setChannels(prevChannels => [...prevChannels, response.data]);
//           setChannelName('');
//           setChannelLogo('');
//           setChannelMembers('');

//           setChannelAdd(false);
//       } catch (error){
//           setErrorMessage(error.response?.data?.message || "Error creating channel.");
//       }
//   };
//   return (
//     <div className="sidebar">
//       {}
//       <h2>Welcome to ChatHaven!</h2>
//       {}
//       <div className="sidebar-buttons">
//         {userRole === 'Admin' && <button onClick={() => setChannelAdd(true)} className="add-channel-button">+</button>}
//         {channels.map(channel => (
//           <button
//           key= {channel.id}
//           onClick={() => alert(`Navigating to ${channel.channelName}`)}>
//             {channel.channelName}
//           </button>
//         ))}
//     </div>
//     {}
//       {showChannelAdd && (
//         <form className="create-channel-form" onSubmit = {handleChannelAdd}>
//           <input 
//           type='text' 
//           placeholder='Channel Name' 
//           value={channelName} 
//           onChange ={(e) => setChannelName(e.target.value)} required />

//           <input
//           type='text'
//           placeholder='Channel Members (comma-seperated)'
//           value={channelMembers}
//           onChange = {(e) => setChannelMembers(e.target.value)} required />

//           <button type='submit'>Create Channel</button>
//           <button type='button' onClick={() => setChannelAdd(false)}>Cancel</button>
//         </form>
//       )}
//       {}
//       {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
//     </div>

//   );
// }

// export default ChatPage;
