import React, { useState } from 'react';
import './App.css';

// Import Modular Components
import Sidebar from './components/Sidebar';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Session from './pages/Session'; 
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

  // 1. If not logged in, show Login Page
  if (view === 'login') {
    return <Login onLoginSuccess={(userData) => { setUser(userData); setView('dashboard'); }} />;
  }

  // 2. Main App Layout
  return (
    <div className="app-container">
      <Sidebar 
        user={user} 
        view={view} 
        setView={setView} 
        onLogout={() => setShowLogoutModal(true)} 
      />
      
      {/* Route Logic - Each page fetches its own data now! */}
      
      {view === 'dashboard' && <Dashboard user={user} />}
      
      {view === 'students' && (
        <Students 
          setView={setView} 
          setCurrentLearner={setCurrentLearner} 
        />
      )}
      
      {view === 'session' && (
        <Session 
          learner={currentLearner} 
          onBack={() => setView('students')} 
        />
      )}
      
      {view === 'device' && (
        <DvcManagement 
          onBack={() => setView('dashboard')} 
        />
      )}
      {view === 'session' && (
      <ColorMatchGame 
        learner={currentLearner} 
        onBack={() => setView('students')} 
      />
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal 
          onConfirm={() => { setUser(null); setView('login'); setShowLogoutModal(false); }} 
          onCancel={() => setShowLogoutModal(false)} 
        />
      )}
    </div>
  );
}

export default App;