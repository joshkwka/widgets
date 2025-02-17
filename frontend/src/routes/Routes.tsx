// /src/routes/Routes.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";
// import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
