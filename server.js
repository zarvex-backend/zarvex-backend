const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Zarvex Backend is Live!');
});

// GET so it matches the app: /convert?url=...
app.get('/convert', async (req, res) => {
    try {
        const url = req.query.url;

        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
        }

        const info = await ytdl.getInfo(url);

        // MP3 / audio link
        const audio = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

        // MP4 links (video + audio together), one per quality
        const seen = new Set();
        const videoQualities = info.formats
            .filter(f => f.hasVideo && f.hasAudio && f.container === 'mp4' && f.qualityLabel)
            .filter(f => !seen.has(f.qualityLabel) && seen.add(f.qualityLabel))
            .map(f => ({ qualityLabel: f.qualityLabel, downloadUrl: f.url }));

        res.json({
            title: info.videoDetails.title,
            mp3Url: audio.url,
            videoQualities
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process YouTube link' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));