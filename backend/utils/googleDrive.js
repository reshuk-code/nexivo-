const { google } = require('googleapis');
const stream = require('stream');

// Service account authentication
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // .env मा JSON path राख्नुहोस्
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

exports.auth = auth;
exports.drive = drive;

// Upload buffer/file to Google Drive (no temp file)
exports.uploadToDrive = async (buffer, fileName, mimeType = 'image/jpeg') => {
  try {
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
    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });
    // Make file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });
    return response.data.id;
  } catch (err) {
    console.error('Google Drive upload error:', err);
    throw err;
  }
}; 