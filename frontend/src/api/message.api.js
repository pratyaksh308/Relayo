import api from "./axios";

export const getMessagesByRoom = (roomId) => {
  return api.get(`/messages/${roomId}`);
};

export const sendMessage = (data) => {
  return api.post("/messages", data);
};
