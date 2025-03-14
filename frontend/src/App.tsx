import SidebarButton from "./components/SidebarButton";
import GridLayout from "./components/GridDashboard"; 
import { DarkModeProvider } from "context/DarkModeContext";
import { AuthProvider } from "context/AuthContext";
import { BrowserRouter as Router, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { magicLogin } from "./api/auth";

const AuthRedirect = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        const processToken = async () => {
            if (token) {
                try {
                    await magicLogin(token);

                    if (Cookies.get("verification_success")) {
                        window.dispatchEvent(new Event("email-verified"));
                        Cookies.remove("verification_success");
                    } else {
                        window.dispatchEvent(new Event("magic-login-success"));
                    }

                    navigate("/");
                } catch (error) {
                    console.error("Login failed");
                }
            }
        };

        processToken();
    }, [token, navigate]);

    return null;
};

function App() {
    return (
        <AuthProvider>
            <DarkModeProvider>
                <Router>
                    <div className="flex h-screen">
                        {/* Sidebar Button */}
                        <SidebarButton />

                        {/* Grid Layout (Main Content) */}
                        <div className="flex-1 p-10">
                            <h1 className="text-3xl font-bold">Widgets</h1>
                            <GridLayout /> 
                        </div>
                    </div>
                    <AuthRedirect />
                </Router>
            </DarkModeProvider>
        </AuthProvider>
    );
}

export default App;
