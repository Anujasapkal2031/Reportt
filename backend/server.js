require('dotenv').config(); // ✅ Load environment variables first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // ✅ Correct import

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Check Cloudinary Configuration
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Correct Multer Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "report_images", // Your folder name in Cloudinary
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

const upload = multer({ storage });

// ✅ Routes
app.use('/api', authRoutes);
app.use('/api', reportRoutes);

// ✅ Catch-all Route for Undefined Endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start Server
app.listen(8000, () => console.log('🚀 Server running on http://localhost:8000'));
