import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import relayoIcon from "../assets/images/relayo-r.png";
import "../styles/chat-list.css";
import { createRoom, getRooms } from "../api/room.api";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const loadRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load rooms", error);
      setRooms([]);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        await loadRooms();
      } catch (error) {
        console.error("Failed to load rooms", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
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

  const handleOpenModal = () => {
    setCreateError("");
    setEmailInput("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (createLoading) return;
    setIsModalOpen(false);
    setCreateError("");
    setEmailInput("");
  };

  const handleCreateChat = async () => {
    const email = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setCreateError("Enter a valid email address.");
      return;
    }

    setCreateLoading(true);
    setCreateError("");

    try {
      const currentUserId = getCurrentUserId();
      const targetParticipant = rooms
        .flatMap((room) => room.participants || [])
        .find(
          (participant) =>
            participant?.email?.toLowerCase() === email &&
            participant?._id !== currentUserId
        );

      if (targetParticipant?._id && currentUserId) {
        await createRoom({
          participants: [currentUserId, targetParticipant._id],
          isGroup: false,
        });
      } else {
        // Fallback for backends that accept participant email directly.
        await createRoom({ email });
      }

      await loadRooms();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create room", error);
      setCreateError(error?.response?.data?.message || "Failed to create chat.");
    } finally {
      setCreateLoading(false);
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
              <h1>Relayo</h1>
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
          <button type="button" className="new-chat-btn" onClick={handleOpenModal}>
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

        {isModalOpen ? (
          <div className="new-chat-modal-overlay" onClick={handleCloseModal}>
            <div
              className="new-chat-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Create new chat"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>New Chat</h2>
              <p className="new-chat-modal-subtext">Enter user email</p>

              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="new-chat-input"
                disabled={createLoading}
              />

              {createError ? (
                <p className="new-chat-error">{createError}</p>
              ) : null}

              <div className="new-chat-actions">
                <button
                  type="button"
                  className="new-chat-action cancel"
                  onClick={handleCloseModal}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="new-chat-action create"
                  onClick={handleCreateChat}
                  disabled={createLoading}
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
