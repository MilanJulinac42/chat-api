import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import UserList from "./components/UserList";
import NicknamePrompt from "./components/NicknamePrompt";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Home() {
    const [users, setUsers] = useState<string[]>([]);
    const [showPrompt, setShowPrompt] = useState(true);

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

    const handleJoin = (nickname: string) => {
        socket.emit("join-chat", "Cat Room");
        setShowPrompt(false);
    };

    return (
        <main className={styles.main}>
            {showPrompt && <NicknamePrompt onJoin={handleJoin} />}
            <UserList users={users} socket={socket} />
        </main>
    );
}
