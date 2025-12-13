import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Import Modular Components
import Sidebar from './components/Sidebar';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDashboard from './pages/StudentDashboard'; // NEW
import ActivitySelection from './pages/ActivitySelection'; // NEW
// import Session from './pages/Session'; 
import DvcManagement from './pages/DvcManagement';
import ColorMatchGame from './pages/ColorMatchGame.js'; 

// Helper for Logout Modal
const LogoutModal = ({ onConfirm, onCancel }) => (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Are you sure?</h3>
        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px'}}>
          <button onClick={onConfirm} style={{padding:'10px 20px', background:'var(--yellow)', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Yes</button>
          <button onClick={onCancel} style={{padding:'10px 20px', background:'var(--gray)', border:'none', borderRadius:'5px', cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    </div>
);

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [currentLearner, setCurrentLearner] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1. Detect if we are in "Game Mode"
  const isGameMode = view === 'color-match-game';

  // --- SESSION TIMEOUT LOGIC ---
  const checkForInactivity = useCallback(() => {
      const expireTime = localStorage.getItem('expireTime');
      if (expireTime && Date.now() > expireTime) {
          // Time is up!
          setUser(null); 
          setView('login');
          localStorage.removeItem('expireTime');
          alert("Session timed out due to inactivity.");
      }
  }, []);

  const updateExpireTime = () => {
      // Set expire time to 15 minutes from now
      const expireTime = Date.now() + 900000; // 15 mins * 60 * 1000
      localStorage.setItem('expireTime', expireTime);
  };

  useEffect(() => {
      // Add listeners for mouse move or key press
      window.addEventListener('click', updateExpireTime);
      window.addEventListener('keypress', updateExpireTime);
      window.addEventListener('mousemove', updateExpireTime);
      
      // Check every 5 seconds if time is up
      const interval = setInterval(checkForInactivity, 5000);

      return () => {
          window.removeEventListener('click', updateExpireTime);
          window.removeEventListener('keypress', updateExpireTime);
          window.removeEventListener('mousemove', updateExpireTime);
          clearInterval(interval);
      };
  }, [checkForInactivity]);
  
  if (view === 'login') {
    return <Login onLoginSuccess={(userData) => { setUser(userData); setView('dashboard'); }} />;
  }

  return (
    // 2. Add a specific class if in Game Mode to fix layout width
    <div className={`app-container ${isGameMode ? 'game-mode' : ''}`}>
      
      {/* 3. CONDITIONAL SIDEBAR: Only show if NOT in game mode */}
      {!isGameMode && (
        <Sidebar 
          user={user} 
          view={view} 
          setView={setView} 
          onLogout={() => setShowLogoutModal(true)} 
        />
      )}
      
      {/* --- VIEWS --- */}

      {/* Main Dashboard */}
      {view === 'dashboard' && <Dashboard user={user} />}
      
      {/* Students List */}
      {view === 'students' && (
        <Students 
          setView={setView} 
          setCurrentLearner={setCurrentLearner} 
        />
      )}

      {/* Student Profile Dashboard */}
      {view === 'student-dashboard' && currentLearner && (
        <StudentDashboard 
            learner={currentLearner}
            user={user}
            onBack={() => setView('students')}
            onStartSession={() => setView('activity-selection')}
        />
      )}

      {/* Activity Selection */}
      {view === 'activity-selection' && (
        <ActivitySelection 
            onBack={() => setView('student-dashboard')}
            onSelectActivity={(activity) => {
                setView('color-match-game');
            }}
        />
      )}
      
      {/* THE GAME (Now Full Screen) */}
      {view === 'color-match-game' && (
        <ColorMatchGame 
          learner={currentLearner} 
          onBack={() => setView('student-dashboard')} 
        />
      )}
      
      {/* Device Tools */}
      {view === 'device' && <DvcManagement />} 
      
      {/* Modal */}
      {showLogoutModal && <LogoutModal onConfirm={() => { setUser(null); setView('login'); setShowLogoutModal(false); }} onCancel={() => setShowLogoutModal(false)} />}
    </div>
  );
}

export default App;