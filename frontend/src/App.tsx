import SidebarButton from "./components/SidebarButton";
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
                        // This is an email verification flow
                        window.dispatchEvent(new Event("email-verified"));
                        Cookies.remove("verification_success");
                    } else {
                        // This is a password reset flow (normal magic login)
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
                    <div className="flex">
                        <SidebarButton />
                        <div className="flex-1 p-10">
                            <h1 className="text-3xl font-bold">Widgets</h1>
                            <p className="text-gray-600">More content to be added.</p>
                        </div>
                    </div>
                    <AuthRedirect />
                </Router>
            </DarkModeProvider>
        </AuthProvider>
    );
}

export default App;
