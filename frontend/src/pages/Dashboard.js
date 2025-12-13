import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Dashboard = ({ user }) => {
  const [learners, setLearners] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to Capitalize Role (e.g. "admin" -> "Admin")
  const formatRole = (role) => {
    if (!role) return "Therapist";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/learners`)
      .then(res => {
        setLearners(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard:", err);
        setError("Could not load students.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{padding:'20px'}}>Loading Dashboard...</div>;
  if (error) return <div style={{padding:'20px', color:'red'}}>{error}</div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Therapist Dashboard</h1>
        
        {/* FIXED WELCOME MESSAGE */}
        {/* Shows "Welcome back, Roden!" or "Welcome back, Admin!" if no name */}
        <p style={{color:'gray'}}>
            Welcome back, {user?.username || formatRole(user?.role)}!
        </p>
      </div>
      
      <div style={{background: 'var(--bg)'}}>
        <h3>Recent Learners</h3>
        <table className="custom-table">
          <thead>
            {/* Updated headers to match new DB schema */}
            <tr><th>ID</th><th>Name</th><th>Gender</th><th>Diagnosis</th></tr>
          </thead>
          <tbody>
            {learners && learners.length > 0 ? (
              learners.map(l => (
                <tr key={l.id}>
                  <td>STU-{l.id.toString().padStart(3, '0')}</td>
                  
                  {/* UPDATED: Uses first_name + last_name since we split them */}
                  {/* Fallback to full_name if the new columns are empty */}
                  <td>{l.first_name ? `${l.first_name} ${l.last_name}` : l.full_name}</td>
                  
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