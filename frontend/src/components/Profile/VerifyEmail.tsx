import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";

const VerifyEmail = () => {
    const { uidb64, token } = useParams(); // Updated to match API's expected param names
    const navigate = useNavigate();
    const { setIsLoggedIn, setUser } = useAuth();
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/auth/verify-email/${uidb64}/${token}/`)
            .then(async () => {
                setMessage("Email verified! Logging you in...");

                try {
                    // Automatically log in user after verification
                    const loginResponse = await axios.post(`${process.env.REACT_APP_API_URL}/auth/auto-login/`, { uid: uidb64 });

                    Cookies.set("access_token", loginResponse.data.access, { expires: 7 });
                    Cookies.set("refresh_token", loginResponse.data.refresh, { expires: 30 });

                    setUser(loginResponse.data.user);
                    setIsLoggedIn(true);

                    setTimeout(() => navigate("/"), 3000);
                } catch {
                    setMessage("Email verified! Please log in manually.");
                    setTimeout(() => navigate("/login"), 3000);
                }
            })
            .catch(() => {
                setMessage("Invalid or expired verification link.");
            });
    }, [uidb64, token, navigate, setIsLoggedIn, setUser]);

    return <div className="text-center text-lg font-medium">{message}</div>;
};

export default VerifyEmail;
