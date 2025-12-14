import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import '../css/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // New User Form State
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');

  // 1. FETCH DATA ON LOAD
  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const fetchUsers = () => {
    axios.get(`${API_BASE_URL}/users`)
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  const fetchAuditLogs = () => {
    axios.get(`${API_BASE_URL}/admin/audit-logs`)
      .then(res => setAuditLogs(res.data))
      .catch(err => console.error(err));
  };

  // 2. CREATE USER HANDLER
  const handleCreateUser = (e) => {
    e.preventDefault();
    if(!newUser || !newPass) return alert("Please fill all fields");

    axios.post(`${API_BASE_URL}/users`, { username: newUser, password: newPass })
      .then(res => {
        alert("Therapist created! They must change password on first login.");
        setNewUser('');
        setNewPass('');
        fetchUsers(); // Refresh list
      })
      .catch(err => alert("Error creating user"));
  };

  // 3. DELETE USER HANDLER
  const handleDeleteUser = (id) => {
    if(window.confirm("Are you sure you want to remove this access?")) {
        axios.delete(`${API_BASE_URL}/users/${id}`)
            .then(() => fetchUsers())
            .catch(err => alert("Error deleting user"));
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
            <h1>Admin Control Center</h1>
            <p style={{color:'#7f8c8d'}}>Security & User Management</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Manage Therapists
        </button>
        <button className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            System Audit Logs
        </button>
      </div>

      <div className="admin-card">
        
        {/* --- TAB 1: MANAGE USERS --- */}
        {activeTab === 'users' && (
            <div>
                {/* CREATE USER FORM */}
                <form className="create-user-form" onSubmit={handleCreateUser}>
                    <div className="form-group">
                        <label>New Username</label>
                        <input className="admin-input" value={newUser} onChange={e=>setNewUser(e.target.value)} placeholder="e.g. therapist2" />
                    </div>
                    <div className="form-group">
                        <label>Initial Password</label>
                        <input className="admin-input" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="e.g. temp1234" />
                    </div>
                    <button type="submit" className="add-btn">+ Add Therapist</button>
                </form>

                {/* USER LIST */}
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Date Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>#{u.id}</td>
                                <td style={{fontWeight:'bold'}}>{u.username}</td>
                                <td>
                                    <span style={{
                                        background: u.role==='admin'?'#E8F8F5':'#FEF9E7',
                                        color: u.role==='admin'?'#27AE60':'#F39C12',
                                        padding:'4px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold'
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    {u.role !== 'admin' && (
                                        <button className="delete-btn-sm" onClick={() => handleDeleteUser(u.id)}>Revoke Access</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- TAB 2: AUDIT LOGS --- */}
        {activeTab === 'audit' && (
            <div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date/Time</th>
                            <th>Therapist (WHO)</th>
                            <th>Action</th>
                            <th>Student (TO WHOM)</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLogs.map(log => (
                            <tr key={log.id}>
                                <td style={{fontSize:'13px'}}>{new Date(log.completed_at).toLocaleString()}</td>
                                <td style={{fontWeight:'bold', color:'#2980b9'}}>{log.therapist_name}</td>
                                <td>Completed <b>{log.activity_name}</b></td>
                                <td>{log.first_name} {log.last_name}</td>
                                <td style={{fontWeight:'bold'}}>{log.performance_score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;