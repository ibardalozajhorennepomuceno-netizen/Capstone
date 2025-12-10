import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { FaWifi, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import API_BASE_URL from '../config'; // Using your centralized config

const DvcManagement = () => {
  const [status, setStatus] = useState('Disconnected');
  const [ping, setPing] = useState(0);
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 1. Connect to the WebSocket
    const socket = io(API_BASE_URL);
    const startTime = Date.now();

    socket.on('connect', () => {
      setStatus('Connected');
      setPing(Date.now() - startTime); // Rough ping estimate
    });

    socket.on('disconnect', () => setStatus('Disconnected'));

    // 2. Listen for 'fsr_update' (The Hardware Signal)
    socket.on('fsr_update', (data) => {
      console.log("Hardware Signal:", data);
      setCurrentData(data);
      // Keep last 5 signals for the log
      setHistory(prev => [
        { time: new Date().toLocaleTimeString(), ...data }, 
        ...prev
      ].slice(0, 5));
    });

    return () => socket.disconnect();
  }, []);

  // Helper to visualize the sensor color
  const getStatusColor = () => status === 'Connected' ? '#4CAF50' : '#F44336';

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Device Management</h1>
        <p style={{color: 'gray'}}>Hardware Diagnostic Console</p>
      </div>

      {/* STATUS CARDS */}
      <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
        
        {/* Connection Card */}
        <div style={{
          flex: 1, padding: '20px', borderRadius: '15px',
          background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          borderLeft: `5px solid ${getStatusColor()}`
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            {status === 'Connected' ? <FaCheckCircle color="#4CAF50" size={24}/> : <FaExclamationTriangle color="#F44336" size={24}/>}
            <div>
              <h3 style={{margin: 0}}>System Status</h3>
              <p style={{margin: 0, color: getStatusColor(), fontWeight: 'bold'}}>{status}</p>
            </div>
          </div>
          <p style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>Target Host: {API_BASE_URL}</p>
        </div>

        {/* Live Data Card */}
        <div style={{
           flex: 1, padding: '20px', borderRadius: '15px',
           background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
           display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
           <h3 style={{margin: 0, marginBottom: '5px'}}>Live Sensor Input</h3>
           {currentData ? (
             <div>
               <span style={{fontSize: '24px', fontWeight: 'bold', color: '#2C3E50'}}>{currentData.fsr}</span>
               <span style={{marginLeft: '10px', padding: '2px 8px', borderRadius: '10px', background: '#eee', fontSize: '12px'}}>
                 Duration: {currentData.duration}s
               </span>
             </div>
           ) : (
             <div style={{color: '#ccc', fontStyle: 'italic'}}>Waiting for input...</div>
           )}
        </div>
      </div>

      {/* SIGNAL LOGS */}
      <div style={{background: 'white', padding: '20px', borderRadius: '15px'}}>
        <h3>Recent Signal Logs</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Sensor ID / Color</th>
              <th>Duration</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((h, i) => (
                <tr key={i}>
                  <td>{h.time}</td>
                  <td style={{fontWeight: 'bold', color: h.fsr === 'RED' ? '#E74C3C' : h.fsr === 'GREEN' ? '#2ECC71' : '#3498DB'}}>
                    {h.fsr}
                  </td>
                  <td>{h.duration}s</td>
                  <td>{h.count}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{textAlign: 'center', color: '#999'}}>No data received yet. Press the device to test.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DvcManagement;