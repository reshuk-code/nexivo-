import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { WorkOutline, LocationOn, Schedule, Description } from '@mui/icons-material';
import Loader from './Loader';

const BASE_URL = 'https://nexivo.onrender.com';

// SEO/meta tags set गर्ने function
function updateVacancyMetaTags() {
  const title = "Careers & Job Openings at Nexivo | IT Jobs in Nepal";
  const description = "Explore latest job vacancies at Nexivo. Join our team of passionate innovators. Software developer jobs, IT jobs, freshers welcome!";
  const keywords = "job, vacancy, careers, software developer, IT jobs, nexivo, jobs in nepal, tech jobs, freshers, hiring";
  const url = window.location.href;
  const image = "https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg";

  document.title = title;

  const metaTags = [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: url },
    { name: 'keywords', content: keywords }
  ];

  metaTags.forEach(({ property, name, content }) => {
    let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${property || name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

export default function Vacancy() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    message: '', 
    cv: null 
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    updateVacancyMetaTags();
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v1/api/vacancy`);
      const data = await response.json();
      setVacancies(data);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (vacancy) => {
    setSelectedVacancy(vacancy);
    setApplyOpen(true);
    setForm({ name: '', email: '', phone: '', message: '', cv: null });
    setAlert(null);
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFormChange('cv', file);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.cv) {
      setAlert({ type: 'error', message: 'All fields are required.' });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('message', form.message);
    formData.append('cv', form.cv);
    formData.append('vacancyId', selectedVacancy._id);

    try {
      const response = await fetch(`${BASE_URL}/v1/api/vacancy/apply`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Application submitted successfully!' });
        setForm({ name: '', email: '', phone: '', message: '', cv: null });
        setTimeout(() => {
          setApplyOpen(false);
        }, 2000);
      } else {
        setAlert({ type: 'error', message: data.error || 'Application submission failed.' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Application submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Full-time': return '#4caf50';
      case 'Part-time': return '#ff9800';
      case 'Internship': return '#2196f3';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Box sx={{ py: 8, bgcolor: '#fafafa', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          fontWeight={700} 
          sx={{ 
            mb: 2, 
            fontFamily: 'Poppins', 
            textAlign: 'center', 
            color: '#111',
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          Open Positions
        </Typography>
        
        <Typography 
          sx={{ 
            textAlign: 'center', 
            color: '#666', 
            mb: 6, 
            fontSize: '1.1rem',
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Exciting opportunities to join our team. Take your career forward with us.
        </Typography>

        {vacancies.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#888', fontSize: '1.2rem' }}>
              No positions available at the moment. Please check back later.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {vacancies.map((vacancy) => (
              <Grid item xs={12} md={6} key={vacancy._id}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    borderRadius: 3, 
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#000',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      sx={{ 
                        color: '#111',
                        fontFamily: 'Poppins',
                        lineHeight: 1.2
                      }}
                    >
                      {vacancy.title}
                    </Typography>
                    <Chip 
                      label={vacancy.type} 
                      sx={{ 
                        bgcolor: getTypeColor(vacancy.type),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }} 
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ color: '#666', mr: 1, fontSize: 20 }} />
                      <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                        {vacancy.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Schedule sx={{ color: '#666', mr: 1, fontSize: 20 }} />
                      <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                        Deadline: {formatDate(vacancy.deadline)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Description sx={{ color: '#666', mr: 1, mt: 0.2, fontSize: 20 }} />
                      <Typography 
                        sx={{ 
                          color: '#444', 
                          fontSize: '0.95rem',
                          lineHeight: 1.6
                        }}
                      >
                        {vacancy.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Button 
                    variant="contained" 
                    fullWidth
                    size="large"
                    onClick={() => handleApply(vacancy)}
                    sx={{ 
                      bgcolor: '#111',
                      color: 'white',
                      fontWeight: 600,
                      fontFamily: 'Poppins',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      '&:hover': {
                        bgcolor: '#000'
                      }
                    }}
                  >
                    Apply Now
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Apply Dialog */}
        <Dialog 
          open={applyOpen} 
          onClose={() => setApplyOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ 
            fontFamily: 'Poppins', 
            fontWeight: 600,
            borderBottom: '1px solid #e0e0e0'
          }}>
            Apply for {selectedVacancy?.title}
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {alert && (
              <Alert 
                severity={alert.type} 
                sx={{ mb: 3 }}
                onClose={() => setAlert(null)}
              >
                {alert.message}
              </Alert>
            )}
            
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              label="Phone Number"
              value={form.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              label="Message (optional)"
              value={form.message}
              onChange={(e) => handleFormChange('message', e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ 
                mb: 3,
                borderColor: '#111',
                color: '#111',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              {form.cv ? form.cv.name : 'Upload CV (PDF, DOCX, JPG, PNG)'}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setApplyOpen(false)}
              sx={{ 
                color: '#666',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={submitting}
              sx={{ 
                bgcolor: '#111',
                color: 'white',
                fontWeight: 600,
                '&:hover': { bgcolor: '#000' },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 