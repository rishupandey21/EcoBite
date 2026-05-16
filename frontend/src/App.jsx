import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';


import Register from './pages/Register';
import Login from './pages/Login';  


import RestaurantDashboard from './pages/RestaurantDashboard';
import NgoRequests from './pages/NgoRequests';
import AddFood from './pages/AddFood';
import VolunteerDashboard from './pages/VolunteerDashboard';
import FoodListings from './pages/FoodListings';
import FoodNearYouNGO from './pages/FoodNearYouNGO';
import ManageDeliveries from './pages/ManageDelivery';
import NgoDashboard from './pages/NgoDashboard';
import About from './pages/About';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restaurants" element={<FoodNearYouNGO />} />
          
          {/* New Routes */}
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/add-food" element={<AddFood />} />
          <Route path="/ngo-requests" element={<NgoRequests />} />
          <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
          <Route path="/food-listings" element={<FoodListings />} />
          <Route path="/manage-deliveries" element={<ManageDeliveries />} />
          <Route path="/ngo-dashboard" element={<NgoDashboard />} />
          <Route path="/about" element={<About />} />
          
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;