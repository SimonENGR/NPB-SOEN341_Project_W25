// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../Styling/DMPage.css";

// function DMPage() {
//   const [showUserList, setShowUserList] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [newMessage, setNewMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get("http://localhost:3001/getUsers", { withCredentials: true });
//               console.log("Fetched users:", response.data);

//         setUsers(response.data);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handleUserClick = (user) => {
//     setSelectedUser(user);
//     setMessages([]); // Reset messages when switching users
//     setShowUserList(false);
//   };

//   const handleSendMessage = () => {
//     if (newMessage.trim() !== "") {
//       const timestamp = new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//       setMessages([...messages, { text: newMessage, sender: "You", timestamp }]);
//       setNewMessage("");
//     }
//   };


  
//   //logout 
//   const handleLogout = async () => {
//     console.log("Logout function triggered..."); 
//     try {
//       await axios.post("http://localhost:3001/logout", {}, { withCredentials: true });
//       alert("Logged out successfully!");
//       navigate("/"); // Redirect to login page
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };


//   return (
//     <div className="chat-container">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <h2>Direct Messages</h2>
//           <button onClick={() => setShowUserList(!showUserList)} className="add-channel-button">
//             +
//           </button>

//           <button onClick={handleLogout} className="logout-button">
//           Logout
//         </button>

//         </div>

//         {showUserList && (
//           <div className="channels-list">
//             {users.map((user) => (
//               <button key={user.id} className={`chat-button ${selectedUser?.id === user.id ? "active" : ""}`} onClick={() => handleUserClick(user)}>
//               {user.username}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Chat Box */}
//       <div className="chat-box">
//         {selectedUser ? (
//           <>
//             <div className="chat-header">
//               <h3>Chat with {selectedUser.username}</h3>
//             </div>
//             <div className="messages">
//               {messages.map((msg, index) => (
//                 <div key={index} className={`message ${msg.sender === "You" ? "user" : "other"}`}>
//                   <span className="message-text">{msg.text}</span>
//                   <span className="message-timestamp">{msg.timestamp}</span>
//                 </div>
//               ))}
//             </div>
//             <div className="message-input">
//               <input
//                 type="text"
//                 placeholder="Type a message..."
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//               />
//               <button className="send-button" onClick={handleSendMessage}>
//                 Send
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="placeholder">
//             <h2>Select a User</h2>
//             <p>Click on a user to start chatting.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default DMPage;



import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styling/DMPage.css";

function DMPage() {
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/getUsers", { withCredentials: true });
        console.log("Fetched users:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setMessages([]); // Reset messages when switching users
    setShowUserList(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages([...messages, { text: newMessage, sender: "You", timestamp }]);
      setNewMessage("");
    }
  };

  // Logout function
  const handleLogout = async () => {
    console.log("Logout function triggered...");
    try {
      await axios.post("http://localhost:3001/logout", {}, { withCredentials: true });
      alert("Logged out successfully!");
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Direct Messages</h2>
          <button onClick={() => setShowUserList(!showUserList)} className="add-channel-button">
            +
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
          <button onClick={() => navigate("/chat")} className="channels-button">
            Channels
          </button>
        </div>

        {showUserList && (
          <div className="channels-list">
            {users.map((user) => (
              <button key={user.id} className={`chat-button ${selectedUser?.id === user.id ? "active" : ""}`} onClick={() => handleUserClick(user)}>
                {user.username}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Box */}
      <div className="chat-box">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h3>Chat with {selectedUser.username}</h3>
            </div>
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === "You" ? "user" : "other"}`}>
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
            <h2>Select a User</h2>
            <p>Click on a user to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DMPage;
