const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  type: { type: String, enum: ['link', 'video'], default: 'link' },
  icon: { type: String, default: '' },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  buttonText: { type: String, default: 'Visit' },
  clickCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  startDate: { type: Date },
  expiryDate: { type: Date },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Link', linkSchema);
