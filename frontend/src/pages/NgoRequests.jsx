import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clock,
  CheckCircle,
  Package,
  MessageSquare,
  Phone,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import { handleError, handleSuccess } from "../utils";
import socket from "../socket";

export default function NgoRequests() {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const getTimeAgo = useMemo(
    () => (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;

      const minutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
      return "Just now";
    },
    []
  );

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const handleNewRequest = (data) => {
      handleSuccess(data.message || "New pickup request received");
      fetchRequests();
    };

    const handlePickedUp = (data) => {
      handleSuccess(data.message || "Food picked up");
      fetchRequests();
    };

    const handleDelivered = (data) => {
      handleSuccess(data.message || "Food delivered");
      fetchRequests();
    };

    socket.on("new_pickup_request", handleNewRequest);
    socket.on("food_picked_up", handlePickedUp);
    socket.on("food_delivered", handleDelivered);

    return () => {
      socket.off("new_pickup_request", handleNewRequest);
      socket.off("food_picked_up", handlePickedUp);
      socket.off("food_delivered", handleDelivered);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests/restaurant");

      const transformed = (res.data || []).map((r) => ({
        id: r.id,
        ngoName: r.ngo?.name || "NGO",
        ngoPhone: r.ngo?.phoneNumber || "Not available",
        ngoAddress: r.ngo?.address || "Not available",
        foodItem: r.food ? `${r.food.foodName} (${r.food.quantity})` : "Food",
        foodName: r.food?.foodName || "Food",
        foodImage: r.food?.imageUrl || null,
        mealsCount: r.food?.mealsCount || 0,
        expiryDate: r.food?.expiryDate,
        pickupAddress: r.food?.pickupAddress,
        requestTime: getTimeAgo(r.createdAt),
        status: r.status,
        ngoNotes: r.ngoNotes || "",
        restaurantNotes: r.restaurantNotes || "",
        volunteerName: r.volunteer?.name || null,
        volunteerPhone: r.volunteer?.phoneNumber || null,
      }));

      setRequests(transformed);

      setActiveRequest((prev) => {
        if (!prev) return transformed[0] || null;
        return (
          transformed.find((item) => item.id === prev.id) ||
          transformed[0] ||
          null
        );
      });
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load requests");
    }
  };

  const filteredRequests = useMemo(() => {
    if (activeFilter === "ALL") return requests;
    return requests.filter((req) => req.status === activeFilter);
  }, [requests, activeFilter]);

  const summary = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      accepted: requests.filter((r) => r.status === "ACCEPTED").length,
      active: requests.filter((r) =>
        ["ASSIGNED", "PICKED_UP"].includes(r.status)
      ).length,
      delivered: requests.filter((r) => r.status === "DELIVERED").length,
    };
  }, [requests]);

  const handleAcceptRequest = async () => {
    if (!activeRequest) return;

    try {
      const res = await api.patch(`/requests/${activeRequest.id}/accept`, {
        restaurantNotes: newNote.trim() || "Request accepted by restaurant",
      });

      const updatedStatus = res.data.request.status;

      const updatedRequest = {
        ...activeRequest,
        status: updatedStatus,
        restaurantNotes: newNote.trim() || "Request accepted by restaurant",
      };

      setActiveRequest(updatedRequest);

      setRequests((prev) =>
        prev.map((req) => (req.id === activeRequest.id ? updatedRequest : req))
      );

      setNewNote("");
      handleSuccess("Request accepted successfully!");
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to accept request");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "ACCEPTED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ASSIGNED":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "PICKED_UP":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "DELIVERED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-gray-400 border-white/20";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "PENDING":
        return "This NGO is waiting for your approval.";
      case "ACCEPTED":
        return "Request accepted. NGO can now assign a volunteer.";
      case "ASSIGNED":
        return "Volunteer has been assigned for pickup.";
      case "PICKED_UP":
        return "Food has been picked up by the volunteer.";
      case "DELIVERED":
        return "Food has been delivered successfully.";
      case "REJECTED":
        return "This request was rejected.";
      case "CANCELLED":
        return "This request was cancelled.";
      default:
        return "Request status unavailable.";
    }
  };

  const filters = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Assigned", value: "ASSIGNED" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "Delivered", value: "DELIVERED" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#050505] pt-32 pb-12">
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <MessageSquare className="text-green-400" size={32} /> NGO Requests
          </h1>
          <p className="text-gray-400 text-lg">
            Review incoming food requests from NGOs and approve pickups.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <Package className="text-gray-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.total}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <Clock className="text-orange-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.pending}</p>
            <p className="text-gray-400 text-sm">Pending</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <CheckCircle className="text-blue-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.accepted}</p>
            <p className="text-gray-400 text-sm">Accepted</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <AlertCircle className="text-yellow-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.active}</p>
            <p className="text-gray-400 text-sm">Active</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <CheckCircle className="text-green-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.delivered}</p>
            <p className="text-gray-400 text-sm">Delivered</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                activeFilter === filter.value
                  ? "bg-green-500 text-black border-green-500"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 min-h-[620px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10 bg-white/5">
              <h2 className="font-bold text-lg">Incoming Requests</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[620px]">
              {filteredRequests.length === 0 ? (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-white/10 bg-[#050505]/30 px-6">
                  <Package size={40} className="text-gray-600 mb-3" />
                  <h3 className="text-white font-bold text-lg">
                    No requests found
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    New NGO requests will appear here.
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setActiveRequest(req)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      activeRequest?.id === req.id
                        ? "bg-white/10 border-green-500/50 shadow-lg"
                        : "bg-[#050505]/50 border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest border ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>

                      <span className="text-xs text-gray-500 font-bold flex items-center gap-1 whitespace-nowrap">
                        <Clock size={12} /> {req.requestTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-white mb-1 truncate">
                      {req.ngoName}
                    </h3>

                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Phone size={14} className="text-green-400" />{" "}
                      {req.ngoPhone}
                    </p>

                    <p className="text-sm text-gray-400 pt-1 flex items-center gap-2 truncate">
                      <Package size={14} className="text-gray-500" />{" "}
                      {req.foodItem}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
            {!activeRequest ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-10">
                <MessageSquare size={48} className="text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Select a request</h2>
                <p className="text-gray-400">
                  Choose an NGO request from the list to view details.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
                      <Building2 className="text-green-400" size={24} />
                    </div>

                    <div>
                      <h2 className="font-bold text-xl text-white">
                        {activeRequest.ngoName}
                      </h2>
                      <p className="text-sm text-gray-400">
                        Requesting:{" "}
                        <span className="text-gray-300 font-medium">
                          {activeRequest.foodItem}
                        </span>
                      </p>
                    </div>
                  </div>

                  {activeRequest.status === "PENDING" ? (
                    <button
                      onClick={handleAcceptRequest}
                      className="flex items-center gap-2 bg-green-500 text-black px-6 py-2.5 rounded-xl font-bold hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    >
                      <CheckCircle size={18} /> Accept Request
                    </button>
                  ) : (
                    <span
                      className={`flex items-center gap-2 border px-6 py-2.5 rounded-xl font-bold ${getStatusBadge(
                        activeRequest.status
                      )}`}
                    >
                      <CheckCircle size={18} /> {activeRequest.status}
                    </span>
                  )}
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-6">
                  <div>
                    {activeRequest.foodImage ? (
                      <img
                        src={activeRequest.foodImage}
                        alt={activeRequest.foodName}
                        className="w-full h-64 object-cover rounded-3xl border border-white/10"
                      />
                    ) : (
                      <div className="w-full h-64 bg-white/10 rounded-3xl border border-white/10 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <h3 className="font-black text-lg mb-3">
                        Request Details
                      </h3>

                      <div className="space-y-2 text-sm text-gray-300">
                        <p>
                          <span className="text-white font-semibold">
                            NGO:
                          </span>{" "}
                          {activeRequest.ngoName}
                        </p>

                        <p>
                          <span className="text-white font-semibold">
                            Phone:
                          </span>{" "}
                          {activeRequest.ngoPhone}
                        </p>

                        <p>
                          <span className="text-white font-semibold">
                            NGO Address:
                          </span>{" "}
                          {activeRequest.ngoAddress}
                        </p>

                        <p>
                          <span className="text-white font-semibold">
                            Food:
                          </span>{" "}
                          {activeRequest.foodItem}
                        </p>

                        <p>
                          <span className="text-white font-semibold">
                            Meals:
                          </span>{" "}
                          {activeRequest.mealsCount || 0}
                        </p>

                        <p>
                          <span className="text-white font-semibold">
                            Expiry:
                          </span>{" "}
                          {activeRequest.expiryDate
                            ? new Date(
                                activeRequest.expiryDate
                              ).toLocaleString()
                            : "Not available"}
                        </p>

                        <p>
                          <span className="text-white font-semibold">
                            Pickup:
                          </span>{" "}
                          {activeRequest.pickupAddress || "Not added"}
                        </p>

                        {activeRequest.volunteerName && (
                          <p>
                            <span className="text-white font-semibold">
                              Volunteer:
                            </span>{" "}
                            {activeRequest.volunteerName}{" "}
                            {activeRequest.volunteerPhone
                              ? `(${activeRequest.volunteerPhone})`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {activeRequest.ngoNotes && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                        <h3 className="font-black text-lg mb-2 text-blue-300">
                          NGO Note
                        </h3>
                        <p className="text-sm text-gray-300">
                          {activeRequest.ngoNotes}
                        </p>
                      </div>
                    )}

                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <h3 className="font-black text-lg mb-2">
                        Status Update
                      </h3>
                      <p className="text-sm text-gray-300">
                        {getStatusMessage(activeRequest.status)}
                      </p>
                    </div>

                    {activeRequest.restaurantNotes && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                        <h3 className="font-black text-lg mb-2 text-green-300">
                          Restaurant Note
                        </h3>
                        <p className="text-sm text-gray-300">
                          {activeRequest.restaurantNotes}
                        </p>
                      </div>
                    )}

                    {activeRequest.status === "PENDING" && (
                      <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                        <label className="block text-sm font-bold mb-2">
                          Restaurant Note
                        </label>
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Example: Food will be ready by 7 PM."
                          rows="3"
                          className="w-full bg-[#050505] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-gray-600 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}