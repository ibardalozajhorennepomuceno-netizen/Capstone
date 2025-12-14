import React from 'react';
import { FaChartPie, FaUsers, FaSignOutAlt, FaUserCircle, FaWifi } from 'react-icons/fa';

const Sidebar = ({ user, view, setView, onLogout }) => {
  
  // Helper to make "admin" look like "Admin"
  const formatRole = (role) => {
    if (!role) return "Therapist";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // CHECK IF ADMIN
  const isAdmin = user?.role === 'admin';

  return (
    <div className="sidebar">
      {/* LOGO AREA - Kept exactly as your current code */}
      <div className="logo-area">
        <img 
            src="/Logo.png"
            alt="Logo"
            style={{ width: '200px', height: '200px', marginBottom: '0px', margin: '0 auto 0px' }}
          />
      </div>

      {/* USER PROFILE - Updated to use real data */}
      <div className="user-profile-widget">
        <div className="avatar-circle"><FaUserCircle /></div>
        <h3>{user?.username || 'Guest'}</h3>
        <span style={{opacity:0.7, fontSize:'14px'}}>
            {formatRole(user?.role)}
        </span>
      </div>

      {/* Menu Items - Kept your structure */}
      <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
        <FaChartPie className="nav-icon"/> Dashboard
      </div>
      
      {/* 2. STUDENTS (HIDDEN FOR ADMIN) */}
      {!isAdmin && (
        <div className={`nav-item ${view === 'students' ? 'active' : ''}`} onClick={() => setView('students')}>
            <FaUsers className="nav-icon"/> Students
        </div>
      )}

      {/* Device Management Button */}
      <div className={`nav-item ${view === 'device' ? 'active' : ''}`} onClick={() => setView('device')}>
        <FaWifi className="nav-icon"/> Device Check
      </div>
      
      <div style={{marginTop: 'auto'}}>
        <div className="nav-item" onClick={onLogout}>
          <FaSignOutAlt className="nav-icon"/> Logout
        </div>
      </div>
    </div>
  );
};

export default Sidebar;