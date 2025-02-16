import React, { useState } from 'react';
import axios from 'axios';
import './stylesheets/Login.css'; // Import the CSS file for styling
import toga from './images/toga.png'; // Adjust the path to your image

const Login = ({ setToken, setUsername, setRole }) => {
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setToken(response.data.token);
      setUsername(username); // Set the username
      setRole(response.data.role); // Set the role
      alert('Login successful!');
    } catch (error) {
      alert('Login failed: ' + error.response.data.message);
    }
  };

  return (
    <div id="container">
      <div id="app-title">
        <img src={toga} alt="toga logo" width="50" height="50" />
        <h1> Student Record System </h1>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
