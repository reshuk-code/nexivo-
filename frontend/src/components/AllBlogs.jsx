import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Loader from './Loader';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://nexivo.onrender.com';

// Helper to get Google Drive image URL from file ID or old URL
function getThumbnailUrl(img) {
  if (!img) return '';
  if (img.startsWith('http')) return img; // Cloudinary or external
  if (!img.includes('/') && !img.startsWith('http')) return `${BACKEND_BASE_URL}/v1/api/drive/image/${img}`;
  const match = img.match(/[-\w]{25,}/);
  if (match) return `${BACKEND_BASE_URL}/v1/api/drive/image/${match[1]}`;
  const shareMatch = img.match(/[-\w]{25,}/);
  if (shareMatch) return `${BACKEND_BASE_URL}/v1/api/drive/image/${shareMatch[1]}`;
  return img;
}

export default function AllBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(BACKEND_BASE_URL + '/v1/api/blogs')
      .then(res => res.json())
      .then(data => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch blogs:', err);
        setLoading(false);
      });
  }, []);

  const handleReadMore = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Box sx={{ py: 8, bgcolor: '#f8f8f8', minHeight: '60vh' }}>
      <Container>
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
          <Typography color="text.primary" sx={{ color: '#111', fontFamily: 'Poppins' }}>
            All Blogs
          </Typography>
        </Breadcrumbs>

        <Typography variant="h3" fontWeight={700} sx={{ 
          mb: 6, 
          fontFamily: 'Poppins', 
          textAlign: 'center', 
          color: '#111' 
        }}>
          All Blogs
        </Typography>

        {blogs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins', mb: 2 }}>
              No blogs available yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#888', fontFamily: 'Poppins', mb: 3 }}>
              Check back later for our latest articles and insights.
            </Typography>
            <Button
              variant="contained"
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
        ) : (
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
            {blogs.map((blog) => (
              <SwiperSlide key={blog._id}>
                <Card sx={{
                  width: '100%',
                  maxWidth: 400,
                  height: 370,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 0,
                  border: '2px solid #111',
                  boxShadow: 'none',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': { 
                    boxShadow: '0 0 0 4px #000', 
                    transform: 'scale(1.02)' 
                  },
                  background: '#fff',
                  mx: 'auto'
                }}>
                  {getThumbnailUrl(blog.thumbnail) && (
                    <Box sx={{ 
                      height: 180, 
                      overflow: 'hidden',
                      borderBottom: '1px solid #eee',
                      width: '100%'
                    }}>
                      <img
                        src={getThumbnailUrl(blog.thumbnail)}
                        alt={blog.title}
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
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3, minHeight: 110 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ 
                      mb: 2, 
                      color: '#111', 
                      fontFamily: 'Poppins',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {blog.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#666', 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5
                    }}>
                      {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#888', fontFamily: 'Poppins' }}>
                        By {blog.author}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#888', fontFamily: 'Poppins' }}>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="outlined"
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
                      onClick={() => handleReadMore(blog._id)}
                      fullWidth
                    >
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Container>
    </Box>
  );
} 