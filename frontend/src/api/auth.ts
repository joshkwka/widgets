import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid"; 

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

export const sendMagicLoginEmail = async (email: string) => {
    return axios.post(`${API_BASE_URL}/send-magic-link/`, { email });
};

export const magicLogin = async (token: string) => {
    return axios.post(`${API_BASE_URL}/auth-login/`, { token }, { withCredentials: true });
};

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

            Cookies.remove("access_token");
            Cookies.remove("refresh_token");

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

interface Widget {
    i: string;  // UUID of the widget
    x: number;
    y: number;
    w: number;
    h: number;
    type: string;
  }

interface LayoutData {
    id: number;  // Layout ID
    name: string;
    widgets: Widget[];  // Ensure widgets are typed correctly
    user: number;
  }

export const fetchUserWidgets = async (): Promise<LayoutData[] | null> => {
    const token = Cookies.get("access_token");
    if (!token) {
        console.warn("No access token found. Cannot fetch widgets.");
        return null;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/layouts/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched user widgets:", response.data);

        // Return full layouts, not just widgets
        return response.data.map((layout: any) => ({
            id: layout.id,
            name: layout.name,
            user: layout.user,
            widgets: layout.widgets.map((widget: any) => ({
                i: widget.id,  // Ensure this matches frontend expectations
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
                type: widget.type,
            }))
        }));
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Error fetching user widgets:", err.message);
        return null;
    }
};



export const addWidgetToLayout = async (type: string) => {
    const token = Cookies.get("access_token");
    if (!token) {
        console.error("No access token found. Cannot add widget.");
        return null;
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL}/layouts/`,
            { type }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Widget added:", response.data);
        return response.data; 
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error("Error adding widget:", err.message);
        return null;
    }
};

export const saveWidgetPreferences = async (widgetId: string, widgetType: string, newPreferences: object) => {
    const token = Cookies.get("access_token");
    if (!token) {
        console.error("No access token found. Cannot save widget preferences.");
        return;
    }

    try {
        console.log(`Checking if preferences exist for widget ${widgetId}...`);
        
        // Fetch existing preferences
        const response = await axios.get(`${API_BASE_URL}/widget-preferences/${widgetId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const existingPreferences = response.data.settings || {};
        console.log(`Existing preferences for widget ${widgetId}:`, existingPreferences);

        // Merge new settings with existing settings
        const mergedPreferences = { ...existingPreferences, ...newPreferences };

        console.log(`Updating preferences for widget ${widgetId} with:`, mergedPreferences);

        // Send full payload including `widget_id` and `widget_type`
        await axios.put(
            `${API_BASE_URL}/widget-preferences/${widgetId}/`,
            { 
                widget_id: widgetId,     
                widget_type: widgetType, 
                settings: mergedPreferences 
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log(`Updated preferences for widget ${widgetId}`);

    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response?.status === 404) {
            console.warn(`Preferences not found for widget ${widgetId}. Creating new preferences...`);
            try {
                await axios.post(
                    `${API_BASE_URL}/widget-preferences/`,
                    {
                        widget_id: widgetId,
                        widget_type: widgetType,
                        settings: newPreferences,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log(`Created preferences for widget ${widgetId}`);
            } catch (creationError) {
                console.error(`Error creating widget preferences for ${widgetId}:`, creationError);
            }
        } else {
            console.error(`Error checking/updating preferences for widget ${widgetId}:`, err.message);
        }
    }
};

export const deleteWidgetFromLayout = async (widgetId: string) => {
    const token = Cookies.get("access_token");
    if (!token) {
        console.warn("No access token found. Cannot delete widget.");
        return;
    }

    try {
        // Remove the widget from the layout
        await axios.delete(`${API_BASE_URL}/layouts/${widgetId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`Deleted widget ${widgetId} from layout`);

        // Then delete the widget preferences
        await axios.delete(`${API_BASE_URL}/widget-preferences/${widgetId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`Deleted preferences for widget ${widgetId}`);
        
    } catch (error: unknown) {
        const err = error as AxiosError;
        console.error(`Error deleting widget:`, err.message);
    }
};



export const fetchWidgetPreferences = async (widgetId: string): Promise<any | null> => {
    const token = Cookies.get("access_token");
    if (!token) {
        console.warn("No access token found. Cannot fetch widget preferences.");
        return null;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/widget-preferences/${widgetId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`Fetched preferences for widget ${widgetId}:`, response.data);
        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response?.status === 404) {
            console.warn(`Preferences not found for widget ${widgetId}. Creating default preferences...`);
            await saveWidgetPreferences(widgetId, "clock", { timezone: "America/Los_Angeles", analogMode: false }); 
        } else {
            console.error(`Error fetching preferences for widget ${widgetId}:`, err.message);
        }
        
        return null;
    }
};

