import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography,
  Stack,
  Backdrop
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import { useGlobalDragDrop } from '../../hooks/useGlobalDragDrop';

// Helper to get Google Drive image URL from file ID or old URL
function getThumbnailUrl(img) {
  if (!img) return '';
  if (img.startsWith('http')) return img; // Cloudinary or external
  if (!img.includes('/') && !img.startsWith('http')) return `https://nexivo.onrender.com/v1/api/drive/image/${img}`;
  const match = img.match(/id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://nexivo.onrender.com/v1/api/drive/image/${match[1]}`;
  const shareMatch = img.match(/file\/d\/([a-zA-Z0-9_-]+)/);
  if (shareMatch) return `https://nexivo.onrender.com/v1/api/drive/image/${shareMatch[1]}`;
  return img;
}

export default function BlogEditor({ open, onClose, onSave, initialData }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(initialData?.thumbnail ? getThumbnailUrl(initialData.thumbnail) : '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef();

  // Global drag and drop handler
  const handleGlobalFileDrop = (file) => {
    if (open) { // Only handle if editor is open
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const { isDragOver: isGlobalDragOver } = useGlobalDragDrop(handleGlobalFileDrop);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setContent(initialData?.content || '');
    setAuthor(initialData?.author || '');
    setPreview(initialData?.thumbnail ? getThumbnailUrl(initialData.thumbnail) : '');
    setThumbnail(null);
  }, [initialData, open]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (title && content && author) {
      onSave({ title, content, author, thumbnail });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{initialData ? 'Edit Blog' : 'Add Blog'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              fullWidth
              required
            />
            
            {/* Thumbnail Upload */}
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{ 
                border: '2px dashed #aaa', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center', 
                bgcolor: isDragOver ? '#f0f0f0' : '#fafafa', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#f0f0f0',
                  borderColor: '#666'
                }
              }}
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <Box>
                  <img 
                    src={preview} 
                    alt="Blog thumbnail" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200, 
                      marginBottom: 16, 
                      borderRadius: 8,
                      objectFit: 'cover'
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    Click or drag to change thumbnail
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    📷
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Drag & drop thumbnail here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to select file
                  </Typography>
                </Box>
              )}
              <input 
                type="file" 
                accept="image/*" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFile} 
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                Content
              </Typography>
              <Editor
                apiKey="ybw3wa3vihi4mj57pc2w0rhaw527paxik4sjh8z6e44j8b6q"
                value={content}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'advlist autolink lists link image charmap preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | removeformat | help'
                }}
                onEditorChange={setContent}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!title || !content || !author}>Save</Button>
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
            📷
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Drop image here to set as thumbnail
          </Typography>
          <Typography variant="body1">
            Release to upload
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
} 