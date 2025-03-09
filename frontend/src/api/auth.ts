import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://localhost:8000/api";

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

        if (!refreshToken) {
            console.error("No refresh token found in cookies.");
            return null;
        }

        console.log("Refreshing access token...");
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });

        console.log("New Access Token:", response.data.access);

        Cookies.set("access_token", response.data.access, { expires: 7, secure: true, sameSite: "Lax" });
        Cookies.set("refresh_token", response.data.refresh, { expires: 30, secure: true, sameSite: "Lax" });

        return response.data.access;
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Failed to refresh access token:", err.message);
        if (err.response) {
            console.error("Response Data:", err.response.data);
            console.error("Response Status:", err.response.status);
        }
        return null;
    }
};

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
        let token = Cookies.get("access_token") ?? null;
        console.log("Using Access Token Before Request:", token);

        if (!token) {
            console.warn("No access token found, attempting to refresh...");
            token = await refreshAccessToken();
            if (!token) {
                console.error("Failed to refresh token. User must log in again.");
                return null;
            }
        }

        const response = await axios.get<{ user: UserProfile }>(`${API_BASE_URL}/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched User Data:", response.data);

        // Fetch user widgets after fetching user profile
        await fetchUserWidgets();

        return response.data.user;
    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response && err.response.status === 401) {
            console.warn("Access token expired, attempting to refresh...");
            const newToken = await refreshAccessToken();
            if (newToken) {
                console.log("Retrying profile fetch with new access token...");
                return fetchUserProfile(); 
            }
        }

        console.error("Error fetching profile:", err.message);
        return null;
    }
};



export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        console.log("Login Request:", { email, password });

        // Retrieve CSRF token from cookies
        const csrftoken = Cookies.get("csrftoken");
        if (!csrftoken) {
            console.warn("No CSRF token found. Django may reject the request.");
        }

        const response = await axios.post<AuthResponse>(
            `${API_BASE_URL}/login/`,
            { email, password },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken || "", // Include CSRF token in request headers
                },
                withCredentials: true, // Ensure cookies are sent
            }
        );

        console.log("Login Successful:", response.data);

        // Store tokens in cookies
        Cookies.set("access_token", response.data.access, { expires: 7, secure: true, sameSite: "Lax" });
        Cookies.set("refresh_token", response.data.refresh, { expires: 30, secure: true, sameSite: "Lax" });

        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Login Failed:", err.message);

        // Log the actual response data
        if (err.response) {
            console.error("Response Data:", err.response.data);
            console.error("Response Status:", err.response.status);
        }

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

// export const requestPasswordReset = async (email: string) => {
//     return axios.post(`${API_BASE_URL}/password_reset/`, { email });
// };

// export const validateResetToken = async (token: string) => {
//     return axios.post(`${API_BASE_URL}/password_reset/validate_token/`, { token });
// };

// export const resetPassword = async (token: string, password: string) => {
//     return axios.post(`${API_BASE_URL}/password_reset/confirm/`, { token, password });
// };

export const sendMagicLoginEmail = async (email: string) => {
    return axios.post(`${API_BASE_URL}/send-magic-link/`, { email });
};

export const magicLogin = async (token: string) => {
    return axios.post(`${API_BASE_URL}/auth-login/`, { token }, { withCredentials: true });
};

// Update password & log out after change
export const updatePassword = async (password: string) => {
    const token = Cookies.get("access_token");

    try {
        const response = await axios.post(
            `${API_BASE_URL}/change-password/`,
            { password },
            { 
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (response.status === 200) {
            console.log("Password updated successfully. Logging out...");

            // Remove tokens from cookies
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");

            // Dispatch logout event (if needed elsewhere)
            window.dispatchEvent(new Event("logout"));

            return response.data;
        }
    } catch (error) {
        console.error("Error updating password:", error);
        throw new Error("Failed to update password.");
    }
};

// Profile functions
export const updateUserProfile = async (first_name: string, last_name: string): Promise<any> => {
    const token = Cookies.get("access_token");

    const response = await axios.post(
        `${API_BASE_URL}/update-profile/`,
        { first_name, last_name },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const deleteUserAccount = async (): Promise<any> => {
    const token = Cookies.get("access_token");

    const response = await axios.delete(`${API_BASE_URL}/delete-account/`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
};

// widgets:
export const saveWidgetPreferences = async (widgetId: string, preferences: object) => {
    const token = Cookies.get("access_token");
    if (!token) {
        console.error("No access token found. Cannot save widget preferences.");
        return;
    }

    try {
        await axios.put(
            `${API_BASE_URL}/widgets/${widgetId}/`,
            preferences,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`Widget ${widgetId} preferences saved successfully.`);
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error(`Error saving preferences for widget ${widgetId}:`, err.message);
        if (err.response) {
            console.error("Response Data:", err.response.data);
        }
    }
};

export const fetchUserWidgets = async (): Promise<any[] | null> => {
    const token = Cookies.get("access_token");
    if (!token) {
        console.warn("No access token found. Cannot fetch widgets.");
        return null;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/widgets/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched user widgets:", response.data);
        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Error fetching user widgets:", err.message);
        if (err.response) {
            console.error("Response Data:", err.response.data);
        }
        return null;
    }
};
