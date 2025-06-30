import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Avatar, Stack, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, fetchProfile, token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchProfile();
    // Fetch enrolled vacancies
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://nexivo.onrender.com/v1/api/user/my-vacancy-applications', {
          headers: { Authorization: 'Bearer ' + token }
        });
        const data = await res.json();
        if (Array.isArray(data)) setApplications(data);
      } catch {}
      setLoading(false);
    };
    if (token) fetchApplications();
  }, [token]);
  if (!user) return null;

  // Helper to extract Google Drive file ID and get backend proxy URL
  const getProfileImage = (img) => {
    if (!img) return undefined;
    // If already a file ID (no slashes, no http), return as is
    if (!img.includes('/') && !img.startsWith('http')) return `https://nexivo.onrender.com/v1/api/drive/image/${img}`;
    // If Google Drive URL, extract id param
    const match = img.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) return `https://nexivo.onrender.com/v1/api/drive/image/${match[1]}`;
    // If shared link format
    const shareMatch = img.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (shareMatch) return `https://nexivo.onrender.com/v1/api/drive/image/${shareMatch[1]}`;
    return undefined;
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 3, borderRadius: 3, boxShadow: 2, bgcolor: '#fff' }}>
      <Stack alignItems="center" spacing={2}>
        <Avatar src={getProfileImage(user.profileImage)} sx={{ width: 80, height: 80, mb: 1 }} />
        <Typography variant="h6" fontWeight={700}>{user.username}</Typography>
        <Typography color="text.secondary">{user.email}</Typography>
        <Typography color="text.secondary">{user.phone}</Typography>
        <Typography color="text.secondary" sx={{ fontWeight: 500, mt: 1 }}>
          Profile Status: <Chip label={user.status || 'pending'} color={user.status === 'verified' ? 'success' : user.status === 'completed' ? 'primary' : 'warning'} size="small" />
        </Typography>
        <Button variant="outlined" sx={{ mt: 2, borderRadius: 2, borderColor: '#000', color: '#000', fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none', '&:hover': { bgcolor: '#000', color: '#fff', borderColor: '#000' } }} onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </Button>
        <Button variant="text" color="error" sx={{ mt: 1 }} onClick={logout}>Logout</Button>
      </Stack>
      {/* Enrolled Vacancies Section */}
      <Box sx={{ mt: 4, width: '100%' }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>My Enrolled Vacancies</Typography>
        {loading ? <CircularProgress size={28} /> : applications.length === 0 ? (
          <Typography color="text.secondary">No enrolled vacancies yet.</Typography>
        ) : (
          <Box>
            {applications.map(app => (
              <Card key={app._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
                <CardContent>
                  <Typography fontWeight={600}>{app.vacancyId?.title || 'Vacancy'}</Typography>
                  <Typography color="text.secondary" fontSize={14}>
                    Status: <Chip label={app.status} size="small" color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : app.status === 'reviewed' ? 'info' : 'warning'} />
                  </Typography>
                  <Typography color="text.secondary" fontSize={13}>
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
} 