import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
  const [showAccountSelect, setShowAccountSelect] = useState(false);
  const [accountOptions, setAccountOptions] = useState([]);

  const handleSendOTP = async () => {
    setError(''); setSuccess('');
    const res = await sendOTP(email);
    if (res.accounts) {
      setAccounts(res.accounts);
      setOtpSent(true);
      setSuccess('OTP sent to your email. Please select your account.');
    } else if (res.message) {
      setOtpSent(true); setSuccess('OTP sent to your email.');
    } else setError(res.error || 'Failed to send OTP');
  };

  const handleLogin = async () => {
    setError(''); setSuccess('');
    const res = await login(email, code, accounts.length > 1 ? selectedUserId : undefined);
    if (res.multiple) {
      setAccounts(res.accounts);
      setOtpSent(true);
      setSuccess('Multiple accounts found. Please select your account.');
    } else if (res.user) {
      setSuccess('Login successful!');
      loginUser(res.user, res.token);
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleAccountSelect = async (userId) => {
    setSelectedUserId(userId);
    setShowAccountSelect(false);
    const res = await fetch('/v1/api/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: code, userId })
    });
    const data = await res.json();
    if (data.user) loginUser(data.user, data.token);
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
      {otpSent && accounts.length > 0 && (
        <div>
          <h3>Choose your account</h3>
          {accounts.map(acc => (
            <button key={acc._id} onClick={() => handleAccountSelect(acc._id)}>
              {acc.username} ({acc.role}, {acc.status})
            </button>
          ))}
        </div>
      )}
      {otpSent && <>
        <TextField label="OTP Code" fullWidth margin="normal" value={code} onChange={e => setCode(e.target.value)} disabled={loading} />
        <Button fullWidth variant="contained" sx={{ bgcolor: '#000', color: '#fff', mb: 2 }} onClick={handleLogin} disabled={loading || !code || (accounts.length > 1 && !selectedUserId)}>
          {loading ? <CircularProgress size={22} /> : 'Login'}
        </Button>
      </>}
      <Button fullWidth sx={{ mt: 1, textTransform: 'none' }} onClick={onSwitch}>Don't have an account? Register</Button>
    </Box>
  );
} 