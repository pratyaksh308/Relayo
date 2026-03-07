import api from "./axios";

export const getRooms = () => {
  // backend exposes user-specific rooms at /rooms/my
  return api.get("/rooms/my");
};

export const createDirectRoom = (email) => {
  return api.post("/rooms/direct", { email });
};
