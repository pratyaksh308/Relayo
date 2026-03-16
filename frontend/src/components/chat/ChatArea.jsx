import React from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, FileText, CheckCheck, Lock, ChevronDown } from 'lucide-react';

function MessageBubble({ message, isGrouped }) {
    return (
        <div className={`message-group ${message.type} ${isGrouped ? 'grouped' : ''}`}>
            {!isGrouped && (
                <div className="message-meta">
                    <span className="message-sender">{message.sender}</span>
                    <span className="message-time">{message.time}</span>
                </div>
            )}
            <div className="message-content-wrapper">
                {isGrouped ? (
                    <div className="avatar message-avatar" style={{ visibility: 'hidden', width: '32px', height: '32px' }} />
                ) : message.avatar ? (
                    <img src={message.avatar} alt={message.sender} className="avatar message-avatar" referrerPolicy="no-referrer" />
                ) : (() => {
                    const stats = generateAvatarStats(message.sender);
                    return (
                        <div className="avatar message-avatar" style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: stats.color, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            {stats.initials}
                        </div>
                    );
                })()}

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

export function generateAvatarStats(name) {
    if (!name || name === "You") {
        return { initials: "U", color: "var(--primary-color)" };
    }
    
    const parts = name.trim().split(/\s+/);
    let initials = "U";
    if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts[0].length >= 2) {
        initials = (parts[0][0] + parts[0][1]).toUpperCase();
    } else {
        initials = parts[0][0].toUpperCase();
    }

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const color = `hsl(${hue > 0 ? hue : -hue}, 65%, 45%)`;

    return { initials, color };
}

function formatDateSeparator(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
}

export default function ChatArea({ conversation, onSendMessage, onTyping }) {
    const [inputValue, setInputValue] = React.useState('');
    const [showScrollButton, setShowScrollButton] = React.useState(false);
    const [newMessageCount, setNewMessageCount] = React.useState(0);

    const messageListRef = React.useRef(null);
    const bottomRef = React.useRef(null);
    const prevConversationIdRef = React.useRef(null);
    const prevMessageCountRef = React.useRef(0);
    const typingTimeoutRef = React.useRef(null);

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

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (onTyping) onTyping(conversation.id, false);

        const newMessage = {
            id: Date.now(),
            type: 'outgoing',
            sender: 'User',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString(),
            avatar: '',
            text: inputValue
        };

        onSendMessage(conversation.id, newMessage);
        setInputValue('');
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        
        if (onTyping && conversation) {
            onTyping(conversation.id, true);
            
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(conversation.id, false);
            }, 2000);
        }
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
                            {(showScrollButton && conversation.typingUsers && conversation.typingUsers.length > 0) ? (
                                <span style={{ color: 'var(--primary-color)', fontWeight: '500', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                    {conversation.typingUsers.map(u => u.userName).join(', ')} typing...
                                </span>
                            ) : (
                                <span>{conversation.members || 0} members • {conversation.onlineCount || 0} online</span>
                            )}
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
                        {conversation.messages.map((msg, index) => {
                            const prevMsg = conversation.messages[index - 1];
                            
                            let isSameSender = false;
                            if (prevMsg && prevMsg.sender === msg.sender && prevMsg.type === msg.type) {
                                const currentMsgTime = new Date(msg.createdAt).getTime();
                                const prevMsgTime = new Date(prevMsg.createdAt).getTime();
                                // Group messages only if they are within 5 minutes (300,000 ms) of each other
                                if (currentMsgTime - prevMsgTime < 300000) {
                                    isSameSender = true;
                                }
                            }
                            
                            const currentDate = new Date(msg.createdAt).toDateString();
                            const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
                            const showDateSeparator = currentDate !== prevDate;

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDateSeparator && (
                                        <div className="date-separator">
                                            {formatDateSeparator(msg.createdAt || new Date())}
                                        </div>
                                    )}
                                    <MessageBubble message={msg} isGrouped={isSameSender && !showDateSeparator} />
                                </React.Fragment>
                            );
                        })}
                    </>
                )}
                
                {(!showScrollButton && conversation.typingUsers && conversation.typingUsers.length > 0) && (
                    <div className="typing-indicator-container" style={{ padding: '0 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <div className="typing-dots" style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0s' }}></span>
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                        </div>
                        {conversation.typingUsers.map(u => u.userName).join(', ')} {conversation.typingUsers.length > 1 ? 'are' : 'is'} typing...
                    </div>
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
                        onChange={handleInputChange}
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
