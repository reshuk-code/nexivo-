import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Alert, Avatar, Stack } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://nexivo.onrender.com';

const testimonials = [
  {
    name: 'Amit Sharma',
    review: 'The Nexivo team is extremely professional. Our website was delivered on time and exceeded expectations.',
    company: 'Sharma Traders',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Maria Rossi',
    review: 'Excellent support and modern design! Highly recommended for any business.',
    company: 'Rossi Consulting',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Suman Joshi',
    review: 'Their AI/ML solution added great value to our business operations.',
    company: 'Joshi Enterprises',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
  {
    name: 'Rina Müller',
    review: 'The mobile app development experience was very smooth and efficient.',
    company: 'Müller Foods',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    name: 'Bikash Thapa',
    review: 'Working with Nexivo was a pleasure. Communication and results were both outstanding!',
    company: 'Thapa Logistics',
    image: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
  {
    name: 'Lucas Dubois',
    review: 'Their team delivered our project on time and with great quality. Very satisfied!',
    company: 'Dubois Tech',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setSuccess(''); setError('');
    const res = await fetch(BASE_URL + '/v1/api/contact/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } else {
      setError(data.error || 'Failed to send message.');
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    pauseOnHover: true,
  };

  return (
    <Box id="contact" sx={{ py: 8, bgcolor: '#fff' }}>
      <Helmet>
        <title>Contact Nexivo | IT Solutions & Web Development in Nepal</title>
        <meta name="description" content="Contact Nexivo for web development, IT solutions, digital services, and business inquiries in Nepal." />
        <meta name="keywords" content="contact, nexivo, IT solutions, web development, digital services, Nepal" />
        <meta property="og:image" content="https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg" />
        <link rel="canonical" href="https://www.reshuksapkota.com.np/contact" />
      </Helmet>
      <Container>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
          Contact Nexivo
        </h1>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 500, textAlign: 'center', marginBottom: 16, color: '#444' }}>
          IT Solutions & Web Development in Nepal
        </h2>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3, fontFamily: 'Poppins', textAlign: 'center' }}>
          Contact Us
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch"
          direction={{ xs: 'column', md: 'row' }}
          wrap={{ xs: 'wrap', md: 'nowrap' }}
          sx={{ minHeight: 400 }}>
          {/* Left: Testimonials */}
          <Grid item xs={12} md={6} lg={6} sx={{ minWidth: { xs: 0, md: 340 }, display: 'flex', alignItems: 'center' }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee', width: '100%', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', minHeight: 340 }}>
              <Box width="100%">
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontFamily: 'Poppins', color: '#222' }}>
                  What Our Clients Say
                </Typography>
                <Slider {...sliderSettings}>
                  {testimonials.map((t, i) => (
                    <Stack key={i} direction="column" alignItems="center" spacing={2} sx={{ px: 2 }}>
                      <Avatar src={t.image} alt={t.name} sx={{ width: 64, height: 64, mb: 1 }} />
                      <Typography sx={{ fontStyle: 'italic', color: '#444', mb: 1, fontSize: 18, textAlign: 'center' }}>
                        "{t.review}"
                      </Typography>
                      <Typography fontWeight={600} sx={{ color: '#000' }}>{t.name}</Typography>
                      <Typography sx={{ color: '#888', fontSize: 15 }}>{t.company}</Typography>
                    </Stack>
                  ))}
                </Slider>
              </Box>
            </Paper>
          </Grid>
          {/* Right: Contact Form */}
          <Grid item xs={12} md={6} lg={6} sx={{ minWidth: { xs: 0, md: 340 }, display: 'flex', alignItems: 'center' }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee', width: '100%' }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>Send us a message</Typography>
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <input name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ddd', fontFamily: 'Poppins', fontSize: 16 }} required />
                <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ddd', fontFamily: 'Poppins', fontSize: 16 }} required />
                <textarea name="message" placeholder="Message" rows={4} value={form.message} onChange={handleChange} style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ddd', fontFamily: 'Poppins', fontSize: 16 }} required />
                <Button type="submit" variant="contained" sx={{ bgcolor: '#000', color: '#fff', borderRadius: 2, fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none', px: 4, py: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#222' }, transition: 'all 0.2s' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 