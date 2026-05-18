import api from "./axios";

export const getMessagesByRoom = (roomId) => {
  return api.get(`/messages/${roomId}`);
};

export const sendMessage = (data) => {
  return api.post("/messages", data);
};

export const sendFileMessage = (data) => {
  return api.post("/messages/file", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
