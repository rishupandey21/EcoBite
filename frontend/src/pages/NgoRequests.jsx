import React, { useEffect, useMemo, useState } from 'react';
import { Send, Building2, Clock, CheckCircle, Package, MessageSquare,Phone } from 'lucide-react';
import axios from 'axios';
import { handleError, handleSuccess } from '../utils';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function NgoRequests() {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [newMessage, setNewMessage] = useState("");

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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/requests/restaurant`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data);

      const transformed = res.data.map((r) => ({
        id: r.id,
        ngoName: r.ngo?.name || 'NGO',
        ngoPhone: r.ngo?.phoneNumber || 'Not available',
        foodItem: r.food ? `${r.food.foodName} (${r.food.quantity})` : 'Food',
        requestTime: getTimeAgo(r.createdAt),
        status: r.status,
        messages: []
      }));

      setRequests(transformed);
      setActiveRequest((prev) => prev || transformed[0] || null);
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to load requests');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!activeRequest) return;

    // Add message to the active chat
    const updatedRequest = {
      ...activeRequest,
      messages: [...activeRequest.messages, { sender: "restaurant", text: " " + newMessage, time: "Just now" }]
    };

    setActiveRequest(updatedRequest);
    
    // Update the main requests array
    setRequests(requests.map(req => req.id === activeRequest.id ? updatedRequest : req));
    setNewMessage("");
  };

  const handleAcceptRequest = async () => {
    if (!activeRequest) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${API_URL}/api/requests/${activeRequest.id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRequest = { ...activeRequest, status: res.data.status || "accepted" };
      setActiveRequest(updatedRequest);
      setRequests(requests.map(req => req.id === activeRequest.id ? updatedRequest : req));
      handleSuccess("Request accepted! The NGO will be notified to begin pickup.");
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to accept request');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#050505] pt-32 pb-12">
      
      {/* --- Ambient Background Glows --- */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <MessageSquare className="text-green-400" size={32} /> NGO Requests
          </h1>
          <p className="text-gray-400 text-lg">Coordinate pickups and chat directly with verified NGOs.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[700px]">
          
          {/* LEFT PANE: Request List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/5">
              <h2 className="font-bold text-lg">Active Inquiries</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {requests.length === 0 ? (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-white/10 bg-[#050505]/30 px-6">
                  <Package size={40} className="text-gray-600 mb-3" />
                  <h3 className="text-white font-bold text-lg">No inquiries yet</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    New inquiries will appear here when NGOs contact you.
                  </p>
                </div>
              ) : (
                requests.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => setActiveRequest(req)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                      activeRequest?.id === req.id 
                        ? 'bg-white/10 border-green-500/50 shadow-lg' 
                        : 'bg-[#050505]/50 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                          req.status === 'pending'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                        <Clock size={12} /> {req.requestTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-white mb-1 truncate">{req.ngoName}</h3>

                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Phone size={14} className="text-green-400" /> {req.ngoPhone}
                    </p>

                    <p className="text-sm text-gray-400 pt-1 flex items-center gap-2 truncate">
                      <Package size={14} className="text-gray-500" /> {req.foodItem}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANE: Chat & Actions */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
                  <Building2 className="text-green-400" size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white">{activeRequest?.ngoName || 'Select a request'}</h2>
                  <p className="text-sm text-gray-400">Requesting: <span className="text-gray-300 font-medium">{activeRequest?.foodItem || '-'}</span></p>
                </div>
              </div>

              {/* Action Button */}
              {activeRequest?.status === 'pending' ? (
                <button
                  onClick={handleAcceptRequest}
                  className="flex items-center gap-2 bg-green-500 text-black px-6 py-2.5 rounded-xl font-bold hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                >
                  <CheckCircle size={18} /> Accept Request
                </button>
              ) : activeRequest?.status ? (
                <span className="flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-2.5 rounded-xl font-bold">
                  <CheckCircle size={18} /> Accepted
                </span>
              ) : null}
            </div>

            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-white/[0.02]">
              {(activeRequest?.messages || []).map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'restaurant' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl ${
                    msg.sender === 'restaurant' 
                      ? 'bg-green-600 text-white rounded-tr-sm' 
                      : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message to coordinate pickup..." 
                  className="flex-1 bg-[#050505] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-gray-600"
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
      </div>
    </div>
  );
}