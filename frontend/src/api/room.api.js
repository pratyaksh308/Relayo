import api from "./axios";

export const getRooms = () => {
  // backend exposes user-specific rooms at /rooms/my
  return api.get("/rooms/my");
};