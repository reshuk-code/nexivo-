import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <Helmet>
        <title>404 - Page Not Found | Nexivo</title>
        <meta name="description" content="Sorry, the page you are looking for does not exist. Go back to Nexivo home or explore our IT services and blogs." />
        <meta name="keywords" content="404, not found, error, nexivo, IT solutions, web development, nepal" />
        <meta property="og:image" content="https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg" />
        <link rel="canonical" href="https://www.reshuksapkota.com.np/404" />
      </Helmet>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '2.5rem', marginBottom: 16 }}>
        404 - Page Not Found
      </h1>
      <h2 style={{ fontFamily: 'Poppins', fontWeight: 500, marginBottom: 16, color: '#444' }}>
        Sorry, this page does not exist.
      </h2>
      <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <a href="/" style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 600 }}>Go to Home</a>
    </div>
  );
} 