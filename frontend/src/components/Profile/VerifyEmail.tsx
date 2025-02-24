import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";

const VerifyEmail = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const { setIsLoggedIn, setUser } = useAuth();
    const [message, setMessage] = useState("Verifying...");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/verify-email/${uid}/${token}/`)
            .then(async () => {
                setMessage("Email verified! Logging you in...");
                
                // Automatically log in user after verification
                const loginResponse = await axios.post(`${process.env.REACT_APP_API_URL}/auto-login/`, { uid });
                
                Cookies.set("access_token", loginResponse.data.access, { expires: 7 });
                Cookies.set("refresh_token", loginResponse.data.refresh, { expires: 30 });

                setUser(loginResponse.data.user);
                setIsLoggedIn(true);

                setTimeout(() => navigate("/"), 3000);
            })
            .catch(() => {
                setMessage("Invalid or expired verification link.");
            });
    }, [uid, token, navigate, setIsLoggedIn, setUser]);

    return <div className="text-center">{message}</div>;
};

export default VerifyEmail;
