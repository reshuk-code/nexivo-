import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAuth } from './auth/AuthContext';
import { Helmet } from 'react-helmet-async';

// Custom CSS for Swiper
const swiperStyles = `
  .swiper-button-next,
  .swiper-button-prev {
    color: #111 !important;
    background: #fff;
    width: 50px !important;
    height: 50px !important;
    border: 2px solid #111;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    background: #111;
    color: #fff !important;
  }
  
  .swiper-button-next::after,
  .swiper-button-prev::after {
    font-size: 20px !important;
    font-weight: bold;
  }
  
  .swiper-pagination-bullet {
    background: #111 !important;
    opacity: 0.3;
    transition: all 0.3s ease;
  }
  
  .swiper-pagination-bullet-active {
    opacity: 1;
    background: #111 !important;
  }
`;

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://nexivo.onrender.com';

const companyTypes = [
  'IT', 'Finance', 'Education', 'Healthcare', 'Manufacturing', 'Retail', 'Other'
];
const professions = [
  'Developer', 'Designer', 'Manager', 'Student', 'Freelancer', 'Other'
];

// Helper to get Google Drive image URL from file ID or old URL
function getImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http')) return img; // Cloudinary or external
  // Google Drive/fileId मात्र भएमा
  const match = img.match(/[-\w]{25,}/);
  if (match) return `${BACKEND_BASE_URL}/v1/api/drive/image/${match[0]}`;
  return '';
}

// SEO/meta tags set गर्ने function
function updateServicesMetaTags() {
  const title = "Nexivo Services | Affordable Web Design, IT Solutions in Nepal";
  const description = "Discover Nexivo's range of digital services: web design, development, IT solutions, cloud, ecommerce, and more. Grow your business with us!";
  const keywords = "services, web design, IT solutions, nexivo, digital services, ecommerce, cloud, business, Nepal, affordable website";
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

export default function Services() {
  const [services, setServices] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [enrollmentModal, setEnrollmentModal] = useState({ open: false, service: null });
  const [userType, setUserType] = useState('individual');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyType: '',
    companyName: '',
    employees: '',
    turnover: '',
    profession: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    fetch(BACKEND_BASE_URL + '/v1/api/services')
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    updateServicesMetaTags();
  }, []);

  const handleEnroll = (service) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setEnrollmentModal({ open: true, service });
    setUserType('individual');
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: '',
      companyType: '',
      companyName: '',
      employees: '',
      turnover: '',
      profession: '',
      message: ''
    });
  };

  const handleSubmitEnrollment = async () => {
    setLoading(true);
    try {
      const enrollmentData = {
        ...formData,
        userType,
        serviceId: enrollmentModal.service._id,
        serviceName: enrollmentModal.service.name,
        userId: user._id
      };
      const res = await fetch(BACKEND_BASE_URL + '/v1/api/services/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(enrollmentData)
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: 'Enrollment submitted successfully! We will contact you soon.', severity: 'success' });
        setEnrollmentModal({ open: false, service: null });
        setFormData({
          name: '',
          email: '',
          phone: '',
          companyType: '',
          companyName: '',
          employees: '',
          turnover: '',
          profession: '',
          message: ''
        });
      } else {
        setSnackbar({ open: true, message: data.error || 'Failed to submit enrollment.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit enrollment.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box id="services" sx={{ py: 8, bgcolor: '#f8f8f8' }}>
      <Helmet>
        <title>IT Services in Nepal | Web Design, Development, Digital Solutions | Nexivo</title>
        <meta name="description" content="Explore Nexivo's IT services: web design, development, cloud, ecommerce, digital solutions in Nepal. Grow your business with our expert team." />
        <meta name="keywords" content="IT services, web design, web development, digital solutions, ecommerce, cloud, Nepal, nexivo" />
        <meta property="og:image" content="https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg" />
        <link rel="canonical" href="https://www.reshuksapkota.com.np/services" />
      </Helmet>
      <style>{swiperStyles}</style>
      <Container>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
          Our IT Services in Nepal
        </h1>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 500, textAlign: 'center', marginBottom: 16, color: '#444' }}>
          Web Design, Development, Cloud, Ecommerce & More
        </h2>
        
        {services.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins', mb: 2 }}>
              No services currently available
            </Typography>
            <Typography variant="body1" sx={{ color: '#888', fontFamily: 'Poppins' }}>
              Please check back later for our latest services.
            </Typography>
          </Box>
        ) : services.length > 3 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            style={{ paddingBottom: 50 }}
          >
            {services.map((s, i) => {
              // items fallback: string आयो भने split गर्ने
              const tagList = Array.isArray(s.items) ? s.items : (typeof s.items === 'string' ? s.items.split(',').map(i => i.trim()).filter(Boolean) : []);
              return (
                <SwiperSlide key={s._id || i} style={{ height: '100%' }}>
                  <Paper elevation={8} sx={{
                    p: 5,
                    textAlign: 'center',
                    borderRadius: 0,
                    border: '2px solid #111',
                    boxShadow: 'none',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: '0 0 0 4px #000', transform: 'scale(1.03)' },
                    minHeight: 480,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#fff',
                    mb: 2
                  }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                      {getImageUrl(s.image) && (
                        <img
                          src={getImageUrl(s.image)}
                          alt={s.name}
                          style={{
                            width: '100%',
                            height: 180,
                            objectFit: 'cover',
                            borderRadius: 12,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            marginBottom: 12,
                            cursor: 'pointer',
                          }}
                          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      )}
                      <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: '#111', letterSpacing: 1, fontFamily: 'Poppins' }}>{s.name}</Typography>
                      <Typography sx={{ color: '#222', fontSize: 18, mb: 2, fontWeight: 500 }}>{s.description}</Typography>
                      <Typography sx={{ color: '#000', fontSize: 15, mb: 2, fontWeight: 700, letterSpacing: 1 }}>{s.category}</Typography>
                      {tagList.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                          {tagList.map((item, idx) => (
                            <Chip key={idx} label={item} sx={{ bgcolor: '#f5f5f5', color: '#222', fontWeight: 600, fontFamily: 'Poppins', borderRadius: 1 }} />
                          ))}
                        </Stack>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      color="inherit"
                      sx={{
                        mt: 4,
                        borderRadius: 0,
                        fontWeight: 700,
                        fontFamily: 'Poppins',
                        textTransform: 'uppercase',
                        fontSize: 18,
                        px: 5,
                        py: 1.5,
                        boxShadow: 'none',
                        bgcolor: '#111',
                        color: '#fff',
                        '&:hover': { bgcolor: '#fff', color: '#111', border: '2px solid #111' }
                      }}
                      onClick={() => handleEnroll(s)}
                    >
                      Enroll Now
                    </Button>
                  </Paper>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {services.map((s, i) => {
              // items fallback: string आयो भने split गर्ने
              const tagList = Array.isArray(s.items) ? s.items : (typeof s.items === 'string' ? s.items.split(',').map(i => i.trim()).filter(Boolean) : []);
              return (
                <Grid item xs={12} md={5} key={s._id || i} style={{ height: '100%' }}>
                  <Paper elevation={8} sx={{
                    p: 5,
                    textAlign: 'center',
                    borderRadius: 0,
                    border: '2px solid #111',
                    boxShadow: 'none',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: '0 0 0 4px #000', transform: 'scale(1.03)' },
                    minHeight: 480,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#fff',
                    mb: 2
                  }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                      {getImageUrl(s.image) && (
                        <img
                          src={getImageUrl(s.image)}
                          alt={s.name}
                          style={{
                            width: '100%',
                            height: 180,
                            objectFit: 'cover',
                            borderRadius: 12,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            marginBottom: 12,
                            cursor: 'pointer',
                          }}
                          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      )}
                      <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: '#111', letterSpacing: 1, fontFamily: 'Poppins' }}>{s.name}</Typography>
                      <Typography sx={{ color: '#222', fontSize: 18, mb: 2, fontWeight: 500 }}>{s.description}</Typography>
                      <Typography sx={{ color: '#000', fontSize: 15, mb: 2, fontWeight: 700, letterSpacing: 1 }}>{s.category}</Typography>
                      {tagList.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                          {tagList.map((item, idx) => (
                            <Chip key={idx} label={item} sx={{ bgcolor: '#f5f5f5', color: '#222', fontWeight: 600, fontFamily: 'Poppins', borderRadius: 1 }} />
                          ))}
                        </Stack>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      color="inherit"
                      sx={{
                        mt: 4,
                        borderRadius: 0,
                        fontWeight: 700,
                        fontFamily: 'Poppins',
                        textTransform: 'uppercase',
                        fontSize: 18,
                        px: 5,
                        py: 1.5,
                        boxShadow: 'none',
                        bgcolor: '#111',
                        color: '#fff',
                        '&:hover': { bgcolor: '#fff', color: '#111', border: '2px solid #111' }
                      }}
                      onClick={() => handleEnroll(s)}
                    >
                      Enroll Now
                    </Button>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Enrollment Modal */}
        <Dialog
          open={enrollmentModal.open}
          onClose={() => setEnrollmentModal({ open: false, service: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 0, boxShadow: '0 8px 32px #0002', bgcolor: '#fff', border: '2px solid #111' }
          }}
        >
          <DialogTitle sx={{
            bgcolor: '#111',
            color: 'white',
            fontWeight: 700,
            fontFamily: 'Poppins',
            textAlign: 'center',
            letterSpacing: 1
          }}>
            Enroll in {enrollmentModal.service?.name}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup
                row
                value={userType}
                onChange={e => setUserType(e.target.value)}
              >
                <FormControlLabel value="individual" control={<Radio sx={{ color: '#111' }} />} label="Individual" />
                <FormControlLabel value="organization" control={<Radio sx={{ color: '#111' }} />} label="Organization/Company" />
              </RadioGroup>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={userType === 'organization' ? 'Contact Person Name' : 'Full Name'}
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ style: { color: '#111' } }}
                  InputProps={{ style: { color: '#111', background: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ style: { color: '#111' } }}
                  InputProps={{ style: { color: '#111', background: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ style: { color: '#111' } }}
                  InputProps={{ style: { color: '#111', background: '#fff' } }}
                />
              </Grid>
              {userType === 'organization' && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ color: '#111' }}>Company Type</InputLabel>
                      <Select
                        value={formData.companyType}
                        label="Company Type"
                        onChange={e => handleInputChange('companyType', e.target.value)}
                        required
                        sx={{ color: '#111', background: '#fff' }}
                      >
                        {companyTypes.map(type => (
                          <MenuItem value={type} key={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={formData.companyName}
                      onChange={e => handleInputChange('companyName', e.target.value)}
                      required
                      sx={{ mb: 2 }}
                      InputLabelProps={{ style: { color: '#111' } }}
                      InputProps={{ style: { color: '#111', background: '#fff' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="No. of Employees"
                      value={formData.employees}
                      onChange={e => handleInputChange('employees', e.target.value)}
                      required
                      sx={{ mb: 2 }}
                      InputLabelProps={{ style: { color: '#111' } }}
                      InputProps={{ style: { color: '#111', background: '#fff' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Avg. Turnover (USD)"
                      value={formData.turnover}
                      onChange={e => handleInputChange('turnover', e.target.value)}
                      required
                      sx={{ mb: 2 }}
                      InputLabelProps={{ style: { color: '#111' } }}
                      InputProps={{ style: { color: '#111', background: '#fff' } }}
                    />
                  </Grid>
                </>
              )}
              {userType === 'individual' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: '#111' }}>Profession/Post</InputLabel>
                    <Select
                      value={formData.profession}
                      label="Profession/Post"
                      onChange={e => handleInputChange('profession', e.target.value)}
                      required
                      sx={{ color: '#111', background: '#fff' }}
                    >
                      {professions.map(prof => (
                        <MenuItem value={prof} key={prof}>{prof}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Why do you want to enroll in this service?"
                  multiline
                  rows={3}
                  value={formData.message}
                  onChange={e => handleInputChange('message', e.target.value)}
                  placeholder="Tell us about your goals and expectations..."
                  sx={{ mb: 2 }}
                  InputLabelProps={{ style: { color: '#111' } }}
                  InputProps={{ style: { color: '#111', background: '#fff' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #eee' }}>
            <Button
              onClick={() => setEnrollmentModal({ open: false, service: null })}
              sx={{ fontWeight: 600, color: '#111', borderRadius: 0 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEnrollment}
              variant="contained"
              disabled={loading || !formData.name || !formData.email || !formData.phone || (userType === 'organization' && (!formData.companyType || !formData.companyName || !formData.employees || !formData.turnover)) || (userType === 'individual' && !formData.profession)}
              sx={{
                fontWeight: 700,
                borderRadius: 0,
                px: 4,
                py: 1.5,
                bgcolor: '#111',
                color: '#fff',
                '&:hover': { bgcolor: '#fff', color: '#111', border: '2px solid #111' }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Enrollment'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
} 