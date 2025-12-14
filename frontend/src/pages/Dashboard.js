import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserFriends, FaChalkboardTeacher } from 'react-icons/fa'; // Icons for the cards
import API_BASE_URL from '../config';

const Dashboard = ({ user }) => {
  // 1. Data States
  const [learners, setLearners] = useState([]); 
  const [stats, setStats] = useState({ total_students: 0, new_this_week: 0, sessions_today: 0 });
  
  // 2. UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to format role
  const formatRole = (role) => {
    if (!role) return "Therapist";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            // A. Fetch Recent Learners
            const studentsRes = await axios.get(`${API_BASE_URL}/learners`);
            setLearners(Array.isArray(studentsRes.data) ? studentsRes.data : []);

            // B. Fetch Overview Stats (The New Part)
            const statsRes = await axios.get(`${API_BASE_URL}/dashboard-stats`);
            setStats(statsRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching dashboard:", err);
            setError("Could not load dashboard data.");
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{padding:'40px'}}>Loading Dashboard...</div>;
  if (error) return <div style={{padding:'40px', color:'red'}}>{error}</div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Therapist Dashboard</h1>
        <p style={{color:'gray'}}>
            Welcome back, {user?.username || formatRole(user?.role)}!
        </p>
      </div>
      
      {/* --- NEW: OVERVIEW SECTION --- */}
      <div className="overview-section">
        <h2 className="overview-title">Overview</h2>
        <div className="stats-grid">
            
            {/* BLUE CARD: STUDENTS */}
            <div className="stat-card blue">
                <FaUserFriends className="stat-icon-bg" />
                <div className="stat-header">
                    <FaUserFriends className="stat-icon-small" />
                    <span className="stat-label">Students</span>
                    <span className="stat-sublabel">Total Students</span>
                </div>
                <div>
                    <div className="stat-number">{stats.total_students}</div>
                    <div className="stat-footer">+{stats.new_this_week} this week</div>
                </div>
            </div>

            {/* PINK CARD: SESSIONS */}
            <div className="stat-card pink">
                <FaChalkboardTeacher className="stat-icon-bg" />
                <div className="stat-header">
                    <FaChalkboardTeacher className="stat-icon-small" />
                    <span className="stat-label">Sessions</span>
                    <span className="stat-sublabel">Session Task Completed</span>
                </div>
                <div>
                    <div className="stat-number">{stats.sessions_today}</div>
                    <div className="stat-footer">Today</div>
                </div>
            </div>

        </div>
      </div>

      {/* --- EXISTING TABLE SECTION --- */}
      <div style={{background: 'white', padding:'30px', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.02)'}}>
        <h3 style={{marginTop:0, marginBottom:'20px', color:'#2C3E50'}}>Recent Learners</h3>
        <table className="custom-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Gender</th><th>Diagnosis</th></tr>
          </thead>
          <tbody>
            {learners && learners.length > 0 ? (
              learners.map(l => (
                <tr key={l.id}>
                  <td>STU-{l.id.toString().padStart(3, '0')}</td>
                  
                  {/* Name Logic: Use split names if available, else fallback */}
                  <td style={{fontWeight:'bold', color:'#2C3E50'}}>
                      {l.first_name ? `${l.first_name} ${l.last_name}` : l.full_name}
                  </td>
                  
                  <td style={{textTransform:'capitalize'}}>{l.gender}</td>
                  <td>
                    <span style={{
                      backgroundColor: l.diagnosis && l.diagnosis.includes('ASD') ? '#e3f2fd' : '#fce4ec',
                      color: l.diagnosis && l.diagnosis.includes('ASD') ? '#1976d2' : '#c2185b',
                      padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {l.diagnosis}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;