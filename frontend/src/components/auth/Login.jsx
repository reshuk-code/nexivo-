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
  const [accounts, setAccounts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleSendOTP = async () => {
    setError(''); setSuccess('');
    const res = await sendOTP(email);
    if (res.accounts) {
      setAccounts(res.accounts);
      setOtpSent(true);
      setSuccess('OTP sent to your email.' + (res.accounts.length > 1 ? ' Please select your account.' : ''));
      if (res.accounts.length === 1) {
        setSelectedUserId(res.accounts[0]._id);
      }
    } else if (res.message) {
      setOtpSent(true); setSuccess('OTP sent to your email.');
    } else setError(res.error || 'Failed to send OTP');
  };

  const handleLogin = async () => {
    setError(''); setSuccess('');
    if (!selectedUserId) {
      setError('Please select your account.');
      return;
    }
    const res = await login(email, code, selectedUserId);
    if (res.success) {
      setSuccess('Login successful!');
      // loginUser(res.user, res.token); // If you have a loginUser function, call it here
    } else {
      setError(res.error || 'Login failed');
    }
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
      {otpSent && accounts.length > 1 && (
        <div>
          <Typography variant="subtitle1">Choose your account</Typography>
          {accounts.map(acc => (
            <Button
              key={acc._id}
              variant={selectedUserId === acc._id ? 'contained' : 'outlined'}
              sx={{ m: 0.5 }}
              onClick={() => setSelectedUserId(acc._id)}
            >
              {acc.username} ({acc.role}, {acc.status})
            </Button>
          ))}
        </div>
      )}
      {otpSent && (
        <>
          <TextField label="OTP Code" fullWidth margin="normal" value={code} onChange={e => setCode(e.target.value)} disabled={loading} />
          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: '#000', color: '#fff', mb: 2 }}
            onClick={handleLogin}
            disabled={loading || !code || (accounts.length > 0 && !selectedUserId)}
          >
            {loading ? <CircularProgress size={22} /> : 'Login'}
          </Button>
        </>
      )}
      <Button fullWidth sx={{ mt: 1, textTransform: 'none' }} onClick={onSwitch}>Don't have an account? Register</Button>
    </Box>
  );
} 