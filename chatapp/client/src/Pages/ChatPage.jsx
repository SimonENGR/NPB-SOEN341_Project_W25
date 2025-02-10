import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styling/ChatPage.css";

function ChatPage() {
  const [showChannelAdd, setChannelAdd] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelMembers, setChannelMembers] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get("http://localhost:3001/getChannels", {
          withCredentials: true,
        });
        setChannels(response.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };
    fetchChannels();
  }, []);

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
      setErrorMessage(
        error.response?.data?.message || "Error creating channel."
      );
    }
  };

  return (
    <div className="sidebar">
      {}
      <h2>Welcome to the Chat</h2>

      {}
      <div className="sidebar-buttons">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => alert(`Navigating to ${channel.channelName}`)}
          >
            {channel.channelName}
          </button>
        ))}
        <button
          className="add-channel-button"
          onClick={() => setChannelAdd(true)}
        >
          + Add Channel
        </button>
      </div>

      {}
      {showChannelAdd && (
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
          <button type="submit">Create Channel</button>
          <button type="button" onClick={() => setChannelAdd(false)}>
            Cancel
          </button>
        </form>
      )}

      {}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default ChatPage;
