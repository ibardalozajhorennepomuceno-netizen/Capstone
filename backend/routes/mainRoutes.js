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

// LOG SESSION ROUTE
router.post('/log-session', (req, res) => {
    const { learner_id, activity_id, performance_score, duration, engagement_level } = req.body;
    
    // Note: duration is now expected to be an INT (seconds)
    const sql = "INSERT INTO engagement_logs (learner_id, activity_id, performance_score, duration_completed, engagement_level, completed_at) VALUES (?, ?, ?, ?, ?, NOW())";
    
    console.log("📥 Saving Session Data:", req.body);

    db.query(sql, [learner_id, activity_id, performance_score, duration, engagement_level], (err, result) => {
        if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json(err);
        }
        res.json({ success: true, id: result.insertId });
    });
});

// GET SPECIFIC STUDENT HISTORY
router.get('/engagement_logs/:learner_id', (req, res) => {
    const id = req.params.learner_id;
    // We Join with 'activities' to get the real name "Color Match" instead of just ID '1'
    const sql = `
        SELECT 
            el.id, 
            el.performance_score, 
            el.duration_completed, 
            el.engagement_level, 
            el.completed_at, 
            a.name as activity_name
        FROM engagement_logs el
        JOIN activities a ON el.activity_id = a.id
        WHERE el.learner_id = ?
        ORDER BY el.completed_at DESC
    `;
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

export default router;