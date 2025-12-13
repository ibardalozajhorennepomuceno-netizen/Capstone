import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
// Ensure your CSS file with .login-wrapper, .login-card, etc. is imported in App.js or here

const Login = ({ onLoginSuccess }) => {
  // --- STATE ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // New State for Change Password Flow
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForceChange, setIsForceChange] = useState(false); 
  const [tempUserId, setTempUserId] = useState(null); 

  // UI State
  const [error, setError] = useState('');

  // --- LOGIC 1: LOGIN ---
  const handleLogin = async (e) => {
    if(e) e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { username, password });
      
      if (res.data.status === 'Success') {
          // PASS USER & TOKEN UP TO APP.JS
          onLoginSuccess(res.data.user, res.data.token);
      } 
      else if (res.data.status === 'FORCE_CHANGE_PASSWORD') {
          // TRIGGER FORCE CHANGE UI
          setIsForceChange(true);
          setTempUserId(res.data.user_id);
          setError(""); 
      } 
      else {
          setError(res.data.message || 'Invalid credentials');
      }
    } catch (err) { 
        setError('Server error. Check backend.'); 
    }
  };

  // --- LOGIC 2: CHANGE PASSWORD ---
  const handleChangePassword = async (e) => {
      if(e) e.preventDefault();
      
      if (newPassword !== confirmPassword) return setError("Passwords do not match!");
      if (newPassword.length < 8) return setError("Password must be at least 8 characters.");

      try {
          const res = await axios.post(`${API_BASE_URL}/change-password`, {
              user_id: tempUserId,
              new_password: newPassword
          });

          if (res.data.success) {
              alert("Success! Please login with your new password.");
              setIsForceChange(false); // Reset to Login View
              setPassword(''); 
              setNewPassword(''); 
              setConfirmPassword('');
              setError('');
          } else {
              setError(res.data.message);
          }
      } catch (err) {
          setError("Failed to change password.");
      }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
       isForceChange ? handleChangePassword() : handleLogin();
    }
  };

  // --- RENDER (USING ORIGINAL CSS CLASSES) ---
  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        {/* HEADER */}
        <p className="login-title">
            {isForceChange ? "Setup Account" : "Welcome Back!"}
        </p>
        <p className="login-subtitle">
            {isForceChange ? "First-time login? Please set a new password." : "Please enter your details..."}
        </p>
        
        {/* VIEW 1: CHANGE PASSWORD */}
        {isForceChange ? (
             <>
                <div className="input-group">
                    <label>New Password</label>
                    <input 
                        type="password"
                        className="custom-input" 
                        placeholder="Min 8 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="input-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password"
                        className="custom-input" 
                        placeholder="Retype password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                
                {error && <p style={{color: '#ff6b6b', fontWeight:'bold', fontSize:'14px', margin:'10px 0'}}>{error}</p>}
                
                <button className="login-btn" style={{background:'#27ae60'}} onClick={handleChangePassword}>
                    Update Password
                </button>
             </>
        ) : (
            /* VIEW 2: ORIGINAL LOGIN */
            <>
                <div className="input-group">
                    <label>Username</label>
                    <input 
                        className="custom-input" 
                        placeholder="Enter username" 
                        value={username}
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
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown} 
                    />
                </div>

                <p className="login-subtitle2">“Accounts are provided by the Administrator. Please contact your Admin if you don’t have an account.”</p>
                
                {error && <p style={{color: '#ff6b6b', fontWeight:'bold', fontSize:'14px', margin:'10px 0'}}>{error}</p>}
                
                <button className="login-btn" onClick={handleLogin}>Login</button>
            </>
        )}

      </div>
    </div>
  );
};

export default Login;