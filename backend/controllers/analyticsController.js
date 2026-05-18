const { Op, fn, col, literal } = require("sequelize");
const Food = require("../models/Food");
const FoodRequest = require("../models/FoodRequest");
const User = require("../models/User");

// Restaurant analytics
exports.getRestaurantAnalytics = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const totalListings = await Food.count({
      where: { restaurantId },
    });

    const activeListings = await Food.count({
      where: {
        restaurantId,
        status: {
          [Op.in]: ["AVAILABLE", "REQUESTED", "ASSIGNED", "PICKED_UP"],
        },
      },
    });

    const deliveredListings = await Food.count({
      where: {
        restaurantId,
        status: "DELIVERED",
      },
    });

    const expiredListings = await Food.count({
      where: {
        restaurantId,
        status: "EXPIRED",
      },
    });

    const mealsResult = await Food.findOne({
      attributes: [[fn("SUM", col("mealsCount")), "totalMeals"]],
      where: {
        restaurantId,
        status: "DELIVERED",
      },
      raw: true,
    });

    const totalMealsServed = Number(mealsResult.totalMeals) || 0;

    const monthlyDonations = await Food.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
        [fn("COUNT", col("id")), "donations"],
        [fn("SUM", col("mealsCount")), "meals"],
      ],
      where: {
        restaurantId,
      },
      group: [literal("month")],
      order: [[literal("month"), "ASC"]],
      raw: true,
    });

    return res.json({
      totalListings,
      activeListings,
      deliveredListings,
      expiredListings,
      totalMealsServed,
      wasteReducedKg: totalMealsServed * 0.4,
      monthlyDonations,
    });
  } catch (error) {
    console.error("Restaurant analytics error:", error);
    return res.status(500).json({
      message: "Server error while fetching restaurant analytics",
    });
  }
};

// NGO analytics
exports.getNgoAnalytics = async (req, res) => {
  try {
    const ngoId = req.user.id;

    const totalRequests = await FoodRequest.count({
      where: { ngoId },
    });

    const pendingRequests = await FoodRequest.count({
      where: {
        ngoId,
        status: "PENDING",
      },
    });

    const acceptedRequests = await FoodRequest.count({
      where: {
        ngoId,
        status: {
          [Op.in]: ["ACCEPTED", "ASSIGNED", "PICKED_UP"],
        },
      },
    });

    const deliveredRequests = await FoodRequest.count({
      where: {
        ngoId,
        status: "DELIVERED",
      },
    });

    const deliveredRequestRows = await FoodRequest.findAll({
      where: {
        ngoId,
        status: "DELIVERED",
      },
      include: [
        {
          model: Food,
          as: "food",
          attributes: ["mealsCount"],
        },
      ],
    });

    const totalMealsReceived = deliveredRequestRows.reduce((sum, request) => {
      return sum + (Number(request.food?.mealsCount) || 0);
    }, 0);

    const monthlyRequests = await FoodRequest.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("FoodRequest.createdAt"), "%Y-%m"), "month"],
        [fn("COUNT", col("FoodRequest.id")), "requests"],
      ],
      where: {
        ngoId,
      },
      group: [literal("month")],
      order: [[literal("month"), "ASC"]],
      raw: true,
    });

    return res.json({
      totalRequests,
      pendingRequests,
      acceptedRequests,
      deliveredRequests,
      totalMealsReceived,
      wasteReducedKg: totalMealsReceived * 0.4,
      monthlyRequests,
    });
  } catch (error) {
    console.error("NGO analytics error:", error);
    return res.status(500).json({
      message: "Server error while fetching NGO analytics",
    });
  }
};

// Admin analytics
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count();

    const totalRestaurants = await User.count({
      where: { account_type: "restaurant" },
    });

    const totalNgos = await User.count({
      where: { account_type: "ngo" },
    });

    const totalVolunteers = await User.count({
      where: { account_type: "volunteer" },
    });

    const totalFoodListings = await Food.count();

    const deliveredFood = await Food.count({
      where: { status: "DELIVERED" },
    });

    const expiredFood = await Food.count({
      where: { status: "EXPIRED" },
    });

    const mealsResult = await Food.findOne({
      attributes: [[fn("SUM", col("mealsCount")), "totalMeals"]],
      where: {
        status: "DELIVERED",
      },
      raw: true,
    });

    const totalMealsServed = Number(mealsResult.totalMeals) || 0;

    const topDonors = await Food.findAll({
      attributes: [
        "restaurantId",
        [fn("COUNT", col("Food.id")), "donations"],
        [fn("SUM", col("Food.mealsCount")), "meals"],
      ],
      where: {
        status: "DELIVERED",
      },
      include: [
        {
          model: User,
          as: "restaurant",
          attributes: ["id", "name", "email"],
        },
      ],
      group: ["restaurantId", "restaurant.id"],
      order: [[literal("donations"), "DESC"]],
      limit: 5,
    });

    const monthlyPlatformGrowth = await Food.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
        [fn("COUNT", col("id")), "donations"],
        [fn("SUM", col("mealsCount")), "meals"],
      ],
      group: [literal("month")],
      order: [[literal("month"), "ASC"]],
      raw: true,
    });

    return res.json({
      totalUsers,
      totalRestaurants,
      totalNgos,
      totalVolunteers,
      totalFoodListings,
      deliveredFood,
      expiredFood,
      totalMealsServed,
      wasteReducedKg: totalMealsServed * 0.4,
      topDonors,
      monthlyPlatformGrowth,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return res.status(500).json({
      message: "Server error while fetching admin analytics",
    });
  }
};