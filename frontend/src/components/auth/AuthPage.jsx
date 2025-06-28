import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthPage() {
  const [page, setPage] = useState('login');
  const [verifiedMsg, setVerifiedMsg] = useState('');

  const handleSwitch = (to) => {
    setPage(to);
    setVerifiedMsg('');
  };

  // Register.jsx ले onSwitch मा verify पछि call गर्छ
  const handleVerified = (email) => {
    setPage('login');
    setVerifiedMsg('Email verified! Now you can login.');
  };

  return (
    <>
      {page === 'login' && <Login onSwitch={() => handleSwitch('register')} verifiedMsg={verifiedMsg} />}
      {page === 'register' && <Register onSwitch={() => handleSwitch('login')} onVerified={handleVerified} />}
    </>
  );
} 