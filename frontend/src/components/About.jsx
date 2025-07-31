import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <Box id="about" sx={{ py: 8, bgcolor: '#fff' }}>
      <Helmet>
        <title>About Nexivo | IT Solutions & Digital Services in Nepal</title>
        <meta name="description" content="Learn about Nexivo, a leading IT company in Nepal providing web development, mobile apps, AI/ML, and digital transformation services." />
        <meta name="keywords" content="about nexivo, IT company Nepal, web development, digital services, AI, ML, mobile apps" />
      </Helmet>
      <Container>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
          About Nexivo
        </h1>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 500, textAlign: 'center', marginBottom: 16, color: '#444' }}>
          Leading IT Solutions & Digital Services in Nepal
        </h2>
        <Typography sx={{ color: '#444', fontSize: 18, maxWidth: 700, mx: 'auto', textAlign: 'center' }}>
          Nexivo is a large-scale IT company delivering digital transformation for global clients. Our team of experts crafts innovative solutions in web, mobile, AI/ML, and design, helping businesses grow and succeed in the digital era.
        </Typography>
      </Container>
    </Box>
  );
} 