import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { handleError, handleSuccess } from "../utils";
import socket from "../socket";
import {
  Truck,
  Clock,
  CheckCircle,
  UserPlus,
  Package,
  Building2,
  Phone,
  MapPin,
} from "lucide-react";

export default function ManageDelivery() {
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchNgoRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/requests/ngo");
      setRequests(res.data || []);
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await api.get("/users/volunteers");
      setVolunteers(res.data || []);
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load volunteers");
    }
  };

  const assignVolunteer = async (requestId) => {
    const volunteerId = selectedVolunteer[requestId];

    if (!volunteerId) {
      handleError("Please select a volunteer first");
      return;
    }

    try {
      const res = await api.patch(`/requests/${requestId}/assign-volunteer`, {
        volunteerId,
      });

      handleSuccess(res.data.message);
      fetchNgoRequests();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to assign volunteer");
    }
  };

  useEffect(() => {
    fetchNgoRequests();
    fetchVolunteers();
  }, []);

  useEffect(() => {
    const refresh = (data) => {
      handleSuccess(data.message || "Request updated");
      fetchNgoRequests();
    };

    socket.on("request_accepted", refresh);
    socket.on("food_picked_up", refresh);
    socket.on("food_delivered", refresh);

    return () => {
      socket.off("request_accepted", refresh);
      socket.off("food_picked_up", refresh);
      socket.off("food_delivered", refresh);
    };
  }, []);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "ALL") return requests;
    return requests.filter((request) => request.status === activeFilter);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "ACCEPTED":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "ASSIGNED":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "PICKED_UP":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "DELIVERED":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "PENDING":
        return "Waiting for restaurant approval.";
      case "ACCEPTED":
        return "Restaurant accepted this request. Assign a volunteer now.";
      case "ASSIGNED":
        return "Volunteer assigned. Waiting for pickup.";
      case "PICKED_UP":
        return "Food picked up. Waiting for delivery confirmation.";
      case "DELIVERED":
        return "Food delivered successfully.";
      case "REJECTED":
        return "Restaurant rejected this request.";
      case "CANCELLED":
        return "This request was cancelled.";
      default:
        return "Request status is not available.";
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
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white px-4 pt-32 pb-12">
      {/* Background */}
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] bg-green-900/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Truck className="text-green-400" size={34} />
            Pickup Requests & Volunteer Assignment
          </h1>

          <p className="text-gray-400 text-lg">
            Track your food requests and assign volunteers after restaurant
            approval.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <Package className="text-gray-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.total}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <Clock className="text-yellow-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.pending}</p>
            <p className="text-gray-400 text-sm">Pending</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <CheckCircle className="text-blue-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.accepted}</p>
            <p className="text-gray-400 text-sm">Accepted</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <Truck className="text-orange-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.active}</p>
            <p className="text-gray-400 text-sm">Active</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <CheckCircle className="text-green-300 mb-3" size={24} />
            <p className="text-3xl font-black">{summary.delivered}</p>
            <p className="text-gray-400 text-sm">Delivered</p>
          </div>
        </div>

        {/* Filters */}
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

        {loading ? (
          <div className="text-center text-gray-300 py-20">
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white/10 border border-white/20 rounded-3xl p-10 text-center">
            <Package className="mx-auto text-gray-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">No requests found</h2>
            <p className="text-gray-400">
              Request food from the Food Near You page first, or change the
              selected filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
  <div
    key={request.id}
    className="bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl hover:bg-white/[0.13] hover:border-green-500/40 transition-all"
  >
    <div className="flex gap-4">
      {/* Small Image */}
      {request.food?.imageUrl ? (
        <img
          src={request.food.imageUrl}
          alt={request.food.foodName}
          className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
        />
      ) : (
        <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
          No Image
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-3 mb-2">
          <div>
            <h2 className="text-lg font-black truncate">
              {request.food?.foodName || "Food Item"}
            </h2>
            <p className="text-gray-400 text-sm">
              {request.food?.quantity || "Quantity not mentioned"}
            </p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black border whitespace-nowrap ${getStatusColor(
              request.status
            )}`}
          >
            {request.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 mb-3">
          <p>
            <span className="text-white font-semibold">Restaurant:</span>{" "}
            {request.restaurant?.name || "Restaurant"}
          </p>

          <p>
            <span className="text-white font-semibold">Phone:</span>{" "}
            {request.restaurant?.phoneNumber || "Not available"}
          </p>

          <p className="sm:col-span-2 truncate">
            <span className="text-white font-semibold">Pickup:</span>{" "}
            {request.food?.pickupAddress ||
              request.restaurant?.address ||
              "Not available"}
          </p>

          <p>
            <span className="text-white font-semibold">Expiry:</span>{" "}
            {request.food?.expiryDate
              ? new Date(request.food.expiryDate).toLocaleString()
              : "Not available"}
          </p>

          {request.volunteer && (
            <p>
              <span className="text-white font-semibold">Volunteer:</span>{" "}
              {request.volunteer.name}
            </p>
          )}
        </div>
        
        <div className="space-y-3 mb-4">
          {request.ngoNotes && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm">
              <p className="text-blue-300 font-bold mb-1">Your Note</p>
              <p className="text-gray-300">{request.ngoNotes}</p>
            </div>
          )}

          {request.restaurantNotes && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm">
              <p className="text-green-300 font-bold mb-1">Restaurant Note</p>
              <p className="text-gray-300">{request.restaurantNotes}</p>
            </div>
          )}

          {request.volunteerNotes && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-sm">
              <p className="text-orange-300 font-bold mb-1">Volunteer Note</p>
              <p className="text-gray-300">{request.volunteerNotes}</p>
            </div>
          )}
        </div>

        {request.status === "ACCEPTED" ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedVolunteer[request.id] || ""}
              onChange={(e) =>
                setSelectedVolunteer((prev) => ({
                  ...prev,
                  [request.id]: e.target.value,
                }))
              }
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
            >
              <option value="" className="text-black">
                Select volunteer
              </option>

              {volunteers.map((volunteer) => (
                <option
                  key={volunteer.id}
                  value={volunteer.id}
                  className="text-black"
                >
                  {volunteer.name} - {volunteer.phoneNumber || volunteer.email}
                </option>
              ))}
            </select>

            <button
              onClick={() => assignVolunteer(request.id)}
              className="bg-green-500 text-black px-4 py-2 rounded-xl font-black hover:bg-green-400 transition text-sm whitespace-nowrap"
            >
              Assign
            </button>
          </div>
        ) : (
          <div className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300">
            {getStatusMessage(request.status)}
          </div>
        )}
      </div>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </div>
  );
}