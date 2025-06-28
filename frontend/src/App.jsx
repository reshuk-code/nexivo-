import React, { useState, useEffect } from 'react';
import { Box, Snackbar, Alert, Button, TextField, Paper, Slide } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Blogs from './components/Blogs';
import AllBlogs from './components/AllBlogs';
import About from './components/About';
import Careers from './components/Careers';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BlogDetail from './components/BlogDetail';
import Vacancy from './components/Vacancy';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import ProfileEdit from './components/auth/ProfileEdit';
import AdminPanel from './components/admin/AdminPanel';

function AuthFlow() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  if (!user) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login onSwitch={() => setShowRegister(true)} />
    );
  }
  return <Navigate to="/profile" />;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  // Newsletter popup state
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState(null);

  // Cookie consent state
  const [showCookie, setShowCookie] = useState(false);

  // Check localStorage for flags
  useEffect(() => {
    if (!localStorage.getItem('nexivo_cookie_accepted')) {
      setShowCookie(true);
    }
    if (!localStorage.getItem('nexivo_newsletter_subscribed')) {
      setTimeout(() => setShowNewsletter(true), 2000);
    }
  }, []);

  // Newsletter subscribe handler
  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newsletterEmail)) {
      setNewsletterMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await fetch('https://nexivo.onrender.com/v1/api/admin/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterMsg({ type: 'success', text: data.message || 'Subscribed successfully!' });
        setNewsletterEmail('');
        localStorage.setItem('nexivo_newsletter_subscribed', '1');
        setTimeout(() => setShowNewsletter(false), 2000);
      } else {
        setNewsletterMsg({ type: 'error', text: data.error || data.message || 'Subscription failed.' });
      }
    } catch (e) {
      setNewsletterMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Cookie consent handler
  const handleAcceptCookie = () => {
    localStorage.setItem('nexivo_cookie_accepted', '1');
    setShowCookie(false);
  };

  return (
    <AuthProvider>
      <Router>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <Services />
                  <Blogs />
                  <About />
                  <Careers />
                  <Contact />
                </>
              } />
              <Route path="/login" element={<AuthFlow />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
              <Route path="/services" element={<Services />} />
              <Route path="/blogs" element={<AllBlogs />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/vacancy" element={<Vacancy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminPanel />} />
              {/* Add more routes as needed */}
            </Routes>
          </div>
          <Footer />

          {/* Newsletter Popup */}
          <Slide direction="up" in={showNewsletter} mountOnEnter unmountOnExit>
            <Paper elevation={6} sx={{ position: 'fixed', bottom: 24, left: 0, right: 0, mx: 'auto', maxWidth: 400, zIndex: 1400, p: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ fontWeight: 700, fontSize: 20, mb: 1, color: '#222' }}>Subscribe to our Newsletter</Box>
              <Box sx={{ color: '#555', mb: 2, fontSize: 15, textAlign: 'center' }}>Get updates on new jobs, blogs, and more!</Box>
              <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Your email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  sx={{ bgcolor: '#f5f5f5', borderRadius: 1, flex: 1 }}
                  disabled={newsletterLoading}
                />
                <Button variant="contained" onClick={handleNewsletterSubscribe} disabled={newsletterLoading} sx={{ minWidth: 110 }}>
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </Box>
              <Button size="small" sx={{ color: '#888', mt: 0.5 }} onClick={() => setShowNewsletter(false)}>No thanks</Button>
              {newsletterMsg && (
                <Alert severity={newsletterMsg.type} sx={{ mt: 1, width: '100%' }}>{newsletterMsg.text}</Alert>
              )}
            </Paper>
          </Slide>

          {/* Cookie Consent Popup */}
          <Snackbar
            open={showCookie}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ zIndex: 2000 }}
          >
            <Paper elevation={6} sx={{ p: 2, borderRadius: 2, bgcolor: '#222', color: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <span>We use cookies to improve your experience. By using this site, you accept our cookie policy.</span>
              <Button variant="contained" color="primary" size="small" onClick={handleAcceptCookie} sx={{ ml: 2 }}>
                Accept
              </Button>
            </Paper>
          </Snackbar>
        </div>
      </Router>
    </AuthProvider>
  );
}
