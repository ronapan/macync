import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-lg px-12 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2 text-2xl font-black text-[#111315] ">
        <div className="w-8 h-8 "></div>
        
      </div>
      
      <div className="flex gap-10 items-center font-bold text-sm text-gray-600">
        <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
        <Link to="/news" className="hover:text-green-600 transition-colors">News & Events</Link>
        <Link to="/report" className="hover:text-green-600 transition-colors">Report</Link>
        <Link to="/donate" className="hover:text-green-600 transition-colors">Donate</Link>
        
        <Link to="/login" className="bg-[#111315] text-white px-8 py-2.5 rounded-2xl hover:bg-green-600 hover:shadow-lg transition-all">
          Log In
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;