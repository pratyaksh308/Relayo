import { useMemo, useState, useEffect } from "react";
import relayoIcon from "../assets/images/relayo-r.png";
import "../styles/chat-list.css";
import { getRooms } from "../api/room.api";


export default function ChatListPage() {
  const [activeChatId, setActiveChatId] = useState(null);
  const [query, setQuery] = useState("");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  fetchRooms();
}, []);

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return rooms;

    return rooms.filter((room) =>
      room.name.toLowerCase().includes(normalized)
    );
  }, [query, rooms]);

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
          ) : (
            filteredChats.map((room) => (
              <li key={room._id}>
              <button
                type="button"
                className={`chat-row ${activeChatId === room._id ? "active" : ""}`}
                onClick={() => setActiveChatId(room._id)}
              >
                <span className="avatar avatar-violet">
                  {room.name.charAt(0)}
                </span>
                <span className="row-content">
                  <span className="row-top">
                    <strong>{room.name}</strong>
                    <time>{room.lastMessage?.createdAt ? new Date(room.lastMessage.createdAt).toLocaleTimeString() : ""}</time>
                  </span>
                  <span className="row-bottom">
                    <span className="preview">{room.lastMessage?.text || "No messages yet"}</span>
                  </span>
                </span>
              </button>
            </li>
          )))
          }
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
