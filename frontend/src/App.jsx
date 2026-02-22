import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ChatListPage from "./pages/ChatListPage.jsx";

function App() {
  return (
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* App Pages */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat-list" element={<ChatListPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
