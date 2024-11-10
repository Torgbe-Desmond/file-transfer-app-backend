const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

class ConnectionManager {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: ['https://student-rep.vercel.app', 'http://localhost:3000'],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true,
            },
        });

        this.userSocketMap = {};

        this.setupSocketListeners();
    }

    getUserSocket(userId) {
        return this.userSocketMap[userId];
    }

    handleUserConnection(socket, userData) {
        const { userId } = userData;
        if (userId) {
            this.userSocketMap[userId] = socket.id;
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        }
    }

    handleDisconnection(socket) {
        for (const [userId, socketId] of Object.entries(this.userSocketMap)) {
            if (socketId === socket.id) {
                delete this.userSocketMap[userId];
                console.log(`User disconnected: ${userId}`);
            }
        }
    }

    setupSocketListeners() {
        this.io.on('connection', (socket) => {
            // Handle user connection
            socket.on('user', (userData) => {
                this.handleUserConnection(socket, userData);
            });

            // Handle user disconnection
            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });
        });
    }
}

// Instantiate ConnectionManager
const connectionManager = new ConnectionManager(server);

// Export `io` and the `getUserSocket` method for external use
module.exports = { io: connectionManager.io, getUserSocket: connectionManager.getUserSocket.bind(connectionManager), app, server };
