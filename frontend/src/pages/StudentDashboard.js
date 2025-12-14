import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaPen, FaTrash, FaArrowLeft } from 'react-icons/fa';
import API_BASE_URL from '../config';
import '../css/StudentDashboard.css';

const StudentDashboard = ({ learner: initialLearner, user, onBack, onStartSession }) => {
  const [learner, setLearner] = useState(initialLearner); // Local state to handle updates
  const [activeTab, setActiveTab] = useState('profile'); 
  const [history, setHistory] = useState([]);
  
  // EDIT MODAL STATE
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // 1. FETCH HISTORY & SYNC LEARNER
  useEffect(() => {
    if (activeTab === 'sessions' && learner?.id) {
      axios.get(`${API_BASE_URL}/engagement_logs/${learner.id}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error(err));
    }
  }, [activeTab, learner.id]);

  // 2. OPEN EDIT MODAL
  const handleEditClick = () => {
      // Pre-fill form with current learner data
      // Format birth_date to YYYY-MM-DD for the input field
      const formattedDate = new Date(learner.birth_date).toISOString().split('T')[0];
      
      setEditFormData({
          ...learner,
          birth_date: formattedDate
      });
      setShowEditModal(true);
  };

  // 3. HANDLE INPUT CHANGE
  const handleEditChange = (e) => {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // 4. SUBMIT UPDATE
  const handleEditSubmit = (e) => {
      e.preventDefault();
      axios.put(`${API_BASE_URL}/learners/${learner.id}`, editFormData)
          .then(res => {
              if (res.data.success) {
                  alert("Profile Updated Successfully!");
                  setLearner(editFormData); // Update UI immediately
                  setShowEditModal(false);
              } else {
                  alert("Failed to update.");
              }
          })
          .catch(err => alert("Server Error"));
  };

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
            <h1>Student Profile</h1> 
        </div>
        <div className="header-right">
            <div className="back-link" onClick={onBack}>
                <FaArrowLeft /> Back to Student List
            </div>
            <button className="start-session-btn" onClick={onStartSession}>
                Start Session ▶
            </button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Student Profile</button>
        <button className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>Session History</button>
        <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>Progress Report</button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
      </div>

      <div className="content-card">
        {activeTab === 'profile' && (
            <>
                {/* --- STUDENT PROFILE --- */}
                <div className="profile-card">
                    <div className="action-buttons">
                        <button className="edit-btn" onClick={handleEditClick}><FaPen size={10}/> Edit</button>
                        
                        {/* THERAPIST DELETE BUTTON */}
                        <button 
                            className="edit-btn" 
                            style={{color:'#E74C3C', borderColor:'#fadbd8'}}
                            onClick={() => {
                                if(window.confirm("Are you sure you want to delete this student?")) {
                                    alert("Delete functionality triggered");
                                }
                            }}
                        >
                            <FaTrash size={10}/> Delete
                        </button>
                    </div>

                    <div className="profile-layout">
                        <div style={{textAlign:'center'}}>
                            <div className="avatar-container">
                                <FaUserCircle size={80} color="white" />
                            </div>
                            <p className="avatar-label" style={{marginTop:'15px', color:'#95A5A6', fontSize:'12px'}}>Profile</p>
                        </div>

                        <div className="info-grid">
                            <div className="info-group"><p className="info-value">{learner.first_name}</p><label className="info-label">First Name</label></div>
                            <div className="info-group"><p className="info-value">STU-{learner.id.toString().padStart(3, '0')}</p><label className="info-label">Student ID</label></div>
                            <div className="info-group"><p className="info-value">{formatDate(learner.birth_date)}</p><label className="info-label">Birth Date</label></div>

                            <div className="info-group"><p className="info-value">{learner.middle_name || "-"}</p><label className="info-label">Middle Name</label></div>
                            <div className="info-group"><p className="info-value" style={{textTransform:'capitalize'}}>{learner.gender}</p><label className="info-label">Gender</label></div>
                            <div className="info-group"><p className="info-value">{formatDate(learner.created_at)}</p><label className="info-label">Date Enrolled</label></div>

                            <div className="info-group"><p className="info-value">{learner.last_name}</p><label className="info-label">Last Name</label></div>
                            <div className="info-group"><p className="info-value">{learner.age}</p><label className="info-label">Age</label></div>
                            <div className="info-group"><p className="info-value">{learner.diagnosis}</p><label className="info-label">Diagnosis</label></div>
                        </div>
                    </div>
                </div>

                {/* --- GUARDIAN --- */}
                <h3 className="section-header" style={{marginBottom:'15px', color:'#2C3E50', fontWeight:'700'}}>Guardian Information</h3>
                <div className="profile-card">
                    <div className="action-buttons">
                        <button className="edit-btn" onClick={handleEditClick}><FaPen size={10}/> Edit</button>
                    </div>

                    <div className="info-grid">
                        <div className="info-group"><p className="info-value">{learner.guardian_name || "N/A"}</p><label className="info-label">Guardian Name</label></div>
                        <div className="info-group" style={{gridColumn:'span 2'}}><p className="info-value">{learner.guardian_email || "N/A"}</p><label className="info-label">Email</label></div>

                        <div className="info-group"><p className="info-value">{learner.guardian_contact || "N/A"}</p><label className="info-label">Contact Number</label></div>
                        <div className="info-group" style={{gridColumn:'span 2'}}><p className="info-value">{learner.address || "N/A"}</p><label className="info-label">Address</label></div>

                        <div className="info-group"><p className="info-value">{learner.guardian_relation || "N/A"}</p><label className="info-label">Relationship</label></div>
                    </div>
                </div>
            </>
        )}

        {activeTab === 'sessions' && (
            <div>
                 <table className="history-table">
                    <thead>
                        <tr><th>Date</th><th>Activity</th><th>Score</th><th>Time</th><th>Engagement</th></tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? history.map(h => (
                            <tr key={h.id}>
                                <td>{new Date(h.completed_at).toLocaleDateString()}</td>
                                <td>{h.activity_name || "Color Match"}</td>
                                <td style={{color:'#F39C12', fontWeight:'bold'}}>{Number(h.performance_score || 0).toFixed(2)}</td>
                                <td>{h.duration_completed}s</td>
                                <td style={{color: h.engagement_level==='High'?'#27AE60': '#F39C12', fontWeight:'bold'}}>{h.engagement_level}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#999'}}>No sessions found.</td></tr>
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

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
                <h3 style={{margin:'0 0 20px 0', color:'#2C3E50', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                    Edit Student Profile
                </h3>
                
                <form onSubmit={handleEditSubmit}>
                    {/* SECTION 1: STUDENT */}
                    <h4 style={modalStyles.sectionTitle}>Student Information</h4>
                    <div style={modalStyles.grid}>
                        <div><label style={modalStyles.label}>First Name</label><input style={modalStyles.input} name="first_name" required onChange={handleEditChange} value={editFormData.first_name} /></div>
                        <div><label style={modalStyles.label}>Middle Name</label><input style={modalStyles.input} name="middle_name" onChange={handleEditChange} value={editFormData.middle_name} /></div>
                        <div><label style={modalStyles.label}>Last Name</label><input style={modalStyles.input} name="last_name" required onChange={handleEditChange} value={editFormData.last_name} /></div>
                        <div><label style={modalStyles.label}>Birth Date</label><input type="date" style={modalStyles.input} name="birth_date" required onChange={handleEditChange} value={editFormData.birth_date} /></div>
                        <div>
                            <label style={modalStyles.label}>Gender</label>
                            <select style={modalStyles.input} name="gender" onChange={handleEditChange} value={editFormData.gender}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label style={modalStyles.label}>Diagnosis</label>
                            <select style={modalStyles.input} name="diagnosis" required onChange={handleEditChange} value={editFormData.diagnosis}>
                                <option value="ADHD">ADHD</option>
                                <option value="ASD">ASD</option>
                            </select>
                        </div>
                    </div>

                    {/* SECTION 2: GUARDIAN */}
                    <h4 style={modalStyles.sectionTitle}>Guardian Information</h4>
                    <div style={modalStyles.grid}>
                        <div><label style={modalStyles.label}>Guardian Name</label><input style={modalStyles.input} name="guardian_name" required onChange={handleEditChange} value={editFormData.guardian_name} /></div>
                        <div><label style={modalStyles.label}>Relationship</label><input style={modalStyles.input} name="guardian_relation" onChange={handleEditChange} value={editFormData.guardian_relation} /></div>
                        <div><label style={modalStyles.label}>Contact No.</label><input style={modalStyles.input} name="guardian_contact" required onChange={handleEditChange} value={editFormData.guardian_contact} /></div>
                        <div><label style={modalStyles.label}>Email</label><input type="email" style={modalStyles.input} name="guardian_email" onChange={handleEditChange} value={editFormData.guardian_email} /></div>
                    </div>
                    <div style={{marginTop:'10px'}}>
                        <label style={modalStyles.label}>Full Address</label>
                        <input style={modalStyles.input} name="address" required onChange={handleEditChange} value={editFormData.address} />
                    </div>

                    <div style={modalStyles.actions}>
                        <button type="button" style={modalStyles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button type="submit" style={modalStyles.saveBtn}>Update Profile</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

// MODAL STYLES (Reusing the nice style from Students.js)
const modalStyles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    content: {
        background: 'white', padding: '30px', borderRadius: '15px',
        width: '650px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    sectionTitle: { color: '#3498DB', marginBottom: '10px', marginTop: '15px', fontSize: '14px', textTransform:'uppercase' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#7F8C8D', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' },
    cancelBtn: { padding: '10px 20px', background: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    saveBtn: { padding: '10px 20px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' }
};

export default StudentDashboard;