import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const loginUser = async (email: string, password: string) => {
  return axios.post(`${API_BASE_URL}/users/login/`, { email, password });
};

export const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}/users/profile/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
