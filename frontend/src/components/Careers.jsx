import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Careers() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>Careers - Join NEXIVO IT Solutions</title>
        <meta name="description" content="Join NEXIVO's team of passionate innovators. We welcome undergraduates, freshers, and experienced professionals. Explore career opportunities in IT and technology." />
        <meta name="keywords" content="careers at NEXIVO, IT jobs, technology careers, software development jobs, web development careers, mobile app development jobs" />
        <meta property="og:title" content="Careers - Join NEXIVO IT Solutions" />
        <meta property="og:description" content="Join NEXIVO's team of passionate innovators. Explore career opportunities in IT and technology." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reshuksapkota.com.np/careers" />
        <meta property="og:image" content="https://reshuksapkota.com.np/careers-og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Careers - Join NEXIVO IT Solutions" />
        <meta name="twitter:description" content="Join NEXIVO's team of passionate innovators. Explore career opportunities in IT and technology." />
        <link rel="canonical" href="https://reshuksapkota.com.np/careers" />
      </Helmet>
      
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
    </>
  );
} 