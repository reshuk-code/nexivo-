import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import BusinessIcon from '@mui/icons-material/Business';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArticleIcon from '@mui/icons-material/Article';
import logo from '../assets/logo.png';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

const navItems = [
  { label: 'Home', icon: <BusinessIcon fontSize="small" />, href: '/' },
  { label: 'Blogs', icon: <ArticleIcon fontSize="small" />, href: '/blogs' },
  { label: 'Careers', icon: <WorkOutlineIcon fontSize="small" />, href: '/vacancy' },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();

  const handleProfileMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  // Helper to extract Google Drive file ID and get backend proxy URL
  const getProfileImage = (img) => {
    if (!img) return undefined;
    if (!img.includes('/') && !img.startsWith('http')) return `https://nexivo.onrender.com/v1/api/drive/image/${img}`;
    const match = img.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) return `https://nexivo.onrender.com/v1/api/drive/image/${match[1]}`;
    const shareMatch = img.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (shareMatch) return `https://nexivo.onrender.com/v1/api/drive/image/${shareMatch[1]}`;
    return undefined;
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', color: '#000', borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <Box display="flex" alignItems="center">
          <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={logo} alt="Nexivo Logo" style={{ height: 40, marginRight: 12 }} />
          </RouterLink>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              component={RouterLink}
              to={item.href}
              sx={{ color: '#000', fontWeight: 500, fontFamily: 'Poppins', textTransform: 'none' }}
              startIcon={item.icon}
            >
              {item.label}
            </Button>
          ))}
          {user && user.role === 'admin' && (
            <Button component={RouterLink} to="/admin" startIcon={<AdminPanelSettingsIcon />} sx={{ color: '#000', fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none' }}>
              Admin Panel
            </Button>
          )}
          {user ? (
            <>
              <IconButton onClick={handleProfileMenu} sx={{ ml: 2 }}>
                <Avatar src={getProfileImage(user.profileImage ? user.profileImage : undefined)} alt={user.username} sx={{ width: 32, height: 32 }}>
                  {!user.profileImage && user.username ? user.username[0].toUpperCase() : ''}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                <MenuItem component={RouterLink} to="/profile" onClick={handleCloseMenu}>
                  <AccountCircleIcon sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem onClick={() => { logout(); handleCloseMenu(); }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button variant="outlined" component={RouterLink} to="/login" startIcon={<LoginOutlinedIcon />} sx={{ ml: 2, borderRadius: 2, borderColor: '#000', color: '#000', fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none', '&:hover': { bgcolor: '#000', color: '#fff', borderColor: '#000' } }}>
              Login
            </Button>
          )}
        </Box>
        <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 240, pt: 2 }} role="presentation" onClick={() => setDrawerOpen(false)}>
            <List>
              {navItems.map((item) => (
                <ListItem button key={item.label} component={RouterLink} to={item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
              {user && user.role === 'admin' && (
                <ListItem button component={RouterLink} to="/admin">
                  <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                  <ListItemText primary="Admin Panel" />
                </ListItem>
              )}
              {user && (
                <ListItem button component={RouterLink} to="/profile">
                  <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
              )}
            </List>
            <Divider />
            {!user && (
              <Button fullWidth variant="outlined" component={RouterLink} to="/login" startIcon={<LoginOutlinedIcon />} sx={{ m: 2, borderRadius: 2, borderColor: '#000', color: '#000', fontWeight: 600, fontFamily: 'Poppins', textTransform: 'none', '&:hover': { bgcolor: '#000', color: '#fff', borderColor: '#000' } }}>
                Login
              </Button>
            )}
            {user && (
              <Button fullWidth variant="text" color="error" onClick={logout} sx={{ m: 2 }}>
                Logout
              </Button>
            )}
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
} 