import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet'; 

// Import Routes
import mainRoutes from './routes/mainRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js'; 

dotenv.config();

// 1. INITIALIZE APP
const app = express();
// BACKEND RUNS ON PORT 3000
const PORT = process.env.PORT || 3000; 
const HOST = process.env.HOST || '0.0.0.0';

// 2. SECURITY MIDDLEWARE
app.use(helmet());

// 3. CORS CONFIGURATION (The Fix)
const corsOptions = {
  // We explicitly allow requests from localhost:3001
  origin: ['http://localhost:3001', 'http://localhost:3000'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 4. PARSE JSON
app.use(express.json());

// 5. SOCKET.IO SETUP (The Fix for Real-time data)
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { 
        origin: ["http://localhost:3001", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.set('io', io);

// 6. ROUTES
app.use('/', mainRoutes);     
app.use('/api', deviceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 7. START SERVER
httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});