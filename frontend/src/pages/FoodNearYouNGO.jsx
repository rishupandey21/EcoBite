import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { handleSuccess, handleError } from "../utils";
import socket from "../socket";
import { MapPin, Clock, Package, Utensils } from "lucide-react";

export default function FoodNearYouNGO() {
  const [foods, setFoods] = useState([]);
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [requestNotes, setRequestNotes] = useState({});

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      handleError("Geolocation is not supported by your browser");
      fetchAvailableFoods();
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocation(currentLocation);
        fetchAvailableFoods(currentLocation.lat, currentLocation.lng, radius);
      },
      () => {
        handleError("Location permission denied. Showing all available food.");
        setLocation(null);
        fetchAvailableFoods();
      }
    );
  };

  const fetchAvailableFoods = async (lat, lng, selectedRadius = radius) => {
    try {
      setLoading(true);

      let url = "/food/available";

      if (lat && lng) {
        url = `/food/available?lat=${lat}&lng=${lng}&radius=${selectedRadius}`;
      }

      const res = await api.get(url);
      setFoods(res.data || []);
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to fetch food");
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (e) => {
    const newRadius = e.target.value;
    setRadius(newRadius);

    if (location) {
      fetchAvailableFoods(location.lat, location.lng, newRadius);
    }
  };

  const handleRequestPickup = async (foodId) => {
  try {
    const res = await api.post("/requests", {
      foodId,
      ngoNotes: requestNotes[foodId] || "Pickup requested by NGO",
    });

    handleSuccess(res.data.message);

    setRequestNotes((prev) => ({
      ...prev,
      [foodId]: "",
    }));

    if (location) {
      fetchAvailableFoods(location.lat, location.lng, radius);
    } else {
      fetchAvailableFoods();
    }
  } catch (error) {
    handleError(error.response?.data?.message || "Failed to request pickup");
  }
};

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const handleNewFood = (data) => {
      handleSuccess(data.message || "New food available");

      if (location) {
        fetchAvailableFoods(location.lat, location.lng, radius);
      } else {
        fetchAvailableFoods();
      }
    };

    socket.on("new_food_available", handleNewFood);

    return () => {
      socket.off("new_food_available", handleNewFood);
    };
  }, [location, radius]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white pt-32 pb-12 px-4">
      {/* Background */}
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] bg-green-900/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <MapPin className="text-green-400" size={34} />
              Nearby Food Donations
            </h1>

            <p className="text-gray-300 text-lg">
              Find surplus food available near your NGO and request pickup.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={radius}
              onChange={handleRadiusChange}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="5" className="text-black">
                Within 5 km
              </option>
              <option value="10" className="text-black">
                Within 10 km
              </option>
              <option value="20" className="text-black">
                Within 20 km
              </option>
              <option value="50" className="text-black">
                Within 50 km
              </option>
            </select>

            <button
              onClick={getCurrentLocation}
              className="bg-green-500 text-black font-black px-5 py-3 rounded-xl hover:bg-green-400 transition"
            >
              Use My Location
            </button>
          </div>
        </div>

        {location ? (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-200 rounded-2xl p-4">
            Location active: showing food within {radius} km.
          </div>
        ) : (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 rounded-2xl p-4">
            Location not active: showing all available food.
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-300 py-20">
            Loading nearby food...
          </div>
        ) : foods.length === 0 ? (
          <div className="bg-white/10 border border-white/20 rounded-3xl p-10 text-center">
            <Package className="mx-auto text-gray-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">No nearby food found</h2>
            <p className="text-gray-300">
              Try increasing the radius or check again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-xl hover:bg-white/[0.13] hover:border-green-500/40 transition-all"
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
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-xl font-black">{food.foodName}</h2>
                      <p className="text-gray-300 text-sm">{food.category}</p>
                    </div>

                    {food.distance && (
                      <span className="bg-green-500 text-black text-sm font-black px-3 py-1 rounded-full">
                        {food.distance} km
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-300 mb-5">
                    <p>
                      <span className="text-white font-semibold">
                        Quantity:
                      </span>{" "}
                      {food.quantity}
                    </p>

                    <p className="flex items-center gap-2">
                      <Utensils size={14} className="text-green-400" />
                      <span>
                        <span className="text-white font-semibold">
                          Meals:
                        </span>{" "}
                        {food.mealsCount || "Not mentioned"}
                      </span>
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-400" />
                      <span>
                        <span className="text-white font-semibold">
                          Expiry:
                        </span>{" "}
                        {new Date(food.expiryDate).toLocaleString()}
                      </span>
                    </p>

                    <p>
                      <span className="text-white font-semibold">Pickup:</span>{" "}
                      {food.pickupAddress ||
                        food.restaurant?.address ||
                        "Not added"}
                    </p>

                    <p>
                      <span className="text-white font-semibold">
                        Restaurant:
                      </span>{" "}
                      {food.restaurant?.name || "Restaurant"}
                    </p>

                    {food.description && (
                      <p>
                        <span className="text-white font-semibold">Note:</span>{" "}
                        {food.description}
                      </p>
                    )}
                  </div>

                  {food.requestStatus ? (
                    <button
                      disabled
                      className="w-full bg-gray-600 text-white py-3 rounded-xl font-bold cursor-not-allowed"
                    >
                      Requested: {food.requestStatus}
                    </button>
                  ) : (
                    <>
                      <textarea
                        value={requestNotes[food.id] || ""}
                        onChange={(e) =>
                          setRequestNotes((prev) => ({
                            ...prev,
                            [food.id]: e.target.value,
                          }))
                        }
                        placeholder="Add note for restaurant, e.g. Please pack food properly."
                        rows="2"
                        className="w-full mb-3 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 placeholder:text-gray-500 resize-none"
                      />

                      <button
                        onClick={() => handleRequestPickup(food.id)}
                        className="w-full bg-white text-black py-3 rounded-xl font-black hover:bg-gray-200 transition"
                      >
                        Request Pickup
                      </button>
                    </>
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