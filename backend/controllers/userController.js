const User = require("../models/User");

// Get all verified volunteers
exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.findAll({
      where: {
        account_type: "volunteer",
        isSuspended: false,
      },
      attributes: [
        "id",
        "name",
        "email",
        "phoneNumber",
        "address",
        "latitude",
        "longitude",
        "isVerified",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(volunteers);
  } catch (error) {
    console.error("Get volunteers error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};