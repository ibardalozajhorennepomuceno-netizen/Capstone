import React from 'react';
import { FaChartPie, FaUsers, FaSignOutAlt, FaUserCircle, FaWifi } from 'react-icons/fa'; // Added FaWifi icon

const Sidebar = ({ user, view, setView, onLogout }) => {
  return (
    <div className="sidebar">
      <div className="logo-area">
        <img 
            src="\Logo.png"
            alt="Logo"
            style={{ width: '200px', height: '200px', marginBottom: '0px', margin: '0 auto 0px' }}
          />
      </div>

      <div className="user-profile-widget">
        <div className="avatar-circle"><FaUserCircle /></div>
        <h3>{user ? user.name : 'Therapist'}</h3>
        <span style={{opacity:0.7, fontSize:'14px'}}>Therapist</span>
      </div>

      {/* Menu Items */}
      <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
        <FaChartPie className="nav-icon"/> Dashboard
      </div>
      
      <div className={`nav-item ${view === 'students' ? 'active' : ''}`} onClick={() => setView('students')}>
        <FaUsers className="nav-icon"/> Students
      </div>

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