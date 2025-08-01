import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Loader from './Loader';
import { Helmet } from 'react-helmet-async';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://nexivo.onrender.com';

// Helper to get Google Drive image URL from file ID or old URL
function getThumbnailUrl(img) {
  if (!img) return '';
  if (img.startsWith('http')) return img; // Cloudinary or external
  return `${BACKEND_BASE_URL}/v1/api/drive/image/${img}`;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(BACKEND_BASE_URL + '/v1/api/blogs')
      .then(res => res.json())
      .then(data => {
        setBlogs(Array.isArray(data) ? data.slice(0, 6) : []); // Show only 6 latest blogs
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

  if (blogs.length === 0) {
    return (
      <Box id="blogs" sx={{ py: 8, bgcolor: '#f8f8f8' }}>
        <Helmet>
          <title>Latest Blogs | IT, Web Development, Digital Trends | Nexivo</title>
          <meta name="description" content="Read the latest blogs from Nexivo on IT, web development, digital trends, and technology in Nepal." />
          <meta name="keywords" content="blogs, IT, web development, digital trends, technology, Nepal, nexivo" />
          <meta property="og:image" content="https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg" />
          <link rel="canonical" href="https://www.reshuksapkota.com.np/blogs" />
        </Helmet>
        <Container>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
            Latest Blogs & Insights
          </h1>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 500, textAlign: 'center', marginBottom: 16, color: '#444' }}>
            IT, Web Development, Digital Trends
          </h2>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: '#666', fontFamily: 'Poppins', mb: 2 }}>
              No blogs available yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#888', fontFamily: 'Poppins' }}>
              Check back later for our latest articles and insights.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box id="blogs" sx={{ py: 8, bgcolor: '#f8f8f8' }}>
      <Helmet>
        <title>Latest Blogs | IT, Web Development, Digital Trends | Nexivo</title>
        <meta name="description" content="Read the latest blogs from Nexivo on IT, web development, digital trends, and technology in Nepal." />
        <meta name="keywords" content="blogs, IT, web development, digital trends, technology, Nepal, nexivo" />
        <meta property="og:image" content="https://www.reshuksapkota.com.np/assets/hero-image-Bn8O94uu.jpg" />
        <link rel="canonical" href="https://www.reshuksapkota.com.np/blogs" />
      </Helmet>
      <Container>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
          Latest Blogs & Insights
        </h1>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 500, textAlign: 'center', marginBottom: 16, color: '#444' }}>
          IT, Web Development, Digital Trends
        </h2>
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
        {blogs.length >= 6 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              sx={{
                borderRadius: 0,
                fontWeight: 700,
                fontFamily: 'Poppins',
                textTransform: 'uppercase',
                bgcolor: '#111',
                color: '#fff',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#fff',
                  color: '#111',
                  border: '2px solid #111'
                }
              }}
              onClick={() => navigate('/blogs')}
            >
              View All Blogs
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
} 