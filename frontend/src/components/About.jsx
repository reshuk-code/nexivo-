import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export default function About() {
  return (
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
  );
} 