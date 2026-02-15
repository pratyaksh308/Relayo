import { useState } from 'react';
import LoginPage from './pages/login-page/LoginPage';
import ForgotPasswordPage from './pages/forgot-password-page/ForgotPasswordPage';
import RegisterPage from './pages/register-page/RegisterPage';

function App() {
  const [page, setPage] = useState('login');

  if (page === 'forgot-password') {
    return <ForgotPasswordPage onBackToLogin={() => setPage('login')} />;
  }

  if (page === 'register') {
    return <RegisterPage onBackToLogin={() => setPage('login')} />;
  }

  return (
    <LoginPage
      onForgotPassword={() => setPage('forgot-password')}
      onSignUp={() => setPage('register')}
    />
  );
}

export default App;
