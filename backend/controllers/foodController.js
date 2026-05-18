const { Op, Sequelize } = require("sequelize");
const Food = require("../models/Food");
const FoodRequest = require("../models/FoodRequest");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// Create new food donation
exports.createFood = async (req, res) => {
  try {
    const {
      foodName,
      quantity,
      mealsCount,
      category,
      expiryDate,
      pickupStartTime,
      pickupEndTime,
      pickupAddress,
      latitude,
      longitude,
      description,
    } = req.body;

    if (!foodName || !quantity || !category || !expiryDate) {
      return res.status(400).json({
        message: "Food name, quantity, category and expiry date are required",
      });
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);

      imageUrl = uploadedImage.secure_url;
      imagePublicId = uploadedImage.public_id;
    }

    const newFood = await Food.create({
      restaurantId: req.user.id,
      foodName,
      quantity,
      mealsCount: Number(mealsCount) || 0,
      category,
      expiryDate,
      pickupStartTime: pickupStartTime || null,
      pickupEndTime: pickupEndTime || null,
      pickupAddress,
      latitude: latitude || null,
      longitude: longitude || null,
      description,
      imageUrl,
      imagePublicId,
      status: "AVAILABLE",
    });

    const io = req.app.get("io");

      io.to("ngo").emit("new_food_available", {
        message: "New food donation available near you",
        food: newFood,
      });

      io.to("admin").emit("food_created", {
        message: "New food listing created",
        food: newFood,
    });

    return res.status(201).json({
      message: "Food added successfully",
      food: newFood,
    });
  } catch (error) {
    console.error("Create food error:", error);
    return res.status(500).json({
      message: "Server error while adding food",
    });
  }
};

// Get all food donations for logged-in restaurant
exports.getRestaurantFoods = async (req, res) => {
  try {
    const foods = await Food.findAll({
      where: {
        restaurantId: req.user.id,
        status: {
          [Op.in]: ["AVAILABLE"],
        },
      },
      include: [  
        {
          model: FoodRequest,
          as: "requests",
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(foods);
  } catch (error) {
    console.error("Get restaurant foods error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all available food donations for NGO
// Get nearby available food donations for NGO
exports.getAvailableFoods = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    // If NGO location is not provided, return normal available foods
    // This keeps page working even before location permission.
    if (!lat || !lng) {
      const foods = await Food.findAll({
        where: {
          status: "AVAILABLE",
          expiryDate: {
            [Op.gt]: new Date(),
          },
        },
        include: [
          {
            model: User,
            as: "restaurant",
            attributes: [
              "id",
              "name",
              "email",
              "phoneNumber",
              "address",
              "latitude",
              "longitude",
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.json(foods);
    }

    const ngoLat = parseFloat(lat);
    const ngoLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    if (Number.isNaN(ngoLat) || Number.isNaN(ngoLng)) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    /*
      Haversine formula:
      6371 = Earth radius in kilometers

      It calculates distance between:
      - NGO current location
      - Food pickup location
    */
    const distanceFormula = Sequelize.literal(`
  6371 * acos(
    cos(radians(${ngoLat}))
    * cos(radians(\`Food\`.\`latitude\`))
    * cos(radians(\`Food\`.\`longitude\`) - radians(${ngoLng}))
    + sin(radians(${ngoLat}))
    * sin(radians(\`Food\`.\`latitude\`))
  )
`);

    const foods = await Food.findAll({
      attributes: {
        include: [[distanceFormula, "distance"]],
      },
      where: {
        status: "AVAILABLE",
        expiryDate: {
          [Op.gt]: new Date(),
        },
        latitude: {
          [Op.ne]: null,
        },
        longitude: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: User,
          as: "restaurant",
          attributes: [
            "id",
            "name",
            "email",
            "phoneNumber",
            "address",
            "latitude",
            "longitude",
          ],
        },
      ],
      having: Sequelize.literal(`\`distance\` <= ${searchRadius}`),
      order: Sequelize.literal("distance ASC"),
    });

    const foodIds = foods.map((food) => food.id);

    const requests = await FoodRequest.findAll({
      where: {
        ngoId: req.user.id,
        foodId: foodIds.length > 0 ? foodIds : [0],
      },
      order: [["createdAt", "DESC"]],
    });

    const latestRequestByFood = new Map();

    for (const request of requests) {
      if (!latestRequestByFood.has(request.foodId)) {
        latestRequestByFood.set(request.foodId, request);
      }
    }

    const enrichedFoods = foods.map((food) => {
      const request = latestRequestByFood.get(food.id);

      return {
        ...food.toJSON(),
        distance: Number(food.getDataValue("distance")).toFixed(2),
        requestStatus: request?.status || null,
        requestId: request?.id || null,
      };
    });

    return res.json(enrichedFoods);
  } catch (error) {
    console.error("Get nearby foods error:", error);
    return res.status(500).json({
      message: "Server error while fetching nearby food",
    });
  }
};

// Temporary old claim food API
// Later request system will fully replace this.
exports.claimFood = async (req, res) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findByPk(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    if (food.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "Food is no longer available",
      });
    }

    await food.update({
      status: "REQUESTED",
    });

    return res.json({
      message: "Food marked as requested",
      food,
    });
  } catch (error) {
    console.error("Claim food error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get volunteer assigned pickups
exports.getVolunteerAssignments = async (req, res) => {
  try {
    const assignments = await FoodRequest.findAll({
      where: {
        volunteerId: req.user.id,
      },
      include: [
        {
          model: Food,
          as: "food",
          include: [
            {
              model: User,
              as: "restaurant",
              attributes: [
                "id",
                "name",
                "email",
                "phoneNumber",
                "address",
                "latitude",
                "longitude",
              ],
            },
          ],
        },
        {
          model: User,
          as: "ngo",
          attributes: [
            "id",
            "name",
            "email",
            "phoneNumber",
            "address",
            "latitude",
            "longitude",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(assignments);
  } catch (error) {
    console.error("Get volunteer assignments error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete food donation
exports.deleteFood = async (req, res) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findByPk(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    if (food.restaurantId !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own food listings",
      });
    }

    await food.destroy();

    return res.json({
      message: "Food donation deleted successfully",
    });
  } catch (error) {
    console.error("Delete food error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};