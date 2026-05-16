const { Op } = require('sequelize');
const Food = require('../models/Food');
const jwt = require('jsonwebtoken');
const FoodRequest = require('../models/FoodRequest');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      account_type: decoded.account_type || decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Create new food donation
exports.createFood = async (req, res) => {
  try {
    const { foodName, quantity, category, expiryDate, pickupTime, description } = req.body;
    
    const newFood = await Food.create({
      restaurantId: req.user.id,
      foodName,
      quantity,
      category,
      expiryDate,
      pickupTime,
      description
    });

    res.status(201).json({
      message: 'Food Added Successfully',
      food: newFood
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all food donations for a restaurant (exclude expired by date or status)
exports.getRestaurantFoods = async (req, res) => {
  try {
    const foods = await Food.findAll({
      where: {
        restaurantId: req.user.id,
        expiryDate: { [Op.gt]: new Date() },
        status: { [Op.ne]: 'expired' }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all available food donations (for NGOs/Volunteers)
exports.getAvailableFoods = async (req, res) => {
  try {
    const foods = await Food.findAll({
      where: { 
        status: 'available',
        expiryDate: {
          [Op.gt]: new Date() 
        }
      },
      include: [{
        association: 'restaurant',
        attributes: ['name', 'email', 'phoneNumber']
      }],
      order: [['createdAt', 'DESC']]
    });

    if (req.user?.account_type === 'ngo') {
      const foodIds = foods.map((f) => f.id);
      const requests = await FoodRequest.findAll({
        where: { ngoId: req.user.id, foodId: foodIds },
        order: [['createdAt', 'DESC']]
      });

      const latestByFood = new Map();
      for (const r of requests) {
        if (!latestByFood.has(r.foodId)) latestByFood.set(r.foodId, r);
      }

      const enriched = foods.map((f) => {
        const r = latestByFood.get(f.id);
        return {
          ...f.toJSON(),
          requestStatus: r?.status || null,
          requestId: r?.id || null
        };
      });

      return res.json(enriched);
    }

    return res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Claim food donation
exports.claimFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    
    const food = await Food.findByPk(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.status !== 'available') {
      return res.status(400).json({ message: 'Food is no longer available' });
    }

    await food.update({
      status: 'claimed',
      claimedBy: req.user.id
    });

    res.json({
      message: 'Food claimed successfully',
      food
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all food assignments for a volunteer (claimed by current user)
exports.getVolunteerAssignments = async (req, res) => {
  try {
    const foods = await Food.findAll({
      where: { claimedBy: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete food donation
exports.deleteFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    
    const food = await Food.findByPk(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if the food belongs to the current user (restaurant)
    if (food.restaurantId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own food listings' });
    }

    await food.destroy();

    res.json({
      message: 'Food donation deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createFood: [verifyToken, exports.createFood],
  getRestaurantFoods: [verifyToken, exports.getRestaurantFoods],
  getAvailableFoods: [verifyToken, exports.getAvailableFoods],
  claimFood: [verifyToken, exports.claimFood],
  getVolunteerAssignments: [verifyToken, exports.getVolunteerAssignments],
  deleteFood: [verifyToken, exports.deleteFood]
};
