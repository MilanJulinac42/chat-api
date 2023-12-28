import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import UserList from "./components/UserList";
import NicknamePrompt from "./components/NicknamePrompt";
import ChatBox from "./components/ChatBox";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Home() {
    const [users, setUsers] = useState<string[]>([]);
    const [showPrompt, setShowPrompt] = useState(true);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data));

        socket.on(
            "user-nickname-updated",
            (userId: string, nickname: string) => {
                setUsers((prevUsers) =>
                    prevUsers.map((user) => (user === userId ? nickname : user))
                );
            }
        );

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        socket.on("chat-message", (message: string) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
    }, [socket]);

    const handleJoin = (nickname: string) => {
        socket.emit("join-chat", "Cat Room");
        setShowPrompt(false);
    };

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        socket.emit("chat-message", message);
        setMessage("");
    };

    return (
        <main className={styles.main}>
            {showPrompt && <NicknamePrompt onJoin={handleJoin} />}
            <UserList users={users} socket={socket} />
            <ChatBox messages={messages} />

            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </main>
    );
}
