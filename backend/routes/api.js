const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const {
  getLinksByAdmin,
  createLink,
  updateLink,
  deleteLink,
  recordClick,
  recordShare,
  getPublicProfileLinks,
  getPersonalProfile
} = require('../controllers/linkController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', protect, getProfile);
router.put('/auth/profile', protect, updateProfile);

// Upload Routes
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Admin Link Routes
router.get('/admin/links', protect, getLinksByAdmin);
router.post('/admin/links', protect, createLink);
router.put('/admin/links/:id', protect, updateLink);
router.delete('/admin/links/:id', protect, deleteLink);

// Public Routes
router.get('/public/personal', getPersonalProfile);
router.get('/public/profile/:username', getPublicProfileLinks);
router.get('/public/link/:id/click', recordClick);
router.get('/public/link/:id/share', recordShare);

module.exports = router;
