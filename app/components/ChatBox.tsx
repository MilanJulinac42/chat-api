import React, { useState } from "react";

interface ChatBoxProps {
    messages: string[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages }) => {
    const [scrollToBottom, setScrollToBottom] = useState<boolean>(true);

    const handleScroll = () => {
        const el = document.getElementById("chat-box");
        if (el && el.scrollHeight > el.clientHeight) {
            setScrollToBottom(
                el.scrollTop + el.clientHeight === el.scrollHeight
            );
        }
    };

    return (
        <div id="chat-box" className="chat-box" onScroll={handleScroll}>
            {messages.map((message) => (
                <div key={message} className="chat-message">
                    {message}
                </div>
            ))}
            {scrollToBottom && <div className="scroll-indicator" />}
        </div>
    );
};

export default ChatBox;
