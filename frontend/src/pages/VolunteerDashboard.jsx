import React, { useEffect, useState } from 'react';
import { MapPin, Box, CheckCircle2, Navigation } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { handleError } from '../utils';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/food/my-assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAssignments(res.data);
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const currentTask = assignments[0] || null;
  const deliveredCount = assignments.filter((a) => a.status === 'picked_up').length;
  const activeCount = assignments.filter((a) => a.status === 'claimed').length;

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#050505] pt-32 pb-12">
      {/* --- Ambient Background Glows --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white">Volunteer Hub</h1>
          <p className="text-gray-400 text-lg">Your active deliveries and impact stats.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Box className="text-green-400" size={20} /> Current Assignment
            </h2>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
              {loading ? (
                <p className="text-gray-400">Loading your assignments...</p>
              ) : !currentTask ? (
                <div className="text-center text-gray-400 py-10">
                  <p className="font-bold text-lg mb-2">No active assignment</p>
                  <p className="text-sm">
                    Once you claim a donation, it will appear here with pickup and delivery details.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <span className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/30">
                      {currentTask.status === 'claimed'
                        ? 'Pending Pickup'
                        : currentTask.status === 'picked_up'
                        ? 'In Transit'
                        : currentTask.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm font-bold">
                      Pickup: {currentTask.pickupTime}
                    </span>
                  </div>

                  <div className="flex gap-6 mb-10">
                    <div className="w-6 flex flex-col items-center mt-1">
                      <div className="w-4 h-4 bg-green-400 rounded-full border-4 border-[#050505]" />
                      <div className="w-0.5 h-16 bg-white/20 my-1" />
                      <MapPin size={22} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
                        Pickup From
                      </p>
                      <p className="font-black text-2xl mb-2 text-white">
                        Restaurant #{currentTask.restaurantId}
                      </p>
                      <p className="text-sm text-gray-400 mb-6">
                        Item: <span className="text-gray-200">{currentTask.foodName}</span> (
                        {currentTask.quantity})
                      </p>

                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
                        Deliver To
                      </p>
                      <p className="font-black text-2xl text-white">
                        Assigned NGO / beneficiary (to be linked)
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/20 hover:-translate-y-1 transition-all shadow-lg">
                      <Navigation size={18} /> Directions
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-green-500 text-black py-4 rounded-2xl font-bold hover:bg-green-400 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                      <CheckCircle2 size={18} /> Mark Picked Up
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dark Glass Sidebar */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 h-fit shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white">Your Impact</h2>
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-2xl flex justify-between items-center border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-gray-400 font-medium">Active Assignments</span>
                <span className="font-black text-2xl text-white">{activeCount}</span>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl flex justify-between items-center border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-gray-400 font-medium">Completed Pickups</span>
                <span className="font-black text-2xl text-green-400">{deliveredCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}