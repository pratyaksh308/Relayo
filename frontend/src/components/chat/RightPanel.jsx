import React from 'react';
import { BellOff, Search, MoreHorizontal } from 'lucide-react';

export default function RightPanel({ conversation }) {
    if (!conversation || !conversation.id) {
        return null; // Don't render panel if no active conversation
    }

    const currentUserId = localStorage.getItem("userId");
    const otherMembers = conversation.participants?.filter(
        p => String(p._id || p.id || p) !== String(currentUserId)
    ) || [];

    return (
        <div className="right-panel">
            <div className="panel-header">
                <div className="group-avatar">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <h2 className="group-title">{conversation.name || "Conversation"}</h2>
                <p className="group-description">
                    Discussion for {conversation.name || "this"} team.
                </p>
            </div>

            <div className="panel-actions">
                <button className="action-btn">
                    <BellOff size={20} />
                    <span>Mute</span>
                </button>
                <button className="action-btn">
                    <Search size={20} />
                    <span>Search</span>
                </button>
                <button className="action-btn">
                    <MoreHorizontal size={20} />
                    <span>More</span>
                </button>
            </div>

            <div className="panel-section">
                <div className="section-header">
                    <span className="section-title">PINNED</span>
                </div>
                <div className="pinned-content" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    No pinned messages.
                </div>
            </div>

            <div className="panel-section">
                <div className="section-header">
                    <span className="section-title">SHARED MEDIA</span>
                </div>
                <div className="pinned-content" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    No media shared yet.
                </div>
            </div>

            <div className="panel-section no-border">
                <div className="section-header">
                    <span className="section-title">MEMBERS ({conversation.members || 0})</span>
                </div>
                <div className="member-list">
                    {otherMembers.length > 0 ? (
                        otherMembers.map((member, idx) => (
                            <div key={idx} className="user-profile" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name || member.username} className="avatar" style={{width: '32px', height: '32px', borderRadius: '50%'}} referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="avatar" style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        {(member.name || member.username || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="user-info">
                                    <span className="user-name" style={{ fontSize: '14px', color: 'var(--text-primary, #fff)' }}>{member.name || member.username}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pinned-content" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            No members available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
