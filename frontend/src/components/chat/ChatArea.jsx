import React from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, FileText, CheckCheck, Lock, ChevronDown } from 'lucide-react';

function MessageBubble({ message }) {
    return (
        <div className={`message-group ${message.type}`}>
            <div className="message-meta">
                <span className="message-sender">{message.sender}</span>
                <span className="message-time">{message.time}</span>
            </div>
            <div className="message-content-wrapper">
                <img src={message.avatar} alt={message.sender} className="avatar message-avatar" referrerPolicy="no-referrer" />

                {message.attachment ? (
                    <div className="message-content-stack">
                        <div className="message-bubble">
                            {message.text}
                        </div>
                        <div className="message-attachment">
                            <div className="attachment-icon">
                                <FileText size={20} />
                            </div>
                            <div className="attachment-info">
                                <span className="attachment-name">{message.attachment.name}</span>
                                <span className="attachment-size">{message.attachment.size}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="message-bubble">
                        {message.text}
                    </div>
                )}
            </div>
            {message.status && (
                <div className="message-status">
                    <CheckCheck size={14} /> {message.status}
                </div>
            )}
        </div>
    );
}

export default function ChatArea({ conversation, onSendMessage }) {
    const [inputValue, setInputValue] = React.useState('');
    const [showScrollButton, setShowScrollButton] = React.useState(false);
    const [newMessageCount, setNewMessageCount] = React.useState(0);

    const messageListRef = React.useRef(null);
    const bottomRef = React.useRef(null);
    const prevConversationIdRef = React.useRef(null);
    const prevMessageCountRef = React.useRef(0);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // Check if user is near bottom
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
        
        if (isNearBottom) {
            setShowScrollButton(false);
            setNewMessageCount(0);
        } else {
            setShowScrollButton(true);
        }
    };

    React.useEffect(() => {
        const currentConvId = conversation?.id;
        const currentMsgsLength = conversation?.messages?.length || 0;

        if (prevConversationIdRef.current !== currentConvId) {
            // Selected a different chat, reset states and snap safely
            prevConversationIdRef.current = currentConvId;
            prevMessageCountRef.current = currentMsgsLength;
            setShowScrollButton(false);
            setNewMessageCount(0);

            if (bottomRef.current) {
                bottomRef.current.scrollIntoView({ behavior: 'auto' });
            }
            return;
        }

        const addedMessages = currentMsgsLength - prevMessageCountRef.current;

        if (addedMessages > 0) {
            if (!showScrollButton) {
                // If we were near the bottom before, smoothly auto-scroll down
                if (bottomRef.current) {
                    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // If we were reading history, increment badge and keep user in place
                setNewMessageCount((prev) => prev + addedMessages);
                setShowScrollButton(true);
            }
        }

        prevMessageCountRef.current = currentMsgsLength;
    }, [conversation?.messages, conversation?.id, showScrollButton]);

    const scrollToBottom = () => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        setNewMessageCount(0);
        setShowScrollButton(false);
    };

    const handleSend = () => {
        if (!inputValue.trim() || !conversation) return;

        const newMessage = {
            id: Date.now(),
            type: 'outgoing',
            sender: 'User',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: '',
            text: inputValue
        };

        onSendMessage(conversation.id, newMessage);
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    if (!conversation || !conversation.id) {
        return (
            <div className="chat-area" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Select a conversation to start chatting</div>
            </div>
        );
    }

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="chat-header-info">
                    <button className="icon-button mobile-menu-btn" style={{ display: 'none' }}>
                        {/* Mobile menu toggle would go here */}
                    </button>
                    <div className="chat-title-wrapper">
                        <div className="chat-title">
                            {conversation.name}
                            <span className="chat-badge">PUBLIC</span>
                        </div>
                        <div className="chat-subtitle">
                            {conversation.members || 0} members • {conversation.onlineCount || 0} online
                        </div>
                    </div>
                </div>

                <div className="chat-header-actions">
                    <div className="avatar-group">
                        {/* Dynamic members will go here */}
                    </div>
                    <button className="icon-button">
                        <Search size={20} />
                    </button>
                    <button className="icon-button">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            <div className="message-list" ref={messageListRef} onScroll={handleScroll}>
                {(!conversation.messages || conversation.messages.length === 0) ? (
                    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        No messages yet.
                    </div>
                ) : (
                    <>
                        <div className="date-divider">
                            <span className="date-badge">Today</span>
                        </div>
                        {conversation.messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                    </>
                )}
                <div ref={bottomRef} />
            </div>

            {showScrollButton && (
                <button className="scroll-to-bottom" onClick={scrollToBottom}>
                    <ChevronDown size={24} strokeWidth={2.5} />
                    {newMessageCount > 0 && (
                        <span className="unread-badge-float">{newMessageCount}</span>
                    )}
                </button>
            )}

            <div className="chat-input-container">
                <div className="chat-input-wrapper">
                    <button className="icon-button input-action-btn">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder={`Type a message to ${conversation.name}...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="icon-button input-action-btn">
                        <Smile size={20} />
                    </button>
                    <button className="icon-button input-action-btn">
                        <Mic size={20} />
                    </button>
                    <button className="send-button" onClick={handleSend}>
                        <Send size={18} />
                    </button>
                </div>
                <div className="encryption-notice">
                    <Lock size={12} /> End-to-end encrypted
                </div>
            </div>
        </div>
    );
}
