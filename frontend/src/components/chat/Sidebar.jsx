import React from 'react';
import { Search, Edit, Settings } from 'lucide-react';

export default function Sidebar({ conversations, selectedConversationId, onSelectConversation }) {
    const getPreviewText = (lastMessage) => {
        if (!lastMessage) return "No messages yet";

        let text = "";
        if (typeof lastMessage.text === 'string') {
            text = lastMessage.text;
        } else if (React.isValidElement(lastMessage.text)) {
            // Very basic extraction of children text if JSX
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

        const prefix = lastMessage.type === 'outgoing' ? "You: " : "";
        text = prefix + text;

        return text.length > 35 ? text.substring(0, 35) + "..." : text;
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <div className="brand-icon">R</div>
                    Relayo
                </div>
                <button className="icon-button">
                    <Edit size={20} />
                </button>
            </div>

            <div className="search-container">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={16} />
                    <input type="text" className="search-input" placeholder="Search messages..." />
                </div>
            </div>

            <div className="conversation-list">
                {conversations.map((conv) => {
                    const lastMessage = conv.messages && conv.messages.length > 0
                        ? conv.messages[conv.messages.length - 1]
                        : null;

                    return (
                        <div
                            key={conv.id}
                            className={`conversation-item ${conv.id === selectedConversationId ? 'active' : ''}`}
                            onClick={() => onSelectConversation(conv.id)}
                        >
                            <div className="avatar-wrapper">
                                {conv.isInitials ? (
                                    <div className="avatar" style={{ backgroundColor: conv.color }}>
                                        {conv.avatar}
                                    </div>
                                ) : (
                                    <img src={conv.avatar} alt={conv.name} className="avatar" referrerPolicy="no-referrer" />
                                )}
                                {conv.online && <div className="online-indicator" />}
                            </div>

                            <div className="conversation-details">
                                <div className="conversation-header">
                                    <span className="conversation-name">{conv.name}</span>
                                    {lastMessage && <span className="conversation-time">{lastMessage.time}</span>}
                                </div>
                                <div className={`conversation-message ${conv.unread ? 'unread' : ''}`}>
                                    {getPreviewText(lastMessage)}
                                </div>
                            </div>

                            {conv.unread ? (
                                <div className="unread-badge">{conv.unread}</div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">U</div>
                    <div className="user-info">
                        <span className="user-name">User</span>
                        <span className="user-status">Online</span>
                    </div>
                </div>
                <button className="icon-button">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
}
