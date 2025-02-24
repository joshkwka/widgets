import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface UserProfile {
    first_name: string;
    last_name: string;
    email: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    access: string;
    refresh: string;
    user: UserProfile;
}

export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) throw new Error("No refresh token found");

        console.log("Refreshing access token...");
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
        });

        console.log("New Access Token:", response.data.access);
        Cookies.set("access_token", response.data.access, { expires: 7, secure: true, sameSite: "Lax" });

        return response.data.access;
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Failed to refresh access token:", err.message);
        return null;
    }
};

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
        let token = Cookies.get("access_token");
        console.log("Using Access Token:", token);
        if (!token) throw new Error("No token found");

        const response = await axios.get<{ user: UserProfile }>(`${API_BASE_URL}/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched User Data:", response.data);
        return response.data.user;
    } catch (error: unknown) {
        const err = error as AxiosError;
        if (err.response && err.response.status === 401) {
            console.warn("Access token expired, attempting to refresh...");
            const token = await refreshAccessToken();
            if (token) {
                return fetchUserProfile(); // ✅ Retry fetching profile with new token
            }
        }
        console.error("Error fetching profile:", err.message);
        return null;
    }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log("Login Request:", { email, password });
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login/`, { email, password });
  
      console.log("Login Successful:", response.data);

      Cookies.set("access_token", response.data.access, { expires: 7, secure: true, sameSite: "Lax" });
      Cookies.set("refresh_token", response.data.refresh, { expires: 30, secure: true, sameSite: "Lax" });
  
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError;
      console.error("Login Failed:", err.message);
      throw new Error("Invalid email or password");
    }
  };
  

export const logoutUser = async (): Promise<void> => {
    try {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        console.log("User logged out successfully.");
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Logout Failed:", err.message);
    }
};

export const registerUser = async (first_name: string, last_name: string, email: string, password: string): Promise<any> => {
    try {
        const userData = { first_name, last_name, email, password };
        console.log("Register Request:", userData);
        const response = await axios.post(`${API_BASE_URL}/register/`, userData);

        console.log("Registration Successful:", response.data);
        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Registration Failed:", err.message);
        throw new Error("Failed to register user");
    }
};

export const forgotPassword = async (email: string): Promise<any> => {
    try {
        console.log("Forgot Password Request for:", email);
        const response = await axios.post(`${API_BASE_URL}/forgot-password/`, { email });

        console.log("Forgot Password Response:", response.data);
        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Forgot Password Failed:", err.message);
        throw new Error("Failed to send reset password email");
    }
};