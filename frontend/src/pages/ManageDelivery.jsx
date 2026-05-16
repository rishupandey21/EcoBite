import React, { useEffect, useMemo, useState } from 'react';
import { Truck, MapPin, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { handleError } from '../utils';

export default function ManageDeliveries() {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const [claimedOrders, setClaimedOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]); 

  const [volunteers, setVolunteers] = useState([]);

  const getTimeAgo = useMemo(() => (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }, []);

  useEffect(() => {
    const fetchAcceptedOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/requests/ngo`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const accepted = (res.data || []).filter((r) => r.status === 'accepted');
        const transformed = accepted.map((r, idx) => ({
          id: r.id,
          restaurant: r.restaurant?.name || 'Restaurant',
          item: r.food ? `${r.food.foodName} (${r.food.quantity})` : 'Food',
          timeClaimed: getTimeAgo(r.createdAt),
          distance: idx % 2 === 0 ? '2.5 km' : '4.1 km'
        }));

        setClaimedOrders(transformed);
        setActiveOrder(transformed[0] || null);
      } catch (error) {
        handleError(error.response?.data?.message || 'Failed to load claimed orders');
      }
    };

    fetchAcceptedOrders();
  }, [API_URL, getTimeAgo, user]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/users/volunteers`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Keep UI fields intact (vehicle/distance/rating not stored yet)
        const transformed = (res.data || []).map((v, idx) => ({
          id: v.id,
          name: v.name,
          vehicle: 'Volunteer',
          distance: idx % 2 === 0 ? '0.5 km' : '1.2 km',
          rating: ''
        }));

        setVolunteers(transformed);
      } catch (error) {
        handleError(error.response?.data?.message || 'Failed to load volunteers');
      }
    };

    fetchVolunteers();
  }, [API_URL, user]);

  const handleAssign = (volunteerName) => {
    if (!activeOrder) return;
    setAssignedOrders([...assignedOrders, activeOrder.id]);
    alert(`${volunteerName} has been assigned to pick up from ${activeOrder.restaurant}!`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#050505] pt-32 pb-12">
      <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Truck className="text-indigo-400" size={32} /> Assign Deliveries
          </h1>
          <p className="text-gray-400 text-lg">Select a claimed order and dispatch a nearby volunteer.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[650px]">
          
          {/* LEFT PANE: Claimed Orders */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/5">
              <h2 className="font-bold text-lg">Needs Driver</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {claimedOrders.length === 0 ? (
                <div className="text-center text-gray-500 font-medium py-8">
                  No accepted requests yet.
                </div>
              ) : (
                claimedOrders.map((order) => (
                  <div 
                    key={order.id}
                    onClick={() => setActiveOrder(order)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                      activeOrder?.id === order.id 
                        ? 'bg-white/10 border-indigo-500/50 shadow-lg' 
                        : 'bg-[#050505]/50 border-white/5 hover:bg-white/5'
                    }`}
                  >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-indigo-400 font-black text-sm">{order.restaurant}</span>
                    <span className="text-xs text-gray-500 font-bold">{order.timeClaimed}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 truncate">{order.item}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><MapPin size={12}/> {order.distance} away</span>
                    {assignedOrders.includes(order.id) && (
                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} /> Dispatched
                      </span>
                    )}
                  </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANE: Volunteer List */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-bold text-xl text-white">Nearby Volunteers</h2>
                <p className="text-sm text-gray-400">For: <span className="text-indigo-300 font-medium">{activeOrder?.item || '-'}</span></p>
              </div>
              <span className="bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-400"/> Verified Drivers Only
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/[0.02]">
              {activeOrder && assignedOrders.includes(activeOrder.id) ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                  <CheckCircle2 size={64} className="text-green-500 mb-4" />
                  <h3 className="text-2xl font-black text-white mb-2">Driver Dispatched!</h3>
                  <p className="text-gray-400">A volunteer is on their way to pick up this order.</p>
                </div>
              ) : (
                volunteers.map((vol) => (
                  <div key={vol.id} className="bg-[#050505] border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all shadow-lg group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                        {vol.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white flex items-center gap-2">
                          {vol.name} <span className="text-yellow-500 text-sm">{vol.rating}</span>
                        </h4>
                        <p className="text-sm text-gray-400 font-medium">{vol.vehicle} • {vol.distance} away</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => activeOrder && handleAssign(vol.name)}
                      className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                    >
                      <UserCheck size={18} /> Assign Task
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}