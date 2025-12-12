import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';
import API_BASE_URL from '../config';

const StudentDashboard = ({ learner, onBack, onStartSession }) => {
  const [activeTab, setActiveTab] = useState('profile'); 
  const [history, setHistory] = useState([]);

  // FETCH REAL HISTORY
  useEffect(() => {
    if (activeTab === 'sessions' && learner?.id) {
      axios.get(`${API_BASE_URL}/engagement_logs/${learner.id}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error("Error loading history:", err));
    }
  }, [activeTab, learner.id]);

  // Helper to format date (e.g., "Jan 19, 2016")
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Helper to format session time (seconds -> 05:00)
  const formatDuration = (secs) => {
    if (!secs) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="main-content">
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <div>
            <h1 className="page-title">Student Dashboard</h1>
            <p style={{color:'gray'}}>Managing profile for: {learner.full_name}</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
            <button className="action-btn" onClick={onBack} style={{background:'#6c757d'}}>Back to List</button>
            <button className="action-btn" onClick={onStartSession} style={{background:'#F9BF15', color:'black'}}>Start Session</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:'flex', gap:'20px', marginBottom:'20px', borderBottom:'2px solid #eee'}}>
        <div onClick={() => setActiveTab('profile')} style={{padding:'10px 20px', cursor:'pointer', fontWeight:'bold', borderBottom: activeTab === 'profile' ? '3px solid #2C3E50' : 'none', color: activeTab === 'profile' ? '#2C3E50' : '#aaa'}}>
            Student Profile
        </div>
        <div onClick={() => setActiveTab('sessions')} style={{padding:'10px 20px', cursor:'pointer', fontWeight:'bold', borderBottom: activeTab === 'sessions' ? '3px solid #2C3E50' : 'none', color: activeTab === 'sessions' ? '#2C3E50' : '#aaa'}}>
            Sessions History
        </div>
      </div>

      {/* --- PROFILE TAB (CONNECTED TO DB) --- */}
      {activeTab === 'profile' && (
        <div style={{background:'white', padding:'40px', borderRadius:'10px', boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}>
            
            {/* Student Info */}
            <div style={{display:'flex', gap:'40px', border: '2px solid #3498db', padding:'30px', borderRadius:'10px', marginBottom:'30px'}}>
                <div style={{textAlign:'center'}}>
                    <div style={{width:'100px', height:'100px', background:'#ddd', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontSize:'3rem', color:'white'}}>
                        <FaUserCircle />
                    </div>
                    <p style={{marginTop:'10px', color:'#999'}}>ID: STU-00{learner.id}</p>
                </div>

                <div style={{flex:1, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px'}}>
                    <div><small style={{color:'#999', fontWeight:'bold'}}>FULL NAME</small><p style={{fontWeight:'bold', fontSize:'1.1rem'}}>{learner.full_name}</p></div>
                    <div><small style={{color:'#999', fontWeight:'bold'}}>BIRTH DATE</small><p>{formatDate(learner.birth_date)}</p></div>
                    <div><small style={{color:'#999', fontWeight:'bold'}}>GENDER</small><p style={{textTransform:'capitalize'}}>{learner.gender}</p></div>
                    <div><small style={{color:'#999', fontWeight:'bold'}}>AGE</small><p>{learner.age} Years Old</p></div>
                    <div><small style={{color:'#999', fontWeight:'bold'}}>DIAGNOSIS</small><p style={{color:'#E74C3C', fontWeight:'bold'}}>{learner.diagnosis}</p></div>
                    <div><small style={{color:'#999', fontWeight:'bold'}}>LEARNING STYLE</small><p style={{textTransform:'capitalize'}}>{learner.learning_style}</p></div>
                </div>
            </div>

            {/* Guardian Info (Connected to DB) */}
            <h3 style={{marginBottom:'15px'}}>Guardian Information</h3>
            <div style={{border: '1px solid #eee', padding:'30px', borderRadius:'10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px'}}>
                <div><small style={{color:'#999', fontWeight:'bold'}}>GUARDIAN NAME</small><p>{learner.guardian_name || "N/A"}</p></div>
                <div><small style={{color:'#999', fontWeight:'bold'}}>EMAIL</small><p>{learner.guardian_email || "N/A"}</p></div>
                <div><small style={{color:'#999', fontWeight:'bold'}}>CONTACT NUMBER</small><p>{learner.guardian_contact || "N/A"}</p></div>
                <div><small style={{color:'#999', fontWeight:'bold'}}>RELATIONSHIP</small><p>{learner.guardian_relation || "N/A"}</p></div>
                <div style={{gridColumn:'span 2'}}><small style={{color:'#999', fontWeight:'bold'}}>ADDRESS</small><p>{learner.address || "N/A"}</p></div>
            </div>
        </div>
      )}

      {/* --- SESSIONS TAB (CONNECTED TO DB) --- */}
      {activeTab === 'sessions' && (
        <div style={{background:'white', padding:'30px', borderRadius:'10px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                <h3>Previous Sessions</h3>
                <span style={{color:'#999'}}>{history.length} records found</span>
            </div>
            
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Activity</th>
                        <th>Score</th>
                        <th>Time</th>
                        <th>Engagement</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map(h => (
                            <tr key={h.id}>
                                <td>{new Date(h.completed_at).toLocaleString()}</td>
                                <td>{h.activity_name}</td>
                                <td style={{fontWeight:'bold', color:'#F9BF15'}}>{h.performance_score}</td>
                                <td>{formatDuration(h.duration_completed)}</td>
                                <td style={{
                                    fontWeight:'bold',
                                    color: h.engagement_level === 'High' ? 'green' : h.engagement_level === 'Medium' ? 'orange' : 'red'
                                }}>
                                    {h.engagement_level || 'N/A'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{textAlign:'center', color:'#999'}}>No sessions recorded yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;