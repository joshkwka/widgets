import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginModal from "./components/LoginModal";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <Router>
      <nav className="p-4 bg-gray-800 text-white">
        <ul className="flex space-x-4">
          <li><Link to="/">Home</Link></li>
          <li><button onClick={() => setShowLogin(true)}>Login</button></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<h1 className="text-center text-3xl mt-10">Welcome</h1>} />
      </Routes>
      {showLogin && <LoginModal />}
    </Router>
  );
}

export default App;
