import relayoLogo from "../assets/images/relayo-logo.png";
import "../styles/chat-list.css";

const chatItems = [
  {
    id: 1,
    name: "Project Revengers",
    lastMessage: "Meeting is moved to 4:30 PM. Share the latest slides.",
    timestamp: "4:12 PM",
    type: "group",
  },
  {
    id: 2,
    name: "Aarav Mehta",
    lastMessage: "Can you review my API schema before standup?",
    timestamp: "3:48 PM",
    type: "user",
  },
  {
    id: 3,
    name: "UI Team",
    lastMessage: "Pushed updated spacing tokens to the design branch.",
    timestamp: "2:26 PM",
    type: "group",
  },
  {
    id: 4,
    name: "Sana Khan",
    lastMessage: "Thanks. I have merged your feedback changes.",
    timestamp: "1:09 PM",
    type: "user",
  },
  {
    id: 5,
    name: "Placement Cell",
    lastMessage: "Please upload final resume by tonight.",
    timestamp: "Yesterday",
    type: "group",
  },
];

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function ChatListPage() {
  return (
    <main className="chat-list-page">
      <header className="chat-list-header">
        <div className="chat-brand">
          <img src={relayoLogo} alt="Relayo" className="chat-brand-logo" />
          <div className="chat-brand-text">
            <h1>Relayo</h1>
            <p>Recent Chats</p>
          </div>
        </div>
        <button type="button" className="chat-logout-btn">
          Logout
        </button>
      </header>

      <section className="chat-list-container" aria-label="Recent chat list">
        <ul className="chat-list">
          {chatItems.map((chat) => (
            <li key={chat.id} className="chat-item">
              <div
                className={`chat-avatar ${
                  chat.type === "group" ? "group-avatar" : "user-avatar"
                }`}
              >
                {getInitials(chat.name)}
              </div>
              <div className="chat-item-content">
                <div className="chat-item-head">
                  <h2>{chat.name}</h2>
                  <time>{chat.timestamp}</time>
                </div>
                <p>{chat.lastMessage}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
