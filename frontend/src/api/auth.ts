import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const loginUser = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/login/`, { email, password });
        localStorage.setItem("token", response.data.token);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Invalid email or password");
        }
        throw new Error("Something went wrong");
    }
};

export const registerUser = async (username: string, email: string, password: string, firstName: string, lastName: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/register/`, {
            username,
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        });
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Registration failed");
        }
        throw new Error("Something went wrong");
    }
};

export const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    return axios.get(`${API_BASE_URL}/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const logoutUser = () => {
    localStorage.removeItem("token");
};
