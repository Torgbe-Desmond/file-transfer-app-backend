const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const User = require('../models/user');
const { users } = require('./functions/users');


const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
    cors: {
        origin: ['https://student-rep.vercel.app', 'http://localhost:3000',"http://localhost:56708"],
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
        const existingUser = users.find((user) => user.userId === userId);

        if (!existingUser) {
            users.push({ userId, socketId: socket.id });
            console.log(users);
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        } else {
            console.log(`User already connected: ${userId}`);
            const userIndex = users.findIndex(user => user.userId === userId);
            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    socketId: socket.id,
                };
            }
            console.log(users); 
        }  
        
    } catch (error) {
        console.error('Error handling user connection:', error);
    }
};

// handle emit socket
// const emitProgress = (process,error = null, file, user_id) => {
//     const existingUser = users?.find((user) => user.userId == socketId);
//     if (!existingUser) {
//         console.error(`Invalid socketId: ${socketId}`);
//         return;
//     }

//     console.log(`Emitting progress to socketId: ${socketId}`);
//     io.to(existingUser.socketId).emit('uploading', {
//         process,
//         file: file?.originalname || 'Unknown file',
//         error,
//     });
// };


// Handle socket disconnection
const handleDisconnection = (socket) => {
    try {
        const userIndex = users.findIndex((user) => user.socketId === socket.id);

        if (userIndex !== -1) {
            const disconnectedUser = users[userIndex];
            users.splice(userIndex, 1);
            console.log(`User disconnected: ${disconnectedUser.userId}`);
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

// Export io and related modules
module.exports = {
    io,
    app,
    server,
};
