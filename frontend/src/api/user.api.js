import axios from "./axios";

// Search users by username
export const searchUsers = async (username) => {
  const res = await axios.get(`/users/search?username=${username}`);
  return res.data;
};