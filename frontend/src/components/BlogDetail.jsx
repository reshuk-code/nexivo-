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
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BASE_URL = 'https://nexivo.onrender.com';

// Helper to get Google Drive image URL from file ID or old URL
function getThumbnailUrl(img) {
  if (!img) return null;
  if (!img.includes('/') && !img.startsWith('http')) return `https://nexivo.onrender.com/v1/api/drive/image/${img}`;
  const match = img.match(/id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://nexivo.onrender.com/v1/api/drive/image/${match[1]}`;
  const shareMatch = img.match(/file\/d\/([a-zA-Z0-9_-]+)/);
  if (shareMatch) return `https://nexivo.onrender.com/v1/api/drive/image/${shareMatch[1]}`;
  return img;
}

export default function BlogDetail() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(BASE_URL + `/v1/api/blogs/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Blog not found');
        }
        return res.json();
      })
      .then(data => {
        setBlog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch blog:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ py: 8, bgcolor: '#f8f8f8', minHeight: '60vh' }}>
        <Container>
          <Typography sx={{ textAlign: 'center', color: '#666' }}>Loading blog...</Typography>
        </Container>
      </Box>
    );
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

          {/* Footer */}
          <Divider sx={{ mt: 6, mb: 4, borderColor: '#ddd' }} />
          
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
    </Box>
  );
} 