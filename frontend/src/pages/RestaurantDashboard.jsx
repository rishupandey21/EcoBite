import React, { useState, useEffect } from 'react';
import { Plus, Package, Clock, CheckCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { handleSuccess, handleError } from '../utils';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    total: 0
  });

  const [orderRequests, setOrderRequests] = useState([]);

  useEffect(() => {
    fetchRestaurantFoods();
    fetchNgoRequests();
  }, []);

  const fetchRestaurantFoods = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_URL}/api/food/my-donations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setFoods(res.data);
      
      // Calculate stats based on your active listings
      const active = res.data.filter(food => food.status === 'available').length;
      const pending = res.data.filter(food => food.status === 'claimed').length;
const total = res.data.filter(food => food.status === 'completed').length;
      setStats({ active, pending, total });
    } catch (error) {
      handleError('Failed to fetch food donations');
    }
  };

  const fetchNgoRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/requests/restaurant`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const transformed = res.data.map((r) => ({
        id: r.id,
        foodName: r.food ? `${r.food.foodName} (${r.food.quantity})` : 'Food',
        ngoName: r.ngo?.name || 'NGO',
        status: r.status,
        date: new Date(r.createdAt).toLocaleString()
      }));
      setOrderRequests(transformed);
    } catch (error) {
      // Keep dashboard usable even if requests fail
    }
  };

  const getRequestStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Available</span>;
      case 'claimed':
        return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Claimed</span>;
      case 'picked_up':
        return <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Picked Up</span>;
      case 'expired':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Expired</span>;
      case 'pending':
        return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>;
      case 'accepted':
        return <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Accepted</span>;
      case 'rejected':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Rejected</span>;
      default:
        return <span className="bg-white/10 text-gray-400 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Unknown</span>;
    }
  };

  const statsData = [
    { label: "Active Listings", value: stats.active.toString(), icon: <Package className="text-blue-400" /> },
    { label: "Pending Pickups", value: stats.pending.toString(), icon: <Clock className="text-orange-400" /> },
    { label: "Total Donations", value: stats.total.toString(), icon: <CheckCircle className="text-green-400" /> },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#050505] pt-32 pb-12">
      
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* 1. WELCOME & ALERT BAR */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">Welcome back, {user?.name || "Partner"}</h1>
          <p className="text-gray-400 text-lg mb-6">Here is your daily surplus snapshot.</p>
          
          {stats.pending > 0 && (
            <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3 text-orange-400 shadow-lg">
              <AlertTriangle size={20} />
              <span className="font-medium text-sm">Action Needed: You have <strong>{stats.pending} claimed</strong> order(s) awaiting pickup.</span>
            </div>
          )}
        </div>

        {/* 2. QUICK ACTION TRIGGERS */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link to="/add-food" className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
            <Plus size={22} /> List New Surplus
          </Link>
          <Link to="/ngo-requests" className="flex-1 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all shadow-sm hover:-translate-y-1">
            <MessageSquare size={22} /> View NGO Requests 
          </Link>
        </div>

        {/* 3. STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {statsData.map((stat, i) => (
            <div key={i} className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/10 group">
              <div className="mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 4. ALL-TIME REQUESTED ORDERS TABLE */}
        <h2 className="text-2xl font-bold mb-6 text-white">All-Time Requested Orders</h2>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Food Item</th>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Requested By (NGO)</th>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Date</th>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orderRequests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                      No requests have been made yet.
                    </td>
                  </tr>
                ) : (
                  // --- FIX: Mapping over orderRequests instead of foods ---
                  orderRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-white">{request.foodName}</td>
                      <td className="p-5 text-gray-400 font-medium">{request.ngoName}</td>
                      <td className="p-5 text-gray-400 font-medium text-sm">{request.date}</td>
                      <td className="p-5">{getRequestStatusBadge(request.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}