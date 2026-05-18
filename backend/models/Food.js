const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Food = sequelize.define(
  "Food",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    foodName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mealsCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    imagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    pickupStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    pickupEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    pickupAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "AVAILABLE",
        "REQUESTED",
        "ASSIGNED",
        "PICKED_UP",
        "DELIVERED",
        "EXPIRED",
        "CANCELLED"
      ),
      defaultValue: "AVAILABLE",
    },
  },
  {
    tableName: "foods",
    timestamps: true,
  }
);

module.exports = Food;