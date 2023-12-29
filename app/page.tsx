"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import UserList from "./components/UserList";
import NicknamePrompt from "./components/NicknamePrompt";
import ChatBox from "./components/ChatBox";
import io from "socket.io-client";

const socket = io("http://localhost:4000", {
    auth: {
        room: "Cat room",
    },
});

interface Message {
    sender: string;
    content: string;
    timestamp?: string;
}

export default function Home() {
    const [users, setUsers] = useState<string[]>([]);
    const [showPrompt, setShowPrompt] = useState(true);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        socket.on("set-nickname", (nickname) => {
            setUsers((prevUsers) => [...prevUsers, nickname]);
        });

        socket.on("user-list-updated", (updatedUserList) => {
            setUsers(updatedUserList);
        });

        socket.emit("user-list-updated");
    }, [socket]);

    useEffect(() => {
        socket.on("chat-message", (newMessage: Message) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });
    }, [socket]);

    useEffect(() => {
        socket.emit("join-chat", "Cat Room");
    }, [socket]);

    const handleJoin = (nickname: string) => {
        socket.emit("join-chat", "Cat Room");
        socket.emit("set-nickname", nickname);
        setShowPrompt(false);
    };

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        socket.emit("chat-message", message);
        setMessage("");
    };

    const handleLeaveChat = () => {
        socket.emit("leave-chat");
        socket.disconnect();
    };
    return (
        <main className={styles.main}>
            {showPrompt && <NicknamePrompt onJoin={handleJoin} />}
            <UserList users={users} socket={socket} />
            <div className="mainWrapper">
                <h1>chat box</h1>
                <ChatBox messages={messages} />
                <form onSubmit={handleSendMessage} className="form-wrapper">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit">Send</button>
                    <button onClick={handleLeaveChat}>Leave Chat</button>
                </form>
            </div>
        </main>
    );
}
