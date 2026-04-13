import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, FileText, Heart, Users, User, Settings, HelpCircle, LogOut, Bell, MessageSquare, Search as SearchIcon } from 'lucide-react';
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

  const menuItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/dashboard', category: 'MENU' },
    { name: 'Search', icon: <Search size={20} />, path: '/search', category: 'MENU' },
    { name: 'Report', icon: <FileText size={20} />, path: '/report', category: 'MENU' },
    { name: 'Membership', icon: <Users size={20} />, path: '/membership', category: 'MENU' },
    { name: userRole === 'admin' ? 'Donation' : 'Donate', icon: <Heart size={20} />, path: '/donate', category: 'MENU'},
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings', category: 'GENERAL' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile', category: 'GENERAL' },
    { name: 'Help', icon: <HelpCircle size={20} />, path: '/help', category: 'GENERAL' },
 
  ];

  return (
    <div className="overflow-hidden flex min-h-screen bg-[#F8F9FA] font-['Inter',sans-serif]">
      {/* SIDEBAR */}
      <aside className="overflow-hidden w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-hidden shadow-xl">
  
        {/* --- CANVA HEADER: FULL WIDTH GRADIENT --- */}
        <div 
          className="w-full h-19 flex items-center gap-4 px-6 shadow-lg mb-8"
          
        >
          {/* White Circular Logo Container */}
          <div className="w-17 h-17  p-1 flex items-center justify-center ">
            <img 
              src={logo} 
              alt="MaCync Logo" 
              className="w-full h-full object-contain text-[#166534]" 
            />
          </div>

          {/* MaCync Text: Bold & White */}
          <h1 className="text-[24px] font-black bg-gradient-to-r from-[#166534] to-[#507d02] bg-clip-text text-transparent tracking-tighter drop-shadow-md">
            MaCync
          </h1>
        </div>

        {/* --- NAVIGATION: PADDED HERE TO KEEP BUTTONS ALIGNED --- */}
        <nav className="flex-1 px-2 space-y-8 overflow-y-auto no-scrollbar">
          
          {/* MENU SECTION */}
          <div>
            <p className="text-[11px] font-black text-gray-400 tracking-[px] mb-4 uppercase ml-2 ">Menu</p>
            <div className="space-y-1">
              {menuItems.filter(i => i.category === 'MENU').map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`flex items-center gap-4 px-5 py-4 rounded-[.5rem] transition-all duration-300 font-bold ${
                    location.pathname === item.path 
                    ? 'bg-gradient-to-r from-[#166534] to-[#507d02] text-white shadow-xl 0 scale-[1.02]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#166534]'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* GENERAL SECTION */}
          <div>
            <p className="text-[11px] font-black text-gray-400 tracking-[2px] mb-4 uppercase ml-2 ">General</p>
            <div className="space-y-1">
              {menuItems.filter(i => i.category === 'GENERAL').map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`flex items-center gap-4 px-5 py-4 rounded-[.5rem] transition-all duration-300 font-bold ${
                    location.pathname === item.path 
                    ? 'bg-[#166534] text-white shadow-lg' 
                    : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              ))}
              
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-4 px-5 py-4 rounded-[.5rem] text-red-500 hover:bg-red-50 transition-all mt-4 font-bold"
              >
                <LogOut size={22} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </nav>

      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="h-20 bg-transparent flex items-center justify-between px-10">
          <div className="relative w-96">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search report or task..." className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 shadow-sm outline-none focus:ring-2 ring-green-100" />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button className="p-3 bg-white border border-gray-100 rounded-[.5rem] text-gray-500 shadow-sm hover:bg-gray-50 transition-all"><MessageSquare size={20}/></button>
              <button className="p-3 bg-white border border-gray-100 rounded-[.5rem] text-gray-500 shadow-sm hover:bg-gray-50 transition-all"><Bell size={20}/></button>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-[.5rem] shadow-sm border border-gray-100">
               <div className="w-10 h-10 rounded-[.5rem]  bg-[#bef264] flex items-center justify-center text-black font-black">
                  {userInfo.name.charAt(0)}
               </div>
               <div>
                  <p className="text-xs font-black text-gray-800">{userInfo.name}</p>
                  <p className="text-[10px] text-gray-400">{userInfo.email}</p>
               </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-10 pb-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;