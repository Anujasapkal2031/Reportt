const express = require('express');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reports',  // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// Route to upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const report = new Report({
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      imageUrl: req.file.path, // Cloudinary image URL
    });

    await report.save();
    res.json({ message: 'Report saved with image!', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reports', authMiddleware, async (req, res) => {
  const report = new Report({ ...req.body, userId: req.userId });
  await report.save();
  res.status(201).json(report);
});

router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

router.get('/reports/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
});

module.exports = router;
