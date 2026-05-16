const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...decoded, account_type: decoded.account_type || decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.account_type !== role) return res.status(403).json({ message: 'Forbidden' });
  next();
};

exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.findAll({
      where: { account_type: 'volunteer' },
      attributes: ['id', 'name', 'email', 'phoneNumber'],
      order: [['createdAt', 'DESC']]
    });
    return res.json(volunteers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVolunteers: [verifyToken, requireRole('ngo'), exports.getVolunteers]
};

