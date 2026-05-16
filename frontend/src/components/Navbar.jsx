import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // <-- Fixed: Added useLocation import
import { Leaf, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL path
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  // Helper function to dynamically set link classes based on the current path
  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-green-400 font-bold transition-colors" // Active state (Green)
      : "text-white/70 hover:text-white font-medium transition-colors"; // Inactive state (White)
  };

  const renderNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          {/* Applied getLinkClass to Home */}
          <Link to="/" className={getLinkClass('/')}>Home</Link>
          <Link to="/about" className={getLinkClass('/about')}>About</Link>
          <Link 
            to="/login" 
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transform duration-200 text-center ${
              location.pathname === '/login' 
                ? 'bg-green-500 text-black' // Green button if on login page
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            Login
          </Link>
        </>
      );
    }

    // Applied getLinkClass to the common Home link
    const commonLinks = <Link to="/" className={getLinkClass('/')}>Home</Link>;

    switch (user?.account_type) {
      case 'restaurant':
        return (
          <>
            {commonLinks}
            {/* Applied getLinkClass to all Restaurant links */}
            <Link to="/ngo-requests" className={getLinkClass('/ngo-requests')}>Requests</Link>
            <Link to="/food-listings" className={getLinkClass('/food-listings')}>Food Listings</Link>
            <Link to="/restaurant-dashboard" className={getLinkClass('/restaurant-dashboard')}>Dashboard</Link>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-white/90 font-medium text-sm">{user.name}</span>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors font-medium text-sm">
                <LogOut className="w-4 h-4" />
                <span className="md:hidden">Logout</span>
              </button>
            </div>
          </>
        );
      
      case 'ngo':
        return (
          <>
            {commonLinks}
            {/* Applied getLinkClass to all NGO links */}
            <Link to="/restaurants" className={getLinkClass('/restaurants')}>Food Near You</Link>
            <Link to="/manage-deliveries" className={getLinkClass('/manage-deliveries')}>Manage Deliveries</Link>
            <Link to="/ngo-dashboard" className={getLinkClass('/ngo-dashboard')}>Dashboard</Link>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-white/90 font-medium text-sm">{user.name}</span>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors font-medium text-sm">
                <LogOut className="w-4 h-4" />
                <span className="md:hidden">Logout</span>
              </button>
            </div>
          </>
        );
      
      case 'volunteer':
        return (
          <>
            {commonLinks}
            {/* Applied getLinkClass to Volunteer link */}
            <Link to="/volunteer-dashboard" className={getLinkClass('/volunteer-dashboard')}>Volunteer Hub</Link>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-white/90 font-medium text-sm">{user.name}</span>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors font-medium text-sm">
                <LogOut className="w-4 h-4" />
                <span className="md:hidden">Logout</span>
              </button>
            </div>
          </>
        );
      
      default:
        return (
          <>
            {commonLinks}
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-white/90 font-medium text-sm">{user.name}</span>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors font-medium text-sm">
                <LogOut className="w-4 h-4" />
                <span className="md:hidden">Logout</span>
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50">
      {/* Added 'relative' to nav so the dropdown anchors to it properly */}
      <nav className="relative flex justify-between items-center px-6 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-white font-black text-xl tracking-tight z-50">
          <Leaf className="text-green-500" strokeWidth={3} size={24} /> EcoBite
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {renderNavLinks()}
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="md:hidden text-white/80 hover:text-white transition-colors z-50"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* RIGHT-ALIGNED Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-[110%] right-0 md:hidden mt-2 min-w-[220px]">
            <div 
              className="flex flex-col items-end gap-5 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {renderNavLinks()}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}