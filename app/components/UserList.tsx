"use client";
import React from "react";

const UserList: React.FC<{
    users: string[];
    socket: any;
}> = ({ users, socket }) => {
    return (
        <ul className="userList">
            <h3>Online users</h3>
            {users.map((user) => (
                <li key={user}>{user}</li>
            ))}
        </ul>
    );
};

export default UserList;
