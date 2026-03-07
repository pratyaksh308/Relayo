import React, { useState } from "react";
import { searchUsers } from "../../api/user.api";
import { createDirectRoomByUsername } from "../../api/room.api";

export default function NewChatModal({ isOpen, onClose, onRoomCreated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const users = await searchUsers(value);
      setResults(users);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (username) => {
    try {
      setLoading(true);

      const res = await createDirectRoomByUsername({ username });

      const room = res.data;

      if (onRoomCreated) {
        onRoomCreated(room);
      }

      onClose();
    } catch (err) {
      console.error("Create room error:", err);
      setError(err.response?.data?.message || "Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newchat-overlay">
      <div className="newchat-modal">

        <div className="newchat-header">
          <h3>Start New Chat</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          type="text"
          placeholder="Search username"
          value={searchTerm}
          onChange={handleSearch}
          className="newchat-input"
        />

        {loading && <p>Searching...</p>}
        {error && <p className="error">{error}</p>}

        <div className="newchat-results">
          {results.map((user) => (
            <div
              key={user._id}
              className="newchat-user"
              onClick={() => handleSelectUser(user.username)}
            >
              <strong>{user.name}</strong>
              <span>@{user.username}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}