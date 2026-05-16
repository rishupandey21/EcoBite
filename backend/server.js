const express = require('express');
const cors = require('cors'); 
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db'); // Sequelize setup
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');

// Import models for relationships
const User = require('./models/User');
const Food = require('./models/Food');
const FoodRequest = require('./models/FoodRequest');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Model relationships
User.hasMany(Food, { foreignKey: 'restaurantId', as: 'foods' });
Food.belongsTo(User, { foreignKey: 'restaurantId', as: 'restaurant' });
Food.belongsTo(User, { foreignKey: 'claimedBy', as: 'claimer' });

User.hasMany(FoodRequest, { foreignKey: 'restaurantId', as: 'incomingRequests' });
User.hasMany(FoodRequest, { foreignKey: 'ngoId', as: 'outgoingRequests' });
FoodRequest.belongsTo(User, { foreignKey: 'restaurantId', as: 'restaurant' });
FoodRequest.belongsTo(User, { foreignKey: 'ngoId', as: 'ngo' });
Food.hasMany(FoodRequest, { foreignKey: 'foodId', as: 'requests' });
FoodRequest.belongsTo(Food, { foreignKey: 'foodId', as: 'food' });

// Connect to DB
connectDB();

sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('All tables synced successfully!');
  })
  .catch((err) => {
    console.error('Error syncing tables:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});