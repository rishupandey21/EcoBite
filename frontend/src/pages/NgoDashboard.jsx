import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Truck,
  CheckCircle,
  Users,
  AlertCircle,
  ArrowRight,
  Clock,
  Utensils,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { handleError } from "../utils";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function NgoDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    activeClaims: 0,
    inTransit: 0,
    totalMeals: 0,
    volunteersNearby: 0,
  });

  const [incomingFood, setIncomingFood] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAcceptedPipeline();
    fetchVolunteerCount();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics/ngo");
      setAnalytics(res.data);

      setStats((prev) => ({
        ...prev,
        totalMeals: res.data.totalMealsReceived || 0,
      }));
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load analytics");
    }
  };

  const fetchAcceptedPipeline = async () => {
    try {
      const res = await api.get("/requests/ngo");

      const activeRequests = (res.data || []).filter((r) =>
        ["ACCEPTED", "ASSIGNED", "PICKED_UP"].includes(r.status)
      );

      const transformed = activeRequests.map((r) => ({
        id: r.id,
        foodItem: r.food ? `${r.food.foodName} (${r.food.quantity})` : "Food",
        restaurant: r.restaurant?.name || "Restaurant",
        volunteer: r.volunteer?.name || "Not assigned",
        status: r.status,
        eta: r.scheduledPickupTime
          ? new Date(r.scheduledPickupTime).toLocaleString()
          : "TBD",
      }));

      setIncomingFood(transformed);

      setStats((prev) => ({
        ...prev,
        activeClaims: activeRequests.length,
        inTransit: activeRequests.filter((r) => r.status === "PICKED_UP")
          .length,
      }));
    } catch (error) {
      handleError(
        error.response?.data?.message || "Failed to load incoming pipeline"
      );
    }
  };

  const fetchVolunteerCount = async () => {
    try {
      const res = await api.get("/users/volunteers");

      setStats((prev) => ({
        ...prev,
        volunteersNearby: (res.data || []).length,
      }));
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to load volunteers count");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Accepted
          </span>
        );

      case "ASSIGNED":
        return (
          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Assigned
          </span>
        );

      case "PICKED_UP":
        return (
          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            In Transit
          </span>
        );

      case "DELIVERED":
        return (
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Delivered
          </span>
        );

      case "PENDING":
        return (
          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Pending
          </span>
        );

      case "REJECTED":
      case "CANCELLED":
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {status}
          </span>
        );

      default:
        return (
          <span className="bg-white/10 text-gray-400 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {status || "Unknown"}
          </span>
        );
    }
  };

  const analyticsCards = analytics
    ? [
        {
          title: "Total Requests",
          value: analytics.totalRequests,
          icon: <Clock size={28} />,
          iconColor: "text-orange-400",
        },
        {
          title: "Delivered Pickups",
          value: analytics.deliveredRequests,
          icon: <CheckCircle size={28} />,
          iconColor: "text-green-400",
        },
        {
          title: "Meals Received",
          value: analytics.totalMealsReceived,
          icon: <Utensils size={28} />,
          iconColor: "text-yellow-400",
        },
        {
          title: "Waste Reduced",
          value: `${Number(analytics.wasteReducedKg).toFixed(1)} kg`,
          icon: <Trash2 size={28} />,
          iconColor: "text-red-400",
        },
      ]
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#050505] pt-32 pb-12">
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">
            Welcome back, {user?.name || "City Mission"}
          </h1>

          <p className="text-gray-400 text-lg mb-6">
            Here is your daily incoming food snapshot and impact overview.
          </p>

          {stats.activeClaims > 0 && (
            <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3 text-orange-400 shadow-lg">
              <AlertCircle size={20} />
              <span className="font-medium text-sm">
                Action Needed: You have <strong>{stats.activeClaims}</strong>{" "}
                active order(s) in pickup pipeline.
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link
            to="/restaurants"
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1"
          >
            <MapPin size={22} /> Find Food Nearby
          </Link>

          <Link
            to="/manage-deliveries"
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all shadow-sm hover:-translate-y-1"
          >
            <Truck size={22} /> Manage Deliveries
          </Link>
        </div>

        {/* Current NGO Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/10 group">
            <div className="mb-4 text-orange-400 group-hover:scale-110 transition-transform">
              <Clock size={28} />
            </div>
            <div className="text-3xl font-black text-white">
              {stats.activeClaims}
            </div>
            <div className="text-gray-400 font-medium text-sm">
              Active Claims
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/10 group">
            <div className="mb-4 text-blue-400 group-hover:scale-110 transition-transform">
              <Truck size={28} />
            </div>
            <div className="text-3xl font-black text-white">
              {stats.inTransit}
            </div>
            <div className="text-gray-400 font-medium text-sm">In Transit</div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/10 group">
            <div className="mb-4 text-green-400 group-hover:scale-110 transition-transform">
              <CheckCircle size={28} />
            </div>
            <div className="text-3xl font-black text-white">
              {stats.totalMeals}
            </div>
            <div className="text-gray-400 font-medium text-sm">
              Lifetime Meals Secured
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/10 group">
            <div className="mb-4 text-purple-400 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <div className="text-3xl font-black text-white">
              {stats.volunteersNearby}
            </div>
            <div className="text-gray-400 font-medium text-sm">
              Total Volunteers
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2 text-white">
                NGO Impact Analytics
              </h2>
              <p className="text-gray-400">
                Track your food requests, meals received, and social impact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
              {analyticsCards.map((card, index) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/10 group"
                >
                  <div
                    className={`mb-4 group-hover:scale-110 transition-transform ${card.iconColor}`}
                  >
                    {card.icon}
                  </div>

                  <div className="text-3xl font-black text-white">
                    {card.value}
                  </div>

                  <div className="text-gray-400 font-medium">{card.title}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl mb-12">
              <h2 className="text-xl font-black mb-5">Monthly Requests</h2>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyRequests || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold mb-6 text-white">
          Incoming Food Pipeline
        </h2>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">
                    Food Item
                  </th>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">
                    Restaurant
                  </th>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">
                    Driver
                  </th>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">
                    ETA
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {incomingFood.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-gray-500 font-medium"
                    >
                      No active pickup requests yet.
                    </td>
                  </tr>
                ) : (
                  incomingFood.map((food) => (
                    <tr
                      key={food.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5 font-bold text-white">
                        {food.foodItem}
                      </td>

                      <td className="p-5 text-gray-400 font-medium">
                        {food.restaurant}
                      </td>

                      <td className="p-5 text-gray-400 font-medium">
                        {food.volunteer}
                      </td>

                      <td className="p-5">{getStatusBadge(food.status)}</td>

                      <td className="p-5 font-bold text-white">{food.eta}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            to="/manage-deliveries"
            className="inline-flex items-center gap-2 text-green-400 font-bold hover:text-green-300 transition"
          >
            Manage all deliveries <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}