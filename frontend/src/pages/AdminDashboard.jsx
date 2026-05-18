import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";
import { handleError, handleSuccess } from "../utils";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/foods");
      setFoods(res.data);
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load foods");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics/admin");
      setAnalytics(res.data);
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load analytics");
    }
  };

  const verifyUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/verify`);
      handleSuccess(res.data.message);
      fetchUsers();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to verify user");
    }
  };

  const suspendUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/suspend`);
      handleSuccess(res.data.message);
      fetchUsers();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to suspend user");
    }
  };

  const reactivateUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/reactivate`);
      handleSuccess(res.data.message);
      fetchUsers();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to reactivate user");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFoods();
    fetchAnalytics();
  }, []);

  useEffect(() => {
  const refreshAdmin = (data) => {
    handleSuccess(data.message || "Platform updated");
    fetchUsers();
    fetchFoods();
    fetchAnalytics();
  };

  socket.on("food_created", refreshAdmin);
  socket.on("pickup_request_created", refreshAdmin);
  socket.on("request_status_updated", refreshAdmin);

  return () => {
    socket.off("food_created", refreshAdmin);
    socket.off("pickup_request_created", refreshAdmin);
    socket.off("request_status_updated", refreshAdmin);
  };
}, []);

  const roleBadge = (role) => {
    const base = "px-3 py-1 rounded-full text-xs font-black border";

    if (role === "restaurant") return `${base} bg-orange-500/20 text-orange-300 border-orange-500/30`;
    if (role === "ngo") return `${base} bg-blue-500/20 text-blue-300 border-blue-500/30`;
    if (role === "volunteer") return `${base} bg-green-500/20 text-green-300 border-green-500/30`;
    if (role === "admin") return `${base} bg-purple-500/20 text-purple-300 border-purple-500/30`;

    return `${base} bg-gray-500/20 text-gray-300 border-gray-500/30`;
  };

  const statusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-black border";

    if (status === "AVAILABLE") return `${base} bg-green-500/20 text-green-300 border-green-500/30`;
    if (status === "REQUESTED") return `${base} bg-yellow-500/20 text-yellow-300 border-yellow-500/30`;
    if (status === "ASSIGNED") return `${base} bg-purple-500/20 text-purple-300 border-purple-500/30`;
    if (status === "PICKED_UP") return `${base} bg-orange-500/20 text-orange-300 border-orange-500/30`;
    if (status === "DELIVERED") return `${base} bg-blue-500/20 text-blue-300 border-blue-500/30`;
    if (status === "EXPIRED") return `${base} bg-red-500/20 text-red-300 border-red-500/30`;

    return `${base} bg-gray-500/20 text-gray-300 border-gray-500/30`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage users, monitor food listings, and view platform analytics.
          </p>
        </div>

        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <div className="bg-white/10 border border-white/20 rounded-3xl p-5">
              <p className="text-gray-400 text-sm">Total Users</p>
              <h2 className="text-3xl font-black">{analytics.totalUsers}</h2>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-3xl p-5">
              <p className="text-gray-400 text-sm">Food Listings</p>
              <h2 className="text-3xl font-black">
                {analytics.totalFoodListings}
              </h2>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-3xl p-5">
              <p className="text-gray-400 text-sm">Meals Served</p>
              <h2 className="text-3xl font-black">
                {analytics.totalMealsServed}
              </h2>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-3xl p-5">
              <p className="text-gray-400 text-sm">Waste Reduced</p>
              <h2 className="text-3xl font-black">
                {Number(analytics.wasteReducedKg).toFixed(1)} kg
              </h2>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-3 rounded-xl font-bold ${
              activeTab === "users"
                ? "bg-green-500 text-black"
                : "bg-white/10 text-white border border-white/20"
            }`}
          >
            User Management
          </button>

          <button
            onClick={() => setActiveTab("foods")}
            className={`px-5 py-3 rounded-xl font-bold ${
              activeTab === "foods"
                ? "bg-green-500 text-black"
                : "bg-white/10 text-white border border-white/20"
            }`}
          >
            Food Monitoring
          </button>
        </div>

        {loading && (
          <div className="text-center text-gray-300 py-10">Loading...</div>
        )}

        {activeTab === "users" && (
          <div className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Verified</th>
                    <th className="text-left p-4">Suspended</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-white/10">
                      <td className="p-4 font-bold">{user.name}</td>
                      <td className="p-4 text-gray-300">{user.email}</td>
                      <td className="p-4">
                        <span className={roleBadge(user.account_type)}>
                          {user.account_type}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.isVerified ? (
                          <span className="text-green-300 font-bold">Yes</span>
                        ) : (
                          <span className="text-yellow-300 font-bold">No</span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.isSuspended ? (
                          <span className="text-red-300 font-bold">Yes</span>
                        ) : (
                          <span className="text-green-300 font-bold">No</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          {!user.isVerified && (
                            <button
                              onClick={() => verifyUser(user.id)}
                              className="bg-green-500 text-black px-3 py-2 rounded-lg text-sm font-bold"
                            >
                              Verify
                            </button>
                          )}

                          {user.account_type !== "admin" &&
                            (user.isSuspended ? (
                              <button
                                onClick={() => reactivateUser(user.id)}
                                className="bg-blue-500 text-black px-3 py-2 rounded-lg text-sm font-bold"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => suspendUser(user.id)}
                                className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold"
                              >
                                Suspend
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "foods" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden"
              >
                {food.imageUrl ? (
                  <img
                    src={food.imageUrl}
                    alt={food.foodName}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-white/10 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-black">{food.foodName}</h2>
                      <p className="text-gray-400">{food.quantity}</p>
                    </div>

                    <span className={statusBadge(food.status)}>
                      {food.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <p>
                      <span className="text-white font-semibold">
                        Restaurant:
                      </span>{" "}
                      {food.restaurant?.name || "Not available"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">Meals:</span>{" "}
                      {food.mealsCount || 0}
                    </p>

                    <p>
                      <span className="text-white font-semibold">Expiry:</span>{" "}
                      {food.expiryDate
                        ? new Date(food.expiryDate).toLocaleString()
                        : "Not available"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">
                        Requests:
                      </span>{" "}
                      {food.requests?.length || 0}
                    </p>
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