const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { userSocketMap,getUserSocket } = require('../socket/functions/users');
const User = require('../domains/authentication/model');

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
    cors: {
        origin: ['https://student-rep.vercel.app', 'http://localhost:3000', 'http://localhost:56708'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
});

// Handle user connection
const handleUserConnection = async (socket, userData) => {
    try {
        const { reference_Id } = userData || {};
        if (!reference_Id) {
            console.error('Missing reference_Id in userData');
            return;
        }

        console.log(`Reference ID received: ${reference_Id}`);

        const userExist = await User.findOne({ reference_Id });
        if (!userExist) {
            console.warn(`No user found with reference_Id: ${reference_Id}`);
            return;
        }

        const userId = userExist._id.toString();

        // Map the user ID to the socket ID
        userSocketMap[userId] = socket.id;
        console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        console.log('Current userSocketMap:', userSocketMap);
    } catch (error) {
        console.error('Error handling user connection:', error);
    }
};

// Emit progress to a specific user
module.exports.emitProgress = ({ process, file, error }, userId) => {
    const socketId = getUserSocket(userId);
    if (!socketId) {
        console.error(`Socket ID not found for user ID: ${userId}`);
        return;
    }

    io.to(socketId).emit('uploading', {
        process,
        file,
        error,
    });
};

// Handle socket disconnection
const handleDisconnection = (socket) => {
    try {
        // Find and remove the user associated with the disconnected socket ID
        const userId = Object.keys(userSocketMap).find((id) => userSocketMap[id] === socket.id);

        if (userId) {
            delete userSocketMap[userId];
            console.log(`User disconnected: ${userId}`);
        }
    } catch (error) {
        console.error('Error handling disconnection:', error);
    }
};

// Set up socket event listeners
const setupSocketListeners = () => {
    io.on('connection', (socket) => {
        console.log('New socket connection established:', socket.id);

        try {
            const userData = JSON.parse(socket.handshake.query.userData || '{}');
            handleUserConnection(socket, userData);
        } catch (error) {
            console.error('Invalid userData in handshake query:', error);
        }

        socket.on('disconnect', () => {
            handleDisconnection(socket);
        });
    });
};

// Initialize socket listeners
setupSocketListeners();
console.log('Current userSocketMap:', userSocketMap);

// Export io and related modules
module.exports = {
    io,
    app,
    server,
};
