import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us - NEXIVO IT Solutions</title>
        <meta name="description" content="Learn about NEXIVO, a leading IT company delivering digital transformation solutions. Our expert team specializes in web development, mobile apps, AI/ML, and innovative technology solutions." />
        <meta name="keywords" content="about NEXIVO, IT company, digital transformation, technology solutions, web development company, mobile app development" />
        <meta property="og:title" content="About Us - NEXIVO IT Solutions" />
        <meta property="og:description" content="Learn about NEXIVO, a leading IT company delivering digital transformation solutions for global clients." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reshuksapkota.com.np/about" />
        <meta property="og:image" content="https://reshuksapkota.com.np/about-og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us - NEXIVO IT Solutions" />
        <meta name="twitter:description" content="Learn about NEXIVO, a leading IT company delivering digital transformation solutions." />
        <link rel="canonical" href="https://reshuksapkota.com.np/about" />
      </Helmet>
      
      <Box id="about" sx={{ py: 8, bgcolor: '#fff' }}>
        <Container>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 3, fontFamily: 'Poppins', textAlign: 'center' }}>
            About Nexivo
          </Typography>
          <Typography sx={{ color: '#444', fontSize: 18, maxWidth: 700, mx: 'auto', textAlign: 'center' }}>
            Nexivo is a large-scale IT company delivering digital transformation for global clients. Our team of experts crafts innovative solutions in web, mobile, AI/ML, and design, helping businesses grow and succeed in the digital era.
          </Typography>
        </Container>
      </Box>
    </>
  );
} 