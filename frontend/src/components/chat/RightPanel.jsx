import React from 'react';
import { BellOff, Search, MoreHorizontal } from 'lucide-react';
import { generateAvatarStats } from './ChatArea';

export default function RightPanel({ conversation }) {
    if (!conversation || !conversation.id) {
        return null; // Don't render panel if no active conversation
    }

    const currentUserId = localStorage.getItem("userId");
    const membersList = conversation.participants || [];

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
                    {membersList.length > 0 ? (
                        membersList.map((member, idx) => {
                            const isMe = String(member._id || member.id || member) === String(currentUserId);
                            const actualName = member.name || member.username;
                            const displayName = isMe ? "You" : actualName;
                            // Pass the actual name to the color generator to get real initials and consistent color
                            const stats = generateAvatarStats(actualName);

                            return (
                                <div key={idx} className="user-profile" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={displayName} className="avatar" style={{width: '32px', height: '32px', borderRadius: '50%'}} referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="avatar" style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: stats.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                                            {stats.initials}
                                        </div>
                                    )}
                                    <div className="user-info">
                                        <span className="user-name" style={{ fontSize: '14px', color: 'var(--text-primary, #fff)' }}>{displayName}</span>
                                    </div>
                                </div>
                            );
                        })
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
