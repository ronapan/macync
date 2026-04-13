import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Shield, ArrowLeft } from 'lucide-react';
import { locations } from '../utils/location'; // Siguraduhing tama ang import path
import '../index.css'; 
import logo from '../assets/images/logo.png'; 
import heroBg from '../assets/images/bg-sign1.png'; 

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member', // Default role
    municipality: '',
    barangay: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation: Siguraduhing may barangay bago i-send
    if (!formData.barangay) {
      setError("Please select your Municipality and Barangay.");
      return;
    }

    try {
      // Dito mo i-check kung tama ang URL (3000 o 5000)
      await axios.post("http://localhost:3000/api/v1/users/register", formData);
      alert("Registration Successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F5F7] font-['Poppins']">
      
      {/* LEFT SIDE: HERO (Matching Login) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#166534]/90 to-[#98ff24]/40"></div>
        </div>
        <div className="relative z-10 text-white space-y-6 text-center">
          <img src={logo} alt="Logo" className="w-24 h-24 mx-auto drop-shadow-2xl mb-4" />
          <h1 className="text-6xl font-black leading-tight tracking-tighter">Join MaCync</h1>
          <p className="text-xl font-medium opacity-80">Help us monitor and protect Marinduque's environment.</p>
        </div>
      </div>

      {/* RIGHT SIDE: REGISTER FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-xlg bg-white p-10 rounded-[.5rem] shadow-2xl shadow-gray-200 border border-gray-50 relative">
          
          <Link to="/login" className="absolute top-8 left-8 text-gray-400 hover:text-[#166534] flex items-center gap-1 text-xs font-bold uppercase transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>

          <h2 className="text-2xl font-black text-gray-800 text-center mb-8">Create Account</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-6 text-[10px] font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* NAME */}
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="name" type="text" placeholder="Full Name" onChange={handleChange} className="register-input" required />
            </div>

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="register-input" required />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="password" type="password" placeholder="Password" onChange={handleChange} className="register-input" required />
            </div>

            {/* ROLE SELECT */}
            <div className="relative">
              <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select name="role" onChange={handleChange} className="register-input pl-14 appearance-none" required>
                <option value="member">Member</option>
                <option value="barangay_officer">Barangay Official</option>
                <option value="municipal_officer">Municipal Officer</option>
              </select>
            </div>

            {/* MUNICIPALITY SELECT (Kailangan na ito ng lahat ngayon) */}
            <div className="relative group animate-in slide-in-from-top-2">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                name="municipality" 
                onChange={(e) => setFormData({...formData, municipality: e.target.value, barangay: ''})} 
                className="register-input pl-14 appearance-none" 
                required
              >
                <option value="">Select Municipality</option>
                {Object.keys(locations).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* BARANGAY SELECT */}
            <div className="relative group animate-in slide-in-from-top-2">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                name="barangay" 
                onChange={handleChange} 
                disabled={!formData.municipality} 
                className="register-input pl-14 appearance-none disabled:opacity-50" 
                required
              >
                <option value="">Select Barangay</option>
                {formData.municipality && locations[formData.municipality].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-[#166534] text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all mt-4">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;