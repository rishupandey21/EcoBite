import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Package, Search, PlusCircle, MessageSquare, Send, X, Building2, Phone } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { handleSuccess, handleError } from '../utils';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function FindFood() {
  const { user } = useAuth();
  const [radius, setRadius] = useState(5);
  const [availableFood, setAvailableFood] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableFoods();
  }, []);

  // Keep NGO page in sync so "Requested" can turn to "Accepted"
  useEffect(() => {
    if (!user) return;
    const role = user.account_type || user.role;
    if (role !== 'ngo') return;

    const interval = setInterval(() => {
      fetchAvailableFoods();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchAvailableFoods = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_URL}/api/food/available`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Transform the data to match the expected structure
      const transformedData = res.data.map(food => ({
        id: food.id,
        restaurant: food.restaurant?.name || 'Restaurant',
        phone: food.restaurant?.phoneNumber || 'Not available',
        item: `${food.foodName} (${food.quantity})`,
        distance: null,
        category: food.category,
        timeListed: getTimeAgo(food.createdAt),
        messages: [],
        requestStatus: food.requestStatus || null,
        requestId: food.requestId || null
      }));

      setAvailableFood(transformedData);
    } catch (error) {
      handleError('Failed to fetch available foods');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
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
  };

  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const filteredFood = availableFood;

  const handleRequest = async (food) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/requests`,
        { foodId: food.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAvailableFood((prev) =>
        prev.map((f) =>
          f.id === food.id
            ? { ...f, requestStatus: res.data.status, requestId: res.data.id }
            : f
        )
      );
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to send request');
    }
  };

  const openChat = (food) => {
    setActiveChat(food);
  };

  const closeChat = () => {
    setActiveChat(null);
    setNewMessage("");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Create the new message (sender is 'ngo' here)
    const newMsg = { sender: "ngo", text: " " + newMessage, time: "Just now" };
    
    // Update the active chat
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, newMsg]
    };
    setActiveChat(updatedChat);

    // Update the main array so the chat saves if they close and reopen it
    setAvailableFood(availableFood.map(food => food.id === activeChat.id ? updatedChat : food));
    setNewMessage("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#050505] pt-32 pb-12">
      
      {/* Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header & Radius Slider */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <Search className="text-blue-400" size={32} /> Find Surplus Food
            </h1>
            <p className="text-gray-400 text-lg">Browse and request donations from nearby partners.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col gap-2 w-full md:w-72 shadow-2xl">
            <div className="flex justify-between items-center text-sm font-bold text-gray-300">
              <span>Search Radius</span>
              <span className="text-blue-400">{radius} km</span>
            </div>
            <input 
              type="range" min="1" max="15" value={radius} onChange={(e) => setRadius(e.target.value)}
              className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
              <span>1 km</span><span>15 km</span>
            </div>
          </div>
        </div>

        {/* Food Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 border-dashed rounded-[2rem]">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-r-2 border-white/20 border-t-blue-500 border-l-blue-500 mx-auto mb-4"></div>
               <p className="text-gray-400">Loading available food...</p>
            </div>
          ) : filteredFood.length > 0 ? (
            filteredFood.map((food) => (
              <div key={food.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col group hover:-translate-y-1 hover:bg-white/10 hover:border-blue-500/50 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {food.category}
                  </span>
                  <span className="text-xs text-gray-500 font-bold">{food.timeListed}</span>
                </div>

                <h3 className="text-2xl font-black text-white mb-1 line-clamp-2">{food.item}</h3>
                <div className="space-y-2 mb-6">
                  <p className="text-blue-400 font-bold flex items-center gap-1.5 text-sm">
                    <Building2 size={14} /> {food.restaurant}
                  </p>
                  <p className="text-gray-400 font-medium flex items-center gap-1.5 text-sm">
                    <Phone size={14} /> {food.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-gray-400 font-medium text-sm mb-6 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#050505] border border-white/5 flex items-center justify-center">
                    <Navigation size={14} className="text-red-400" />
                  </div>
                  <span>{food.distance} away</span>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRequest(food)}
                    disabled={food.requestStatus === 'pending' || food.requestStatus === 'accepted'}
                    className={`flex-1 py-3.5 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 ${
                      food.requestStatus === 'accepted'
                        ? 'bg-green-500 text-black cursor-not-allowed'
                        : food.requestStatus === 'pending'
                        ? 'bg-white/10 text-gray-300 border border-white/10 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    <PlusCircle size={18} /> {food.requestStatus === 'accepted' ? 'Accepted' : food.requestStatus === 'pending' ? 'Requested' : 'Request'}
                  </button>
                  <button 
                    onClick={() => openChat(food)}
                    title="Chat with Restaurant"
                    className="w-14 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all shadow-sm group-hover:bg-white/10"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
             <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 border-dashed rounded-[2rem]">
               <MapPin className="mx-auto text-gray-600 mb-4" size={48} />
               <h3 className="text-xl font-bold text-white mb-2">No food found within {radius}km</h3>
               <p className="text-gray-400">Try expanding your search radius using the slider above.</p>
             </div>
          )}
        </div>
      </div>

      {/* --- CHAT MODAL OVERLAY --- */}
      {activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Using the exact same chat container styling as NgoRequests */}
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col h-[600px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
                  <Building2 className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white">{activeChat.restaurant}</h2>
                  <p className="text-sm text-gray-400">Inquiry: <span className="text-blue-300 font-medium">{activeChat.item}</span></p>
                </div>
              </div>
              <button onClick={closeChat} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Chat History Area (Reversed colors for NGO side) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-white/[0.02]">
              {activeChat.messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                  <MessageSquare className="mx-auto mb-3 opacity-50" size={40} />
                  <p>No messages yet. Send a message to coordinate pickup!</p>
                </div>
              )}
              {activeChat.messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'ngo' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl ${
                    msg.sender === 'ngo' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' // NGO messages are blue here
                      : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-sm' // Restaurant messages are gray
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input (Your exact form) */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message to the restaurant..." 
                  className="flex-1 bg-[#050505] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-white text-black w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-all disabled:opacity-50 disabled:hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <Send size={20} className={newMessage.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}