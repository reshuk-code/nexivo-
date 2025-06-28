import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Careers() {
  const navigate = useNavigate();
  return (
    <Box id="careers" sx={{ py: 8, bgcolor: '#fafafa' }}>
      <Container>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3, fontFamily: 'Poppins', textAlign: 'center' }}>
          Careers
        </Typography>
        <Typography sx={{ color: '#444', fontSize: 18, maxWidth: 700, mx: 'auto', textAlign: 'center', mb: 2 }}>
          Join our team of passionate innovators. We welcome undergraduates, freshers, and experienced professionals to be part of our journey.
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            size="large" 
            sx={{ borderRadius: 2, borderColor: '#000', color: '#000', fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none', '&:hover': { bgcolor: '#000', color: '#fff', borderColor: '#000' } }}
            onClick={() => navigate('/vacancy')}
          >
            View Open Positions
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 