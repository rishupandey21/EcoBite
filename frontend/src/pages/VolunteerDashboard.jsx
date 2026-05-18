import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { handleError, handleSuccess } from "../utils";
import socket from "../socket";

export default function VolunteerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/food/my-assignments");
      setAssignments(res.data);
    } catch (error) {
      handleError(
        error.response?.data?.message || "Failed to load assigned pickups"
      );
    } finally {
      setLoading(false);
    }
  };

  const markPickedUp = async (requestId) => {
    try {
      const res = await api.patch(`/requests/${requestId}/picked-up`, {
        volunteerNotes: "Food picked up by volunteer",
      });

      handleSuccess(res.data.message);
      fetchAssignments();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to mark picked up");
    }
  };

  const markDelivered = async (requestId) => {
    try {
      const res = await api.patch(`/requests/${requestId}/delivered`, {
        volunteerNotes: "Food delivered by volunteer",
      });

      handleSuccess(res.data.message);
      fetchAssignments();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to mark delivered");
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);


  useEffect(() => {
  const handleAssignment = (data) => {
    handleSuccess(data.message || "New pickup assigned");
    fetchAssignments();
  };

  socket.on("volunteer_assigned", handleAssignment);

  return () => {
    socket.off("volunteer_assigned", handleAssignment);
  };
}, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "PICKED_UP":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "DELIVERED":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Volunteer Dashboard</h1>
          <p className="text-gray-400">
            View assigned pickups and update pickup/delivery status.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-300 py-20">
            Loading assigned pickups...
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white/10 border border-white/20 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">No assigned pickups</h2>
            <p className="text-gray-400">
              Assigned pickup tasks will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-xl"
              >
                {assignment.food?.imageUrl ? (
                  <img
                    src={assignment.food.imageUrl}
                    alt={assignment.food.foodName}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-white/10 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-black">
                        {assignment.food?.foodName || "Food Item"}
                      </h2>
                      <p className="text-gray-400">
                        {assignment.food?.quantity || "Quantity not mentioned"}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(
                        assignment.status
                      )}`}
                    >
                      {assignment.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300 mb-5">
                    <p>
                      <span className="text-white font-semibold">
                        Restaurant:
                      </span>{" "}
                      {assignment.food?.restaurant?.name || "Restaurant"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">
                        Restaurant Phone:
                      </span>{" "}
                      {assignment.food?.restaurant?.phoneNumber ||
                        "Not available"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">
                        Pickup Address:
                      </span>{" "}
                      {assignment.food?.pickupAddress ||
                        assignment.food?.restaurant?.address ||
                        "Not available"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">NGO:</span>{" "}
                      {assignment.ngo?.name || "NGO"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">
                        NGO Phone:
                      </span>{" "}
                      {assignment.ngo?.phoneNumber || "Not available"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">
                        Expiry:
                      </span>{" "}
                      {assignment.food?.expiryDate
                        ? new Date(assignment.food.expiryDate).toLocaleString()
                        : "Not available"}
                    </p>
                  </div>

                  {assignment.status === "ASSIGNED" && (
                    <button
                      onClick={() => markPickedUp(assignment.id)}
                      className="w-full bg-orange-500 text-black py-3 rounded-xl font-black hover:bg-orange-400 transition"
                    >
                      Mark as Picked Up
                    </button>
                  )}

                  {assignment.status === "PICKED_UP" && (
                    <button
                      onClick={() => markDelivered(assignment.id)}
                      className="w-full bg-green-500 text-black py-3 rounded-xl font-black hover:bg-green-400 transition"
                    >
                      Mark as Delivered
                    </button>
                  )}

                  {assignment.status === "DELIVERED" && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-2xl p-4 text-center font-bold">
                      Delivery completed successfully
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}