import axios from "./axios";

// search by username
export const searchUsers = async (username) => {
  const res = await axios.get(`/user/search?username=${username}`);
  return res.data;
};