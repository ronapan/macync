import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import NotificationModal from '../components/notificationmodal';
import { User, Mail, MapPin, Shield, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { locations } from '../utils/location'; // Siguraduhing tama ang path nito
import API_URL from './api'; // Centralized API URL configuration

const Profile = () => {
  // 1. STATES
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', municipality: '', barangay: '' });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 2. FETCH DATA FROM BACKEND
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/users/profile`, config);
      
      setUser(data);
      // I-set ang initial values ng form base sa data mula sa DB
      setFormData({ 
        name: data.name, 
        email: data.email, 
        municipality: data.municipality || '', 
        barangay: data.barangay || '' 
      });
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // 3. LOGIC: Check if something actually changed
  const hasChanges = user && (
    formData.name !== user.name || 
    formData.municipality !== user.municipality || 
    formData.barangay !== user.barangay
  );

  // 4. SAVE HANDLER
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.barangay) return alert("Please select a Barangay");
    if (!hasChanges) return setIsEditing(false);

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.put(`${API_URL}/users/profile`, formData, config);
      
      setUser(data);
      // I-update ang localStorage para mag-reflect sa Sidebar ang bagong pangalan
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
      setIsEditing(false);

      setModal({
        show: true,
        type: 'success',
        title: 'Update Successful',
        message: 'Your profile information has been securely updated in the MaCync database.'
      });
    } catch (err) {
      setModal({
        show: true,
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || "An error occurred while saving."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center font-bold">Loading MaCync Profile...</div>;

  return (
    <>
      <Sidebar>
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-400 font-medium text-sm">Manage your MaCync account details and address.</p>
          </div>
          
          {/* TOGGLE EDIT BUTTON */}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[.5rem] font-bold transition-all ${
              isEditing ? 'bg-gray-100 text-gray-500' : 'bg-[#166534] text-white shadow-lg shadow-green-100'
            }`}
          >
            {isEditing ? <><XCircle size={18}/> Cancel</> : <><Edit3 size={18}/> Edit Profile</>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN INFORMATION CARD (Left Side - 2/3 width) */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100">
            
            {!isEditing ? (
              /* VIEW MODE: Displaying User Info */
              <div className="space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
                  <div className="w-24 h-24 rounded-[.5rem] bg-green-100 flex items-center justify-center text-[#166534] text-4xl font-black shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">{user.name}</h2>
                    <p className="flex items-center gap-2 text-green-600 font-bold uppercase text-[10px] tracking-widest mt-1">
                      <Shield size={14}/> {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2">Email Address</p>
                    <p className="text-lg font-bold text-gray-700 flex items-center gap-3"><Mail size={18} className="text-green-500"/> {user.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2">Home Address</p>
                    <p className="text-lg font-bold text-gray-700 flex items-center gap-3"><MapPin size={18} className="text-green-500"/> {user.barangay}, {user.municipality}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE: Form for updating data */
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" className="custom-input h-14" 
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-widest text-opacity-50">Email (Permanent)</label>
                    <input type="text" className="custom-input h-14 bg-gray-50 opacity-50 cursor-not-allowed" value={formData.email} readOnly />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Municipality</label>
                    <select 
                      className="custom-input h-14" 
                      value={formData.municipality} 
                      onChange={(e) => setFormData({...formData, municipality: e.target.value, barangay: ''})} 
                      required
                    >
                      <option value="">Select Municipality</option>
                      {Object.keys(locations).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Barangay</label>
                    <select 
                      className="custom-input h-14" 
                      value={formData.barangay} 
                      disabled={!formData.municipality}
                      onChange={(e) => setFormData({...formData, barangay: e.target.value})} 
                      required
                    >
                      <option value="">Select Barangay</option>
                      {formData.municipality && locations[formData.municipality]?.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading || !hasChanges} 
                    className={`px-10 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${
                      !hasChanges ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#166534] text-white hover:scale-105 shadow-lg'
                    }`}
                  >
                    <CheckCircle size={20}/> {loading ? 'Saving to Database...' : 'Save All Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SIDE WIDGET (Right Side - 1/3 width) */}
          <div className="space-y-8">
            <div className="bg-[#166534] p-8 rounded-[.5rem] text-white shadow-xl shadow-green-100 flex flex-col justify-between h-fit">
              <div>
                <h3 className="text-xl font-bold mb-4">Account Verified</h3>
                <p className="text-sm opacity-80 mb-6">You are a registered {user.role.replace('_', ' ')} of MaCEC. Thank you for your service!</p>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-[#bef264] h-full w-full shadow-[0_0_10px_#bef264]"></div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">XX</p>
              
            </div>
          </div>

        </div>
      </Sidebar>

      {/* POPUP NOTIFICATION MODAL */}
      <NotificationModal 
        isOpen={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, show: false })}
      />
    </>
  );
};

export default Profile;