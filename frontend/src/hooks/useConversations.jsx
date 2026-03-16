import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRooms } from "../api/room.api";
import { getMessagesByRoom, sendMessage } from "../api/message.api";

export default function useConversations() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const selectedConversation = conversations?.find(
    (c) => String(c.id) === String(selectedConversationId)
  );

  const formatRoom = useCallback((room) => {
    const currentUserId = localStorage.getItem("userId") || "";
    let chatName = room.name;
    let chatAvatar = "R";
    let isInitials = true;
    let color = "#3b82f6";

    if (!room.isGroup) {
      const otherParticipant = room.participants?.find((p) => {
        if (!p) return false;
        
        // Handle various ways Mongoose/ObjectId/populated docs can appear
        let pIdStr;
        if (typeof p === 'string') {
          pIdStr = p;
        } else if (p._id && typeof p._id === 'object') {
          pIdStr = p._id.toString(); // Mongoose ObjectId
        } else if (p._id) {
          pIdStr = String(p._id);    // Stringified ObjectId
        } else if (p.id) {
          pIdStr = String(p.id);     // Fallback id
        } else {
          pIdStr = String(p);        // Absolute fallback
        }

        return pIdStr !== String(currentUserId);
      });

      if (otherParticipant) {
        chatName = otherParticipant.name || otherParticipant.username;
        if (otherParticipant.avatar) {
          chatAvatar = otherParticipant.avatar;
          isInitials = false;
        } else {
          chatAvatar = chatName ? chatName.charAt(0).toUpperCase() : "U";
        }
      } else {
        chatName = "Direct Chat";
      }
    } else if (!chatName) {
      chatName = "Group Chat";
    }

    return {
      id: room._id,
      name: chatName,
      members: room.participants?.length || 0,
      onlineCount: 0,
      avatar: chatAvatar,
      isInitials,
      color,
      messages: []
    };
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await getRooms();
        
        setConversations(prev => {
          const rooms = res.data.map(formatRoom);
          
          if (!prev) return rooms; // Initial load

          // Make sure we carry forward any existing fetched messages during polling/reloads
          return rooms.map(newRoom => {
            const existingRoom = prev.find(p => String(p.id) === String(newRoom.id));
            if (existingRoom && existingRoom.messages && existingRoom.messages.length > 0) {
              return { ...newRoom, messages: existingRoom.messages };
            }
            return newRoom;
          });
        });

        if (!chatId && res.data.length > 0) {
          navigate(`/chat/${res.data[0]._id}`, { replace: true });
        }
      } catch (err) {
        console.error("Failed to load rooms", err);
        setConversations([]);
      }
    };

    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessagesAndSelect = useCallback(async (id) => {
    setSelectedConversationId(id);

    try {
      const res = await getMessagesByRoom(id);
      const currentUserId = localStorage.getItem("userId");

      const msgs = res.data.map((m) => {
        const sender = m.sender || {};
        
        let senderIdStr;
        if (typeof sender === 'string') {
          senderIdStr = sender;
        } else if (sender._id && typeof sender._id === 'object') {
          senderIdStr = sender._id.toString();
        } else if (sender._id) {
          senderIdStr = String(sender._id);
        } else if (sender.id) {
          senderIdStr = String(sender.id);
        } else {
          senderIdStr = String(sender);
        }

        const msgType = senderIdStr === String(currentUserId) ? "outgoing" : "incoming";

        return {
          id: m._id,
          type: msgType,
          sender: m.sender?.name || m.sender?.username || (msgType === "outgoing" ? "You" : "User"),
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: m.sender?.avatar || "https://picsum.photos/seed/user/100",
          text: m.text,
        };
      });

      setConversations((prev) => {
        if (!prev) return prev;
        return prev.map((c) =>
          String(c.id) === String(id) ? { ...c, messages: msgs } : c
        );
      });
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }, []);

  useEffect(() => {
    // Only fetch if we Selected a new chat ID OR the currently selected chat has no messages yet.
    if (chatId) {
      if (chatId !== selectedConversationId) {
        fetchMessagesAndSelect(chatId);
      } else if (
        conversations && 
        selectedConversation && 
        (!selectedConversation.messages || selectedConversation.messages.length === 0)
      ) {
         fetchMessagesAndSelect(chatId);
      }
    }
  }, [chatId, fetchMessagesAndSelect, selectedConversationId, conversations, selectedConversation]);

  const handleSendMessage = async (conversationId, message) => {
    try {
      const res = await sendMessage({
        roomId: conversationId,
        text: message.text
      });

      const newMsg = {
        id: res.data.data._id,
        type: "outgoing",
        sender: "You",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: "https://picsum.photos/seed/user/100",
        text: message.text
      };

      setConversations((prev) => {
        if (!prev) return prev;
        return prev.map((c) =>
          String(c.id) === String(conversationId)
            ? { ...c, messages: [...(c.messages || []), newMsg] }
            : c
        );
      });
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  const addConversation = useCallback((room) => {
    const formattedRoom = formatRoom(room);
    setConversations((prev) => {
      const existing = prev || [];
      if (existing.find((c) => String(c.id) === String(formattedRoom.id))) {
        return existing;
      }
      return [formattedRoom, ...existing];
    });
  }, [formatRoom]);

  const handleSelectConversation = useCallback((id) => {
    navigate(`/chat/${id}`);
  }, [navigate]);

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    handleSendMessage,
    handleSelectConversation,
    addConversation
  };
}