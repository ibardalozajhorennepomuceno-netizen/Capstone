import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Auto-imports your IP

const Dashboard = ({ user }) => {
  // 1. Initialize as an EMPTY ARRAY [] (Crucial!)
  const [learners, setLearners] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 2. Fetch data from the new modular API URL
    axios.get(`${API_BASE_URL}/learners`)
      .then(res => {
        console.log("Dashboard Data:", res.data); // Debugging
        // Ensure we are setting an array, even if backend sends nothing
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
        <p style={{color:'gray'}}>Welcome back, {user ? user.name : 'Therapist'}</p>
      </div>
      
      <div style={{background: 'var(--bg)'}}>
        <h3>Recent Learners</h3>
        <table className="custom-table">
          <thead>
            <tr><th>ID</th><th>Full Name</th><th>Gender</th><th>Diagnosis</th></tr>
          </thead>
          <tbody>
            {/* 3. The Safety Check: learners?.length */}
            {learners && learners.length > 0 ? (
              learners.map(l => (
                <tr key={l.id}>
                  <td>STU-00{l.id}</td>
                  <td>{l.full_name}</td>
                  <td>{l.gender}</td>
                  <td>
                    <span style={{
                      backgroundColor: l.diagnosis && l.diagnosis.includes('Autism') ? '#e3f2fd' : '#fce4ec',
                      color: l.diagnosis && l.diagnosis.includes('Autism') ? '#1976d2' : '#c2185b',
                      padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {l.diagnosis}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;