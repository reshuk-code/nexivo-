import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero-image.jpg';
import { Helmet } from 'react-helmet-async';

export default function Hero() {
  const navigate = useNavigate();
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: 2, textAlign: 'center', bgcolor: '#fff' }}>
      <Helmet>
        <title>Web Development & IT Solutions in Nepal | NEXIVO</title>
        <meta name="description" content="NEXIVO provides web development, IT solutions, digital services in Nepal. Affordable, professional, and innovative." />
        <meta name="keywords" content="web development, IT solutions, digital services, Nepal, mobile apps, UI/UX, AI, ML, nexivo" />
        <meta property="og:image" content="https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg" />
        <link rel="canonical" href="https://www.reshuksapkota.com.np/" />
      </Helmet>
      <Container maxWidth="md">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '2.5rem', marginBottom: 16 }}>
          NEXIVO - Web Development & IT Solutions in Nepal
        </h1>
        <img 
          src={heroImg} 
          alt="NEXIVO IT Solutions and Digital Services Hero" 
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