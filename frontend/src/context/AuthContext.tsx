import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import Cookies from "js-cookie";
import { fetchUserProfile, logoutUser, refreshAccessToken } from "../api/auth";

interface AuthContextType {
  isLoggedIn: boolean;
  user: { first_name: string; last_name: string; email: string } | null;
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { first_name: string; last_name: string; email: string } | null) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!Cookies.get("access_token"));
  const [user, setUser] = useState<{ first_name: string; last_name: string; email: string } | null>(null);

  // Initial auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("access_token");
      if (!token) {
        console.log("No token found, user is not logged in.");
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      
      try {
        const userProfile = await fetchUserProfile();
        if (userProfile) {
          console.log("User Profile Loaded:", userProfile);
          setUser(userProfile); 
          setIsLoggedIn(true);
        } else {
          console.log("User profile is null, logging out.");
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.warn("Fetching user profile failed, logging out.");
        setIsLoggedIn(false);
        setUser(null);
      }
    };
  
    checkAuth();
  }, []);

  // Listen for "magic-login-success" event to refresh auth state
  useEffect(() => {
    const handleMagicLoginSuccess = async () => {
      const token = Cookies.get("access_token");
      if (token) {
        try {
          const userProfile = await fetchUserProfile();
          if (userProfile) {
            console.log("Magic login event: User Profile Loaded:", userProfile);
            setUser(userProfile);
            setIsLoggedIn(true);
          } else {
            console.warn("Magic login event: User profile is null.");
            setIsLoggedIn(false);
            setUser(null);
          }
        } catch (error) {
          console.warn("Magic login event: Failed to fetch user profile.");
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };

    window.addEventListener("magic-login-success", handleMagicLoginSuccess);
    return () => {
      window.removeEventListener("magic-login-success", handleMagicLoginSuccess);
    };
  }, []);

  useEffect(() => {
    console.log("AuthContext Updated: isLoggedIn =", isLoggedIn, "user =", user); 
  }, [isLoggedIn, user]);

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setUser(null);
  };

  useEffect(() => {
    const handleLogoutEvent = () => {
      console.log("Logout event received. Clearing authentication state.");
      setIsLoggedIn(false);
      setUser(null);
    };

    window.addEventListener("logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("logout", handleLogoutEvent);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn, setUser, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
