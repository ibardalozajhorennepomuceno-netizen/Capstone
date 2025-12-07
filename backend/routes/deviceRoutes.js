// backend/routes/deviceRoutes.js
import express from 'express';

const router = express.Router();

// This handles POST requests to: http://[YOUR_IP]:3001/api/fsr
router.post('/fsr', async (req, res) => {
    try {
        const data = req.body;
        console.log("📡 Received from ESP32:", data);

        // 1. Get the Socket.io instance we set in server.js
        const io = req.app.get('io');

        // 2. Broadcast the data to all connected React clients
        // The event name 'fsr_update' MUST match what is in your React code
        io.emit('fsr_update', data);

        // 3. Send a success response back to the ESP32
        res.status(200).json({ message: "Data received successfully" });

    } catch (error) {
        console.error("❌ Error in FSR route:", error);
        res.status(500).json({ message: "Server error processing data" });
    }
});

export default router;