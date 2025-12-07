import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2'; // Added back MySQL
import { createServer } from 'http';
import { Server } from 'socket.io';
import deviceRoutes from './routes/deviceRoutes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; 

// 1. Create HTTP Server
const httpServer = createServer(app);

// 2. Setup Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.set('io', io);

// 3. Middleware
app.use(cors());
app.use(express.json()); // Handle JSON data

// 4. Database Connection (Restored)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'learning_system_db'
});

db.connect(err => {
    if (err) console.error('❌ DB Connection Failed:', err);
    else console.log('✅ Connected to MySQL DB');
});

// --- RESTORED ROUTES (Login & Students) ---

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password_hash = ?";
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.json({ success: true, role: result[0].role, id: result[0].id });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

// Get Students Route
app.get('/learners', (req, res) => {
    const sql = "SELECT * FROM learners ORDER BY created_at DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Save Session Route
app.post('/log-session', (req, res) => {
    const { learner_id, activity_id, performance_score } = req.body;
    const sql = "INSERT INTO engagement_logs (learner_id, activity_id, performance_score, completed_at) VALUES (?, ?, ?, NOW())";
    db.query(sql, [learner_id, activity_id, performance_score], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// --- IOT ROUTES ---
app.use('/api', deviceRoutes); 

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});