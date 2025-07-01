import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Link,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Loader from './Loader';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://nexivo.onrender.com';

// Helper to get Google Drive image URL from file ID or old URL
function getThumbnailUrl(img) {
  if (!img) return '';
  if (!img.includes('/') && !img.startsWith('http')) return `${BACKEND_BASE_URL}/v1/api/drive/image/${img}`;
  const match = img.match(/[-\w]{25,}/);
  if (match) return `${BACKEND_BASE_URL}/v1/api/drive/image/${match[1]}`;
  const shareMatch = img.match(/[-\w]{25,}/);
  if (shareMatch) return `${BACKEND_BASE_URL}/v1/api/drive/image/${shareMatch[1]}`;
  return img;
}

// Helper to update meta tags for social sharing
function updateMetaTags(blog) {
  if (!blog) return;
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog.title || 'Check out this blog post';
  const shareDescription = blog.content?.replace(/<[^>]*>/g, '').substring(0, 160) + '...' || 'Interesting read from NEXIVO';
  const shareImage = getThumbnailUrl(blog.thumbnail) || 'https://reshuksapkota.com.np/og-image.jpg';

  // Update document title
  document.title = `${shareTitle} - NEXIVO Blog`;

  // Update or create meta tags
  const metaTags = [
    { property: 'og:title', content: shareTitle },
    { property: 'og:description', content: shareDescription },
    { property: 'og:image', content: shareImage },
    { property: 'og:url', content: shareUrl },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:title', content: shareTitle },
    { name: 'twitter:description', content: shareDescription },
    { name: 'twitter:image', content: shareImage },
    { name: 'twitter:url', content: shareUrl },
    { name: 'description', content: shareDescription },
    { name: 'keywords', content: 'blog, article, NEXIVO, IT solutions' }
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

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', shareUrl);
}

export default function BlogDetail() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(BACKEND_BASE_URL + `/v1/api/blogs/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Blog not found');
        }
        return res.json();
      })
      .then(data => {
        setBlog(data);
        setLoading(false);
        // Update meta tags for social sharing
        updateMetaTags(data);
      })
      .catch(err => {
        console.error('Failed to fetch blog:', err);
        setError(err.message);
        setLoading(false);
      });

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      // Reset to default meta tags
      document.title = 'NEXIVO - Professional IT Solutions & Digital Services';
      const defaultMetaTags = [
        { property: 'og:title', content: 'NEXIVO - Professional IT Solutions & Digital Services' },
        { property: 'og:description', content: 'NEXIVO provides cutting-edge IT solutions, web development, mobile apps, digital transformation, and technology consulting services.' },
        { property: 'og:image', content: 'https://reshuksapkota.com.np/og-image.jpg' },
        { property: 'og:url', content: 'https://reshuksapkota.com.np/' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:title', content: 'NEXIVO - Professional IT Solutions & Digital Services' },
        { name: 'twitter:description', content: 'NEXIVO provides cutting-edge IT solutions, web development, mobile apps, digital transformation, and technology consulting services.' },
        { name: 'twitter:image', content: 'https://reshuksapkota.com.np/twitter-image.jpg' },
        { name: 'description', content: 'NEXIVO provides cutting-edge IT solutions, web development, mobile apps, digital transformation, and technology consulting services.' }
      ];

      defaultMetaTags.forEach(({ property, name, content }) => {
        let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${property || name}"]`);
        if (meta) {
          meta.setAttribute('content', content);
        }
      });

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://reshuksapkota.com.np/');
      }
    };
  }, [id]);

  // Social sharing functions
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog?.title || 'Check out this blog post';
  const shareText = blog?.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...' || 'Interesting read from NEXIVO';

  const handleShare = (platform) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\nRead more: ' + shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
        }).catch(() => {
          setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' });
        });
        return;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !blog) {
    return (
      <Box sx={{ py: 8, bgcolor: '#f8f8f8', minHeight: '60vh' }}>
        <Container>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" sx={{ color: '#666', fontFamily: 'Poppins', mb: 2 }}>
              Blog not found
            </Typography>
            <Typography variant="body1" sx={{ color: '#888', fontFamily: 'Poppins', mb: 3 }}>
              The blog you're looking for doesn't exist or has been removed.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 0,
                fontWeight: 600,
                fontFamily: 'Poppins',
                textTransform: 'uppercase',
                bgcolor: '#111',
                color: '#fff',
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#fff',
                  color: '#111',
                  border: '2px solid #111'
                }
              }}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: '#f8f8f8', minHeight: '60vh' }}>
      <Container maxWidth="md">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4, fontFamily: 'Poppins' }}>
          <Link
            color="inherit"
            href="/"
            sx={{ 
              textDecoration: 'none', 
              color: '#666',
              '&:hover': { color: '#111' },
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            Home
          </Link>
          <Link
            color="inherit"
            href="/#blogs"
            sx={{ 
              textDecoration: 'none', 
              color: '#666',
              '&:hover': { color: '#111' },
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/blogs');
            }}
          >
            Blogs
          </Link>
          <Typography color="text.primary" sx={{ color: '#111', fontFamily: 'Poppins' }}>
            {blog.title}
          </Typography>
        </Breadcrumbs>

        {/* Blog Content */}
        <Paper sx={{ 
          p: 6, 
          borderRadius: 0, 
          border: '2px solid #111',
          boxShadow: 'none',
          background: '#fff'
        }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={700} sx={{ 
              mb: 3, 
              color: '#111', 
              fontFamily: 'Poppins',
              lineHeight: 1.2
            }}>
              {blog.title}
            </Typography>
            
            {getThumbnailUrl(blog.thumbnail) && (
              <Box sx={{ 
                mb: 4, 
                borderRadius: 2, 
                overflow: 'hidden',
                border: '1px solid #eee'
              }}>
                <img
                  src={getThumbnailUrl(blog.thumbnail)}
                  alt={blog.title}
                  style={{ 
                    width: '100%', 
                    maxHeight: 400, 
                    objectFit: 'cover' 
                  }}
                />
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ 
                color: '#666', 
                fontFamily: 'Poppins',
                fontWeight: 500
              }}>
                By {blog.author}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', fontFamily: 'Poppins' }}>
                •
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', fontFamily: 'Poppins' }}>
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
              {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                <>
                  <Typography variant="body2" sx={{ color: '#888', fontFamily: 'Poppins' }}>
                    •
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#888', fontFamily: 'Poppins' }}>
                    Updated {new Date(blog.updatedAt).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 4, borderColor: '#ddd' }} />

          {/* Content */}
          <Box sx={{ 
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              fontFamily: 'Poppins',
              fontWeight: 600,
              color: '#111',
              mb: 2,
              mt: 3
            },
            '& p': {
              fontFamily: 'Poppins',
              color: '#333',
              lineHeight: 1.7,
              mb: 2,
              fontSize: '1.1rem'
            },
            '& ul, & ol': {
              fontFamily: 'Poppins',
              color: '#333',
              lineHeight: 1.7,
              mb: 2,
              pl: 3
            },
            '& li': {
              mb: 1
            },
            '& blockquote': {
              borderLeft: '4px solid #111',
              pl: 3,
              ml: 0,
              fontStyle: 'italic',
              color: '#666',
              bgcolor: '#f8f8f8',
              py: 2,
              my: 3
            },
            '& code': {
              bgcolor: '#f5f5f5',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            },
            '& pre': {
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mb: 2
            }
          }}>
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </Box>

          {/* Social Sharing Section */}
          <Divider sx={{ mt: 6, mb: 4, borderColor: '#ddd' }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              color: '#111', 
              fontFamily: 'Poppins',
              fontWeight: 600
            }}>
              Share this article
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title="Share on Facebook">
                <IconButton
                  onClick={() => handleShare('facebook')}
                  sx={{
                    bgcolor: '#1877f2',
                    color: '#fff',
                    '&:hover': { bgcolor: '#166fe5' }
                  }}
                >
                  <FacebookIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Share on Twitter">
                <IconButton
                  onClick={() => handleShare('twitter')}
                  sx={{
                    bgcolor: '#1da1f2',
                    color: '#fff',
                    '&:hover': { bgcolor: '#1a91da' }
                  }}
                >
                  <TwitterIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Share on LinkedIn">
                <IconButton
                  onClick={() => handleShare('linkedin')}
                  sx={{
                    bgcolor: '#0077b5',
                    color: '#fff',
                    '&:hover': { bgcolor: '#006097' }
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Share on WhatsApp">
                <IconButton
                  onClick={() => handleShare('whatsapp')}
                  sx={{
                    bgcolor: '#25d366',
                    color: '#fff',
                    '&:hover': { bgcolor: '#128c7e' }
                  }}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Share via Email">
                <IconButton
                  onClick={() => handleShare('email')}
                  sx={{
                    bgcolor: '#ea4335',
                    color: '#fff',
                    '&:hover': { bgcolor: '#d33426' }
                  }}
                >
                  <EmailIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Copy Link">
                <IconButton
                  onClick={() => handleShare('copy')}
                  sx={{
                    bgcolor: '#666',
                    color: '#fff',
                    '&:hover': { bgcolor: '#555' }
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Footer */}
          <Divider sx={{ mb: 4, borderColor: '#ddd' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 0,
                fontWeight: 600,
                fontFamily: 'Poppins',
                textTransform: 'uppercase',
                borderColor: '#111',
                color: '#111',
                '&:hover': {
                  bgcolor: '#111',
                  color: '#fff',
                  borderColor: '#111'
                }
              }}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label="Blog" 
                sx={{ 
                  bgcolor: '#f5f5f5', 
                  color: '#111', 
                  fontFamily: 'Poppins',
                  fontWeight: 500
                }} 
              />
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Snackbar for copy notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 