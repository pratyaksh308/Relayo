import { useEffect, useState } from "react";
import { getRooms } from "../api/room.api";
import { getMessagesByRoom, sendMessage } from "../api/message.api";

export default function useConversations() {

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {

      const res = await getRooms();

      const rooms = res.data.map((room) => ({
        id: room._id,
        name: room.name || "Direct Chat",
        members: room.participants?.length || 0,
        onlineCount: 0,
        avatar: "R",
        messages: []
      }));

      setConversations(rooms);

      if (rooms.length > 0) {
        setSelectedConversationId(rooms[0].id);
      }

    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  };

  const handleSelectConversation = async (id) => {

    setSelectedConversationId(id);

    try {

      const res = await getMessagesByRoom(id);

      const currentUserId = localStorage.getItem("userId");

      const msgs = res.data.map((m) => {
        const senderId = m.sender?._id || m.sender;
        const msgType = String(senderId) === String(currentUserId) ? "outgoing" : "incoming";

        return {
          id: m._id,
          type: msgType,
          sender: m.sender?.name || "User",
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: "https://picsum.photos/seed/user/100",
          text: m.text,
        };
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, messages: msgs } : c
        )
      );

    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleSendMessage = async (conversationId, message) => {

    try {

      const res = await sendMessage({
        roomId: conversationId,
        text: message.text
      });

      const newMsg = {
        ...message,
        id: res.data.data._id
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, newMsg] }
            : c
        )
      );

    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    handleSendMessage,
    handleSelectConversation
  };
}