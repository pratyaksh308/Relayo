import { useState } from 'react';
import LoginPage from './pages/login-page/LoginPage';
import ForgotPasswordPage from './pages/forgot-password-page/ForgotPasswordPage';

function App() {
  const [page, setPage] = useState('login');

  if (page === 'forgot-password') {
    return <ForgotPasswordPage onBackToLogin={() => setPage('login')} />;
  }

  return <LoginPage onForgotPassword={() => setPage('forgot-password')} />;
}

export default App;
