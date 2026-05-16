import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { handleSuccess, handleError } from "../utils";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        formData
      );

      handleSuccess(res.data.message);

      // Create user object with role and name
      const userData = {
        id: res.data.id, // You might need to add this to your backend response
        name: res.data.name,
        email: formData.email,
        account_type: res.data.role,
        phoneNumber: res.data.phoneNumber
      };

      // Use auth context login method
      login(userData, res.data.token);

      // Redirect based on role
      switch (res.data.role) {
        case 'restaurant':
          navigate('/restaurant-dashboard');
          break;
        case 'ngo':
          navigate('/restaurants');
          break;
        case 'volunteer':
          navigate('/volunteer-dashboard');
          break;
        default:
          navigate('/');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      handleError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden pt-32">
      
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Frosted Dark Glass Form Card */}
      <div className="bg-white/5 backdrop-blur-xl w-full max-w-lg p-10 sm:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10">

        <h2 className="text-3xl font-black mb-2 text-white">Welcome Back</h2>
        <p className="text-gray-400 mb-8 font-medium">
          Log in to continue fighting food waste.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-gray-400 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
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
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
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

          <button
            type="submit"
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-gray-200 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-4"
          >
            Sign In
          </button>

        </form>

        <p className="text-center mt-8 text-gray-500 font-medium">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-400 font-bold hover:text-green-300 hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}