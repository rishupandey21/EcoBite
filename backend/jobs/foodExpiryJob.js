const cron = require("node-cron");
const { Op } = require("sequelize");
const Food = require("../models/Food");
const FoodRequest = require("../models/FoodRequest");

const startFoodExpiryJob = () => {
  /*
    Cron format:
    10 * * * * = every 10 minutes
  */

  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();

      const expiredFoods = await Food.findAll({
        where: {
          expiryDate: {
            [Op.lt]: now,
          },
          status: {
            [Op.in]: ["AVAILABLE", "REQUESTED"],
          },
        },
      });

      if (expiredFoods.length === 0) {
        console.log("Expiry job: No expired foods found");
        return;
      }

      const expiredFoodIds = expiredFoods.map((food) => food.id);

      await Food.update(
        {
          status: "EXPIRED",
        },
        {
          where: {
            id: {
              [Op.in]: expiredFoodIds,
            },
          },
        }
      );

      await FoodRequest.update(
        {
          status: "CANCELLED",
        },
        {
          where: {
            foodId: {
              [Op.in]: expiredFoodIds,
            },
            status: {
              [Op.in]: ["PENDING", "ACCEPTED"],
            },
          },
        }
      );

      console.log(
        `Expiry job: ${expiredFoodIds.length} food listing(s) marked as EXPIRED`
      );
    } catch (error) {
      console.error("Expiry job error:", error);
    }
  });

  console.log("Food expiry job started: runs every 10 minutes");
};

module.exports = startFoodExpiryJob;