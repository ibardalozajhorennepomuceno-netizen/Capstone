import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch } from 'react-icons/fa';
import API_BASE_URL from '../config';

const Students = ({ setView, setCurrentLearner }) => {
  const [learners, setLearners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
      first_name: '', middle_name: '', last_name: '',
      birth_date: '', gender: 'Male', diagnosis: '',
      guardian_name: '', guardian_email: '', guardian_contact: '',
      address: '', guardian_relation: ''
  });

  // 1. FETCH DATA
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    axios.get(`${API_BASE_URL}/learners`)
      .then(res => setLearners(res.data))
      .catch(err => console.error("Error fetching students:", err));
  };

  // 2. FORM HANDLERS
  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      axios.post(`${API_BASE_URL}/learners`, formData)
          .then(res => {
              if(res.data.success) {
                  alert("Student Added Successfully!");
                  setShowModal(false);
                  setFormData({ // Reset Form
                      first_name: '', middle_name: '', last_name: '',
                      birth_date: '', gender: 'Male', diagnosis: '',
                      guardian_name: '', guardian_email: '', guardian_contact: '',
                      address: '', guardian_relation: ''
                  });
                  fetchStudents(); // Refresh List
              } else {
                  alert("Failed to add student.");
              }
          })
          .catch(err => alert("Error connecting to server."));
  };

  return (
    <div className="main-content">
      {/* HEADER */}
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
            <h1 className="page-title">Students List</h1>
            <p style={{color:'gray', marginTop:'5px'}}>Manage your patient records</p>
        </div>
        
        <button 
            className="action-btn" 
            style={{background: '#F9BF15', border:'none', color:'white', fontWeight:'bold', cursor:'pointer'}}
            onClick={() => setShowModal(true)}
        >
            <FaPlus style={{marginRight:'5px'}}/> Add Student
        </button>
      </div>

      {/* TABLE */}
      <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Diagnosis</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {learners.length > 0 ? learners.map(l => (
                <tr key={l.id}>
                  <td>STU-{l.id.toString().padStart(3, '0')}</td>
                  {/* Handle both old full_name and new split names */}
                  <td style={{fontWeight:'bold', color:'#2C3E50'}}>
                      {l.first_name ? `${l.first_name} ${l.last_name}` : l.full_name}
                  </td>
                  <td style={{textTransform:'capitalize'}}>{l.gender}</td>
                  <td>{l.age}</td>
                  <td>
                    <span style={{
                        background: l.diagnosis?.includes('ASD') ? '#e3f2fd' : '#fce4ec',
                        color: l.diagnosis?.includes('ASD') ? '#1976d2' : '#c2185b',
                        padding:'4px 10px', borderRadius:'15px', fontSize:'11px', fontWeight:'bold'
                    }}>
                        {l.diagnosis}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn" 
                      style={{padding:'5px 15px', fontSize:'13px'}}
                      onClick={() => { setCurrentLearner(l); setView('student-dashboard'); }} 
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              )) : (
                  <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#999'}}>No students found.</td></tr>
              )}
            </tbody>
          </table>
      </div>

      {/* --- ADD STUDENT MODAL (Inline Styles) --- */}
      {showModal && (
          <div style={modalStyles.overlay}>
              <div style={modalStyles.content}>
                  <h3 style={{margin:'0 0 20px 0', color:'#2C3E50', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                      Add New Student
                  </h3>
                  
                  <form onSubmit={handleSubmit}>
                      {/* SECTION 1: STUDENT */}
                      <h4 style={modalStyles.sectionTitle}>Student Information</h4>
                      <div style={modalStyles.grid}>
                          <div><label style={modalStyles.label}>First Name</label><input style={modalStyles.input} name="first_name" required onChange={handleChange} value={formData.first_name} /></div>
                          <div><label style={modalStyles.label}>Middle Name</label><input style={modalStyles.input} name="middle_name" onChange={handleChange} value={formData.middle_name} /></div>
                          <div><label style={modalStyles.label}>Last Name</label><input style={modalStyles.input} name="last_name" required onChange={handleChange} value={formData.last_name} /></div>
                          <div><label style={modalStyles.label}>Birth Date</label><input type="date" style={modalStyles.input} name="birth_date" required onChange={handleChange} value={formData.birth_date} /></div>
                          <div>
                              <label style={modalStyles.label}>Gender</label>
                              <select style={modalStyles.input} name="gender" onChange={handleChange} value={formData.gender}>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                              </select>
                          </div>
                          <div>
                            <label style={modalStyles.label}>Diagnosis</label>
                              <select style={modalStyles.input} name="diagnosis" required placeholder="e.g. ADHD" onChange={handleChange} value={formData.diagnosis}>
                                  <option value="ADHD">ADHD</option>
                                  <option value="ASD">ASD</option>
                              </select></div>
                      </div>

                      {/* SECTION 2: GUARDIAN */}
                      <h4 style={modalStyles.sectionTitle}>Guardian Information</h4>
                      <div style={modalStyles.grid}>
                          <div><label style={modalStyles.label}>Guardian Name</label><input style={modalStyles.input} name="guardian_name" required onChange={handleChange} value={formData.guardian_name} /></div>
                          <div><label style={modalStyles.label}>Relationship</label><input style={modalStyles.input} name="guardian_relation" onChange={handleChange} value={formData.guardian_relation} /></div>
                          <div><label style={modalStyles.label}>Contact No.</label><input style={modalStyles.input} name="guardian_contact" required onChange={handleChange} value={formData.guardian_contact} /></div>
                          <div><label style={modalStyles.label}>Email</label><input type="email" style={modalStyles.input} name="guardian_email" onChange={handleChange} value={formData.guardian_email} /></div>
                      </div>
                      <div style={{marginTop:'10px'}}>
                          <label style={modalStyles.label}>Full Address</label>
                          <input style={modalStyles.input} name="address" required onChange={handleChange} value={formData.address} />
                      </div>

                      <div style={modalStyles.actions}>
                          <button type="button" style={modalStyles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                          <button type="submit" style={modalStyles.saveBtn}>Save Student</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

// --- STYLES OBJECT ---
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

export default Students;