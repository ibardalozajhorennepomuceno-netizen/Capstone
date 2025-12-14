import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import API_BASE_URL from '../config';

// --- FIXED: COMPONENT DEFINED OUTSIDE ---
const PasswordInput = ({ value, onChange, onKeyDown, placeholder, show, setShow }) => (
    <div style={{position: 'relative', width: '100%'}}>
        <input 
            type={show ? "text" : "password"} 
            className="custom-input" 
            placeholder={placeholder} 
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown} 
            style={{ paddingRight: '40px' }} 
        />
        <span 
            onClick={() => setShow(!show)}
            style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#95A5A6',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            {show ? <FaEyeSlash /> : <FaEye />}
        </span>
    </div>
);

const Login = ({ onLoginSuccess }) => {
  // State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForceChange, setIsForceChange] = useState(false); 
  const [tempUserId, setTempUserId] = useState(null); 

  // Visibility Toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // UI State
  const [error, setError] = useState('');

  // --- LOGIC 1: LOGIN ---
  const handleLogin = async (e) => {
    if(e) e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { username, password });
      
      if (res.data.status === 'Success') {
          onLoginSuccess(res.data.user, res.data.token);
      } 
      else if (res.data.status === 'FORCE_CHANGE_PASSWORD') {
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
              setIsForceChange(false); 
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
       isForceChange ? handleChangePassword(e) : handleLogin(e);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        <p className="login-title">
            {isForceChange ? "Setup Account" : "Welcome Back!"}
        </p>
        <p className="login-subtitle">
            {isForceChange ? "First-time login? Please set a new password." : "Please enter your details..."}
        </p>
        
        {isForceChange ? (
             <>
                <div className="input-group">
                    <label>New Password</label>
                    <PasswordInput 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="Min 8 characters"
                        show={showNewPass}
                        setShow={setShowNewPass}
                    />
                </div>
                <div className="input-group">
                    <label>Confirm Password</label>
                    <PasswordInput 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="Retype password"
                        show={showConfirmPass}
                        setShow={setShowConfirmPass}
                    />
                </div>
                
                {error && <p style={{color: '#ff6b6b', fontWeight:'bold', fontSize:'14px', margin:'10px 0'}}>{error}</p>}
                
                <button className="login-btn" style={{background:'#27ae60'}} onClick={handleChangePassword}>
                    Update Password
                </button>
             </>
        ) : (
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
                    <PasswordInput 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="Enter password"
                        show={showLoginPass}
                        setShow={setShowLoginPass}
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