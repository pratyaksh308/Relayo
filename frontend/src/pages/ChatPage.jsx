import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import relayoIcon from "../assets/images/relayo-r.png";
import "../styles/chat-page.css";

const DEMO_MESSAGES = [
  {
    id: "m1",
    sender: "other",
    text: "Hey! Are we still on for tomorrow?",
    time: "10:42 AM",
  },
  {
    id: "m2",
    sender: "me",
    text: "Yes, 11:00 AM works for me.",
    time: "10:44 AM",
  },
  {
    id: "m3",
    sender: "other",
    text: "Perfect. I will share the agenda in a bit.",
    time: "10:45 AM",
  },
  {
    id: "m4",
    sender: "me",
    text: "Great, see you then.",
    time: "10:46 AM",
  },
];

export default function ChatPage() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();
  const [messageInput, setMessageInput] = useState("");

  const chatName = location.state?.chatName || `Chat ${chatId}`;
  const avatarClass = location.state?.avatarClass || "avatar-violet";
  const avatarLetter = chatName.charAt(0).toUpperCase();

  const messages = useMemo(() => DEMO_MESSAGES, []);

  return (
    <main className="chat-page-shell">
      <section className="chat-page-panel" aria-label="Chat conversation panel">
        <header className="chat-page-header">
          <button type="button" className="chat-back-btn" onClick={() => navigate("/chat-list")}>
            Back
          </button>
          <div className="chat-title-wrap">
            <span className={`avatar ${avatarClass} chat-header-avatar`}>{avatarLetter}</span>
            <div className="chat-title-meta">
              <h1>{chatName}</h1>
              <p>online</p>
            </div>
          </div>
          <div className="chat-header-brand">
            <img src={relayoIcon} alt="Relayo" />
          </div>
        </header>

        <section className="chat-messages" aria-label="Messages">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`message-row ${message.sender === "me" ? "message-row-me" : "message-row-other"}`}
            >
              <div className={`message-bubble ${message.sender === "me" ? "message-bubble-me" : "message-bubble-other"}`}>
                <p>{message.text}</p>
                <time>{message.time}</time>
              </div>
            </article>
          ))}
        </section>

        <footer className="chat-composer">
          <input
            type="text"
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            className="chat-input"
            placeholder="Type your message..."
          />
          <button type="button" className="chat-send-btn">
            Send
          </button>
        </footer>
      </section>
    </main>
  );
}
