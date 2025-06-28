import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero-image.jpg';

export default function Hero() {
  const navigate = useNavigate();
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: 2, textAlign: 'center', bgcolor: '#fff' }}>
      <Container maxWidth="md">
        <img 
          src={heroImg} 
          alt="IT Hero" 
          style={{ 
            width: '100%', 
            height: 320, 
            maxHeight: 320, 
            minHeight: 200, 
            objectFit: 'contain', 
            background: '#fff', 
            marginBottom: 32, 
            boxShadow: '0 4px 32px #0001', 
            borderRadius: 0, 
            display: 'block' 
          }} 
        />
        <Typography variant="h2" fontWeight={700} sx={{ fontFamily: 'Poppins', mb: 2, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
          Empowering Digital Innovation
        </Typography>
        <Typography variant="h5" sx={{ color: '#444', mb: 4, fontWeight: 400 }}>
          We build world-class Websites, Mobile Apps, AI/ML Solutions, and UI/UX for global enterprises.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ bgcolor: '#000', color: '#fff', borderRadius: 2, px: 4, py: 1.5, fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#222' }, transition: 'all 0.2s' }}
          onClick={() => navigate('/services')}
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
} 