const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const seedUsers = require('./utils/seedUsers');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all for development
        methods: ["GET", "POST"]
    }
});

// Middleware
// Middleware
app.use(cors({
    origin: '*', // Allow all origins for mobile/web compatibility
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true // Enable if you ever switch to cookies (preparedness)
}));
app.use(express.json());

// Socket instance to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('Point Messaging Server Running');
});

const chatSocket = require('./sockets/chatSocket');

// Socket.IO
chatSocket(io);


const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await seedUsers();
});
// restart server
