const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const users = new Map();

function getUsers() {
    return Array.from(users.values()).map((user) => user.nickname);
}

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.get("/users", (req, res) => {
    const usersList = getUsers();
    res.json(usersList);
});

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("set-nickname", (nickname) => {
        try {
            users.set(socket.id, { nickname });
            console.log(`User ${socket.id} set nickname to ${nickname}`);
            const updatedUserList = getUsers();
            io.emit("user-list-updated", updatedUserList);
        } catch (error) {
            console.error("Error setting nickname:", error);
            socket.emit("nickname-error", "Failed to set nickname");
        }
    });

    socket.on("join-chat", (roomName) => {
        try {
            socket.join(roomName);
            console.log(`User joined ${roomName}`);
        } catch (error) {
            console.error(`Error joining room ${roomName}:`, error);
            socket.emit("join-error", "Failed to join room");
        }
    });

    socket.on("chat-message", (message) => {
        const user = users.get(socket.id);
        const firstRoom = socket.rooms.values().next().value;
        try {
            io.to(firstRoom).emit("chat-message", {
                sender: user.nickname,
                content: message,
            });
        } catch (error) {
            console.error("Error broadcasting message:", error);
            socket.emit("message-error", "Failed to send message");
        }
    });

    socket.on("user-left", (userId) => {
        users.delete(userId);
        const updatedUserList = getUsers();
        io.emit("user-list-updated", updatedUserList);
        console.log(`User ${userId} left the chat`);
    });

    socket.on("disconnect", () => {
        const userId = socket.id;
        users.delete(userId);
        const updatedUserList = getUsers();
        io.emit("user-list-updated", updatedUserList);
        console.log(`User ${userId} disconnected`);
    });

    socket.on("leave-chat", () => {
        const userId = socket.id;
        users.delete(userId);
        const updatedUserList = getUsers();
        io.emit("user-list-updated", updatedUserList);
        console.log(`User ${userId} left the chat`);
    });
});

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});
