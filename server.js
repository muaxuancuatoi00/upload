const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const oAuth2Client = new google.auth.OAuth2(
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET',
    'YOUR_REDIRECT_URI'
);

oAuth2Client.setCredentials({ refresh_token: 'YOUR_REFRESH_TOKEN' });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    try {
        const fileMetadata = {
            name: req.file.originalname,
            parents: ['YOUR_FOLDER_ID'], // Optional: Specify the folder ID in Google Drive
        };

        const media = {
            body: fs.createReadStream(filePath),
        };

        const driveResponse = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        });

        fs.unlinkSync(filePath);

        res.json({ message: 'File uploaded successfully', fileId: driveResponse.data.id });
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        res.status(500).json({ message: 'Error uploading file.' });
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
