import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/login-page/LoginPage";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/forgot-password-page/ForgotPasswordPage";
import HomePage from "./pages/HomePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;