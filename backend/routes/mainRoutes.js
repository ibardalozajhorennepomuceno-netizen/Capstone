import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import JWT 
import { body, validationResult } from 'express-validator';
import db from '../config/db.js';

const JWT_SECRET = 'your_super_secret_key_shhh'; // In production, use environment variable
const router = express.Router();

// Login
// 1. UPDATED LOGIN ROUTE
router.post('/login', 
    // A. VALIDATION RULES
    [
        body('username').trim().escape(), // Removes dangerous HTML characters
        body('password').trim().notEmpty()
    ],
    (req, res) => {
    // B. CHECK ERRORS
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ status: 'Failed', message: "Invalid input detected." });
        }

    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json(err);
        
        if (result.length > 0) {
            const user = result[0];

            // A. Check if password matches (Using Bcrypt)
            // Note: For your OLD plain text passwords to work during migration, 
            // we check if it matches plain text OR hash.
            const isMatch = await bcrypt.compare(password, user.password_hash);
            const isPlainMatch = password === user.password_hash; // Fallback for old accounts

            if (isMatch || isPlainMatch) {
                
                // B. Check if it is First Time Login
                if (user.is_first_login === 1) {
                    return res.json({ 
                        status: 'FORCE_CHANGE_PASSWORD', 
                        user_id: user.id,
                        message: "Please change your default password."
                    });
                }

                // C. Normal Login Success
                const token = jwt.sign(
                    { id: user.id, role: user.role, username: user.username }, 
                    JWT_SECRET, 
                    { expiresIn: '1h' } // Token expires in 1 hour (Safety net)
                );

                res.json({ 
                    status: 'Success', 
                    token: token, // Send the token
                    user: user 
                });

            } else {
                res.json({ status: 'Failed', message: "Invalid Credentials" });
            }
        } else {
            res.json({ status: 'Failed', message: "User not found" });
        }
    });
});

router.post('/change-password', async (req, res) => {
    const { user_id, new_password } = req.body;

    // Security Check: Password Policy (Min 8 chars) [cite: 39]
    if (new_password.length < 8) {
        return res.json({ success: false, message: "Password must be at least 8 characters." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update DB: Set new password AND turn off first_login flag
    const sql = "UPDATE users SET password_hash = ?, is_first_login = 0 WHERE id = ?";
    
    db.query(sql, [hashedPassword, user_id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Password updated successfully!" });
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
    const { learner_id, therapist_id, activity_id, performance_score, duration, engagement_level } = req.body;
    
    // Note: duration is now expected to be an INT (seconds)
    const sql = "INSERT INTO engagement_logs (learner_id, therapist_id, activity_id, performance_score, duration_completed, engagement_level, completed_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    console.log("📥 Saving Session Data:", req.body);

    db.query(sql, [learner_id, therapist_id, activity_id, performance_score, duration, engagement_level], (err, result) => {
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

// GET SINGLE LEARNER (Added for Name Split Fix)
router.get('/learners/:id', (req, res) => {
    // We explicitly select the new split name columns here
    const sql = "SELECT id, first_name, middle_name, last_name, birth_date, gender, diagnosis, guardian_name, guardian_email, guardian_contact, address, guardian_relation, created_at FROM learners WHERE id = ?";
    
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: "Learner not found" });
        res.json(result[0]);
    });
});

// --- ADMIN ROUTES ---

// 1. GET ALL THERAPISTS (User Management)
router.get('/users', (req, res) => {
    // Only fetch necessary fields, never send passwords back
    db.query("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 2. CREATE NEW THERAPIST (Provisioning)
router.post('/users', async (req, res) => {
    const { username, password } = req.body;
    
    // Default to 'therapist' role. 
    // We hash the password immediately for security.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = "INSERT INTO users (username, password_hash, role, is_first_login) VALUES (?, ?, 'therapist', 1)";
    
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Therapist account created." });
    });
});

// 3. DELETE THERAPIST (Revocation)
router.delete('/users/:id', (req, res) => {
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// 4. MASTER AUDIT LOG (Non-Repudiation)
// Joins 4 tables to show: WHO (Therapist) did WHAT (Activity) to WHOM (Learner) and WHEN.
router.get('/admin/audit-logs', (req, res) => {
    const sql = `
        SELECT 
            el.id, 
            el.completed_at, 
            u.username as therapist_name, 
            l.first_name, 
            l.last_name, 
            a.name as activity_name, 
            el.performance_score
        FROM engagement_logs el
        JOIN users u ON el.therapist_id = u.id
        JOIN learners l ON el.learner_id = l.id
        JOIN activities a ON el.activity_id = a.id
        ORDER BY el.completed_at DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// GET DASHBOARD STATS (Overview Cards)
router.get('/dashboard-stats', (req, res) => {
    const queries = {
        total_students: "SELECT COUNT(*) AS count FROM learners",
        new_this_week: "SELECT COUNT(*) AS count FROM learners WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)",
        sessions_today: "SELECT COUNT(*) AS count FROM engagement_logs WHERE DATE(completed_at) = CURDATE()"
    };

    // Run queries in parallel
    const dbQuery = (sql) => {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) reject(err);
                else resolve(result[0].count);
            });
        });
    };

    Promise.all([
        dbQuery(queries.total_students),
        dbQuery(queries.new_this_week),
        dbQuery(queries.sessions_today)
    ])
    .then(([total, newWeek, today]) => {
        res.json({
            total_students: total,
            new_this_week: newWeek,
            sessions_today: today
        });
    })
    .catch(err => res.status(500).json(err));
});

// ADD NEW LEARNER
router.post('/learners', (req, res) => {
    const { 
        first_name, middle_name, last_name, birth_date, gender, diagnosis, 
        guardian_name, guardian_email, guardian_contact, address, guardian_relation 
    } = req.body;

    // 1. Calculate Age automatically
    const dob = new Date(birth_date);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs); 
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // 2. Insert into DB
    const sql = `
        INSERT INTO learners 
        (first_name, middle_name, last_name, birth_date, gender, diagnosis, guardian_name, guardian_email, guardian_contact, address, guardian_relation, age, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
        first_name, middle_name, last_name, birth_date, gender, diagnosis, 
        guardian_name, guardian_email, guardian_contact, address, guardian_relation, age
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding student:", err);
            return res.status(500).json({ success: false, error: err });
        }
        res.json({ success: true, id: result.insertId, message: "Student added successfully!" });
    });
});

// UPDATE LEARNER
router.put('/learners/:id', (req, res) => {
    const { 
        first_name, middle_name, last_name, birth_date, gender, diagnosis, 
        guardian_name, guardian_email, guardian_contact, address, guardian_relation 
    } = req.body;

    // 1. Recalculate Age
    const dob = new Date(birth_date);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs); 
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    const sql = `
        UPDATE learners SET
        first_name=?, middle_name=?, last_name=?, birth_date=?, gender=?, diagnosis=?, 
        guardian_name=?, guardian_email=?, guardian_contact=?, address=?, guardian_relation=?, age=?
        WHERE id=?
    `;

    const values = [
        first_name, middle_name, last_name, birth_date, gender, diagnosis, 
        guardian_name, guardian_email, guardian_contact, address, guardian_relation, age,
        req.params.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, message: "Student updated successfully" });
    });
});

export default router;