import express, { Request, Response } from "express";
import http from "http";
import socketIO from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

io.on("connection", (socket: socketIO.Socket) => {
    console.log("User connected");

    socket.on("join-chat", (roomName: string) => {
        try {
            socket.join(roomName);
            console.log(`User joined ${roomName}`);
        } catch (error) {
            console.error(`Error joining room ${roomName}:`, error);
            socket.emit("join-error", "Failed to join room");
        }
    });

    socket.on("chat-message", (message: string) => {
        const firstRoom = socket.rooms.values().next().value;
        try {
            io.to(firstRoom).emit("chat-message", message);
        } catch (error) {
            console.error(`Error broadcasting message:`, error);
            socket.emit("message-error", "Failed to send message");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server listening on port 3000");
});
