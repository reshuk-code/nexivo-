import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Careers() {
  const navigate = useNavigate();
  return (
    <Box id="careers" sx={{ py: 8, bgcolor: '#fafafa' }}>
      <Helmet>
        <title>Careers at Nexivo | Join Our IT Team in Nepal</title>
        <meta name="description" content="Join our team of passionate innovators at Nexivo. We welcome undergraduates, freshers, and experienced professionals to be part of our journey." />
        <meta name="keywords" content="careers, jobs, IT jobs, nexivo, software developer, freshers, nepal" />
        <meta property="og:image" content="https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg" />
        <link rel="canonical" href="https://www.reshuksapkota.com.np/careers" />
      </Helmet>
      <Container>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
          Careers at Nexivo
        </h1>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 500, textAlign: 'center', marginBottom: 16, color: '#444' }}>
          Join Our IT Team in Nepal
        </h2>
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