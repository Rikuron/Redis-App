import React, { useState } from 'react';
import axios from 'axios';
import './stylesheets/Login.css';
import toga from './images/toga.png';

const Login = ({ setToken, setUsername, setRole }) => {
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setToken(response.data.token);
      setUsername(username);
      setRole(response.data.role);
      alert('Login successful!');
    } catch (error) {
      alert('Login failed: ' + error.response.data.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password,
        adminKey
      });
      alert('Registration successful! Please login.');
      setIsRegistering(false);
    } catch (error) {
      alert('Registration failed: ' + error.response.data.message);
    }
  };

  return (
    <div id="container">
      <div id="app-title">
        <img src={toga} alt="toga logo" width="50" height="50" />
        <h1> Student Record System </h1>
      </div>
      <div className={`login-container ${isRegistering ? 'registering' : ''}`}>

        <h2> Log in to see records </h2>
        {isRegistering ? (
          <form onSubmit={handleRegister} className="login-form">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              className="login-input"
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              className="login-input"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              name="adminKey"
              placeholder="Admin Key (optional)"
              value={adminKey}
              className={`login-input admin-key ${isRegistering ? 'visible' : ''}`}
              onChange={(e) => setAdminKey(e.target.value)}
            />

            <div id="button-container">
              <button type="submit" className="login-button">Register</button>
              <button 
                type="button" 
                className="login-button secondary"
                onClick={() => setIsRegistering(false)}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                className="login-input"
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                className="login-input"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div id="button-container">
                <button type="submit" className="login-button">Login</button>
                <button 
                  type="button" 
                  className="register-button"
                  onClick={() => setIsRegistering(true)}
                >
                  Register
                </button>
              </div>
            </form>

          </>
        )}
      </div>
    </div>
  );
};

export default Login;
