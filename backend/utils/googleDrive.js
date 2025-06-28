const { google } = require('googleapis');
const stream = require('stream');

// Service account authentication using JSON content from environment variable
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

exports.auth = auth;
exports.drive = drive;

// Upload buffer/file to Google Drive (no temp file) with timeout
exports.uploadToDrive = async (buffer, fileName, mimeType = 'image/jpeg') => {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
    }
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID environment variable is not set');
    }

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    const media = {
      mimeType,
      body: bufferStream,
    };

    // Add timeout to the upload request
    const uploadPromise = drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    // Set timeout to 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000);
    });

    const response = await Promise.race([uploadPromise, timeoutPromise]);

    // Make file public with timeout
    const permissionPromise = drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const permissionTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Permission timeout after 10 seconds')), 10000);
    });

    await Promise.race([permissionPromise, permissionTimeoutPromise]);

    return response.data.id;
  } catch (err) {
    console.error('Google Drive upload error:', err);
    if (err.message.includes('timeout')) {
      throw new Error(`Upload failed: ${err.message}`);
    }
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      throw new Error('Network error: Unable to connect to Google Drive');
    }
    if (err.response && err.response.status === 403) {
      throw new Error('Permission denied: Check Google Drive API credentials');
    }
    throw new Error(`Upload failed: ${err.message || 'Unknown error'}`);
  }
}; 