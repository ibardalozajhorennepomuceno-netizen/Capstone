import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config'; // Import the IP configuration

// 1. ADD PROPS: Accept setView and setCurrentLearner from App.js
const Students = ({ setView, setCurrentLearner }) => {
  
  // 2. DEFINE LOCAL STATE: 'learners' lives here now
  const [learners, setLearners] = useState([]);

  // 3. FETCH DATA: Get the list when this page loads
  useEffect(() => {
    axios.get(`${API_BASE_URL}/learners`)
      .then(res => {
        setLearners(res.data);
      })
      .catch(err => console.error("Error fetching students:", err));
  }, []);

  return (
    <div className="main-content">
      <div className="page-header" style={{display:'flex', justifyContent:'space-between'}}>
        <h1 className="page-title">Students List</h1>
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
          {/* 4. Now 'learners' is defined because of the useState above */}
          {learners.map(l => (
            <tr key={l.id}>
              <td>STU-00{l.id}</td>
              <td>{l.full_name}</td>
              <td>{l.gender}</td>
              <td>{l.age}</td>
              <td>{l.diagnosis}</td>
              <td>
                {/* 5. These buttons now work because we accepted the props at the top */}
                <button 
                  className="action-btn" 
                  onClick={() => { setCurrentLearner(l); setView('session'); }}
                >
                  🚀 Launch Session
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Students;