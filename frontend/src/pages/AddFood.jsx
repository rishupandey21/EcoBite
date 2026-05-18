import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { handleSuccess, handleError } from "../utils";

export default function AddFood() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    mealsCount: "",
    category: "prepared",
    expiryDate: "",
    pickupStartTime: "",
    pickupEndTime: "",
    pickupAddress: "",
    latitude: "",
    longitude: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      handleError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        handleSuccess("Location added successfully");
      },
      () => {
        handleError("Unable to get your location");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (image) {
        data.append("image", image);
      }

      const res = await api.post("/food/donate", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleSuccess(res.data.message);
      navigate("/food-listings");
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to create food listing");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black mb-2">List Surplus Food</h1>
        <p className="text-gray-300 mb-8">
          Add details of safe surplus food so nearby NGOs can request pickup.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Food Item Name
            </label>
            <input
              type="text"
              name="foodName"
              value={formData.foodName}
              onChange={handleChange}
              placeholder="Example: Veg Biryani, Roti Sabzi"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Quantity and Meals Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Example: 5 kg / 30 plates"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Approx Meals Count
              </label>
              <input
                type="number"
                name="mealsCount"
                value={formData.mealsCount}
                onChange={handleChange}
                placeholder="Example: 30"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="prepared" className="text-black">Prepared Food</option>
              <option value="bakery" className="text-black">Bakery Items</option>
              <option value="fresh_produce" className="text-black">Fresh Produce</option>
              <option value="dairy" className="text-black">Dairy Products</option>
              <option value="packaged" className="text-black">Packaged Food</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />

            {preview && (
              <img
                src={preview}
                alt="Food preview"
                className="mt-4 w-full h-56 object-cover rounded-2xl border border-white/20"
              />
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry Date & Time
            </label>
            <input
              type="datetime-local"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Pickup Time Window */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pickup Start Time
              </label>
              <input
                type="datetime-local"
                name="pickupStartTime"
                value={formData.pickupStartTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pickup End Time
              </label>
              <input
                type="datetime-local"
                name="pickupEndTime"
                value={formData.pickupEndTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pickup Address
            </label>
            <textarea
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              placeholder="Enter restaurant pickup address"
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latitude
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Longitude
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              className="bg-green-500 text-black font-bold px-4 py-3 rounded-xl hover:bg-green-400 transition"
            >
              Use My Location
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Special Instructions
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Example: Please bring containers. Pickup before 8 PM."
              rows="4"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 hover:scale-[1.02] transition-all mt-4"
          >
            Post Donation
          </button>
        </form>
      </div>
    </div>
  );
}