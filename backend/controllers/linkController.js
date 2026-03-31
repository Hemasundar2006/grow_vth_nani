const Link = require('../models/Link');

// Get all links for admin
exports.getLinksByAdmin = async (req, res) => {
  try {
    const links = await Link.find({ adminId: req.user.id }).sort('order');
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new link
exports.createLink = async (req, res) => {
  try {
    const { title, url, description, category, type, icon, status, buttonText, order, expiryDate } = req.body;
    const link = await Link.create({
      adminId: req.user.id,
      title,
      url,
      description,
      category,
      type,
      icon,
      status,
      buttonText,
      order,
      expiryDate
    });
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update link
exports.updateLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    Object.assign(link, req.body);
    const updatedLink = await link.save();
    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete link
exports.deleteLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    await link.remove ? await link.remove() : await Link.deleteOne({ _id: req.params.id });
    res.json({ message: 'Link removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record click
exports.recordClick = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    link.clickCount += 1;
    await link.save();
    res.json({ message: 'Click recorded', url: link.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get public profile links
exports.getPublicProfileLinks = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'Profile not found' });

    const links = await Link.find({ adminId: user._id, status: 'published' }).sort('order');
    res.json({ profile: user, links });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personal profile (for single-user frontpage)
exports.getPersonalProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne();
    if (!user) return res.status(404).json({ message: 'Profile not found' });

    const links = await Link.find({ adminId: user._id, status: 'published' }).sort('order');
    res.json({ profile: user, links });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record share
exports.recordShare = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    link.shareCount = (link.shareCount || 0) + 1;
    await link.save();
    res.json({ message: 'Share recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
