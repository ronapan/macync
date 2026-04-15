import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import { locations } from '../../utils/location';
import { 
  DollarSign, TrendingUp, MapPin, Loader2, CheckCircle, 
  Eye, ArrowLeft, User, Phone, FileText, ChevronRight, XCircle, 
  ShieldCheck, AlertCircle, Zap, Clock, Receipt, Banknote, Hash, ShieldAlert
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
        
        {/* TOP GREETING SECTION */}
        <div className="flex justify-between items-start pt-4">
          <div>
            <h1 className="text-4xl font-black text-green-900 tracking-tight leading-none uppercase">Donation Management</h1>
            <p className="text-gray-400 font-medium text-[11px] mt-2 tracking-widest uppercase italic">Provincial Audit Status & Financial Oversight</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 px-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Database Online</span>
             </div>
          </div>
        </div>

        {/* STAT CARDS GRID */}
        {view === 'muni' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-top-6">
            <div className="lg:col-span-4 bg-[#166534] p-8 rounded-[1.5rem] text-white shadow-xl shadow-green-100 flex flex-col justify-between h-56">
               <div>
                  <p className="text-green-200 font-bold uppercase text-[10px] tracking-widest">Total Collection</p>
                  <h2 className="text-5xl font-black mt-2 tracking-tighter">₱{data?.summary?.totalCollection || 0}</h2>
               </div>
               <div className="flex gap-2">
                  <div className="bg-white/10 p-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <TrendingUp size={14}/> Provincial Target Registry
                  </div>
               </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 flex flex-col justify-between shadow-sm">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Received Today</p>
                  <p className="text-2xl font-black text-gray-800 tracking-tighter leading-none">₱{data?.summary?.todayTotal || 0}</p>
               </div>
               <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 flex flex-col justify-between shadow-sm">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Monitoring Fund</p>
                  <p className="text-xl font-black text-gray-700 tracking-tighter leading-none">₱{data?.summary?.categoryTotals?.find(c => c._id === 'Environmental Monitoring')?.total || 0}</p>
               </div>
               <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 flex flex-col justify-between shadow-sm">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Disaster Relief</p>
                  <p className="text-xl font-black text-gray-700 tracking-tighter leading-none">₱{data?.summary?.categoryTotals?.find(c => c._id === 'Disaster Relief')?.total || 0}</p>
               </div>
               <div className="bg-[#bef264] p-6 rounded-[.5rem] text-[#166534] flex flex-col justify-between shadow-sm">
                  <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Open Audits</p>
                  <p className="text-2xl font-black leading-none">{data?.donations?.filter(d => d.status === 'pending').length}</p>
               </div>
            </div>

            <div className="lg:col-span-3 bg-white p-6 rounded-[.5rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
               <ShieldCheck size={48} className="text-green-600 mb-2 opacity-20"/>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Integrity</p>
               <p className="text-[10px] font-bold text-gray-500 mt-2 px-4 uppercase italic leading-relaxed">Transactions are verified against provincial registry records.</p>
            </div>
          </div>
        )}

        {/* NAVIGATION TRACKER */}
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-white w-fit px-8 py-3 rounded-full border border-gray-50 shadow-sm uppercase tracking-widest transition-all">
          <button onClick={() => setView('muni')} className="hover:text-green-700">PROVINCIAL</button>
          {selection.municipality && <><ChevronRight size={14}/> <button onClick={() => setView('brgy')} className="hover:text-green-700">{selection.municipality}</button></>}
          {selection.barangay && <><ChevronRight size={14}/> <span className="text-[#166534]">{selection.barangay}</span></>}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="min-h-[500px]">
          
          {/* A. MUNICIPALITY VIEW */}
          {view === 'muni' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4">
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                {Object.keys(locations).map(muni => {
                  const muniCount = data?.donations?.filter(d => d.municipality === muni).length || 0;
                  return (
                    <div key={muni} onClick={() => { setSelection({...selection, municipality: muni}); setView('brgy'); }}
                      className="bg-white p-10 rounded-[.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-green-300 cursor-pointer flex justify-between items-center group transition-all">
                      <div>
                        <h3 className="text-2xl font-black text-gray-800 leading-none">{muni}</h3>
                        <p className="text-[10px] font-bold text-green-600 uppercase mt-3 tracking-widest">{muniCount} Registries Found</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-green-100 text-gray-300 group-hover:text-green-600 transition-colors"><MapPin size={24}/></div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION QUEUE */}
              <div className="lg:col-span-4 bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm border-t-8 border-orange-400">
                <div className="flex items-center justify-between mb-8 border-b pb-6">
                   <div className="flex items-center gap-2 text-orange-600"><Zap size={20} fill="currentColor" /><h3 className="text-sm font-black tracking-tighter uppercase">Urgent Audit</h3></div>
                   <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse">{data?.donations?.filter(d => d.status === 'pending').length}</span>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {data?.donations?.filter(d => d.status === 'pending').map((p) => (
                    <div key={p._id} onClick={() => {setSelectedDonation(p); setView('details');}} className="p-5 bg-gray-50 rounded-xl border border-transparent hover:border-green-500 hover:bg-white transition-all cursor-pointer group">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-[2px]">{p.paymentMethod} RECORD</p>
                      <h4 className="font-black text-gray-800 text-base leading-tight group-hover:text-[#166534]">₱{p.amount} from {p.donorName}</h4>
                      <p className="text-[9px] text-gray-400 font-bold mt-2 truncate uppercase tracking-wider">{p.barangay}, {p.municipality}</p>
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
                    className="bg-white p-10 rounded-[.5rem] border border-gray-100 hover:shadow-xl hover:border-green-400 cursor-pointer transition-all text-center group">
                    <p className="font-black text-gray-800 uppercase tracking-tighter text-xl">{brgy}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-3 tracking-widest">{brgyCount} Items</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* C. LIST VIEW */}
          {view === 'list' && (
            <div className="bg-white rounded-[.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in zoom-in-95">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[3px] border-b">
                  <tr><th className="p-10 text-center">Reference / Donor</th><th className="p-10 text-center">Status</th><th className="p-10 text-right">Audit</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.donations?.filter(d => d.municipality === selection.municipality && d.barangay === selection.barangay).map((d, index) => (
                    <tr key={d._id} className="hover:bg-green-50/40 transition-all group">
                      <td className="p-10 flex items-center gap-6">
                        <span className="text-gray-200 font-black italic text-3xl">{index + 1}</span>
                        <div>
                           <p className="font-black text-gray-800 text-xl tracking-tighter leading-none mb-1">₱{d.amount}</p>
                           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[2px]">{d.donatorId?.name || d.donorName}</p>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-sm border ${d.status === 'received' ? 'bg-green-50 text-green-700 border-green-100' : d.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {d.status}
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

          {/* D. FULL DETAIL FOLDER VIEW (RE-DESIGNED FOR URGENCY) */}
          {view === 'details' && selectedDonation && (
            <div className="animate-in slide-in-from-right-10 duration-700 pb-10 px-4">
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase mb-10 hover:text-[#166534] tracking-[3px] transition-all"><ArrowLeft size={16}/> Return to registry list</button>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-12 rounded-[.5rem] shadow-sm border border-gray-100 space-y-12">
                   <div className="border-b border-gray-50 pb-10 flex justify-between items-start">
                      <div>
                        <p className="text-green-600 font-black uppercase text-[10px] tracking-[5px] mb-2 leading-none">Central Registry Case File</p>
                        <h2 className="text-1xl font-black text-gray-900 tracking-tighter leading-none mb-6">Verification Folder</h2>
                        
                        {/* 🔥 URGENCY / IMPORTANCE LEVEL ADDED HERE */}
                        <div className="flex gap-4">
                           <span className="bg-red-50 text-red-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase border border-red-100 flex items-center gap-2 animate-pulse">
                              <ShieldAlert size={14}/> Urgent Priority
                           </span>
                           <span className="bg-gray-50 text-gray-400 px-5 py-2 rounded-2xl text-[10px] font-black uppercase border font-mono">ID: #{selectedDonation.referenceNumber.slice(-10).toUpperCase()}</span>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="p-10 bg-gray-50 rounded-[.5rem] space-y-2 border border-gray-100 shadow-inner">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Contributor Profile</h4>
                         <div className="space-y-5">
                            <p className="font-black flex items-center gap-4 text-gray-800 text-xl tracking-tighter uppercase leading-none"><User size={24} className="text-green-600"/> {selectedDonation.donorName}</p>
                            <p className="text-base font-bold text-gray-400 flex items-center gap-4"><Phone size={20} className="text-green-600"/> {selectedDonation.contactNumber}</p>
                         </div>
                      </div>
                      <div className="p-10 bg-[#166534] rounded-[.5rem] text-white shadow-2xl shadow-green-100 flex flex-col justify-center">
                         <h4 className="text-[10px] opacity-60 font-black uppercase tracking-[3px] mb-4">Registry Principal</h4>
                         <p className="font-black text-4xl tracking-tighter leading-none">₱{selectedDonation.amount}</p>
                         <div className="mt-8 pt-4 border-t border-white/10">
                            <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest">{selectedDonation.paymentMethod} TRANSFER</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[4px] ml-10">Digital Evidence Linkage</h4>
                      <div className="rounded-[.5rem] overflow-hidden border-8 border-gray-50 shadow-2xl relative group h-[450px] cursor-pointer">
                        <img src={`${API_URL.replace('/api/v1', '')}/${selectedDonation.proofOfPayment}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="receipt" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="bg-white text-black px-10 py-3 rounded-full font-black text-xs uppercase tracking-[3px] shadow-2xl">Expand Document</span>
                        </div>
                      </div>
                   </div>
                </div>

                {/* OFFICIAL RECEIPT COLUMN */}
                <div className="bg-white p-16 rounded-[.5rem] shadow-2xl border-t-[30px] border-[#166534] space-y-12 relative overflow-hidden h-fit">
                   <div className="absolute -top-20 -right-20 p-20 opacity-5 scale-[2]"><ShieldCheck size={250} className="text-green-600"/></div>
                   
                   <div className="text-center border-b border-dashed border-gray-200 pb-12">
                      <Receipt size={60} className="mx-auto text-green-600 opacity-20 mb-6" />
                      <h3 className="text-1xl font-black text-[#166534] tracking-tighter italic uppercase">Official Receipt</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[5px] mt-4">MaCync Provincial Treasury</p>
                      {selectedDonation.officialReceiptNo && (
                         <div className="mt-10 inline-block bg-[#bef264] text-[#166534] px-12 py-4 rounded-2xl font-mono font-black text-2xl shadow-sm tracking-[8px]">#{selectedDonation.officialReceiptNo}</div>
                      )}
                   </div>

                   <div className="space-y-10 px-8 text-sm font-bold uppercase tracking-widest">
                      <div className="flex justify-between border-b border-gray-50 pb-5"><span className="text-gray-400 text-[11px]">Received From:</span> <span className="font-black text-gray-900 text-lg tracking-tighter">{selectedDonation.donorName}</span></div>
                      <div className="flex justify-between border-b border-gray-50 pb-5"><span className="text-gray-400 text-[11px]">Audit Reference:</span> <span className="font-mono font-black text-blue-600">{selectedDonation.referenceNumber}</span></div>
                      <div className="flex justify-between border-b border-gray-50 pb-5"><span className="text-gray-400 text-[11px]">Project Fund:</span> <span className="font-black text-green-700 italic">{selectedDonation.category}</span></div>
                      
                      <div className="bg-green-50 p-12 rounded-[.5rem] text-center mt-12 border border-green-100 shadow-inner">
                         <p className="text-[11px] font-black text-green-600 uppercase tracking-[5px] mb-4">Total Principal Verified</p>
                         <p className="text-1xl font-black text-[#166534] tracking-tighter leading-none">₱{selectedDonation.amount}</p>
                      </div>
                   </div>

                   {selectedDonation.status === 'pending' ? (
                     <div className="pt-10 space-y-10 animate-in slide-in-from-bottom-6">
                        <div className="space-y-4 px-6">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-[4px] ml-4 italic">Verification Dispatch Note</label>
                           <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type a professional audit message for the donor..." className="w-full p-10 bg-gray-50 border border-gray-100 rounded-[.5rem] outline-none h-40 focus:ring-4 ring-green-100 text-base font-medium transition-all" />
                        </div>
                        <div className="flex gap-3 px-3">
                           <button onClick={() => handleVerifyAction(selectedDonation._id, 'received', note)} className="flex-[3] bg-[#166534] text-white py-6 rounded-3xl font-black text-2xl shadow-2xl shadow-green-100 hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-[4px]">VERIFY & DEPLOY</button>
                           <button onClick={() => handleVerifyAction(selectedDonation._id, 'rejected', note || 'Invalid Reference ID')} className="flex-1 bg-red-50 text-red-600 rounded-3xl font-black text-sm hover:bg-red-600 hover:text-white transition-all uppercase border border-red-100 shadow-sm">Reject</button>
                        </div>
                     </div>
                   ) : (
                     <div className="p-10 bg-[#166534] text-[#bef264] rounded-[.5rem] text-center font-black uppercase tracking-[8px] flex items-center justify-center gap-6 border-b-[12px] border-green-900 shadow-2xl scale-105">
                        <ShieldCheck size={40}/> REGISTRY AUDIT COMPLETE
                     </div>
                   )}
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

// Reusable Helper for StatCards - Updated Sizing
const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-10 rounded-[.5rem] shadow-sm border border-gray-100 flex flex-col justify-between h-36 transition-all hover:-translate-y-2 hover:shadow-xl`}>
    <div className="flex justify-between items-start opacity-70 uppercase font-black text-[11px] tracking-[4px] leading-none">{title} {icon}</div>
    <p className="text-[48px] font-black tracking-tighter leading-none">{value}</p>
  </div>
);

export default AdminDonation;