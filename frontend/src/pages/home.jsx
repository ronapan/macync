import React from 'react';
import Sidebar from '../components/sidebar';
import { 
  ArrowUpRight, Plus, MapPin, Calendar, 
  ChevronRight, Users, Star, Megaphone, Newspaper 
} from 'lucide-react';

const Home = () => {
  // Mock Data for the 5 Activities
  

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#166534] mb-2 tracking-tight">Announcements</h1>
            <p className="text-gray-400 font-medium">Join community activities and stay updated on environmental news.</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-[#166534] text-white px-6 py-3 rounded-[.5rem] font-bold flex items-center gap-2 shadow-lg shadow-green-100 hover:scale-105 transition-all">
                <Plus size={18}/> New Report
             </button>
          </div>
        </div>

      

        {/* SECTION: NEWS & ANNOUNCEMENTS (Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          
          {/* LEFT: MAIN NEWS FEED */}
          <div className="lg:col-span-2 space-y-6">
             <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3 px-2">
               <Newspaper className="text-green-600"/> Latest News
             </h2>
             
             <div className="bg-white rounded-[.5rem] p-8 border border-gray-100 shadow-sm hover:border-green-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                   <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Update</span>
                   <p className="text-xs text-gray-400 font-bold">June 15, 2024</p>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-[#166534] transition-colors">Provincial Mining Ban Resolution Passed</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">The provincial board has officially endorsed a resolution strengthening the 50-year mining ban in Marinduque. This comes after MaCEC presented satellite evidence of small-scale mining activity...</p>
                <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">M</div>
                   <div>
                      <p className="text-xs font-bold text-gray-800">MaCEC Secretariat</p>
                      <p className="text-[10px] text-gray-400">Official Release</p>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT: ANNOUNCEMENTS & UPCOMING */}
          <div className="space-y-6">
             <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3 px-2">
               <Megaphone className="text-green-600"/> Alerts
             </h2>

             <div className="bg-[#166534] p-8 rounded-[.5rem] text-white shadow-xl shadow-green-100 flex flex-col justify-between h-fit">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-[.5rem] flex items-center justify-center"><Calendar className="text-[#bef264]"/></div>
                  <h3 className="text-xl font-bold">General Assembly</h3>
                  <p className="text-sm opacity-80 leading-relaxed">All Chapter Officers are required to attend the quarterly assembly at the Diocesan Center.</p>
                </div>
                <div className="mt-8 p-4 bg-white/10 rounded-[.5rem]">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Schedule</p>
                   <p className="text-sm font-bold">Friday, 2:00 PM • Boac</p>
                </div>
                <button className="w-full bg-[#bef264] text-[#166534] py-4 rrounded-[.5rem] font-black mt-6 hover:bg-white transition-all shadow-lg">Confirm Attendance</button>
             </div>

             <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm">
                <h4 className="font-black text-gray-800 mb-4">Membership Goal</h4>
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                   <span>9,315 Members</span>
                   <span className="text-green-600">85% Complete</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-[#bef264] h-full w-[85%] shadow-[0_0_10px_#bef264]"></div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
};

export default Home;