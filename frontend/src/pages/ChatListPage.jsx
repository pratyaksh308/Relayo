import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import relayoIcon from "../assets/images/relayo-r.png";
import "../styles/chat-list.css";
import api from "../api/axios";
import { getRooms } from "../api/room.api";

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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatChatMeta(createdAt) {
  if (!createdAt) return "";

  const now = new Date();
  const date = new Date(createdAt);

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.floor((todayStart - dateStart) / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString([], { weekday: "short" });
}

export default function ChatListPage() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [query, setQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRooms();
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load rooms", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    document.body.classList.add("no-page-scroll");
    document.documentElement.classList.add("no-page-scroll");
    return () => {
      document.body.classList.remove("no-page-scroll");
      document.documentElement.classList.remove("no-page-scroll");
    };
  }, []);

  const normalizedChats = useMemo(() => {
    return rooms.map((room, index) => ({
      ...room,
      displayName: room.name || "Unnamed Chat",
      preview: room.lastMessage?.text || "No messages yet",
      meta: formatChatMeta(room.lastMessage?.createdAt),
      avatarClass:
        room.avatarClass ||
        AVATAR_CLASSES[index % AVATAR_CLASSES.length],
    }));
  }, [rooms]);

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

  const handleOpenCreateModal = () => {
    setInviteEmail("");
    setCreateError("");
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (creating) return;
    setIsCreateModalOpen(false);
    setInviteEmail("");
    setCreateError("");
  };

  const handleCreateRoom = async () => {
    const normalizedEmail = inviteEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setCreateError("Email is required.");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setCreateError("Enter a valid email address.");
      return;
    }

    setCreateError("");
    setCreating(true);

    try {
      await api.post("/rooms", {
        email: normalizedEmail,
        participantEmail: normalizedEmail,
      });

      await fetchRooms();
      handleCloseCreateModal();
    } catch (error) {
      setCreateError(
        error.response?.data?.message || "Failed to create chat. Try again."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="chat-shell">
      <section className="chat-panel" aria-label="Chat list panel">
        <header className="panel-header">
          <div className="brand">
            <div className="brand-icon">
              <img
                src={relayoIcon}
                alt="Relayo logo"
                className="brand-icon-image"
              />
            </div>
            <div className="brand-text">
              <h1>Chats</h1>
              <p>Your conversations</p>
            </div>
          </div>

          <button type="button" className="logout-btn">
            Logout
          </button>
        </header>

        <div className="search-wrap">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            placeholder="Search conversations..."
          />
        </div>

        <div className="list-head">
          <p>
            {query ? `Results (${filteredChats.length})` : "RECENT CHATS"}
          </p>
          <button
            type="button"
            className="new-chat-btn"
            onClick={handleOpenCreateModal}
          >
            New Chat +
          </button>
        </div>

        <ul className="chat-list">
          {loading ? (
            <li className="chat-list-empty">
              <p>Loading chats…</p>
            </li>
          ) : filteredChats.length === 0 ? (
            <li className="chat-list-empty">
              <p>No chats found.</p>
            </li>
          ) : (
            filteredChats.map((room) => (
              <li key={room._id}>
                <button
                  type="button"
                  className={`chat-row ${
                    activeChatId === room._id ? "active" : ""
                  }`}
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
                    </span>
                  </span>
                </button>
              </li>
            ))
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

        {isCreateModalOpen ? (
          <div
            className="create-chat-modal-backdrop"
            onClick={handleCloseCreateModal}
            role="presentation"
          >
            <section
              className="create-chat-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-chat-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="create-chat-title">Create New Chat</h2>
              <p>Enter the user email to start a conversation.</p>

              <label htmlFor="create-chat-email" className="create-chat-label">
                User Email
              </label>
              <input
                id="create-chat-email"
                type="email"
                className="create-chat-input"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="you@example.com"
              />

              {createError ? <p className="create-chat-error">{createError}</p> : null}

              <div className="create-chat-actions">
                <button
                  type="button"
                  className="create-btn"
                  onClick={handleCreateRoom}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseCreateModal}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
