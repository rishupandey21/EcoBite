const { Op } = require("sequelize");
const Food = require("../models/Food");
const User = require("../models/User");
const FoodRequest = require("../models/FoodRequest");
const sendEmail = require("../utils/emailService");

// NGO creates a request for a food item
exports.createRequest = async (req, res) => {
  try {
    const { foodId, scheduledPickupTime, ngoNotes } = req.body;

    if (!foodId) {
      return res.status(400).json({
        message: "foodId is required",
      });
    }

    const food = await Food.findByPk(foodId, {
      include: [
        {
          model: User,
          as: "restaurant",
          attributes: ["id", "name", "email", "phoneNumber"],
        },
      ],
    });

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

    const existingRequest = await FoodRequest.findOne({
      where: {
        foodId: food.id,
        ngoId: req.user.id,
        restaurantId: food.restaurantId,
      },
    });
    

    if (existingRequest) {
      return res.status(200).json({
        message: "You already requested this food",
        request: existingRequest,
      });
    }

    const createdRequest = await FoodRequest.create({
      foodId: food.id,
      ngoId: req.user.id,
      restaurantId: food.restaurantId,
      scheduledPickupTime,
      ngoNotes,
      status: "PENDING",
    });

    await food.update({
      status: "REQUESTED",
    });


    await sendEmail({
      to: food.restaurant?.email,
      subject: "New Pickup Request Received - EcoBite",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Pickup Request Received</h2>
          <p>Hello ${food.restaurant?.name || "Restaurant"},</p>

          <p>An NGO has requested pickup for your food donation.</p>

          <h3>Food Details</h3>
          <p><strong>Food Item:</strong> ${food.foodName}</p>
          <p><strong>Quantity:</strong> ${food.quantity}</p>
          <p><strong>Expiry:</strong> ${new Date(food.expiryDate).toLocaleString()}</p>

          ${
            ngoNotes
              ? `<p><strong>NGO Note:</strong> ${ngoNotes}</p>`
              : ""
          }

          <p>Please login to EcoBite and review this request.</p>

          <p style="color: #16a34a; font-weight: bold;">EcoBite Notifications</p>
        </div>
      `,
    });

    const io = req.app.get("io");

      io.to(`user_${food.restaurantId}`).emit("new_pickup_request", {
        message: "New pickup request received",
        request: createdRequest,
      });

      io.to("admin").emit("pickup_request_created", {
        message: "New pickup request created",
        request: createdRequest,
    });

    return res.status(201).json({
      message: "Pickup request created successfully",
      request: createdRequest,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Restaurant fetches all requests sent to them
exports.getRestaurantRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.findAll({
      where: {
        restaurantId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "ngo",
          attributes: ["id", "name", "email", "phoneNumber", "address"],
        },
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "name", "email", "phoneNumber", "address"],
        },
        {
          model: Food,
          as: "food",
          attributes: [
            "id",
            "foodName",
            "quantity",
            "mealsCount",
            "category",
            "expiryDate",
            "pickupStartTime",
            "pickupEndTime",
            "pickupAddress",
            "imageUrl",
            "status",
            "createdAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(requests);
  } catch (error) {
    console.error("Get restaurant requests error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// NGO fetches their own requests
exports.getNgoRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.findAll({
      where: {
        ngoId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "restaurant",
          attributes: ["id", "name", "email", "phoneNumber", "address"],
        },
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "name", "email", "phoneNumber", "address"],
        },
        {
          model: Food,
          as: "food",
          attributes: [
            "id",
            "foodName",
            "quantity",
            "mealsCount",
            "category",
            "expiryDate",
            "pickupStartTime",
            "pickupEndTime",
            "pickupAddress",
            "imageUrl",
            "status",
            "createdAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(requests);
  } catch (error) {
    console.error("Get NGO requests error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Restaurant accepts a request
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { restaurantNotes } = req.body;

    const request = await FoodRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: "ngo",
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: Food,
          as: "food",
          attributes: ["id", "foodName", "quantity", "expiryDate"],
        },
        {
          model: User,
          as: "restaurant",
          attributes: ["id", "name", "email", "phoneNumber"],
        },
      ],
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.restaurantId !== req.user.id) {
      return res.status(403).json({
        message: "You can only accept requests sent to your restaurant",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: `Request cannot be accepted because it is already ${request.status}`,
      });
    }

    const food = await Food.findByPk(request.foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    if (!["AVAILABLE", "REQUESTED"].includes(food.status)) {
      return res.status(400).json({
        message: "Food is no longer available",
      });
    }

    await request.update({
      status: "ACCEPTED",
      restaurantNotes,
    });

    await food.update({
      status: "REQUESTED",
    });

    // Reject other pending requests for the same food
    await FoodRequest.update(
      {
        status: "REJECTED",
      },
      {
        where: {
          id: {
            [Op.ne]: request.id,
          },
          foodId: request.foodId,
          status: "PENDING",
        },
      }
    );


    await sendEmail({
      to: request.ngo?.email,
      subject: "Your Pickup Request Was Accepted - EcoBite",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Pickup Request Accepted</h2>

          <p>Hello ${request.ngo?.name || "NGO"},</p>

          <p>Your pickup request has been accepted by the restaurant.</p>

          <h3>Request Details</h3>
          <p><strong>Restaurant:</strong> ${request.restaurant?.name || "Restaurant"}</p>
          <p><strong>Food Item:</strong> ${request.food?.foodName || "Food"}</p>
          <p><strong>Quantity:</strong> ${request.food?.quantity || "Not mentioned"}</p>
          <p><strong>Expiry:</strong> ${
            request.food?.expiryDate
              ? new Date(request.food.expiryDate).toLocaleString()
              : "Not available"
          }</p>

          ${
            restaurantNotes
              ? `<p><strong>Restaurant Note:</strong> ${restaurantNotes}</p>`
              : ""
          }

          <p>You can now login to EcoBite and assign a volunteer for pickup.</p>

          <p style="color: #16a34a; font-weight: bold;">EcoBite Notifications</p>
        </div>
      `,
    });

    const io = req.app.get("io");

      io.to(`user_${request.ngoId}`).emit("request_accepted", {
        message: "Your pickup request was accepted",
        request,
      });

      io.to("admin").emit("request_status_updated", {
        message: "A pickup request was accepted",
        request,
    });

    return res.json({
      message: "Request accepted successfully",
      request,
    });
  } catch (error) {
    console.error("Accept request error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// NGO assigns volunteer to accepted request
exports.assignVolunteer = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({
        message: "volunteerId is required",
      });
    }

    const request = await FoodRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.ngoId !== req.user.id) {
      return res.status(403).json({
        message: "You can only assign volunteer to your own request",
      });
    }

    if (request.status !== "ACCEPTED") {
      return res.status(400).json({
        message: "Volunteer can be assigned only after restaurant accepts request",
      });
    }

    const volunteer = await User.findOne({
      where: {
        id: volunteerId,
        account_type: "volunteer",
        isSuspended: false,
      },
    });

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found",
      });
    }

    const food = await Food.findByPk(request.foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    await request.update({
      volunteerId,
      status: "ASSIGNED",
    });

    await food.update({
      status: "ASSIGNED",
    });

    const io = req.app.get("io");

      io.to(`user_${volunteerId}`).emit("volunteer_assigned", {
        message: "You have been assigned a new pickup",
        request,
      });

      io.to(`user_${request.restaurantId}`).emit("volunteer_assigned_to_request", {
        message: "Volunteer assigned for pickup",
        request,
      });

      io.to("admin").emit("request_status_updated", {
        message: "Volunteer assigned to request",
        request,
    });

    return res.json({
      message: "Volunteer assigned successfully",
      request,
    });
  } catch (error) {
    console.error("Assign volunteer error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Volunteer marks food as picked up
exports.markPickedUp = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { volunteerNotes } = req.body;

    const request = await FoodRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.volunteerId !== req.user.id) {
      return res.status(403).json({
        message: "This pickup is not assigned to you",
      });
    }

    if (request.status !== "ASSIGNED") {
      return res.status(400).json({
        message: "Only assigned pickup can be marked as picked up",
      });
    }

    const food = await Food.findByPk(request.foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    await request.update({
      status: "PICKED_UP",
      pickedUpAt: new Date(),
      volunteerNotes,
    });

    await food.update({
      status: "PICKED_UP",
    });

    const io = req.app.get("io");

      io.to(`user_${request.ngoId}`).emit("food_picked_up", {
        message: "Food has been picked up by volunteer",
        request,
      });

      io.to(`user_${request.restaurantId}`).emit("food_picked_up", {
        message: "Food has been picked up by volunteer",
        request,
      });

      io.to("admin").emit("request_status_updated", {
        message: "Food picked up",
        request,
    });

    return res.json({
      message: "Food marked as picked up",
      request,
    });
  } catch (error) {
    console.error("Mark picked up error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Volunteer marks food as delivered
exports.markDelivered = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { volunteerNotes } = req.body;

    const request = await FoodRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.volunteerId !== req.user.id) {
      return res.status(403).json({
        message: "This delivery is not assigned to you",
      });
    }

    if (request.status !== "PICKED_UP") {
      return res.status(400).json({
        message: "Food must be picked up before delivery",
      });
    }

    const food = await Food.findByPk(request.foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    await request.update({
      status: "DELIVERED",
      deliveredAt: new Date(),
      volunteerNotes,
    });

    await food.update({
      status: "DELIVERED",
    });

    const io = req.app.get("io");

      io.to(`user_${request.ngoId}`).emit("food_delivered", {
        message: "Food delivered successfully",
        request,
      });

      io.to(`user_${request.restaurantId}`).emit("food_delivered", {
        message: "Food delivered successfully",
        request,
      });

      io.to("admin").emit("request_status_updated", {
        message: "Food delivered successfully",
        request,
    });

    return res.json({
      message: "Food marked as delivered",
      request,
    });
  } catch (error) {
    console.error("Mark delivered error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// NGO cancels their request
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FoodRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.ngoId !== req.user.id) {
      return res.status(403).json({
        message: "You can only cancel your own request",
      });
    }

    if (["PICKED_UP", "DELIVERED"].includes(request.status)) {
      return res.status(400).json({
        message: "Picked up or delivered request cannot be cancelled",
      });
    }

    const food = await Food.findByPk(request.foodId);

    await request.update({
      status: "CANCELLED",
    });

    if (food && ["REQUESTED", "ASSIGNED"].includes(food.status)) {
      await food.update({
        status: "AVAILABLE",
      });
    }

    return res.json({
      message: "Request cancelled successfully",
      request,
    });
  } catch (error) {
    console.error("Cancel request error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};