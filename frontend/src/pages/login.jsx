import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LayoutGrid, Globe, Apple } from 'lucide-react'; 
import '../index.css'; 
import logo from '../assets/images/logo.png'; 
import heroBg from '../assets/images/bg-sign.png'; // Ensure path is correct

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post("http://localhost:3000/api/v1/users/login", { email, password });
      
      // Save token and info
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      
      // Role-based redirection logic
      if (res.data.role === 'admin' || res.data.role === 'municipal_officer') {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F5F7] font-['Poppins']">
      
      
      
      {/* LEFT SIDE: BACKGROUND IMAGE & BRANDING TEXT */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-20 overflow-hidden">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          {/* Strict Green Gradient Overlay matching MaCync theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#166534]/90 to-[#98ff24]/40"></div>
        </div>

        {/* Decorative Floating Elements (as seen in the reference UI) */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-10 w-4 h-4 bg-[#bef264] rounded-full"></div>

        {/* Branding Content */}
        <div className="relative z-10 text-white space-y-6">
          <div className="flex items-center gap-4 mb-10">
            <img src={logo} alt="Logo" className="w-25 h-25 drop-shadow-2xl" />
            <h2 className="text-3xl font-black tracking-tighter">MaCync</h2>
          </div>
          <h1 className="text-5xl font-black leading-[1.1] tracking-tighter">
            Empowering Environmental Action Through Data
          </h1>
          <p className="text-xl font-medium opacity-80 max-w-sm">
            Centralized Environmental Monitoring for the Marinduque Council for Environmental Concerns.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: CLEAN LOGIN CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 md:p-4">
        <div className="w-full max-w-xlg bg-white p-10 md:p-16 rounded-[.5rem] shadow-2xl shadow-gray-200 border border-gray-50 relative">
          
          <div className="flex flex-col items-center mb-10">
            
            <h2 className="text-2xl font-black text-gray-800">Hello! Welcome back</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[.5rem] mb-6 text-sm font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* EMAIL INPUT WITH ICON */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#166534] transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-[#F8F9FA] h-14 pl-14 pr-6 rounded-[.5rem] border-none outline-none focus:ring-2 ring-green-100 font-medium text-gray-700"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD INPUT WITH ICON */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#166534] transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-[#F8F9FA] h-14 pl-14 pr-6 rounded-[.5rem] border-none outline-none focus:ring-2 ring-green-100 font-medium text-gray-700"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* OPTIONS ROW */}
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center text-xs font-bold text-gray-400 cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4 rounded accent-[#166534]" /> Remember me
              </label>
              <a href="#" className="text-xs font-bold text-[#166534] hover:underline">Reset Password?</a>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="w-full bg-[#166534] text-white h-14 rounded-[.5rem] font-black text-lg shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all">
              Login
            </button>
          </form>

          {/* SOCIAL LOGIN SECTION (Matching UI Reference) */}
          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="w-full border-t border-gray-100"></div>
              <span className="absolute bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">or</span>
            </div>

            <div className="flex justify-center gap-4">
              <SocialIcon icon={<Globe size={20}/>} />
              <SocialIcon icon={<LayoutGrid size={20}/>} />
              <SocialIcon icon={<Apple size={20}/>} />
            </div>
          </div>

          <p className="mt-12 text-center text-sm font-bold text-gray-400 uppercase tracking-tighter">
            Don't Have an account? <Link to="/register" className="text-[#166534] underline ml-1">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable Helper for Social Buttons
const SocialIcon = ({ icon }) => (
  <button className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all">
    {icon}
  </button>
);

export default Login;