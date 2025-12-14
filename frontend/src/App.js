import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Import Modular Components
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDashboard from './pages/StudentDashboard';
import ActivitySelection from './pages/ActivitySelection';
import DvcManagement from './pages/DvcManagement';
import ColorMatchGame from './pages/ColorMatchGame'; 
import AdminDashboard from './pages/AdminDashboard';

// --- 1. CONSTANTS (Outside component to fix linter warning) ---
const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 minutes total
const WARNING_DURATION = 15 * 60 * 1000; // show warning during last 15 minutes

const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// --- 2. HELPER: MANUAL LOGOUT MODAL (Restored) ---
const LogoutModal = ({ onConfirm, onCancel }) => (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Are you sure?</h3>
        <p>You will be returned to the login screen.</p>
        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px'}}>
          <button onClick={onConfirm} style={{padding:'10px 20px', background:'#F9BF15', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Yes, Logout</button>
          <button onClick={onCancel} style={{padding:'10px 20px', background:'#eee', color:'#333', border:'none', borderRadius:'5px', cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    </div>
);

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [currentLearner, setCurrentLearner] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Manual logout state

  // --- INACTIVITY STATE ---
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 1. UPDATE TIMER ON ACTIVITY
  const updateExpireTime = useCallback(() => {
    // Only reset if we are NOT in the middle of a warning countdown
    // (Or you can choose to reset always. Here we reset to keep them logged in)
    if (showTimeoutWarning) {
        setShowTimeoutWarning(false); // Hide warning if they come back
    }
    const expireTime = Date.now() + TIMEOUT_DURATION;
    localStorage.setItem('expireTime', expireTime);
  }, [showTimeoutWarning]);

  // 2. CHECK TIMER LOOP
  const checkForInactivity = useCallback(() => {
    const expireTime = parseInt(localStorage.getItem('expireTime') || '0', 10);
    
    if (expireTime && user) {
        const timeLeft = expireTime - Date.now();

        // A. TIME IS UP -> LOGOUT
        if (timeLeft <= 0) {
            setUser(null);
            setView('login');
            localStorage.removeItem('expireTime');
            localStorage.removeItem('token');
            setShowTimeoutWarning(false);
            alert("Session timed out due to inactivity.");
        } 
        // B. LESS THAN 1 MINUTE LEFT -> SHOW WARNING
        else if (timeLeft < WARNING_DURATION) {
            setShowTimeoutWarning(true);
            setCountdown(Math.ceil(timeLeft / 1000)); 
        }
        // C. PLENTY OF TIME -> HIDE WARNING
        else {
            setShowTimeoutWarning(false);
        }
    }
  }, [user]);

  // 3. EVENT LISTENERS
  useEffect(() => {
      if (user) {
          // updateExpireTime(); // Initial set
          
          window.addEventListener('click', updateExpireTime);
          window.addEventListener('keypress', updateExpireTime);  
          
          const interval = setInterval(checkForInactivity, 1000);

          return () => {
              window.removeEventListener('click', updateExpireTime);
              window.removeEventListener('keypress', updateExpireTime);
              clearInterval(interval);
          };
      }
  }, [user, updateExpireTime, checkForInactivity]);
  
  // --- HANDLERS ---
  const handleLoginSuccess = (userData, token) => {
      setUser(userData);
      localStorage.setItem('token', token); 
      updateExpireTime();
      setView('dashboard');
  };

  if (view === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isGameMode = view === 'color-match-game';

  return (
    <div className={`app-container ${isGameMode ? 'game-mode' : ''}`}>
      
      {/* SIDEBAR (Hidden in Game Mode) */}
      {!isGameMode && (
        <Sidebar 
          user={user} 
          view={view} 
          setView={setView} 
          onLogout={() => setShowLogoutModal(true)} 
        />
      )}
      
      {/* --- VIEWS --- */}
      {/* LOGIC SWITCH: ADMIN vs THERAPIST */}
      {view === 'dashboard' && (
          user?.role === 'admin' ? (
              <AdminDashboard />
          ) : (
              <Dashboard user={user} />
          )
      )}
      
      {view === 'students' && (
        <Students setView={setView} setCurrentLearner={setCurrentLearner} />
      )}

      {view === 'student-dashboard' && currentLearner && (
        <StudentDashboard 
            learner={currentLearner}
            user={user}
            onBack={() => setView('students')}
            onStartSession={() => setView('activity-selection')}
        />
      )}

      {view === 'activity-selection' && (
        <ActivitySelection 
            onBack={() => setView('student-dashboard')}
            onSelectActivity={() => setView('color-match-game')}
        />
      )}
      
      {/* THE GAME (Passes Therapist for Security Logging) */}
      {view === 'color-match-game' && (
        <ColorMatchGame 
          learner={currentLearner} 
          therapist={user} 
          onBack={() => setView('student-dashboard')} 
        />
      )}
      
      {view === 'device' && <DvcManagement />} 
      
      {/* --- MODALS --- */}

      {/* 1. MANUAL LOGOUT MODAL */}
      {showLogoutModal && (
        <LogoutModal 
            onConfirm={() => { 
                setUser(null); 
                setView('login'); 
                setShowLogoutModal(false); 
                localStorage.removeItem('token');
            }} 
            onCancel={() => setShowLogoutModal(false)} 
        />
      )}

      {/* 2. AUTO-LOGOUT WARNING MODAL */}
      {showTimeoutWarning && (
        <div style={warningStyles.overlay}>
            <div style={warningStyles.modal}>
                <div style={{fontSize: '40px', marginBottom: '10px'}}>⚠️</div>
                <h2 style={{margin: '0 0 10px 0', color: '#C0392B'}}>Inactivity Warning</h2>
                <p style={{fontSize: '16px', color: '#555', marginBottom: '10px'}}>
                    You will be automatically logged out in:
                </p>
                <div style={{fontSize: '40px', fontWeight: 'bold', color: '#C0392B', marginBottom: '15px'}}>
                    {formatCountdown(countdown)}
                </div>
                <p style={{fontSize: '13px', color: '#999', marginBottom: '20px'}}>
                    Press a key or click anywhere to stay logged in.
                </p>
                <button 
                    style={warningStyles.button} 
                    onClick={updateExpireTime}
                >
                    I'm still here
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles for the Warning Modal (to avoid new CSS files)
const warningStyles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    modal: {
        backgroundColor: 'white', padding: '30px', borderRadius: '15px',
        textAlign: 'center', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
    },
    button: {
        padding: '12px 25px', backgroundColor: '#3498DB', color: 'white',
        border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'
    }
};

export default App;