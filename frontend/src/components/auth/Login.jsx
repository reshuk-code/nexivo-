import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from './AuthContext';

export default function Login({ onSwitch, verifiedMsg }) {
  const { login, sendOTP, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(verifiedMsg || '');

  const handleSendOTP = async () => {
    setError(''); setSuccess('');
    const res = await sendOTP(email);
    if (res.message) { setOtpSent(true); setSuccess('OTP sent to your email.'); }
    else setError(res.error || 'Failed to send OTP');
  };

  const handleLogin = async () => {
    setError(''); setSuccess('');
    const res = await login(email, code);
    if (res.success) setSuccess('Login successful!');
    else setError(res.error || 'Login failed');
  };

  return (
    <Box sx={{ maxWidth: 360, mx: 'auto', mt: 6, p: 3, borderRadius: 3, boxShadow: 2, bgcolor: '#fff' }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} disabled={otpSent || loading} />
      {!otpSent && <Button fullWidth variant="contained" sx={{ bgcolor: '#000', color: '#fff', mb: 2 }} onClick={handleSendOTP} disabled={loading || !email}>
        {loading ? <CircularProgress size={22} /> : 'Send OTP'}
      </Button>}
      {otpSent && <>
        <TextField label="OTP Code" fullWidth margin="normal" value={code} onChange={e => setCode(e.target.value)} disabled={loading} />
        <Button fullWidth variant="contained" sx={{ bgcolor: '#000', color: '#fff', mb: 2 }} onClick={handleLogin} disabled={loading || !code}>
          {loading ? <CircularProgress size={22} /> : 'Login'}
        </Button>
      </>}
      <Button fullWidth sx={{ mt: 1, textTransform: 'none' }} onClick={onSwitch}>Don't have an account? Register</Button>
    </Box>
  );
} 