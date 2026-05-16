const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected to MySQL successfully!");
  } catch (err) {
    console.error("Unable to connect to database:", err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };