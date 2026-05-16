import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Cpu, Users, ArrowRight, Leaf, Globe, Quote, Sprout } from 'lucide-react';

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
      <div className="absolute top-[50%] left-[30%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none animate-float-slow" style={{ animationDelay: '-2s' }}></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* --- HERO SECTION --- */}
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
            We believe that food waste is not a supply problem; it is a logistics problem. EcoBite was built to rewrite the rules of food distribution, turning local surplus into community sustenance.
          </p>
        </div>

        {/* --- THE ORIGIN STORY (Large Glass Pane) --- */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] pointer-events-none"></div>
          
          <Quote className="text-green-500/30 w-24 h-24 absolute top-8 left-8 -z-10" />
          
          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">The Disconnect We Couldn't Ignore</h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed font-medium">
              <p>
                Every single day, roughly one-third of all food produced globally ends up in landfills. At the exact same time, millions of families do not know where their next meal is coming from. 
              </p>
              <p>
                When we looked at the local hospitality industry, we realized that restaurant owners *wanted* to donate their perfectly good surplus food at the end of the night. However, the sheer logistics of finding an available NGO, arranging transport, and ensuring food safety within a narrow time window made it nearly impossible. So, the food was thrown away.
              </p>
              <p>
                <strong className="text-white">EcoBite was born from a simple question:</strong> What if we could use the same technology that brings a taxi to your door in three minutes to rescue food before it spoils?
              </p>
            </div>
          </div>
        </div>

        {/* --- HOW WE USE TECH FOR GOOD --- */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Bridging the Gap with Code</h2>
            <p className="text-gray-400 text-lg">
              We aren't just a charity board; we are a real-time logistics engine. Here is how our technology actively fights waste.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl hover:bg-white/5 transition-colors">
              <Target className="text-blue-400 mb-6" size={32} />
              <h3 className="text-2xl font-black text-white mb-3">Hyper-Local Radius Matching</h3>
              <p className="text-gray-400 leading-relaxed">
                Food has a ticking clock. Our algorithm immediately notifies verified NGOs within a strict, customizable kilometer radius the second a restaurant lists a surplus item, ensuring transit times are kept under 20 minutes.
              </p>
            </div>

            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl hover:bg-white/5 transition-colors">
              <Cpu className="text-green-400 mb-6" size={32} />
              <h3 className="text-2xl font-black text-white mb-3">Decentralized Volunteer Fleet</h3>
              <p className="text-gray-400 leading-relaxed">
                NGOs rarely have dedicated delivery vans. EcoBite crowdsources the delivery process, allowing everyday people with a car, bike, or scooter to accept "rescue missions" directly through their volunteer dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* --- OUR CORE VALUES (4 Grid Items) --- */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <Globe className="text-emerald-400 mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Sustainability</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Food in landfills generates massive amounts of methane. Rescuing meals isn't just about hunger; it's direct climate action.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <ShieldCheck className="text-blue-400 mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Dignity</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We strictly enforce quality standards. Donated food must be fresh, safe, and something you would proudly serve to your own family.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <Users className="text-orange-400 mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Community</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We believe in the power of neighbors helping neighbors. Our platform is simply the digital bridge that connects them.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
              <Leaf className="text-green-400 mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Transparency</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Every meal is tracked. Restaurants see exactly where their food goes, and NGOs know exactly who is delivering it.
              </p>
            </div>

          </div>
        </div>

        {/* --- CTA SECTION --- */}
        <div className="bg-gradient-to-br from-green-900/40 to-[#050505] border border-green-500/20 backdrop-blur-xl rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.15),transparent_50%)] pointer-events-none"></div>
          
          <h2 className="text-4xl font-black mb-6 relative z-10">We cannot do this alone.</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto relative z-10">
            Whether you are a chef with extra portions, a community organizer feeding the hungry, or someone with a car and an hour to spare—your city needs you.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] group relative z-10"
          >
            Become a Partner <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}