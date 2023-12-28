import React from "react";

const UserList: React.FC<{
    users: string[];
    socket: any;
}> = ({ users, socket }) => {
    return (
        <ul>
            {users.map((user) => (
                <li key={user}>{user}</li>
            ))}
        </ul>
    );
};

export default UserList;
