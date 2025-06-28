import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from './AuthContext';

export default function VerifyEmail({ email: initialEmail = '', onSuccess }) {
  const { verifyEmail, loading } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async () => {
    setError(''); setSuccess('');
    const res = await verifyEmail(email, code);
    if (res.message) {
      setSuccess(res.message);
      if (onSuccess) onSuccess(email);
    } else {
      setError(res.error || 'Verification failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 360, mx: 'auto', mt: 6, p: 3, borderRadius: 3, boxShadow: 2, bgcolor: '#fff' }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Verify Email</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} disabled={!!initialEmail || loading} />
      <TextField label="Verification Code" fullWidth margin="normal" value={code} onChange={e => setCode(e.target.value)} disabled={loading} />
      <Button fullWidth variant="contained" sx={{ bgcolor: '#000', color: '#fff', mt: 2 }} onClick={handleVerify} disabled={loading || !email || !code}>
        {loading ? <CircularProgress size={22} /> : 'Verify'}
      </Button>
    </Box>
  );
} 