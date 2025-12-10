import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import Routes
import mainRoutes from './routes/mainRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js'; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Server & Socket Setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// USE ROUTES
app.use('/', mainRoutes);     // Handles /login, /learners
app.use('/api', deviceRoutes); // Handles /api/fsr

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});