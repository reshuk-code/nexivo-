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
  Alert,
  Modal
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
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://nexivo.onrender.com';

// Helper to get Google Drive image URL from file ID or old URL
function getThumbnailUrl(img) {
  if (!img) return 'https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg'; // fallback image
  if (img.startsWith('http')) return img; // already absolute
  // यदि img relative छ भने absolute बनाउने
  return `https://www.reshuksapkota.com.np/${img.replace(/^\//, '')}`;
}

// Helper to update meta tags for SEO and social sharing
function updateMetaTags(blog) {
  if (!blog) return;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog.title || 'Check out this blog post';
  // Attractive, keyword-rich meta description
  const shareDescription = (blog.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '') + ' | Nexivo - Build Website in Nepal, Affordable Web Design, IT Solutions.';
  // Always use absolute blog thumbnail for SEO/social sharing image
  let shareImage = '';
  if (blog.thumbnail) {
    shareImage = getThumbnailUrl(blog.thumbnail);
  } else {
    shareImage = 'https://reshuksapkota.com.np/og-image.jpg';
  }
  // Generate dynamic keywords from title/content and add extra SEO keywords
  const extraKeywords = [
    'Build Website in Nepal',
    'Web Design Nepal',
    'Affordable Website',
    'Nexivo',
    'Nexivo IT Solutions',
    'Digital Services',
    'Web Development',
    'SEO',
    'Business Website',
    'Ecommerce Nepal',
    'Professional Website',
    'Startup Website',
    'Portfolio Website',
    'Nepal IT Company',
    'Custom Website',
    'Mobile Friendly Website',
    'Fast Website',
    'Best Website Nepal'
  ];
  const blogKeywords = [
    ...blog.title?.split(' ') || [],
    ...blog.content?.replace(/<[^>]*>/g, '').split(' ').slice(0, 10) || []
  ].filter(Boolean);
  const allKeywords = [...new Set([...blogKeywords, ...extraKeywords])].join(', ');

  // Set document title
  document.title = `${shareTitle} - NEXIVO Blog`;

  // Meta tags to set
  const metaTags = [
    { name: 'description', content: shareDescription },
    { property: 'og:title', content: shareTitle },
    { property: 'og:description', content: shareDescription },
    { property: 'og:image', content: shareImage },
    { property: 'og:url', content: shareUrl },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:title', content: shareTitle },
    { name: 'twitter:description', content: shareDescription },
    { name: 'twitter:image', content: shareImage },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: shareUrl },
    { name: 'keywords', content: allKeywords }
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

  // Set canonical URL
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
  const [otherBlogs, setOtherBlogs] = useState([]);
  const [reacting, setReacting] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
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
        updateMetaTags(data);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
    // Fetch other blogs
    fetch(BACKEND_BASE_URL + `/v1/api/blogs/other/${id}`)
      .then(res => res.json())
      .then(data => setOtherBlogs(Array.isArray(data) ? data : []));
    // Cleanup function to reset meta tags when component unmounts
    return () => {
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
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'description', content: 'NEXIVO provides cutting-edge IT solutions, web development, mobile apps, digital transformation, and technology consulting services.' },
        { name: 'keywords', content: 'blog, article, NEXIVO, IT solutions, web development, digital services' }
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

  // Emoji reactions
  const emojiList = [
    { key: 'like', icon: <ThumbUpIcon />, label: 'Like' },
    { key: 'love', icon: <FavoriteIcon />, label: 'Love' },
    { key: 'angry', icon: <SentimentVeryDissatisfiedIcon />, label: 'Angry' },
    { key: 'wow', icon: <EmojiObjectsIcon />, label: 'Wow' },
    { key: 'haha', icon: <EmojiEmotionsIcon />, label: 'Haha' }
  ];

  const handleReact = async (emoji) => {
    if (!blog || reacting) return;
    setReacting(emoji);
    try {
      const res = await fetch(BACKEND_BASE_URL + `/v1/api/blogs/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });
      const data = await res.json();
      if (res.ok && data.reactions) {
        setBlog({ ...blog, reactions: data.reactions });
      } else {
        setSnackbar({ open: true, message: data.error || 'Failed to react', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to react', severity: 'error' });
    }
    setTimeout(() => setReacting(''), 500);
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

        {/* Main Blog Card Responsive */}
        <Paper
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', md: 700, lg: 900 },
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            mb: 4,
            boxShadow: 2,
            borderRadius: 2,
            fontSize: { xs: 16, sm: 18 },
            lineHeight: 1.6
          }}
        >
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
            
            {blog?.thumbnail && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img
                  src={getThumbnailUrl(blog.thumbnail)}
                  alt={blog.title}
                  style={{
                    width: '100%',
                    maxWidth: 420,
                    height: 'auto',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onClick={() => setImageModalOpen(true)}
                  title="Click to enlarge"
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
        </Paper>
        {/* Emoji Reactions Responsive */}
        {blog && (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: 18, sm: 22 } }}>React to this blog:</Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 1, sm: 2 },
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                flexDirection: { xs: 'row', sm: 'row' },
                mb: 2
              }}
            >
              {emojiList.map(({ key, icon, label }) => (
                <Button
                  key={key}
                  onClick={() => handleReact(key)}
                  disabled={!!reacting}
                  sx={{
                    minWidth: { xs: 36, sm: 48 },
                    minHeight: { xs: 36, sm: 48 },
                    borderRadius: '50%',
                    fontSize: { xs: 18, sm: 24 },
                    bgcolor: reacting === key ? '#ffe082' : '#fff',
                    boxShadow: reacting === key ? '0 0 8px #ffd600' : 'none',
                    transition: 'all 0.2s',
                    mx: { xs: 0.5, sm: 1 },
                    mb: { xs: 1, sm: 0 }
                  }}
                >
                  <Box sx={{ fontSize: { xs: 22, sm: 28 } }}>{icon}</Box>
                  <Typography variant="caption" sx={{ ml: 1, fontSize: { xs: 14, sm: 16 } }}>
                    {blog.reactions?.[key] || 0}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>
        )}
        {/* Other Blogs Section Responsive */}
        {otherBlogs.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Divider sx={{ mb: 3 }}><Chip label="Other Blogs" /></Divider>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 3,
                justifyContent: 'center',
                alignItems: 'stretch',
                justifyItems: 'center'
              }}
            >
              {otherBlogs.map(oblog => (
                <Paper key={oblog._id} sx={{ width: '100%', maxWidth: 320, p: { xs: 1, sm: 2 }, mx: 'auto', cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} onClick={() => navigate(`/blogs/${oblog._id}`)}>
                  {oblog.thumbnail && (
                    <img src={getThumbnailUrl(oblog.thumbnail)} alt={oblog.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                  )}
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, fontSize: { xs: 16, sm: 18 } }}>{oblog.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: { xs: 14, sm: 16 } }}>{oblog.content.replace(/<[^>]*>/g, '').substring(0, 80)}...</Typography>
                  <Typography variant="caption" sx={{ color: '#888', fontSize: { xs: 12, sm: 14 } }}>By {oblog.author} • {new Date(oblog.createdAt).toLocaleDateString()}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
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

      {/* Modal for thumbnail image */}
      <Modal open={imageModalOpen} onClose={() => setImageModalOpen(false)}>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <Box sx={{ position: 'absolute', top: 24, right: 32, zIndex: 2100 }}>
            <IconButton onClick={() => setImageModalOpen(false)} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <CloseIcon fontSize="large" />
            </IconButton>
          </Box>
          <img
            src={blog?.thumbnail ? getThumbnailUrl(blog.thumbnail) : ''}
            alt={blog?.title}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: 16,
              boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
              background: '#fff',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
} 