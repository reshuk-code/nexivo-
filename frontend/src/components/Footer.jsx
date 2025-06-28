import React, { useState } from "react";
import { Box, Typography, IconButton, TextField, Button, Stack, Snackbar, Alert } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleSubscribe = async () => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setSnackbar({ open: true, message: "Please enter a valid email address.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/v1/api/admin/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: data.message || "Subscribed successfully!", severity: "success" });
        setEmail("");
      } else {
        setSnackbar({ open: true, message: data.error || data.message || "Subscription failed.", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Network error. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        bgcolor: "#000",
        color: "#fff",
        py: 4,
        px: 2,
        mt: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={3}
        sx={{ maxWidth: 1200, mx: "auto" }}
      >
        {/* Logo & Name */}
        <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 2 }}>
          NEXIVO.
        </Typography>

        {/* Quick Links */}
        <Stack direction="row" spacing={2}>
          <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Home</a>
          <a href="/services" style={{ color: "#fff", textDecoration: "none" }}>Services</a>
          <a href="/about" style={{ color: "#fff", textDecoration: "none" }}>About</a>
          <a href="/careers" style={{ color: "#fff", textDecoration: "none" }}>Careers</a>
          <a href="/contact" style={{ color: "#fff", textDecoration: "none" }}>Contact</a>
        </Stack>

        {/* Social Icons */}
        <Stack direction="row" spacing={1}>
          <IconButton href="https://facebook.com" target="_blank" sx={{ color: "#fff" }}>
            <FacebookIcon />
          </IconButton>
          <IconButton href="https://twitter.com" target="_blank" sx={{ color: "#fff" }}>
            <TwitterIcon />
          </IconButton>
          <IconButton href="https://linkedin.com" target="_blank" sx={{ color: "#fff" }}>
            <LinkedInIcon />
          </IconButton>
          <IconButton href="https://instagram.com" target="_blank" sx={{ color: "#fff" }}>
            <InstagramIcon />
          </IconButton>
        </Stack>

        {/* Newsletter */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Subscribe to newsletter"
            variant="outlined"
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              input: { color: "#000" },
              width: 200,
            }}
            disabled={loading}
          />
          <Button variant="contained" color="primary" onClick={handleSubscribe} disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Copyright */}
      <Typography variant="body2" align="center" sx={{ mt: 3, color: "#aaa" }}>
        © {new Date().getFullYear()} Nexivo. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer; 