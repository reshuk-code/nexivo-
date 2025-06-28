const express = require('express');
const router = express.Router();
const { drive } = require('../utils/googleDrive');

// Proxy image fetch from Google Drive with backend auth
router.get('/image/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    res.setHeader('Content-Type', 'image/jpeg'); // Optionally detect type
    driveRes.data.pipe(res);
  } catch (err) {
    res.status(404).send('Image not found or access denied');
  }
});

module.exports = router; 