import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import API_BASE_URL from '../config'; // Auto-imports your IP

const Session = ({ learner, onBack }) => { // <--- Renamed from WirelessSession
  const [isConnected, setIsConnected] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the Backend
    const newSocket = io(API_BASE_URL);

    newSocket.on('connect', () => {
      console.log("✅ Connected to Session Socket");
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log("❌ Disconnected");
      setIsConnected(false);
    });

    // Listen for IoT Data (FSR)
    newSocket.on('fsr_update', (data) => {
      console.log("Data:", data);
      setCurrentData(data);
      setHistory(prev => [data, ...prev].slice(0, 10));
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // Styling Logic
  const getColorStyle = (colorName) => {
    const c = colorName ? colorName.toUpperCase() : '';
    switch(c) {
      case 'BLUE': return { color: '#007bff', border: '5px solid #007bff', bg: '#e7f1ff' };
      case 'RED': return { color: '#dc3545', border: '5px solid #dc3545', bg: '#ffe6e6' };
      case 'GREEN': return { color: '#28a745', border: '5px solid #28a745', bg: '#e6ffe6' };
      default: return { color: '#333', border: '5px solid #333', bg: '#f8f9fa' };
    }
  };

  const style = currentData ? getColorStyle(currentData.fsr) : {};

  return (
    <div className="main-content" style={{textAlign: 'center'}}>
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
         <div>
            <h1 className="page-title">Active Session</h1>
            <p style={{color: 'gray', margin: 0}}>Student: {learner?.full_name}</p>
         </div>
         <button className="action-btn" onClick={onBack} style={{background:'#6c757d'}}>End Session</button>
      </div>
      
      {/* Connection Status Bar */}
      <div style={{
         padding: '10px', margin: '20px 0', borderRadius: '5px',
         backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
         color: isConnected ? '#155724' : '#721c24',
         fontWeight: 'bold'
      }}>
        System Status: {isConnected ? "🟢 Online & Ready" : "🔴 Connecting to Server..."}
      </div>

      {/* Main Interaction Area */}
      <div style={{
         padding: '50px', borderRadius: '20px', 
         border: style.border || '2px dashed #ccc',
         backgroundColor: style.bg || 'white',
         marginBottom: '30px', transition: '0.3s',
         minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
      }}>
        {currentData ? (
          <div>
            <h1 style={{fontSize: '80px', margin: 0, color: style.color}}>{currentData.fsr}</h1>
            <h3 style={{marginTop: 0, color: '#555'}}>DETECTED</h3>
            <div style={{display:'flex', gap:'20px', marginTop:'20px', color: '#666'}}>
                <span>⏱ Duration: {currentData.duration}s</span>
                <span>🔢 Count: {currentData.count}</span>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{color: '#aaa'}}>Waiting for Sensory Input...</h2>
            <p style={{color: '#ccc'}}>Please activate the device</p>
          </div>
        )}
      </div>

      {/* Session History */}
      <div style={{textAlign: 'left', maxWidth: '600px', margin: '0 auto'}}>
        <h3 style={{borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Session History</h3>
        <ul style={{listStyle:'none', padding:0}}>
          {history.map((item, index) => (
            <li key={index} style={{
                borderLeft: `5px solid ${getColorStyle(item.fsr).color}`, 
                padding: '15px', margin: '10px 0', background: 'white', 
                borderRadius:'5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                display: 'flex', justifyContent: 'space-between'
            }}>
              <strong>{item.fsr} Signal</strong> 
              <span style={{color: '#666'}}>{item.duration}s</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Session;