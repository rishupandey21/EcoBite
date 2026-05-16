const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Food = require('../models/Food');
const User = require('../models/User');
const FoodRequest = require('../models/FoodRequest');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      account_type: decoded.account_type || decoded.role
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.account_type !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// NGO creates a request for a food item
exports.createRequest = async (req, res) => {
  try {
    const { foodId } = req.body;
    if (!foodId) return res.status(400).json({ message: 'foodId is required' });

    const food = await Food.findByPk(foodId, {
      include: [{ model: User, as: 'restaurant', attributes: ['id', 'name'] }]
    });
    if (!food) return res.status(404).json({ message: 'Food not found' });

    // Prevent requests if already claimed by someone else
    if (food.status !== 'available' && food.claimedBy !== req.user.id) {
      return res.status(400).json({ message: 'Food is no longer available' });
    }

    const existing = await FoodRequest.findOne({
      where: { foodId: food.id, ngoId: req.user.id, restaurantId: food.restaurantId }
    });
    if (existing) return res.json(existing);

    const created = await FoodRequest.create({
      foodId: food.id,
      ngoId: req.user.id,
      restaurantId: food.restaurantId,
      status: 'pending'
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Restaurant fetches all requests sent to them
exports.getRestaurantRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.findAll({
      where: { restaurantId: req.user.id },
      include: [
        { 
          model: User, 
          as: 'ngo', 
          attributes: ['id', 'name', 'email', 'phoneNumber'] 
        },
        { 
          model: Food, 
          as: 'food', 
          attributes: ['id', 'foodName', 'quantity', 'category', 'createdAt'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(requests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// NGO fetches their own requests (for status display)
exports.getNgoRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.findAll({
      where: { ngoId: req.user.id },
      include: [
        { model: User, as: 'restaurant', attributes: ['id', 'name', 'email'] },
        { model: Food, as: 'food', attributes: ['id', 'foodName', 'quantity', 'category', 'createdAt', 'status', 'claimedBy'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json(requests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Restaurant accepts a request
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const fr = await FoodRequest.findByPk(requestId);
    if (!fr) return res.status(404).json({ message: 'Request not found' });
    if (fr.restaurantId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (fr.status === 'accepted') return res.json(fr);

    const food = await Food.findByPk(fr.foodId);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    // Reserve the food for this NGO
    if (food.status !== 'available' && food.claimedBy !== fr.ngoId) {
      return res.status(400).json({ message: 'Food is no longer available' });
    }

    await fr.update({ status: 'accepted' });

    // Mark food claimed by NGO so it can show as accepted for that NGO
    await food.update({ status: 'claimed', claimedBy: fr.ngoId });

    // Reject other pending requests for same food (optional, but prevents confusion)
    await FoodRequest.update(
      { status: 'rejected' },
      {
        where: {
          id: { [Op.ne]: fr.id },
          foodId: fr.foodId,
          status: 'pending'
        }
      }
    );

    return res.json(fr);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequest: [verifyToken, requireRole('ngo'), exports.createRequest],
  getRestaurantRequests: [verifyToken, requireRole('restaurant'), exports.getRestaurantRequests],
  getNgoRequests: [verifyToken, requireRole('ngo'), exports.getNgoRequests],
  acceptRequest: [verifyToken, requireRole('restaurant'), exports.acceptRequest]
};

