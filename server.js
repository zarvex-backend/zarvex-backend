const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
app.use(cors());
app.use(express.json());

// Root test endpoint
app.get('/', (req, res) => {
    res.send('Zarvex Backend is Live!');
});

// Conversion endpoint
app.post('/convert', async (req, res) => {
    try {
        const { url, format } = req.body;

        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
        }

        const info = await ytdl.getInfo(url);
        
        let selectedFormat;
        if (format === 'mp3') {
            selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        } else {
            selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
        }

        res.json({
            status: 'success',
            title: info.videoDetails.title,
            downloadUrl: selectedFormat.url
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process YouTube link' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});