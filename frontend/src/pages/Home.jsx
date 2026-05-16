import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Building2, HandHeart, Leaf, MapPin, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] font-sans overflow-hidden text-white relative pt-32">
      
      {/* --- Global Ambient Glows --- */}
      <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] bg-emerald-900/20 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* 1. HERO SECTION */}
      <section className="relative px-6 pb-20 md:pb-32 max-w-6xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 font-bold text-sm mb-8 border border-green-500/20 shadow-sm">
          <Leaf size={16} /> <span>Join the movement against food waste</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1]">
          Zero Waste. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            Zero Hunger.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
          EcoBite is a digital ecosystem where surplus food meets those who need it most. We connect local restaurants directly with NGOs and volunteers.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:-translate-y-1">
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* 2. IMPACT STATS */}
      <section className="py-12 bg-white/5 backdrop-blur-md border-y border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-white mb-2">10k+</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Meals Saved</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">250</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Partners</div>
            </div>
            <div>
              <div className="text-4xl font-black text-green-400 mb-2">5.2t</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">CO2 Reduced</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">500+</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Volunteers</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO IS IT FOR (ROLES) */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">One Platform. Three Pillars.</h2>
          <p className="text-xl text-gray-400">Everyone has a role to play in ending food waste.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Restaurant Card */}
          <div className="p-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 hover:border-green-500/50 shadow-2xl transition-all group relative overflow-hidden hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-500/20 transition-colors shadow-inner">
              <Utensils className="text-green-400" size={32} />
            </div>
            <h3 className="font-black text-2xl mb-4 text-white">For Restaurants</h3>
            <p className="text-gray-400 leading-relaxed mb-8">List your surplus food in seconds. Track your social impact metrics and get tax deduction reports for your donations.</p>
            <Link to="/register" className="font-bold text-green-400 flex items-center gap-1 hover:gap-2 transition-all">Join as Donor <ArrowRight size={16} /></Link>
          </div>

          {/* NGO Card */}
          <div className="p-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 hover:border-blue-500/50 shadow-2xl transition-all group relative overflow-hidden hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500/20 transition-colors shadow-inner">
              <Building2 className="text-blue-400" size={32} />
            </div>
            <h3 className="font-black text-2xl mb-4 text-white">For NGOs</h3>
            <p className="text-gray-400 leading-relaxed mb-8">Browse real-time nearby food donations. Schedule instant pickups to ensure your community gets fresh meals.</p>
            <Link to="/register" className="font-bold text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">Join as NGO <ArrowRight size={16} /></Link>
          </div>

          {/* Volunteer Card */}
          <div className="p-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 hover:border-orange-500/50 shadow-2xl transition-all group relative overflow-hidden hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-500/20 transition-colors shadow-inner">
              <HandHeart className="text-orange-400" size={32} />
            </div>
            <h3 className="font-black text-2xl mb-4 text-white">For Volunteers</h3>
            <p className="text-gray-400 leading-relaxed mb-8">Help bridge the gap. Manage the logistics of food delivery from restaurants to NGOs using our smart routing system.</p>
            <Link to="/register" className="font-bold text-orange-400 flex items-center gap-1 hover:gap-2 transition-all">Start Delivering <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 relative z-10 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-white tracking-tight">How EcoBite Works</h2>
            <p className="text-xl text-gray-400">A seamless process from surplus to served.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-white/10"></div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-[#050505] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border-4 border-white/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                <Utensils className="text-green-400" size={24} />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">1. List Surplus</h4>
              <p className="text-gray-400 text-sm">Restaurants post available edible food on the platform.</p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-[#050505] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border-4 border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <MapPin className="text-blue-400" size={24} />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">2. Match & Assign</h4>
              <p className="text-gray-400 text-sm">Nearby NGOs claim the food and a volunteer is assigned.</p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-[#050505] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border-4 border-white/10 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                <Clock className="text-orange-400" size={24} />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">3. Pickup & Deliver</h4>
              <p className="text-gray-400 text-sm">Food is safely transported and distributed to the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 pt-16 pb-8 px-6 mt-auto relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-black text-2xl tracking-tight mb-4">
              <Leaf className="text-green-500" strokeWidth={3} /> EcoBite
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Building a sustainable future by ensuring perfectly good food feeds people, not landfills.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/restaurants" className="hover:text-green-400 transition-colors">Our Partners</Link></li>
              <li><Link to="/register" className="hover:text-green-400 transition-colors">Register NGO</Link></li>
              <li><Link to="/register" className="hover:text-green-400 transition-colors">Volunteer</Link></li>
              <li><Link to="/login" className="hover:text-green-400 transition-colors">Log In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Food Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} EcoBite. All rights reserved.</p>
          <div className="flex gap-4 text-gray-400">
            {/* Social icons styled as dark glass */}
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 cursor-pointer transition-all shadow-md">𝕏</div>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 cursor-pointer transition-all shadow-md">in</div>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 cursor-pointer transition-all shadow-md">IG</div>
          </div>
        </div>
      </footer>

    </div>
  );
}