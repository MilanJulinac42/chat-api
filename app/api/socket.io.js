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
const messages = new Map();

function getUsers() {
    return Array.from(users.values()).map((user) => user.nickname);
}

function getMessages() {
    return Array.from(messages.values()).map((message) => ({
        sender: message.sender,
        content: message.content,
    }));
}

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.get("/messages", (req, res) => {
    const messagesList = getMessages();
    res.json(messagesList);
});

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
        try {
            const user = users.get(socket.id);
            const room = socket.handshake.auth.room;

            if (!room) {
                throw new Error("Room not found in handshake auth data");
            }

            const newMessage = {
                sender: user.nickname,
                content: message,
            };

            messages.set(room, [...(messages.get(room) || []), newMessage]);
            console.log(`Message sent to room: ${room}`);

            io.to(room).emit("chat-message", newMessage);
        } catch (error) {
            console.error("Error handling chat message:", error);
            socket.emit("chat-error", "Failed to send message");
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
