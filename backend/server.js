const express = require('express');
const cors = require('cors');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); 
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db'); // Sequelize setup
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');
const startFoodExpiryJob = require("./jobs/foodExpiryJob");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Import models for relationships
const User = require('./models/User');
const Food = require('./models/Food');
const FoodRequest = require('./models/FoodRequest');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});
// Make io available inside controllers
app.set("io", io);


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join role-based rooms
  socket.on("join_role_room", ({ role, userId }) => {
    if (role) {
      socket.join(role);
      console.log(`User joined role room: ${role}`);
    }

    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User joined personal room: user_${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Security headers
app.use(helmet());

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limit for all API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per IP in 15 minutes
  message: {
    message: "Too many requests, please try again later",
  },
});

app.use("/api", apiLimiter);

// Middleware
app.use(express.json());


const sendEmail = require("./utils/emailService");

app.get("/api/test-email", async (req, res) => {
  await sendEmail({
    to: process.env.EMAIL_USER,
    subject: "EcoBite Test Email",
    html: `
      <h2>EcoBite Email Test</h2>
      <p>If you received this email, Nodemailer is working successfully.</p>
    `,
  });

  res.json({
    message: "Test email triggered. Check your inbox.",
  });
});

// Model relationships

// Restaurant → Foods
User.hasMany(Food, {
  foreignKey: "restaurantId",
  as: "foods",
});

Food.belongsTo(User, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

// Food → Food Requests
Food.hasMany(FoodRequest, {
  foreignKey: "foodId",
  as: "requests",
});

FoodRequest.belongsTo(Food, {
  foreignKey: "foodId",
  as: "food",
});

// Restaurant → Incoming Requests
User.hasMany(FoodRequest, {
  foreignKey: "restaurantId",
  as: "incomingRequests",
});

FoodRequest.belongsTo(User, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

// NGO → Outgoing Requests
User.hasMany(FoodRequest, {
  foreignKey: "ngoId",
  as: "ngoRequests",
});

FoodRequest.belongsTo(User, {
  foreignKey: "ngoId",
  as: "ngo",
});

// Volunteer → Assigned Requests
User.hasMany(FoodRequest, {
  foreignKey: "volunteerId",
  as: "assignedPickups",
});

FoodRequest.belongsTo(User, {
  foreignKey: "volunteerId",
  as: "volunteer",
});

// Connect to DB
connectDB();

sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('All tables synced successfully!');
    startFoodExpiryJob();
  })
  .catch((err) => {
    console.error('Error syncing tables:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});