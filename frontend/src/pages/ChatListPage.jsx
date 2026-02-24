import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import relayoIcon from "../assets/images/relayo-r.png";
import "../styles/chat-list.css";
import { getRooms } from "../api/room.api";

const DEMO_ROOMS = [
  {
    _id: "demo-1",
    name: "Alice Johnson",
    avatarClass: "avatar-violet",
    unreadCount: 3,
    lastMessage: {
      text: "Hey! Are we still on for tomorrow?",
      createdAt: "2026-02-23T10:42:00.000Z",
    },
  },
  {
    _id: "demo-2",
    name: "Design Team",
    avatarClass: "avatar-rose",
    unreadCount: 7,
    lastMessage: {
      text: "Marcus: I pushed the new mockups to Figma",
      createdAt: "2026-02-23T09:15:00.000Z",
    },
  },
  {
    _id: "demo-3",
    name: "Bob Martinez",
    avatarClass: "avatar-teal",
    lastMessage: {
      text: "Thanks, I'll review it by EOD",
      createdAt: "2026-02-22T07:30:00.000Z",
    },
  },
  {
    _id: "demo-4",
    name: "Sprint Planning",
    avatarClass: "avatar-orange",
    lastMessage: {
      text: "Your meeting rescheduled to 3 PM",
      createdAt: "2026-02-22T12:00:00.000Z",
    },
  },
  {
    _id: "demo-5",
    name: "Priya Sharma",
    avatarClass: "avatar-pink",
    unreadCount: 1,
    lastMessage: {
      text: "Can you share the report when it's ready?",
      createdAt: "2026-02-21T18:00:00.000Z",
    },
  },
  {
    _id: "demo-6",
    name: "Dev Backend",
    avatarClass: "avatar-blue",
    lastMessage: {
      text: "Ravi: API rate limit issue resolved",
      createdAt: "2026-02-21T13:00:00.000Z",
    },
  },
  {
    _id: "demo-7",
    name: "Carlos Rivera",
    avatarClass: "avatar-indigo",
    lastMessage: {
      text: "Sounds good, let's connect next week.",
      createdAt: "2026-02-20T11:00:00.000Z",
    },
  },
  {
    _id: "demo-8",
    name: "Sarah Lee",
    avatarClass: "avatar-salmon",
    lastMessage: {
      text: "Photo",
      createdAt: "2026-02-19T11:00:00.000Z",
    },
  },
];

const AVATAR_CLASSES = [
  "avatar-violet",
  "avatar-rose",
  "avatar-teal",
  "avatar-orange",
  "avatar-pink",
  "avatar-blue",
  "avatar-indigo",
  "avatar-salmon",
];

function formatChatMeta(createdAt) {
  if (!createdAt) return "";

  const now = new Date();
  const date = new Date(createdAt);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((todayStart - dateStart) / 86400000);

  if (diffDays <= 0) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { weekday: "short" });
}

export default function ChatListPage() {
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState("demo-2");
  const [query, setQuery] = useState("");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getRooms();
        const apiRooms = Array.isArray(res?.data) ? res.data : [];
        setRooms(apiRooms.length > 0 ? apiRooms : DEMO_ROOMS);
      } catch (err) {
        console.error("Failed to load rooms", err);
        setRooms(DEMO_ROOMS);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const normalizedChats = useMemo(
    () =>
      rooms.map((room, index) => ({
        ...room,
        displayName: room.name?.trim() || "Unnamed Chat",
        preview: room.lastMessage?.text || "No messages yet",
        meta: room.meta || formatChatMeta(room.lastMessage?.createdAt),
        unreadCount: Number(room.unreadCount || 0),
        avatarClass: room.avatarClass || AVATAR_CLASSES[index % AVATAR_CLASSES.length],
      })),
    [rooms]
  );

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return normalizedChats;

    return normalizedChats.filter((room) =>
      room.displayName.toLowerCase().includes(normalized)
    );
  }, [query, normalizedChats]);

  const handleChatClick = (room) => {
    setActiveChatId(room._id);
    navigate(`/chat/${room._id}`, {
      state: {
        chatName: room.displayName,
        avatarClass: room.avatarClass,
      },
    });
  };

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
          {loading ? (
            <p>Loading chats...</p>
          ) : filteredChats.length === 0 ? (
            <p>No chats found.</p>
          ) : (
            filteredChats.map((room) => {
              return (
                <li key={room._id}>
                  <button
                    type="button"
                    className={`chat-row ${activeChatId === room._id ? "active" : ""}`}
                    onClick={() => handleChatClick(room)}
                  >
                    <span className={`avatar ${room.avatarClass}`}>
                      {room.displayName.charAt(0).toUpperCase()}
                    </span>
                    <span className="row-content">
                      <span className="row-top">
                        <strong>{room.displayName}</strong>
                        <time>{room.meta}</time>
                      </span>
                      <span className="row-bottom">
                        <span className="preview">{room.preview}</span>
                        {room.unreadCount > 0 ? (
                          <span className="unread-badge">{room.unreadCount}</span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
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
