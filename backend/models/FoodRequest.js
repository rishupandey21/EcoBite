const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const FoodRequest = sequelize.define(
  "FoodRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    foodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "foods",
        key: "id",
      },
    },

    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    ngoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    volunteerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "ASSIGNED",
        "PICKED_UP",
        "DELIVERED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    scheduledPickupTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    pickedUpAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    ngoNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    restaurantNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    volunteerNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "food_requests",
    timestamps: true,
  }
);

module.exports = FoodRequest;