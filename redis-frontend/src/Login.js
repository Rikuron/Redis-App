import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file for styling
import toga from './images/toga.png'; // Adjust the path to your image

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setToken(response.data.token);
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

      <div className="login-container">
        <h2> Log in to see records </h2>
        <p> Enter your username and password </p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <div id="button-container">
            <button type="submit" className="login-button">Login</button>
            <button type="button" className="register-button">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
