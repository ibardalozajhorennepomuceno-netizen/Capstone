import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; 

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/login`, { username, password });
        if (res.data.success) {
          onLoginSuccess({ ...res.data, name: username });
        } else {
          setError('Invalid credentials');
        }
      } catch (err) { setError('Server error. Check backend.'); }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    };

    return (
      <div className="login-wrapper">
        <div className="login-card">
          <p className="login-title">Welcome Back!</p>
          <p className="login-subtitle">Please enter your details...</p>
          
          <div className="input-group">
            <label>Username</label>
            <input 
              className="custom-input" 
              placeholder="Enter username" 
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown} 
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="custom-input" 
              placeholder="Enter password" 
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} 
            />
          </div>
          <p className="login-subtitle2">“Accounts are provided by the Administrator. Please contact your Admin if you don’t have an account.”</p>
          {error && <p style={{color: '#ff6b6b', fontWeight:'bold'}}>{error}</p>}
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
};

export default Login;