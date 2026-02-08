const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await cloudinary.uploader.upload(req.file.path);
            // Cleanup local file
            fs.unlinkSync(req.file.path);
            return res.json({ url: result.secure_url });
        } else {
            // Fallback for local testing without Cloudinary
            console.log("⚠️ Mocking Upload (No Cloudinary Creds)");
            fs.unlinkSync(req.file.path);
            return res.json({ url: 'https://picsum.photos/300/200' });
        }

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
});

module.exports = router;
