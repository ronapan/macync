import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import { locations } from '../../utils/location';
import { 
  DollarSign, TrendingUp, MapPin, Loader2, CheckCircle, 
  Eye, ArrowLeft, User, Phone, FileText, ChevronRight, XCircle, 
  ShieldCheck, AlertCircle, Zap, Clock, Receipt, Banknote, Hash
} from 'lucide-react';
import NotificationModal from '../../components/notificationmodal';
import '../../index.css';
import API_URL from '../../api';

const AdminDonation = () => {
  // 1. STATES - STRICTLY UNCHANGED
  const [view, setView] = useState('muni'); 
  const [selection, setSelection] = useState({ municipality: '', barangay: '' });
  const [data, setData] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 2. FETCH LOGIC - STRICTLY UNCHANGED
  const fetchAdminDonations = useCallback(async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const response = await axios.get(`${API_URL}/donations`, config);
      setData(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminDonations();
  }, [fetchAdminDonations]);

  // 3. ACTION HANDLER - STRICTLY UNCHANGED
  const handleVerifyAction = async (id, status, adminNote) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.put(`${API_URL}/donations/${id}/verify`, {
        status,
        adminNote: adminNote || (status === 'received' ? "Verified by MaCync Treasury." : "Rejected due to invalid reference.")
      }, config);

      setModal({
        show: true,
        type: status === 'received' ? 'success' : 'error',
        title: status === 'received' ? 'Donation Verified' : 'Action Cancelled',
        message: status === 'received' ? 'Official receipt has been deployed to member.' : 'The record has been rejected.'
      });

      setNote('');
      setSelectedDonation(null);
      setView('list');
      fetchAdminDonations();
    } catch (err) {
      alert("Action failed: " + err.response?.data?.message);
    }
  };

  if (loading) return (
    <Sidebar>
      <div className="h-screen flex flex-col items-center justify-center text-gray-400 animate-pulse">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-[10px]">Accessing MaCync Finance Records...</p>
      </div>
    </Sidebar>
  );

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 px-6">
        
        {/* TOP GREETING SECTION (Finexy Style) */}
        <div className="flex justify-between items-start pt-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Good morning, MaCync Admin</h1>
            <p className="text-gray-400 font-medium text-sm">Provincial audit status and financial oversight summary.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 px-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Live Syncing</span>
             </div>
          </div>
        </div>

        {/* STAT CARDS GRID (Finexy Mixed Card Layout) */}
        {view === 'muni' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Big Card */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-56">
               <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Collection</p>
                  <h2 className="text-4xl font-black text-gray-900 mt-2">₱{data?.summary?.totalCollection || 0}</h2>
               </div>
               <div className="flex gap-2">
                  <div className="bg-green-50 text-green-600 p-2 rounded-lg flex items-center gap-2 text-[10px] font-bold">
                    <TrendingUp size={14}/> +12% this month
                  </div>
               </div>
            </div>

            {/* Middle Grid of 4 small cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
               <div className="bg-[#166534] p-6 rounded-[1.5rem] text-white flex flex-col justify-between shadow-lg shadow-green-100">
                  <p className="text-[9px] font-bold uppercase opacity-60">Received Today</p>
                  <p className="text-2xl font-black">₱{data?.summary?.todayTotal || 0}</p>
               </div>
               <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 flex flex-col justify-between shadow-sm">
                  <p className="text-[9px] font-bold uppercase text-gray-400">Monitoring Fund</p>
                  <p className="text-xl font-black text-gray-800 tracking-tighter">₱{data?.summary?.categoryTotals?.find(c => c._id === 'Environmental Monitoring')?.total || 0}</p>
               </div>
               <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 flex flex-col justify-between shadow-sm">
                  <p className="text-[9px] font-bold uppercase text-gray-400">Disaster Relief</p>
                  <p className="text-xl font-black text-gray-800 tracking-tighter">₱{data?.summary?.categoryTotals?.find(c => c._id === 'Disaster Relief')?.total || 0}</p>
               </div>
               <div className="bg-[#bef264] p-6 rounded-[1.5rem] text-[#166534] flex flex-col justify-between shadow-sm">
                  <p className="text-[9px] font-black uppercase opacity-60">Pending Audits</p>
                  <p className="text-2xl font-black">{data?.donations?.filter(d => d.status === 'pending').length}</p>
               </div>
            </div>

            {/* Right Chart Placeholder Style Card */}
            <div className="lg:col-span-3 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
               <ShieldCheck size={48} className="text-green-600 mb-2 opacity-20"/>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MaCync Treasury</p>
               <p className="text-xs font-medium text-gray-500 mt-2 px-4">All transactions are secured and verified provincially.</p>
            </div>
          </div>
        )}

        {/* NAVIGATION TRACKER */}
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-white w-fit px-8 py-3 rounded-full border border-gray-50 shadow-sm uppercase tracking-widest transition-all">
          <button onClick={() => setView('muni')} className="hover:text-green-700">PROVINCIAL</button>
          {selection.municipality && <><ChevronRight size={14}/> <button onClick={() => setView('brgy')} className="hover:text-green-700">{selection.municipality}</button></>}
          {selection.barangay && <><ChevronRight size={14}/> <span className="text-[#166534]">{selection.barangay}</span></>}
        </div>

        {/* MAIN INTERACTIVE CONTENT */}
        <div className="min-h-[500px]">
          
          {/* A. MUNICIPALITY VIEW */}
          {view === 'muni' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4">
              {/* MUNI GRID */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(locations).map(muni => {
                  const muniCount = data?.donations?.filter(d => d.municipality === muni).length || 0;
                  return (
                    <div key={muni} onClick={() => { setSelection({...selection, municipality: muni}); setView('brgy'); }}
                      className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-300 cursor-pointer flex justify-between items-center group transition-all">
                      <div>
                        <h3 className="text-2xl font-black text-gray-800">{muni}</h3>
                        <p className="text-[10px] font-bold text-green-600 uppercase mt-1 tracking-widest">{muniCount} Registries</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-green-100 text-gray-300 group-hover:text-green-600 transition-colors"><MapPin size={24}/></div>
                    </div>
                  );
                })}
              </div>

              {/* RESPONSE QUEUE (Finexy Recent Activities Style) */}
              <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm border-t-8 border-orange-400">
                <div className="flex items-center justify-between mb-8 border-b pb-6">
                   <div className="flex items-center gap-2"><Zap className="text-orange-500 fill-orange-500" size={18} /><h3 className="text-sm font-black text-gray-800 uppercase">Audit Queue</h3></div>
                   <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{data?.donations?.filter(d => d.status === 'pending').length}</span>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {data?.donations?.filter(d => d.status === 'pending').map((p) => (
                    <div key={p._id} onClick={() => {setSelectedDonation(p); setView('details');}} className="p-4 bg-gray-50 rounded-xl border border-transparent hover:border-green-500 hover:bg-white transition-all cursor-pointer group">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">{p.paymentMethod}</p>
                      <h4 className="font-black text-gray-800 text-sm group-hover:text-[#166534]">₱{p.amount} • {p.donorName}</h4>
                      <p className="text-[9px] text-gray-400 font-bold mt-2 truncate uppercase">{p.barangay}, {p.municipality}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* B. BARANGAY VIEW */}
          {view === 'brgy' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-right-4">
              {locations[selection.municipality].map(brgy => {
                const brgyCount = data?.donations?.filter(d => d.barangay === brgy).length || 0;
                return (
                  <div key={brgy} onClick={() => { setSelection({...selection, barangay: brgy}); setView('list'); }}
                    className="bg-white p-10 rounded-[2rem] border border-gray-100 hover:shadow-lg hover:border-green-400 cursor-pointer transition-all text-center relative group">
                    <p className="font-black text-gray-800 uppercase tracking-tighter text-xl">{brgy}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-2 group-hover:text-green-600 transition-colors">{brgyCount} Items</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* C. LIST VIEW (Finexy Table Aesthetic) */}
          {view === 'list' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in zoom-in-95">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[2px] border-b">
                  <tr><th className="p-10">Donor / Subject</th><th className="p-10 text-center">Status</th><th className="p-10 text-right">Audit Detail</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.donations?.filter(d => d.municipality === selection.municipality && d.barangay === selection.barangay).map((d, index) => (
                    <tr key={d._id} className="hover:bg-green-50/40 transition-all group">
                      <td className="p-10 flex items-center gap-6">
                        <span className="text-gray-200 font-black italic text-3xl">{index + 1}</span>
                        <div>
                           <p className="font-black text-gray-800 text-xl leading-none">₱{d.amount}</p>
                           <p className="text-[11px] text-gray-400 font-bold uppercase mt-2 tracking-widest">{d.donatorId?.name || d.donorName}</p>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase shadow-sm border ${d.status === 'received' ? 'bg-green-50 text-green-700 border-green-100' : d.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          • {d.status}
                        </span>
                      </td>
                      <td className="p-10 text-right">
                        <button onClick={() => { setSelectedDonation(d); setView('details'); }} className="p-5 bg-gray-900 text-white rounded-2xl hover:scale-110 shadow-lg transition-all"><Eye size={22}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* D. FULL DETAIL FOLDER VIEW */}
          {view === 'details' && selectedDonation && (
            <div className="animate-in slide-in-from-right-10 duration-700 pb-10">
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase mb-10 hover:text-[#166534] tracking-widest transition-all px-4"><ArrowLeft size={14}/> Return to registry list</button>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 space-y-12">
                   <div className="border-b border-gray-50 pb-10">
                      <p className="text-green-600 font-black uppercase text-[10px] tracking-[4px] mb-2">Central Registry File</p>
                      <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-6">Case Verification</h2>
                      <div className="flex gap-4 font-black">
                         <span className="bg-gray-50 text-gray-400 px-4 py-1.5 rounded-xl text-[10px] uppercase border font-mono">Ref: {selectedDonation.referenceNumber}</span>
                         <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px] uppercase border border-blue-100">{selectedDonation.paymentMethod}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      <div className="p-8 bg-gray-50 rounded-[1.5rem] space-y-6 border border-gray-100 shadow-inner">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Donator Linkage</h4>
                         <div className="space-y-4">
                            <p className="font-black flex items-center gap-3 text-gray-800 text-xl uppercase tracking-tighter"><User size={22} className="text-green-600"/> {selectedDonation.donorName}</p>
                            <p className="text-base font-bold text-gray-400 flex items-center gap-3"><Phone size={18} className="text-green-600"/> {selectedDonation.contactNumber}</p>
                         </div>
                      </div>
                      <div className="p-8 bg-[#166534] rounded-[1.5rem] text-white shadow-2xl shadow-green-100 flex flex-col justify-center">
                         <h4 className="text-[10px] opacity-60 font-black uppercase tracking-widest mb-2">Total Amount Logged</h4>
                         <p className="font-black text-4xl tracking-tighter leading-none">₱{selectedDonation.amount}</p>
                         <p className="text-[10px] font-bold text-green-200 mt-4 uppercase italic">{selectedDonation.category}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6 tracking-[3px]">Digital Proof Attachment</h4>
                      <div className="rounded-[.5rem] overflow-hidden border-8 border-gray-50 shadow-2xl relative group h-[400px]">
                        <img src={`${API_URL.replace('/api/v1', '')}/${selectedDonation.proofOfPayment}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="receipt" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <a href={`${API_URL.replace('/api/v1', '')}/${selectedDonation.proofOfPayment}`} target="_blank" rel="noreferrer" className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase shadow-xl">full document view</a>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Receipt Card (Right Side) */}
                <div className="bg-white p-16 rounded-[2rem] shadow-2xl border-t-[24px] border-[#166534] space-y-12 relative overflow-hidden h-fit">
                   <div className="absolute -top-10 -right-10 p-10 opacity-5 scale-[2]"><ShieldCheck size={200} className="text-green-600"/></div>
                   <div className="text-center border-b border-dashed border-gray-200 pb-12">
                      <Receipt size={48} className="mx-auto text-green-600 opacity-20 mb-4" />
                      <h3 className="text-3xl font-black text-[#166534] tracking-tight italic uppercase">Official Receipt</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[4px] mt-2 font-mono">MaCync Treasury</p>
                      {selectedDonation.officialReceiptNo && (
                         <div className="mt-8 inline-block bg-[#bef264] text-[#166534] px-10 py-3 rounded-2xl font-mono font-black text-lg shadow-sm tracking-[5px]">#{selectedDonation.officialReceiptNo}</div>
                      )}
                   </div>

                   <div className="space-y-6 text-sm">
                      {selectedDonation.status === 'pending' ? (
                        <div className="pt-10 space-y-8 animate-in slide-in-from-bottom-4">
                           <div className="space-y-4">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] ml-6 italic">Validation Note</label>
                              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type a thank you message..." className="w-full p-8 bg-gray-50 border border-gray-100 rounded-[1.5rem] outline-none h-32 focus:ring-4 ring-green-100 text-sm font-medium" />
                           </div>
                           <div className="flex gap-6">
                              <button onClick={() => handleVerifyAction(selectedDonation._id, 'received', note)} className="flex-[3] bg-[#166534] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-100 hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-widest">Verify & Deploy</button>
                              <button onClick={() => handleVerifyAction(selectedDonation._id, 'rejected', note || 'Invalid Ref Number')} className="flex-1 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-xs hover:bg-red-600 hover:text-white transition-all uppercase">Reject</button>
                           </div>
                        </div>
                      ) : (
                        <div className="p-8 bg-[#166534] text-[#bef264] rounded-[1.5rem] text-center font-black uppercase tracking-[5px] flex items-center justify-center gap-5 border-b-[10px] border-green-900 shadow-2xl scale-105">
                           <ShieldCheck size={32}/> Audit Complete
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <NotificationModal 
        isOpen={modal.show} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message} 
        onClose={() => setModal({...modal, show: false})} 
      />
    </Sidebar>
  );
};

// Simplified StatCard matching the visual weight of the Finexy reference
const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-8 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between h-32 transition-all hover:-translate-y-1 hover:shadow-xl`}>
    <div className="flex justify-between items-start opacity-70 uppercase font-black text-[10px] tracking-[4px]">{title} {icon}</div>
    <p className="text-[44px] font-black tracking-tighter leading-none">{value}</p>
  </div>
);

export default AdminDonation;