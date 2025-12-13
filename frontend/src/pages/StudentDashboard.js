import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaPen, FaTrash, FaArrowLeft } from 'react-icons/fa';
import API_BASE_URL from '../config';
import '../css/StudentDashboard.css';

const StudentDashboard = ({ learner, user, onBack, onStartSession }) => {
  const [activeTab, setActiveTab] = useState('profile'); 
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (activeTab === 'sessions' && learner?.id) {
      axios.get(`${API_BASE_URL}/engagement_logs/${learner.id}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error(err));
    }
  }, [activeTab, learner.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
            <h1>Student Dashboard</h1> 
            <p style={{color:'gray'}}>Managing profile for: {learner.first_name + " " + learner.middle_name + " " + learner.last_name}</p>
        </div>
        
        {/* HEADER RIGHT: Back Link + Start Button */}
        <div className="header-right">
            {/* 1. Back Link */}
            <div className="back-link" onClick={onBack}>
                <FaArrowLeft /> Back to Student List
            </div>

            {/* 2. Start Button (Restored) */}
            <button className="start-session-btn" onClick={onStartSession}>
                Start Session ▶
            </button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Student Profile
        </button>
        <button className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
            Session History
        </button>
        <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
            Progress Report
        </button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            Analytics
        </button>
      </div>

      <div className="content-card">
        {activeTab === 'profile' && (
            <>
                {/* --- STUDENT PROFILE --- */}
                <div className="profile-card">
                    <div className="action-buttons">
                        <button className="edit-btn"><FaPen size={10}/> Edit</button>
                        {user && user.role === 'admin' && (
                            <button className="edit-btn" style={{color:'#E74C3C', borderColor:'#fadbd8'}}><FaTrash size={10}/> Delete</button>
                        )}
                    </div>

                    <div className="profile-layout">
                        <div style={{textAlign:'center'}}>
                            <div className="avatar-container">
                                <FaUserCircle size={80} color="white" />
                            </div>
                            <p className="avatar-label" style={{marginTop:'15px', color:'#95A5A6', fontSize:'12px'}}>Profile</p>
                        </div>

                        <div className="info-grid">
                            <div className="info-group">
                                <p className="info-value">{learner.first_name}</p>
                                <label className="info-label">First Name</label>
                            </div>
                            <div className="info-group">
                                <p className="info-value">STU-{learner.id.toString().padStart(3, '0')}</p>
                                <label className="info-label">Student ID</label>
                            </div>
                            <div className="info-group">
                                <p className="info-value">{formatDate(learner.birth_date)}</p>
                                <label className="info-label">Birth Date</label>
                            </div>

                            <div className="info-group">
                                <p className="info-value">{learner.middle_name || "-"}</p>
                                <label className="info-label">Middle Name</label>
                            </div>
                            <div className="info-group">
                                <p className="info-value" style={{textTransform:'capitalize'}}>{learner.gender}</p>
                                <label className="info-label">Gender</label>
                            </div>
                            <div className="info-group">
                                <p className="info-value">{formatDate(learner.created_at)}</p>
                                <label className="info-label">Date Enrolled</label>
                            </div>

                            <div className="info-group">
                                <p className="info-value">{learner.last_name}</p>
                                <label className="info-label">Last Name</label>
                            </div>
                            <div className="info-group">
                                <p className="info-value">{learner.age}</p>
                                <label className="info-label">Age</label>
                            </div>
                            <div className="info-group">
                                <p className="info-value">{learner.diagnosis}</p>
                                <label className="info-label">Disorder</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- GUARDIAN --- */}
                <h3 className="section-header" style={{marginBottom:'15px', color:'#2C3E50', fontWeight:'700'}}>Guardian Information</h3>
                <div className="profile-card">
                    <div className="action-buttons">
                        <button className="edit-btn"><FaPen size={10}/> Edit</button>
                    </div>

                    <div className="info-grid">
                        <div className="info-group">
                            <p className="info-value">{learner.guardian_name || "N/A"}</p>
                            <label className="info-label">Guardian Name</label>
                        </div>
                        <div className="info-group" style={{gridColumn:'span 2'}}>
                            <p className="info-value">{learner.guardian_email || "N/A"}</p>
                            <label className="info-label">Email</label>
                        </div>

                        <div className="info-group">
                            <p className="info-value">{learner.guardian_contact || "N/A"}</p>
                            <label className="info-label">Contact Number</label>
                        </div>
                        <div className="info-group" style={{gridColumn:'span 2'}}>
                            <p className="info-value">{learner.address || "N/A"}</p>
                            <label className="info-label">Address</label>
                        </div>

                        <div className="info-group">
                            <p className="info-value">{learner.guardian_relation || "N/A"}</p>
                            <label className="info-label">Relationship to Student</label>
                        </div>
                    </div>
                </div>
            </>
        )}

        {activeTab === 'sessions' && (
            <div>
                 <table className="history-table">
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
                        {history.length > 0 ? history.map(h => (
                            <tr key={h.id}>
                                <td>{new Date(h.completed_at).toLocaleDateString()}</td>
                                <td>{h.activity_name || "Color Match"}</td>
                                <td style={{color:'#F39C12', fontWeight:'bold'}}>
                                    {Number(h.performance_score || 0).toFixed(2)}
                                </td>
                                <td>{h.duration_completed}s</td>
                                <td style={{
                                    color: h.engagement_level==='High'?'#27AE60': (h.engagement_level==='Medium' ? '#F39C12' : '#E74C3C'),
                                    fontWeight:'bold'
                                }}>{h.engagement_level}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#999'}}>
                                    No sessions found. Click "Start Session" to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>
        )}

        {(activeTab === 'report' || activeTab === 'analytics') && (
            <div style={{textAlign:'center', padding:'100px', color:'#BDC3C7'}}>
                <div style={{fontSize:'40px', marginBottom:'20px'}}>🚧</div>
                <h3>Feature Coming in Phase 2</h3>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;