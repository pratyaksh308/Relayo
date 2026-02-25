import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import relayoIcon from "../assets/images/relayo-r.png";
import "../styles/chat-page.css";

import { getMessagesByRoom, sendMessage } from "../api/message.api";

export default function ChatPage() {
  const navigate = useNavigate();
  const { chatId, roomId } = useParams();
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);

  const chatName = location.state?.chatName || "Chat";
  const avatarLetter = chatName.charAt(0).toUpperCase();

  // Get current user id from JWT
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

  const currentUserId = getCurrentUserId();
  const activeRoomId = roomId || chatId;

  // -----------------------------
  // Load Messages
  // -----------------------------
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await getMessagesByRoom(activeRoomId);

        const formatted = res.data.map((m) => ({
          id: m._id,
          sender: m.sender?._id === currentUserId ? "me" : "other",
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeRoomId) loadMessages();
  }, [activeRoomId, currentUserId]);

  // -----------------------------
  // Send Message
  // -----------------------------
  const handleSend = async () => {
    if (!messageInput.trim()) return;

    try {
      const res = await sendMessage({
        roomId: activeRoomId,
        text: messageInput,
      });

      const m = res.data.data;

      const newMsg = {
        id: m._id,
        sender: "me",
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newMsg]);
      setMessageInput("");
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  // Send on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="chat-page-shell">
      <section className="chat-page-panel">
        <header className="chat-page-header">
          <button
            onClick={() => navigate("/chat-list")}
            className="chat-back-btn"
          >
            ←
          </button>

          <div className="chat-title-wrap">
            <span className="avatar avatar-violet chat-header-avatar">
              {avatarLetter}
            </span>
            <div className="chat-title-meta">
              <h1>{chatName}</h1>
              <p>Secure room</p>
            </div>
          </div>

          <div className="chat-header-brand">
            <img src={relayoIcon} alt="Relayo" className="chat-brand-logo" />
          </div>
        </header>

        <section className="chat-messages">
          {loading ? (
            <div className="chat-empty-state">
              <p>Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <p>No messages yet. Say hi 👋</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-row ${
                  msg.sender === "me" ? "message-row-me" : "message-row-other"
                }`}
              >
                <div
                  className={`message-bubble ${
                    msg.sender === "me"
                      ? "message-bubble-me"
                      : "message-bubble-other"
                  }`}
                >
                  <p>{msg.text}</p>
                  <time>{msg.time}</time>
                </div>
              </div>
            ))
          )}
        </section>

        <footer className="chat-composer">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="chat-input"
          />

          <button onClick={handleSend} className="chat-send-btn">
            Send
          </button>
        </footer>

      </section>
    </main>
  );
}