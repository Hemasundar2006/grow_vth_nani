const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  creatorName: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: 'https://www.instagram.com/grow_vth_nani?igsh=ZjNxNngwbXhnd3M1' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: 'https://youtube.com/@grow_vth_nani?si=AJayt8vS4QnfhDrb' },
    tiktok: { type: String, default: '' }
  },
  theme: {
    backgroundColor: { type: String, default: '#f3f4f6' },
    textColor: { type: String, default: '#1f2937' },
    buttonColor: { type: String, default: '#3b82f6' },
    buttonTextColor: { type: String, default: '#ffffff' },
    fontFamily: { type: String, default: 'Inter' }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
