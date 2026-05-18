import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Target,
  Cpu,
  Users,
  ArrowRight,
  Leaf,
  Globe,
  Quote,
  Sprout,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative pt-32 pb-20 font-sans">
      {/* Custom Keyframe Animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-float-slow {
            animation: float 15s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float 18s ease-in-out infinite;
            animation-delay: -5s;
          }
        `}
      </style>

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Animated Background Glows */}
      <div className="absolute top-[5%] left-[-10%] w-[500px] h-[500px] bg-green-500/15 rounded-full blur-[150px] pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[150px] pointer-events-none animate-float-delayed"></div>
      <div
        className="absolute top-[50%] left-[30%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none animate-float-slow"
        style={{ animationDelay: "-2s" }}
      ></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-green-400 font-bold text-sm mb-6 shadow-lg tracking-widest uppercase">
            <Sprout size={16} /> Our Story
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            More than a platform. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500">
              A movement for change.
            </span>
          </h1>

          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto">
            EcoBite is built to reduce food wastage by connecting restaurants,
            NGOs, and volunteers through a structured digital platform.
          </p>
        </div>

        {/* THE PROBLEM */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] pointer-events-none"></div>

          <Quote className="text-green-500/30 w-24 h-24 absolute top-8 left-8 -z-10" />

          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              The Disconnect We Wanted to Solve
            </h2>

            <div className="space-y-6 text-gray-300 text-lg leading-relaxed font-medium">
              <p>
                Restaurants, hotels, and catering services often have surplus
                edible food at the end of the day. At the same time, many people
                in nearby communities still struggle with food insecurity.
              </p>

              <p>
                The problem is not only food availability. The bigger challenge
                is coordination. Restaurants may not know which NGO can collect
                the food, NGOs may not know what food is available nearby, and
                volunteers may not have a clear pickup and delivery flow.
              </p>

              <p>
                <strong className="text-white">EcoBite was created with a simple idea:</strong>{" "}
                build a platform where food donors, NGOs, and volunteers can
                work together in a more organized and transparent way.
              </p>
            </div>
          </div>
        </div>

        {/* HOW WE USE TECH */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Bridging the Gap with Technology
            </h2>
            <p className="text-gray-400 text-lg">
              EcoBite uses web technology to make food donation, request
              handling, volunteer assignment, and tracking easier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl hover:bg-white/5 transition-colors">
              <Target className="text-blue-400 mb-6" size={32} />

              <h3 className="text-2xl font-black text-white mb-3">
                Nearby Food Discovery
              </h3>

              <p className="text-gray-400 leading-relaxed">
                NGOs can view available food listings based on location details.
                This helps them find suitable food donations and request pickup
                in a more organized way.
              </p>
            </div>

            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl hover:bg-white/5 transition-colors">
              <Cpu className="text-green-400 mb-6" size={32} />

              <h3 className="text-2xl font-black text-white mb-3">
                Pickup and Delivery Workflow
              </h3>

              <p className="text-gray-400 leading-relaxed">
                After a restaurant accepts a request, NGOs can assign a
                volunteer. The volunteer can then update the status as picked up
                and delivered, making the process easier to track.
              </p>
            </div>
          </div>
        </div>

        {/* CORE VALUES */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-center mb-12">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <Globe className="text-emerald-400 mb-4" size={28} />

              <h3 className="text-xl font-bold text-white mb-2">
                Sustainability
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed">
                Reducing food waste supports a cleaner and more responsible
                way of using available resources.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <ShieldCheck className="text-blue-400 mb-4" size={28} />

              <h3 className="text-xl font-bold text-white mb-2">
                Food Safety
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed">
                Food listings include expiry time and status updates so users
                can manage donations more safely.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <Users className="text-orange-400 mb-4" size={28} />

              <h3 className="text-xl font-bold text-white mb-2">
                Community
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed">
                EcoBite connects restaurants, NGOs, and volunteers so they can
                work together for a common social purpose.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <Leaf className="text-green-400 mb-4" size={28} />

              <h3 className="text-xl font-bold text-white mb-2">
                Transparency
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed">
                Requests, assignments, pickup status, delivery status, and
                analytics help make the donation process clear.
              </p>
            </div>
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="bg-gradient-to-br from-green-900/40 to-[#050505] border border-green-500/20 backdrop-blur-xl rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.15),transparent_50%)] pointer-events-none"></div>

          <h2 className="text-4xl font-black mb-6 relative z-10">
            Be part of the solution.
          </h2>

          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto relative z-10">
            Whether you are a restaurant with surplus food, an NGO supporting a
            community, or a volunteer ready to help, EcoBite gives you a place
            to contribute.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] group relative z-10"
          >
            Become a Partner{" "}
            <ArrowRight
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}