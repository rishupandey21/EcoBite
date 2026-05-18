const User = require("../models/User");
const Food = require("../models/Food");
const FoodRequest = require("../models/FoodRequest");

// Admin: get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      message: "Server error while fetching users",
    });
  }
};

// Admin: verify user
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update({
      isVerified: true,
    });

    return res.json({
      message: "User verified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    console.error("Verify user error:", error);
    return res.status(500).json({
      message: "Server error while verifying user",
    });
  }
};

// Admin: suspend user
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.account_type === "admin") {
      return res.status(400).json({
        message: "Admin account cannot be suspended",
      });
    }

    await user.update({
      isSuspended: true,
    });

    return res.json({
      message: "User suspended successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    return res.status(500).json({
      message: "Server error while suspending user",
    });
  }
};

// Admin: reactivate user
exports.reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update({
      isSuspended: false,
    });

    return res.json({
      message: "User reactivated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    console.error("Reactivate user error:", error);
    return res.status(500).json({
      message: "Server error while reactivating user",
    });
  }
};

// Admin: get all food listings
exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.findAll({
      include: [
        {
          model: User,
          as: "restaurant",
          attributes: ["id", "name", "email", "phoneNumber", "address"],
        },
        {
          model: FoodRequest,
          as: "requests",
          required: false,
          include: [
            {
              model: User,
              as: "ngo",
              attributes: ["id", "name", "email"],
            },
            {
              model: User,
              as: "volunteer",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(foods);
  } catch (error) {
    console.error("Get all foods error:", error);
    return res.status(500).json({
      message: "Server error while fetching foods",
    });
  }
};