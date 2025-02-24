import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api"; 

export const loginUser = async (email: string, password: string) => {
    try {
        console.log("Login Request:", { email, password }); // Debugging log
        const response = await axios.post(`${API_BASE_URL}/login/`, { email, password });
        console.log("Login Response:", response.data);
        localStorage.setItem("token", response.data.token);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Login Error:", error.response.data); // Log error response
            throw new Error(error.response.data?.error || "Invalid email or password");
        }
        throw new Error("Something went wrong");
    }
};

export const registerUser = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
        console.log("Register Request:", { email, password, first_name: firstName, last_name: lastName }); // Debugging log
        const response = await axios.post(`${API_BASE_URL}/register/`, {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        });
        console.log("Register Response:", response.data);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Register Error:", error.response.data); // Log error response
            throw new Error(error.response.data?.error || "Registration failed");
        }
        throw new Error("Something went wrong");
    }
};


export const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    return axios.get(`${API_BASE_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const logoutUser = () => {
    localStorage.removeItem("token");
};

export const forgotPassword = async (email: string) => {
    try {
        await axios.post(`${API_BASE_URL}/forgot-password/`, { email });
    } catch (error) {
        throw new Error("Failed to send password reset email.");
    }
};
