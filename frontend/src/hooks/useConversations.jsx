import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRooms } from "../api/room.api";
import { getMessagesByRoom, sendMessage, sendFileMessage } from "../api/message.api";
import { io } from "socket.io-client";

function generateAvatarStats(name) {
    if (!name || name === "You") {
        return { initials: "U", color: "var(--primary-color)" };
    }
    
    // Generate initials (up to 2 characters)
    const parts = name.trim().split(/\s+/);
    let initials = "U";
    if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts[0].length >= 2) {
        initials = (parts[0][0] + parts[0][1]).toUpperCase();
    } else {
        initials = parts[0][0].toUpperCase();
    }

    // Generate a consistent color based on the name string (hash)
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Convert to HSL with good saturation and lightness for white text
    const hue = hash % 360;
    const color = `hsl(${hue > 0 ? hue : -hue}, 65%, 45%)`;

    return { initials, color };
}

export default function useConversations() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const socketRef = useRef(null);

  // 1. Establish Socket Connection and Listen for Messages
  useEffect(() => {
    // Determine backend URL (fallback to localhost:5000 if env not set)
    const backendUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    socketRef.current = io(backendUrl);

    socketRef.current.on("newMessage", (msg) => {
      setConversations(prev => {
        if (!prev) return prev;
        
        return prev.map(conv => {
          if (String(conv.id) === String(msg.room)) {
            // Check for duplicates (local sent messages already have the DB _id)
            const exists = (conv.messages || []).some(m => String(m.id) === String(msg._id));
            if (exists) return conv;

            const currentUserId = localStorage.getItem("userId");
            const senderIdStr = String(msg.sender?._id || msg.sender?.id || msg.sender);
            const msgType = senderIdStr === String(currentUserId) ? "outgoing" : "incoming";

            const newMsgFormatted = {
              id: msg._id,
              type: msgType,
              messageType: msg.messageType || "text",
              fileUrl: msg.fileUrl ? `${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${msg.fileUrl}` : null,
              fileName: msg.fileName,
              fileType: msg.fileType,
              fileSize: msg.fileSize,
              sender: msg.sender?.name || msg.sender?.username || (msgType === "outgoing" ? "You" : "User"),
              time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              createdAt: msg.createdAt,
              avatar: msg.sender?.avatar || "",
              text: msg.text,
            };

            return { 
              ...conv, 
              messages: [...(conv.messages || []), newMsgFormatted],
              lastMessage: msg 
            };
          }
          return conv;
        });
      });
    });

    socketRef.current.on("typing", ({ roomId, userId, userName }) => {
      setConversations(prev => {
        if (!prev) return prev;
        return prev.map(conv => {
          if (String(conv.id) === String(roomId)) {
            const typingUsers = conv.typingUsers || [];
            if (!typingUsers.some(u => String(u.userId) === String(userId))) {
              return { ...conv, typingUsers: [...typingUsers, { userId, userName }] };
            }
          }
          return conv;
        });
      });
    });

    socketRef.current.on("stopTyping", ({ roomId, userId }) => {
      setConversations(prev => {
        if (!prev) return prev;
        return prev.map(conv => {
          if (String(conv.id) === String(roomId)) {
            return {
              ...conv,
              typingUsers: (conv.typingUsers || []).filter(u => String(u.userId) !== String(userId))
            };
          }
          return conv;
        });
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 2. Join Room when selected
  useEffect(() => {
    if (socketRef.current && selectedConversationId) {
      socketRef.current.emit("joinRoom", selectedConversationId);
    }
  }, [selectedConversationId]);

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
            const stats = generateAvatarStats(chatName);
            chatAvatar = stats.initials;
            color = stats.color;
          }
        } else {
          chatName = "Direct Chat";
        }
      } else if (!chatName) {
        chatName = "Group Chat";
      } else {
        // Group chat without custom avatar
        const stats = generateAvatarStats(chatName);
        chatAvatar = stats.initials;
        color = stats.color;
      }
  
      return {
      id: room._id,
      name: chatName,
      members: room.participants?.length || 0,
      onlineCount: 0,
      avatar: chatAvatar,
      isInitials,
      color,
      participants: room.participants || [],
      lastMessage: room.lastMessage || null,
      messages: [],
      typingUsers: []
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
          messageType: m.messageType || "text",
          fileUrl: m.fileUrl ? `${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${m.fileUrl}` : null,
          fileName: m.fileName,
          fileType: m.fileType,
          fileSize: m.fileSize,
          sender: m.sender?.name || m.sender?.username || (msgType === "outgoing" ? "You" : "User"),
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: m.createdAt,
          avatar: m.sender?.avatar || "",
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

  const handleTyping = useCallback((conversationId, isTyping) => {
    if (!socketRef.current) return;
    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");
    
    if (isTyping) {
      socketRef.current.emit("typing", { roomId: conversationId, userId: currentUserId, userName: currentUserName });
    } else {
      socketRef.current.emit("stopTyping", { roomId: conversationId, userId: currentUserId });
    }
  }, []);

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
        createdAt: new Date().toISOString(),
        avatar: "",
        text: message.text
      };

      setConversations((prev) => {
        if (!prev) return prev;
        return prev.map((c) => {
          if (String(c.id) === String(conversationId)) {
            const exists = (c.messages || []).some(m => String(m.id) === String(newMsg.id));
            if (exists) return c;
            return { ...c, messages: [...(c.messages || []), newMsg] };
          }
          return c;
        });
      });
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  const handleSendFileMessage = async (conversationId, file) => {
    try {
      const formData = new FormData();
      formData.append("roomId", conversationId);
      formData.append("file", file);

      const res = await sendFileMessage(formData);
      
      const newMsg = {
        id: res.data.data._id,
        type: "outgoing",
        messageType: res.data.data.messageType || "file",
        fileUrl: res.data.data.fileUrl ? `${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${res.data.data.fileUrl}` : null,
        fileName: res.data.data.fileName,
        fileType: res.data.data.fileType,
        fileSize: res.data.data.fileSize,
        sender: "You",
        time: new Date(res.data.data.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: res.data.data.createdAt,
        avatar: "",
        text: res.data.data.text
      };

      setConversations((prev) => {
        if (!prev) return prev;
        return prev.map((c) => {
          if (String(c.id) === String(conversationId)) {
            const exists = (c.messages || []).some(m => String(m.id) === String(newMsg.id));
            if (exists) return c;
            return { ...c, messages: [...(c.messages || []), newMsg] };
          }
          return c;
        });
      });
    } catch (err) {
      console.error("Send file failed", err);
      throw err;
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
    handleSendFileMessage,
    handleTyping,
    handleSelectConversation,
    addConversation
  };
}