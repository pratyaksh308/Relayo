import api from "./axios";

export const getRooms = () => {
  // backend exposes user-specific rooms at /rooms/my
  return api.get("/rooms/my");
};

export const createDirectRoom = (email) => {
  return api.post("/rooms/direct", { email });
};

export const createDirectRoomByUsername = (data) => {
  return api.post("/rooms/direct-by-username", data);
};
