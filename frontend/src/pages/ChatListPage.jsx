import { useMemo, useState } from "react";
import relayoIcon from "../assets/images/relayo-r.png";
import "../styles/chat-list.css";

const chatItems = [
  {
    id: 1,
    name: "Alice Johnson",
    initials: "AJ",
    preview: "Hey! Are we still on for tomorrow?",
    timestamp: "10:42 AM",
    unread: 3,
    avatarClass: "avatar-violet",
  },
  {
    id: 2,
    name: "Design Team",
    initials: "DT",
    preview: "Marcus: I pushed the new mockups to Figma",
    timestamp: "9:15 AM",
    unread: 7,
    avatarClass: "avatar-rose",
  },
  {
    id: 3,
    name: "Bob Martinez",
    initials: "BM",
    preview: "Thanks, I'll review it by EOD",
    timestamp: "Yesterday",
    unread: 0,
    avatarClass: "avatar-teal",
  },
  {
    id: 4,
    name: "Sprint Planning",
    initials: "SP",
    preview: "You: Meeting rescheduled to 3 PM",
    timestamp: "Yesterday",
    unread: 0,
    avatarClass: "avatar-orange",
  },
  {
    id: 5,
    name: "Priya Sharma",
    initials: "PS",
    preview: "Can you share the report when it's ready?",
    timestamp: "Mon",
    unread: 1,
    avatarClass: "avatar-pink",
  },
  {
    id: 6,
    name: "Dev Backend",
    initials: "DB",
    preview: "Ravi: API rate limit issue resolved",
    timestamp: "Mon",
    unread: 0,
    avatarClass: "avatar-blue",
  },
  {
    id: 7,
    name: "Carlos Rivera",
    initials: "CR",
    preview: "Sounds good, let's connect next week.",
    timestamp: "Sun",
    unread: 0,
    avatarClass: "avatar-indigo",
  },
  {
    id: 8,
    name: "Sarah Lee",
    initials: "SL",
    preview: "Photo",
    timestamp: "Sat",
    unread: 0,
    avatarClass: "avatar-salmon",
  },
];

export default function ChatListPage() {
  const [activeChatId, setActiveChatId] = useState(2);
  const [query, setQuery] = useState("");

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return chatItems;
    }

    return chatItems.filter(
      (chat) =>
        chat.name.toLowerCase().includes(normalized) ||
        chat.preview.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <main className="chat-shell">
      <section className="chat-panel" aria-label="Chat list panel">
        <header className="panel-header">
          <div className="brand">
            <div className="brand-icon">
              <img src={relayoIcon} alt="Relayo logo" className="brand-icon-image" />
            </div>
            <h1>Relayo</h1>
          </div>

          <button type="button" className="logout-btn">
            Logout
          </button>
        </header>

        <div className="search-wrap">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input"
            placeholder="Search conversations..."
          />
        </div>

        <div className="list-head">
          <p>{query ? `Results (${filteredChats.length})` : "RECENT CHATS"}</p>
          <button type="button" className="new-chat-btn">
            New Chat +
          </button>
        </div>

        <ul className="chat-list">
          {filteredChats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                className={`chat-row ${activeChatId === chat.id ? "active" : ""}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <span className={`avatar ${chat.avatarClass}`}>{chat.initials}</span>
                <span className="row-content">
                  <span className="row-top">
                    <strong>{chat.name}</strong>
                    <time>{chat.timestamp}</time>
                  </span>
                  <span className="row-bottom">
                    <span className="preview">{chat.preview}</span>
                    {chat.unread > 0 ? (
                      <span className="unread-badge">{chat.unread}</span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <footer className="panel-footer">
          <button type="button" className="footer-tab active">
            Chats
          </button>
          <button type="button" className="footer-tab">
            Contacts
          </button>
          <button type="button" className="footer-tab">
            Profile
          </button>
        </footer>
      </section>
    </main>
  );
}
