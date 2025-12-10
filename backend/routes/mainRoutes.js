import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password_hash = ?";
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) res.json({ success: true, role: result[0].role, id: result[0].id });
        else res.json({ success: false, message: "Invalid credentials" });
    });
});

// Get Students
router.get('/learners', (req, res) => {
    db.query("SELECT * FROM learners ORDER BY created_at DESC", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Save Session
router.post('/log-session', (req, res) => {
    const { learner_id, activity_id, performance_score } = req.body;
    const sql = "INSERT INTO engagement_logs (learner_id, activity_id, performance_score, completed_at) VALUES (?, ?, ?, NOW())";
    db.query(sql, [learner_id, activity_id, performance_score], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

export default router;