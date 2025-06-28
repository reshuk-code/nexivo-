import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert, Avatar, Stack, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useAuth } from './AuthContext';
import Cropper from 'react-easy-crop';

const BASE_URL = 'https://nexivo.onrender.com';

export default function ProfileEdit({ onCancel, onSuccess }) {
  const { user, token, fetchProfile } = useAuth();
  const [form, setForm] = useState({ phone: user?.phone || '', password: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropDialog, setCropDialog] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
      setCropDialog(true);
    }
  };

  const onCropComplete = (_, croppedPixels) => setCroppedAreaPixels(croppedPixels);

  // Crop image to square
  async function getCroppedImg(imageSrc, cropPixels) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', error => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  const handleCropSave = async () => {
    if (preview && croppedAreaPixels) {
      const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);
      setProfileImage(new File([croppedBlob], profileImage.name, { type: 'image/jpeg' }));
      setPreview(URL.createObjectURL(croppedBlob));
      setCropDialog(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const formData = new FormData();
    if (form.phone) formData.append('phone', form.phone);
    if (form.password) formData.append('password', form.password);
    if (profileImage) formData.append('profileImage', profileImage);
    const res = await fetch(`${BASE_URL}/v1/api/user/edit-profile`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token },
      body: formData
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess('Profile updated!');
      await fetchProfile();
      if (onSuccess) onSuccess();
    } else {
      setError(data.error || 'Profile update failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 3, borderRadius: 3, boxShadow: 2, bgcolor: '#fff' }}>
      <form onSubmit={handleSubmit}>
        <Stack alignItems="center" spacing={2}>
          <Avatar src={preview} sx={{ width: 80, height: 80, mb: 1 }} />
          <Typography variant="h6" fontWeight={700}>Edit Profile</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <TextField label="Phone" name="phone" fullWidth margin="normal" value={form.phone} onChange={handleChange} disabled={loading} />
          <TextField label="New Password" name="password" type="password" fullWidth margin="normal" value={form.password} onChange={handleChange} disabled={loading} />
          <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
            Upload Profile Picture
            <input type="file" hidden accept="image/*" onChange={handleFile} />
          </Button>
          {profileImage && <Typography fontSize={14}>{profileImage.name}</Typography>}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#000', color: '#fff' }} disabled={loading}>
              {loading ? <CircularProgress size={22} /> : 'Save'}
            </Button>
            <Button variant="text" onClick={onCancel} disabled={loading}>Cancel</Button>
          </Stack>
        </Stack>
      </form>
      <Dialog open={cropDialog} onClose={() => setCropDialog(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ position: 'relative', height: 300, bgcolor: '#222' }}>
          <Cropper
            image={preview}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropDialog(false)}>Cancel</Button>
          <Button onClick={handleCropSave} variant="contained">Crop</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 