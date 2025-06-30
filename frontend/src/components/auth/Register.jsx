import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from './AuthContext';
import VerifyEmail from './VerifyEmail';

export default function Register({ onSwitch, onVerified }) {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerify, setShowVerify] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async () => {
    setError(''); setSuccess('');
    const res = await register(form);
    if (res.message) {
      setSuccess(res.message);
      setTimeout(() => setShowVerify(true), 100);
    } else if (res.error === 'Account limit reached') {
      setError('यो इमेलबाट अधिकतम ५ वटा अकाउन्ट मात्र बनाउन सकिन्छ। कृपया अर्को इमेल प्रयोग गर्नुहोस्।');
    } else setError(res.error || 'Registration failed');
  };

  if (showVerify) {
    return <VerifyEmail email={form.email} onSuccess={onVerified || onSwitch} />;
  }

  return (
    <Box sx={{ maxWidth: 360, mx: 'auto', mt: 6, p: 3, borderRadius: 3, boxShadow: 2, bgcolor: '#fff' }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField label="Username" name="username" fullWidth margin="normal" value={form.username} onChange={handleChange} disabled={loading} />
      <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleChange} disabled={loading} />
      <TextField label="Password" name="password" type="password" fullWidth margin="normal" value={form.password} onChange={handleChange} disabled={loading} />
      <TextField label="Phone" name="phone" fullWidth margin="normal" value={form.phone} onChange={handleChange} disabled={loading} />
      <Button fullWidth variant="contained" sx={{ bgcolor: '#000', color: '#fff', mt: 2 }} onClick={handleRegister} disabled={loading}>
        {loading ? <CircularProgress size={22} /> : 'Register'}
      </Button>
      <Button fullWidth sx={{ mt: 1, textTransform: 'none' }} onClick={onSwitch}>Already have an account? Login</Button>
    </Box>
  );
} 