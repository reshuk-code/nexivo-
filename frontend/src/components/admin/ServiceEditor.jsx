import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem, Select, InputLabel, FormControl, Box, Typography, Backdrop } from '@mui/material';
import { useGlobalDragDrop } from '../../hooks/useGlobalDragDrop';

export default function ServiceEditor({ open, onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [items, setItems] = useState(initialData?.items ? initialData.items.join(', ') : '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initialData?.image ? getImageUrl(initialData.image) : '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef();

  // Global drag and drop handler
  const handleGlobalFileDrop = (file) => {
    if (open) { // Only handle if editor is open
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const { isDragOver: isGlobalDragOver } = useGlobalDragDrop(handleGlobalFileDrop);

  useEffect(() => {
    setName(initialData?.name || '');
    setDescription(initialData?.description || '');
    setCategory(initialData?.category || '');
    setItems(initialData?.items ? initialData.items.join(', ') : '');
    setPreview(initialData?.image ? getImageUrl(initialData.image) : '');
    setImage(null);
  }, [initialData, open]);

  function getImageUrl(img) {
    if (!img) return '';
    if (img.startsWith('http')) return img; // Cloudinary or external
    if (!img.includes('/') && !img.startsWith('http')) return `https://nexivo.onrender.com/v1/api/drive/image/${img}`;
    const match = img.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) return `https://nexivo.onrender.com/v1/api/drive/image/${match[1]}`;
    const shareMatch = img.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (shareMatch) return `https://nexivo.onrender.com/v1/api/drive/image/${shareMatch[1]}`;
    return img;
  }

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (name && description) {
      onSave({
        name,
        description,
        category,
        items: items.split(',').map(i => i.trim()).filter(Boolean),
        image
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{initialData ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth required />
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={e => setCategory(e.target.value)}
                required
              >
                <MenuItem value="Website">Website</MenuItem>
                <MenuItem value="Mobile Application">Mobile Application</MenuItem>
                <MenuItem value="AI/ML">AI/ML</MenuItem>
                <MenuItem value="UI/UX">UI/UX</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Items (comma separated)" value={items} onChange={e => setItems(e.target.value)} fullWidth />
            <Box
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              sx={{ border: '2px dashed #aaa', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#fafafa', cursor: 'pointer' }}
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img src={preview} alt="Service" style={{ maxWidth: '100%', maxHeight: 180, marginBottom: 8, borderRadius: 8 }} />
              ) : (
                <Typography color="text.secondary">Drag & drop or click to upload service image</Typography>
              )}
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFile} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name || !description}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Global Drag Overlay */}
      <Backdrop
        open={open && isGlobalDragOver}
        sx={{ 
          zIndex: 9999,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          color: 'white',
          p: 4,
          border: '3px dashed white',
          borderRadius: 2,
          bgcolor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            🖼️
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Drop image here to set as service image
          </Typography>
          <Typography variant="body1">
            Release to upload
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
} 