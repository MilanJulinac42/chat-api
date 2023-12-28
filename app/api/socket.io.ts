import express, { Request, Response } from "express";
import http from "http";
import socketIO from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

const users: Map<string, { socket: socketIO.Socket; nickname: string }> =
    new Map();

export const getUsers = () => {
    return Array.from(users.values()).map((user) => user.nickname);
};

io.on("connection", (socket: socketIO.Socket) => {
    console.log("User connected");

    socket.on("set-nickname", (nickname: string) => {
        try {
            users.set(socket.id, { socket, nickname });
            console.log(`User ${socket.id} set nickname to ${nickname}`);

            io.emit("user-nickname-updated", socket.id, nickname);
        } catch (error) {
            console.error(`Error setting nickname:`, error);
            socket.emit("nickname-error", "Failed to set nickname");
        }
    });

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
        const user = users.get(socket.id);
        const firstRoom = socket.rooms.values().next().value;
        try {
            io.to(firstRoom).emit("chat-message", {
                sender: user!.nickname,
                content: message,
            });
        } catch (error) {
            console.error(`Error broadcasting message:`, error);
            socket.emit("message-error", "Failed to send message");
        }
    });

    socket.on("disconnect", () => {
        users.delete(socket.id);
        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server listening on port 3000");
});
