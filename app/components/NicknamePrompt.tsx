"use client";
import React, { useState } from "react";

interface NicknamePromptProps {
    onJoin: (nickname: string) => void;
}

const NicknamePrompt: React.FC<NicknamePromptProps> = ({ onJoin }) => {
    const [nickname, setNickname] = useState<string>("");

    const handleJoin = () => {
        if (nickname) {
            onJoin(nickname);
        } else {
            alert("Please choose a meowgnificent nickname!");
        }
    };

    return (
        <div className="nickname-prompt">
            <h2>Paws for a Mewment!</h2>
            <p>Choose a pawsome nickname to enter the Cat Room:</p>
            <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />
            <button onClick={handleJoin}>Join the Cattitude!</button>
        </div>
    );
};

export default NicknamePrompt;
