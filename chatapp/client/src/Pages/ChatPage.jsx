import React, { useState, useEffect}from 'react';
import axios from 'axios';
import '../Styling/ChatPage.css';

function ChatPage() {
  const [showChannelAdd, setChannelAdd] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelLogo, setChannelLogo] = useState('');
  const [channelMembers, setChannelMembers] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [channels, setChannels] = useState([]);
  const [userRole, setUserRole] = useState('');

  useEffect( () => {
    const fetchUserData = async () => {
      try{
        const roleResponse = await axios.get('http://localhost:3001/getUserRole', {withCredentials: true});
        console.log('User role:', roleResponse.data.role); 
        setUserRole(roleResponse.data.role);

        const channelsResponse = await axios.get('http://localhost:3001/getChannels', {withCredentials: true});
        setChannels(channelsResponse.data);
      }
      catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleChannelAdd = async (e) => {
      e.preventDefault();
      try{
          const response = await axios.post('http://localhost:3001/addChannel', { 
              channelName: channelName,
              channelMembers: channelMembers.split(",").map(member => member.trim()),
          }, {withCredentials: true});
          alert(response.data.message || "Channel created successfully!");

          setChannels(prevChannels => [...prevChannels, response.data]);
          setChannelName('');
          setChannelLogo('');
          setChannelMembers('');

          setChannelAdd(false);
      } catch (error){
          setErrorMessage(error.response?.data?.message || "Error creating channel.");
      }
  };
  return (
    <div className="sidebar">
      {}
      <h2>Welcome to ChatHaven!</h2>
      {}
      <div className="sidebar-buttons">
        {userRole === 'Admin' && <button onClick={() => setChannelAdd(true)} className="add-channel-button">+</button>}
        {channels.map(channel => (
          <button
          key= {channel.id}
          onClick={() => alert(`Navigating to ${channel.channelName}`)}>
            {channel.channelName}
          </button>
        ))}
    </div>
    {}
      {showChannelAdd && (
        <form className="create-channel-form" onSubmit = {handleChannelAdd}>
          <input 
          type='text' 
          placeholder='Channel Name' 
          value={channelName} 
          onChange ={(e) => setChannelName(e.target.value)} required />

          <input
          type='text'
          placeholder='Channel Members (comma-seperated)'
          value={channelMembers}
          onChange = {(e) => setChannelMembers(e.target.value)} required />

          <button type='submit'>Create Channel</button>
          <button type='button' onClick={() => setChannelAdd(false)}>Cancel</button>
        </form>
      )}
      {}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>

  );
}

export default ChatPage;
