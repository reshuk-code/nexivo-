import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
    <Helmet>
        <title>About | Nexivo</title>
        <meta name="description" content="Learn more about Nexivo, our mission, and our team." />
        <meta property="og:title" content="About | Nexivo" />
        <meta property="og:description" content="Learn more about Nexivo, our mission, and our team." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/about" />
        <meta property="og:image" content="https://yourdomain.com/your-og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
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