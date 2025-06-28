import React, { useEffect } from 'react';
import { Box, Typography, Button, Avatar, Stack } from '@mui/material';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, fetchProfile } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { fetchProfile(); }, []);
  if (!user) return null;

  // Helper to extract Google Drive file ID and get backend proxy URL
  const getProfileImage = (img) => {
    if (!img) return undefined;
    // If already a file ID (no slashes, no http), return as is
    if (!img.includes('/') && !img.startsWith('http')) return `http://localhost:3000/v1/api/drive/image/${img}`;
    // If Google Drive URL, extract id param
    const match = img.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) return `http://localhost:3000/v1/api/drive/image/${match[1]}`;
    // If shared link format
    const shareMatch = img.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (shareMatch) return `http://localhost:3000/v1/api/drive/image/${shareMatch[1]}`;
    return undefined;
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 3, borderRadius: 3, boxShadow: 2, bgcolor: '#fff' }}>
      <Stack alignItems="center" spacing={2}>
        <Avatar src={getProfileImage(user.profileImage)} sx={{ width: 80, height: 80, mb: 1 }} />
        <Typography variant="h6" fontWeight={700}>{user.username}</Typography>
        <Typography color="text.secondary">{user.email}</Typography>
        <Typography color="text.secondary">{user.phone}</Typography>
        <Button variant="outlined" sx={{ mt: 2, borderRadius: 2, borderColor: '#000', color: '#000', fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none', '&:hover': { bgcolor: '#000', color: '#fff', borderColor: '#000' } }} onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </Button>
        <Button variant="text" color="error" sx={{ mt: 1 }} onClick={logout}>Logout</Button>
      </Stack>
    </Box>
  );
} 