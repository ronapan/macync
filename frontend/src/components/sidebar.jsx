import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Search, FileText, Heart, Users, User, Settings, 
  HelpCircle, LogOut, Bell, MessageSquare, Search as SearchIcon,
  Inbox, LayoutGrid, ShieldCheck, ChevronUp, Receipt
} from 'lucide-react';
import logo from '../assets/images/logo.png';

const Sidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: "Guest", email: "guest@macync.com" };
  const userRole = userInfo.role || 'user';

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // 1. Updated Menu Items with Profile included
  const menuItems = [
    { name: 'Dashboard', icon: <Home size={18} />, path: '/dashboard' },
    { name: 'Search', icon: <Search size={18} />, path: '/search' },
    { name: 'Reports', icon: <FileText size={18} />, path: '/report' },
    { name: 'Membership', icon: <Users size={18} />, path: '/membership' },
    { name: userRole === 'admin' ? 'Donation' : 'Donate', icon: <Heart size={18} />, path: '/donate' },
    { name: 'My Profile', icon: <User size={18} />, path: '/profile' }, // Added Profile here
  ];

  const generalItems = [
    { name: 'Preferences', icon: <Settings size={18} />, path: '/settings' },
    { name: 'Help Center', icon: <HelpCircle size={18} />, path: '/help' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-['Inter',sans-serif] overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen shadow-sm overflow-hidden">
        
        {/* 1. BRAND HEADER (Matching "Pointsale" top) */}
        <div className="p-5 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-3">
             <img src={logo} alt="MaCync" className="w-7 h-7 object-contain" />
             <span className="text-lg font-black text-gray-800 tracking-tighter uppercase">MaCync</span>
          </div>
          <LayoutGrid size={18} className="text-gray-300" />
        </div>

        {/* 2. TOP ACTIONS (Quick Search & Notifs) */}
        <div className="px-4 py-4 space-y-1 border-b border-gray-50">
          
           <div className="flex items-center justify-between px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer transition-all">
              <div className="flex items-center gap-3 text-sm font-medium"><Inbox size={18}/> Inbox</div>
              <span className="text-[10px] font-bold text-gray-400">12</span>
           </div>
           <div className="flex items-center justify-between px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer transition-all">
              <div className="flex items-center gap-3 text-sm font-medium"><Bell size={18}/> Notifications</div>
              <span className="text-[10px] font-bold text-gray-400">15+</span>
           </div>
        </div>

        {/* 3. SCROLLABLE NAVIGATION */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-8">
          
          {/* MENU SECTION */}
          <div className="px-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase ml-3 mb-3 tracking-widest">Menu</p>
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white shadow-sm border border-gray-100 text-gray-900 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <span className={isActive ? 'text-[#166534]' : ''}>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          

          {/* GENERAL SECTION */}
          <div className="px-4">
             <p className="text-[11px] font-bold text-gray-400 uppercase ml-3 mb-3 tracking-widest">System</p>
            <nav className="space-y-0.5 pt-1">
              {generalItems.map((item) => (
                <Link key={item.name} to={item.path} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* 5. USER FOOTER (Fixed at bottom) */}
        <div className="p-4 border-t border-gray-50 bg-white">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100 group cursor-pointer hover:bg-gray-100 transition-all"
          >
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#166534] to-[#bef264] flex items-center justify-center text-white font-black text-xs shadow-sm">
                   {userInfo.name.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                   <span className="text-xs font-black text-gray-800 leading-none mb-1 truncate w-24">{userInfo.name}</span>
                   <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{userRole.replace('_', ' ')}</span>
                </div>
             </div>
             <div className="flex flex-col items-center gap-0.5">
                <ChevronUp size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Logout"
                >
                  <LogOut size={12} className="text-red-500"/>
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
        <header className="h-16 flex items-center justify-between px-10">
           <div className="flex items-center gap-4">
              {/* Context Title can go here */}
           </div>
           <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:bg-white hover:shadow-sm rounded-lg transition-all"><MessageSquare size={20}/></button>
              <button className="p-2 text-gray-400 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Bell size={20}/></button>
           </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-10 pb-10 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;