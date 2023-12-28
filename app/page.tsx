import { useEffect, useState } from "react";
import styles from "./page.module.css";
import UserList from "./components/UserList";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Home() {
    const [users, setUsers] = useState<string[]>([]);

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

    return (
        <main className={styles.main}>
            <UserList users={users} socket={socket} />
        </main>
    );
}
