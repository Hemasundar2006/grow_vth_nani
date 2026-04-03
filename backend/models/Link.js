const mongoose = require('mongoose');

// Matches admin UI: Useful links, Content, Upcoming, Trending (pinned)
const LINK_CATEGORY_VALUES = ['useful', 'content', 'upcoming', 'trending'];

const linkSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: LINK_CATEGORY_VALUES,
    default: 'useful',
  },
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

// Mongoose 9+: no `next()` callback — use sync middleware or async/await
linkSchema.pre('validate', function coerceCategory() {
  const raw = this.category;
  const x = String(raw == null ? 'useful' : raw).toLowerCase().trim();
  if (LINK_CATEGORY_VALUES.includes(x)) {
    this.category = x;
  } else if (x === 'general') {
    this.category = 'useful';
  } else {
    this.category = 'useful';
  }
});

const Link = mongoose.model('Link', linkSchema);
Link.LINK_CATEGORY_VALUES = LINK_CATEGORY_VALUES;
module.exports = Link;
