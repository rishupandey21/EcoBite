import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Briefcase, Phone} from 'lucide-react';
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
import { handleSuccess, handleError } from "../utils";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    account_type: "volunteer",
    name: "",
    email: "",
    password: "",
    phoneNumber: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        formData
      );

      handleSuccess(res.data.message);
      // Redirect to login page after successful registration
      navigate('/login');

    } catch (error) {
      handleError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 py-12 relative overflow-hidden pt-32">
      
      {/* Background Glows */}
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Frosted Dark Glass Form Card */}
      <div className="bg-white/5 backdrop-blur-xl w-full max-w-lg p-10 sm:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10">

        <h2 className="text-3xl font-black mb-2 text-white">Join EcoBite</h2>
        <p className="text-gray-400 mb-8 font-medium">
          Create an account to start making an impact.
        </p>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* Account Type */}

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-gray-400 ml-1">
              Account Type
            </label>

            <div className="relative">
              <Briefcase
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />

              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 appearance-none font-medium text-white transition-all [&>option]:bg-[#050505] [&>option]:text-white"
              >
                <option value="volunteer">Volunteer (Individual)</option>
                <option value="restaurant">Restaurant / Donor</option>
                <option value="ngo">NGO / Distributor</option>
              </select>
            </div>
          </div>

          {/* Name */}

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-gray-400 ml-1">
              Full Name / Organization Name
            </label>

            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe or Fresh Bakes"
                className="w-full p-4 pl-12 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-600 text-white transition-all"
              />
            </div>
          </div>

          {/* Email */}

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-gray-400 ml-1">
              Email Address
            </label>

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full p-4 pl-12 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-600 text-white transition-all"
              />
            </div>
          </div>

          {/* Password */}

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-gray-400 ml-1">
              Password
            </label>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full p-4 pl-12 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-600 text-white transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-gray-400 ml-1">
              Phone Number
            </label>

            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />

              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="+91 123-456-7890"
                className="w-full p-4 pl-12 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-600 text-white transition-all"
              />
            </div>
          </div>

          {/* Button */}

          <button
            type="submit"
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-gray-200 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-4"
          >
            Create Account
          </button>

        </form>

        <p className="text-center mt-8 text-gray-500 font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-400 font-bold hover:text-green-300 hover:underline"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}