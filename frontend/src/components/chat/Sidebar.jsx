import React, { useState } from "react";
import { Search, Edit, Settings } from "lucide-react";
import NewChatModal from "./NewChatModal";

export default function Sidebar({ conversations, selectedConversationId, onSelectConversation, onRoomCreated }) {

    const [showNewChat, setShowNewChat] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const getPreviewText = (lastMessage) => {
        if (!lastMessage) return "No messages yet";

        let text = "";
        if (typeof lastMessage.text === 'string') {
            text = lastMessage.text;
        } else if (React.isValidElement(lastMessage.text)) {
            const extractText = (element) => {
                if (typeof element === 'string') return element;
                if (Array.isArray(element)) return element.map(extractText).join(' ');
                if (element?.props?.children) return extractText(element.props.children);
                return "";
            };
            text = extractText(lastMessage.text);
        } else {
            text = "Attachment...";
        }

        const currentUserId = localStorage.getItem("userId");
        let prefix = "";

        if (lastMessage.sender) {
            if (typeof lastMessage.sender === 'object') {
                const senderId = lastMessage.sender._id || lastMessage.sender.id;
                if (String(senderId) === String(currentUserId)) {
                    prefix = "You: ";
                } else {
                    prefix = `${lastMessage.sender.name || lastMessage.sender.username || "User"}: `;
                }
            } else if (typeof lastMessage.sender === 'string') {
                if (lastMessage.type === 'outgoing' || lastMessage.sender === 'You') {
                     prefix = "You: ";
                } else {
                     prefix = `${lastMessage.sender}: `;
                }
            }
        } else if (lastMessage.type === 'outgoing') {
            prefix = "You: ";
        }

        text = prefix + text;

        return text.length > 35 ? text.substring(0, 35) + "..." : text;
    };

    const userName = localStorage.getItem("userName") || "User";
    const userAvatar = localStorage.getItem("userAvatar");

    return (
        <div className="sidebar">

            <div className="sidebar-header">
                <div className="brand">
                    <div className="brand-icon">R</div>
                    Relayo
                </div>

                <button
                    className="icon-button"
                    onClick={() => setShowNewChat(true)}
                >
                    <Edit size={20} />
                </button>
            </div>

            <div className="search-container">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="conversation-list">
                {conversations.filter(conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase())).map((conv) => {

                    const lastMessage =
                        conv.messages && conv.messages.length > 0
                            ? conv.messages[conv.messages.length - 1]
                            : conv.lastMessage;

                    return (
                        <div
                            key={conv.id}
                            className={`conversation-item ${
                                conv.id === selectedConversationId ? "active" : ""
                                }`}
                            onClick={() => onSelectConversation(conv.id)}
                        >

                            <div className="avatar-wrapper">
                                {conv.isInitials ? (
                                    <div
                                        className="avatar"
                                        style={{ backgroundColor: conv.color }}
                                    >
                                        {conv.avatar}
                                    </div>
                                ) : (
                                    <img
                                        src={conv.avatar}
                                        alt={conv.name}
                                        className="avatar"
                                        referrerPolicy="no-referrer"
                                    />
                                )}

                                {conv.online && (
                                    <div className="online-indicator" />
                                )}
                            </div>

                            <div className="conversation-details">

                                <div className="conversation-header">
                                    <span className="conversation-name">
                                        {conv.name}
                                    </span>

                                    {lastMessage && (
                                        <span className="conversation-time">
                                            {lastMessage.time}
                                        </span>
                                    )}
                                </div>

                                <div
                                    className={`conversation-message ${
                                        conv.unread ? "unread" : ""
                                        }`}
                                >
                                    {getPreviewText(lastMessage)}
                                </div>

                            </div>

                            {conv.unread && (
                                <div className="unread-badge">
                                    {conv.unread}
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            <div className="sidebar-footer">

                <div className="user-profile">
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="avatar" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-status">Online</span>
                    </div>
                </div>

                <button className="icon-button">
                    <Settings size={20} />
                </button>

            </div>

            {/* NEW CHAT MODAL */}

            <NewChatModal
                isOpen={showNewChat}
                onClose={() => setShowNewChat(false)}
                onRoomCreated={onRoomCreated}
            />

        </div>
    );
}