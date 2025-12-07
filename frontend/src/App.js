import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartPie, FaUsers, FaSignOutAlt, FaUserCircle, FaGoogle } from 'react-icons/fa';
import './App.css';
import { io } from 'socket.io-client';

function App() {
  const [view, setView] = useState('login'); // 'login', 'dashboard', 'students', 'session'
  const [user, setUser] = useState(null);
  const [learners, setLearners] = useState([]);
  const [currentLearner, setCurrentLearner] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- 1. LOGIN COMPONENT ---
  const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
      if(!username || !password) {
        setError('Please fill in all fields');
        return;
      }
      try {
        const res = await axios.post('http://192.168.68.120:3000/login', { username, password });
        if (res.data.success) {
          setUser({ ...res.data, name: username }); // Store username for display
          setView('dashboard');
        } else {
          setError('Invalid credentials');
        }
      } catch (err) { setError('Server error. Check backend.'); }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleLogin();
    };

    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1 className="login-title">Welcome back!</h1>
          <p style={{color: 'white', marginBottom: '30px'}}>Please enter your details</p>
          
          <div className="input-group">
            <label>Username</label>
            <input 
              className="custom-input" 
              placeholder="Enter your username" 
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password"
              className="custom-input" 
              placeholder="Enter your password" 
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && <p style={{color: '#ff6b6b', fontWeight:'bold'}}>{error}</p>}

          <button className="login-btn" onClick={handleLogin}>Login</button>
          
          <div style={{color:'white', margin:'15px 0'}}>or</div>

          <button className="google-btn" onClick={() => alert("Google Login coming in Phase 2!")}>
            <FaGoogle /> Continue with Google
          </button>
        </div>
      </div>
    );
  };

  // --- 2. SIDEBAR COMPONENT ---
  const Sidebar = () => (
    <div className="sidebar">
      <div className="logo-area">
        {/* Replace with your actual image tag later */}
        <h2 style={{color:'var(--yellow)', textShadow: '1px 1px 0 #333'}}>Sensory<br/>Palette</h2>
      </div>

      <div className="user-profile-widget">
        <div className="avatar-circle"><FaUserCircle /></div>
        {/* Dynamic Name based on who logged in */}
        <h3>{user ? user.name : 'Therapist'}</h3>
        <span style={{opacity:0.7, fontSize:'14px'}}>Therapist</span>
      </div>

      <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
        <FaChartPie className="nav-icon"/> Dashboard
      </div>
      <div className={`nav-item ${view === 'students' ? 'active' : ''}`} onClick={() => setView('students')}>
        <FaUsers className="nav-icon"/> Students
      </div>
      
      <div style={{marginTop: 'auto'}}>
        <div className="nav-item" onClick={() => setShowLogoutModal(true)}>
          <FaSignOutAlt className="nav-icon"/> Logout
        </div>
      </div>
    </div>
  );

  // --- 3. FETCH DATA ---
  const fetchLearners = async () => {
    try {
      const res = await axios.get('http://192.168.68.120:3000/learners');
      setLearners(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (view === 'dashboard' || view === 'students') {
      fetchLearners();
    }
  }, [view]);

  // --- 4. DASHBOARD PAGE (Diagnosis only, no actions) ---
  const DashboardPage = () => (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Therapist Dashboard</h1>
        <p style={{color:'gray'}}>Welcome back, {user?.name}</p>
      </div>
      
      {/* Summary Cards could go here */}

      <div style={{background: 'var(--bg)'}}>
        <h3>Recent Learners</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Diagnosis</th>
            </tr>
          </thead>
          <tbody>
            {learners.map((l, index) => (
              <tr key={l.id}>
                <td>STU-00{l.id}</td>
                <td>{l.full_name}</td>
                <td>{l.gender}</td>
                <td>
                  <span style={{
                    backgroundColor: l.diagnosis.includes('Autism') ? '#e3f2fd' : '#fce4ec',
                    color: l.diagnosis.includes('Autism') ? '#1976d2' : '#c2185b',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {l.diagnosis}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- 5. STUDENTS PAGE (With Launch Action) ---
  const StudentsPage = () => (
    <div className="main-content">
      <div className="page-header" style={{display:'flex', justifyContent:'space-between'}}>
        <h1 className="page-title">Students List</h1>
        {/* Phase 2 Button */}
        <button className="action-btn" style={{background: 'var(--gray)', cursor:'not-allowed'}}>
          + Add Student (Phase 2)
        </button>
      </div>

      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Diagnosis</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {learners.map(l => (
            <tr key={l.id}>
              <td>STU-00{l.id}</td>
              <td>{l.full_name}</td>
              <td>{l.gender}</td>
              <td>{l.age}</td>
              <td>{l.diagnosis}</td>
              <td>
                <button 
                  className="action-btn" 
                  onClick={() => { setCurrentLearner(l); setView('session'); }}
                >
                  🚀 Launch Session
                </button>
                <button 
                  className="action-btn" 
                  style={{backgroundColor: '#2C3E50', color: 'white', marginLeft: '5px'}}
                  onClick={() => { setCurrentLearner(l); setView('wireless'); }}
                >
                  📶 Wireless
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- 6. SESSION MOCKUP ---
  const SessionPage = () => (
    <div className="main-content" style={{textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center'}}>
      <h1>Session Active: {currentLearner?.full_name}</h1>
      <p>Interactive Sensory Activity goes here...</p>
      <button 
        className="action-btn" 
        style={{marginTop:'20px', width:'200px', margin:'20px auto'}}
        onClick={() => setView('students')}
      >
        End Session
      </button>
    </div>
  );

  // --- 7. LOGOUT MODAL ---
  const LogoutModal = () => (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Are you sure you want to logout?</h3>
        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px'}}>
          <button 
            onClick={() => { setUser(null); setView('login'); setShowLogoutModal(false); }}
            style={{padding:'10px 20px', background:'var(--pink)', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}
          >
            Yes, Logout
          </button>
          <button 
            onClick={() => setShowLogoutModal(false)}
            style={{padding:'10px 20px', background:'var(--gray)', border:'none', borderRadius:'5px', cursor:'pointer'}}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // --- WIRELESS IOT COMPONENT (DIAGNOSTIC VERSION) ---
  const WirelessSession = ({ learner, onBack }) => {
    const [pressure, setPressure] = useState(0);
    const [socketStatus, setSocketStatus] = useState('Disconnected 🔴'); // Connection to Laptop Backend
    const [lastSignal, setLastSignal] = useState('Never'); // Last time ESP32 sent data
    const [socket, setSocket] = useState(null);

    // 1. SETUP CONNECTION
    useEffect(() => {
      // IMPORTANT: If testing on same laptop, use localhost.
      // If testing on phone, use your laptop's IP (e.g., http://192.168.68.150:3001)
      const newSocket = io('http://192.168.68.120:3000'); 

      // A. Check if Browser is connected to Node.js
      newSocket.on('connect', () => {
        setSocketStatus('Connected to Backend 🟢');
        console.log("✅ Socket Connected via ID:", newSocket.id);
      });

      newSocket.on('disconnect', () => {
        setSocketStatus('Backend Disconnected 🔴');
      });

      newSocket.on('connect_error', (err) => {
        setSocketStatus('Connection Failed ⚠️');
        console.error("Socket Error:", err);
      });

      // B. Listen for Data (from ESP32 or Test Button)
      newSocket.on('fsr_update', (data) => {
        console.log("📡 Signal Received:", data);
        
        // Update UI
        const val = data.pressure || data.force || 0; 
        setPressure(val);
        
        // Update Timestamp
        const time = new Date().toLocaleTimeString();
        setLastSignal(time);
      });

      setSocket(newSocket);
      return () => newSocket.disconnect();
    }, []);

    // 2. DIAGNOSTIC TEST FUNCTION
    // This simulates the ESP32 sending data. 
    // If this works, but the hardware doesn't, your code is fine but the ESP32 Network is wrong.
    const testConnection = async () => {
      try {
        await axios.post('http://192.168.68.120:3000/api/fsr', { force: Math.floor(Math.random() * 100) });
        alert("Test Signal Sent! Did the bar move?");
      } catch (err) {
        alert("Backend Error: Is the server running on Port 3000?");
        console.error(err);
      }
    };

    return (
      <div className="main-content" style={{textAlign: 'center'}}>
        <div className="page-header">
          <h1 className="page-title">Wireless Diagnostics Mode</h1>
          <p>Student: {learner.full_name}</p>
        </div>

        <div style={{
          background: 'white', padding: '40px', borderRadius: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto'
        }}>
          
          {/* --- DIAGNOSTIC PANEL --- */}
          <div style={{
            backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', 
            marginBottom: '30px', border: '1px solid #ddd', textAlign: 'left'
          }}>
            <h4 style={{marginTop: 0, color: '#2C3E50'}}>📡 System Status</h4>
            <p style={{margin: '5px 0'}}><strong>1. React ↔ Server:</strong> {socketStatus}</p>
            <p style={{margin: '5px 0'}}><strong>2. Last Signal Received:</strong> {lastSignal}</p>
            <p style={{margin: '5px 0', fontSize: '12px', color: '#666'}}>
              (If #1 is Green but #2 says "Never", the ESP32 is not reaching the laptop.)
            </p>
          </div>

          {/* VISUALIZATION */}
          <h3>Grip Strength / Pressure</h3>
          <div style={{
            width: '100%', height: '50px', 
            backgroundColor: '#eee', borderRadius: '25px', 
            overflow: 'hidden', border: '2px solid #ddd',
            marginBottom: '20px'
          }}>
            <div style={{
              width: `${Math.min(pressure, 100)}%`, 
              height: '100%',
              backgroundColor: pressure > 80 ? '#FF5252' : '#4CAF50', 
              transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}></div>
          </div>
          
          <h1 style={{fontSize: '60px', color: '#333'}}>{pressure}</h1>

          {/* CONTROLS */}
          <div style={{marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
            <button className="action-btn" onClick={testConnection} style={{backgroundColor: '#FFB74D', color: 'white'}}>
              🛠️ Simulate Signal
            </button>
            
            <button className="action-btn" onClick={onBack} style={{backgroundColor: '#FF5252', color: 'white'}}>
              Exit Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Hapticdevice =()=>{
    const [isConnected, setIsConnected] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 1. Initialize Socket Connection
    const socket = io("http://192.168.68.120:3000");

    // 2. Setup Listeners
    socket.on('connect', () => {
      console.log("Connected to Server via Socket.io");
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log("Disconnected from Server");
      setIsConnected(false);
    });

    // 3. Listen for the 'fsr_update' event from backend
    socket.on('fsr_update', (data) => {
      console.log("New Data:", data);
      
      // Update current view
      setCurrentData(data);

      // Add to history (keep last 10 items)
      setHistory(prev => [data, ...prev].slice(0, 10));
    });

    // 4. Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Helper to get color for styling
  const getColorStyle = (colorName) => {
    switch(colorName) {
      case 'BLUE': return { color: '#007bff', borderColor: '#007bff' };
      case 'RED': return { color: '#dc3545', borderColor: '#dc3545' };
      case 'GREEN': return { color: '#28a745', borderColor: '#28a745' };
      default: return { color: '#333', borderColor: '#333' };
    }
  };

  return (
    <div className="container">
      <h1>ESP32 FSR Dashboard</h1>
      
      {/* Status Indicator */}
      <div className={`status ${isConnected ? 'online' : 'offline'}`}>
        Status: {isConnected ? "Connected to Server" : "Disconnected..."}
      </div>

      {/* Main Display Card */}
      <div className="main-card">
        {currentData ? (
          <div className="data-box" style={getColorStyle(currentData.fsr)}>
            <h2>{currentData.fsr} PRESSED</h2>
            <p className="stat">Duration: <span>{currentData.duration}s</span></p>
            <p className="stat">Total Count: <span>{currentData.count}</span></p>
          </div>
        ) : (
          <p className="placeholder">Waiting for button press...</p>
        )}
      </div>

      {/* History List */}
      <div className="history-section">
        <h3>Recent History</h3>
        <ul>
          {history.map((item, index) => (
            <li key={index} style={{ borderLeft: `5px solid ${getColorStyle(item.fsr).color}` }}>
              <strong>{item.fsr}</strong> - {item.duration}s (Count: {item.count})
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  }

  // --- MAIN RENDER ---
  return (
    <div className="App">
      {view === 'login' ? (
        <Login />
      ) : (
        <div className="app-container">
          <Sidebar />
          {view === 'dashboard' && <DashboardPage />}
          {view === 'students' && <StudentsPage />}
          {view === 'session' && <SessionPage />}
          {view === 'wireless' && <WirelessSession learner={currentLearner} onBack={() => setView('students')} />}
          {view === 'device' && <Hapticdevice />}
        </div>
      )}
      
      {showLogoutModal && <LogoutModal />}
    </div>
  );
}

export default App;