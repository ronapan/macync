import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import { locations } from '../../utils/location';
import { 
  DollarSign, TrendingUp, MapPin, Loader2, CheckCircle, 
  Eye, ArrowLeft, User, Phone, FileText, ChevronRight, XCircle, ShieldCheck, AlertCircle 
} from 'lucide-react';
import NotificationModal from '../../components/notificationmodal';
import '../../index.css';
import API_URL from '../../api';

const AdminDonation = () => {
  // 1. STATES
  const [view, setView] = useState('muni');
  const [selection, setSelection] = useState({ municipality: '', barangay: '' });
  const [data, setData] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 2. FETCH LOGIC
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

  // 3. ACTION HANDLER (Verification / Rejection)
  const handleVerifyAction = async (id, status, adminNote) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.patch(`${API_URL}/donations/${id}`, {
        status,
        adminNote: adminNote || (status === 'received'
          ? "Transaction verified by MaCync Treasury."
          : "Donation rejected by admin.")
      }, config);

      setModal({
        show: true,
        type: status === 'received' ? 'success' : 'error',
        title: status === 'received' ? 'Donation Verified' : 'Donation Rejected',
        message: status === 'received'
          ? 'Official receipt has been deployed.'
          : 'The record has been marked as rejected.'
      });

      setNote('');
      setSelectedDonation(null);
      setView('list');
      await fetchAdminDonations(); // re-fetch so donor status updates
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
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

        {/* HEADER */}
        <header className="flex justify-between items-end bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100 bg-gradient-to-r from-[#166534] to-[#507d02]">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">Donation Management</h1>
            <p className="text-gray-400 p-2 font-bold uppercase text-[9px] tracking-[3px]">Provincial Audit & Receipt Deployment</p>
          </div>
        </header>

        {/* BREADCRUMBS NAVIGATION */}
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-white w-fit px-8 py-3 rounded-full border shadow-sm uppercase tracking-widest transition-all">
          <button onClick={() => setView('muni')} className="hover:text-green-700">PROVINCIAL</button>
          {selection.municipality && <><ChevronRight size={12}/> <button onClick={() => setView('brgy')} className="hover:text-green-700">{selection.municipality}</button></>}
          {selection.barangay && <><ChevronRight size={12}/> <span className="text-[#166534]">{selection.barangay}</span></>}
        </div>

        {/* STAT CARDS */}
        {view === 'muni' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Received Today" value={`₱${data?.summary?.todayTotal || 0}`} color="bg-[#166534] text-white" />
            <StatCard
              title="Monitoring Fund"
              value={`₱${data?.summary?.categoryTotals?.find(c => c._id === 'Environmental Monitoring')?.total || 0}`}
              icon={<ShieldCheck size={20}/>}
              color="bg-white text-[#166534] border border-green-100"
            />
            <StatCard
              title="Disaster Relief"
              value={`₱${data?.summary?.categoryTotals?.find(c => c._id === 'Disaster Relief')?.total || 0}`}
              icon={<AlertCircle size={20}/>}
              color="bg-white text-[#166534] border border-green-100"
            />
            <StatCard
              title="Total Collection"
              value={`₱${data?.summary?.totalCollection || 0}`}
              icon={<TrendingUp size={20}/>}
              color="bg-[#bef264] text-[#166534]"
            />
          </div>
        )}

        {/* MAIN INTERACTIVE CONTENT */}
        <div className="min-h-[500px]">

          {/* A. MUNICIPALITY SELECTION */}
          {view === 'muni' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
              {Object.keys(locations).map(muni => {
                const muniCount = data?.donations?.filter(d => d.municipality === muni).length || 0;
                return (
                  <div key={muni} onClick={() => { setSelection({...selection, municipality: muni}); setView('brgy'); }}
                    className="bg-white p-10 rounded-[.5rem] border border-gray-100 shadow-sm hover:shadow-xl cursor-pointer flex justify-between items-center group transition-all">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800">{muni}</h3>
                      <p className="text-[10px] font-bold text-green-600 uppercase mt-1">{muniCount} Total Donators</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-green-100 text-gray-300 group-hover:text-green-600 transition-colors"><MapPin size={24}/></div>
                  </div>
                );
              })}
            </div>
          )}

          {/* B. BARANGAY SELECTION */}
          {view === 'brgy' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-right-4">
              {locations[selection.municipality].map(brgy => {
                const brgyCount = data?.donations?.filter(d => d.barangay === brgy).length || 0;
                return (
                  <div key={brgy} onClick={() => { setSelection({...selection, barangay: brgy}); setView('list'); }}
                    className="bg-white p-8 rounded-[.5rem] border border-gray-100 hover:shadow-lg cursor-pointer transition-all text-center group">
                    <p className="font-black text-gray-800 uppercase text-sm">{brgy}</p>
                    <p className="text-[9px] font-bold text-gray-400 mt-1">{brgyCount} Items</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* C. LIST VIEW */}
          {view === 'list' && (
            <div className="bg-white rounded-[.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in zoom-in-95">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr><th className="p-8">Donor / Amount</th><th className="p-8">Status</th><th className="p-8 text-right">View Audit</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.donations?.filter(d => d.municipality === selection.municipality && d.barangay === selection.barangay).map(d => (
                    <tr key={d._id} className="hover:bg-green-50/40 transition-all">
                      <td className="p-8">
                        <p className="font-black text-gray-800 text-lg">₱{d.amount}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">{d.donatorId?.name || d.donorName}</p>
                      </td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase 
                          ${d.status === 'received' ? 'bg-green-100 text-green-700' : 
                            d.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                            'bg-yellow-100 text-yellow-700'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <button onClick={() => { setSelectedDonation(d); setView('details'); }} className="p-4 bg-[#166534] text-white rounded-2xl hover:scale-110 shadow-md transition-all"><Eye size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* D. FULL DETAIL VIEW */}
          {view === 'details' && selectedDonation && (
            <div className="animate-in slide-in-from-right-10 duration-500 pb-10">
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase mb-8 hover:text-[#166534] tracking-widest transition-all">
                <ArrowLeft size={14}/> Close Registry File
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Info Column */}
                <div className="bg-white p-12 rounded-[.5rem] shadow-sm border border-gray-100 space-y-10">
                  <div className="border-b pb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Review Case Details</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Ref ID: {selectedDonation.referenceNumber}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Donator Profile</h4>
                      <div className="p-8 bg-gray-50 rounded-[.5rem] space-y-4">
                        <p className="font-bold flex items-center gap-3 text-gray-800 leading-none"><User size={18} className="text-green-600"/> {selectedDonation.donorName}</p>
                        <p className="text-sm font-bold text-gray-400 flex items-center gap-3"><Phone size={16} className="text-green-600"/> {selectedDonation.contactNumber}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction</h4>
                      <div className="p-8 bg-[#166534] rounded-[.5rem] text-white shadow-xl shadow-green-100">
                        <p className="font-black text-2xl tracking-tighter leading-none">₱{selectedDonation.amount}</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase mt-2 tracking-widest">{selectedDonation.paymentMethod || 'MaCync Fund'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Proof of Payment</h4>
                    <a href={`${API_URL.replace('/api/v1', '')}/${selectedDonation.proofOfPayment}`} target="_blank" rel="noreferrer"
                      className="block rounded-[.2rem] overflow-hidden border-4 border-white shadow-2xl h-90 group relative">
                      <img src={`${API_URL.replace('/api/v1', '')}/${selectedDonation.proofOfPayment}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="receipt" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-black text-xs uppercase tracking-widest">full view</div>
                    </a>
                  </div>
                </div>

                {/* RIGHT COLUMN — status-aware */}

                {/* PENDING: Show receipt form + action buttons */}
                {selectedDonation.status === 'pending' && (
                  <div className="bg-white p-12 rounded-[.5rem] shadow-2xl border-4 border-green-50 space-y-8 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={150} className="text-green-600"/></div>

                    <div className="text-center border-b border-dashed border-gray-200 pb-8">
                      <h3 className="text-2xl font-black text-[#166534]">OFFICIAL RECEIPT</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">MaCync Provincial Treasury</p>
                    </div>

                    <div className="space-y-5 px-4 text-sm">
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Donor:</span> <span className="font-black text-gray-800">{selectedDonation.donorName}</span></div>
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Reference:</span> <span className="font-mono font-bold text-blue-600">{selectedDonation.referenceNumber}</span></div>
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Target Fund:</span> <span className="font-bold text-green-700 italic">{selectedDonation.category}</span></div>
                      <div className="bg-green-50 p-8 rounded-3xl text-center mt-6">
                        <p className="text-[10px] font-black text-green-600 uppercase mb-2">Final Verified Amount</p>
                        <p className="text-5xl font-black text-[#166534]">₱{selectedDonation.amount}</p>
                      </div>
                    </div>

                    <div className="pt-6 space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Deployment Note</label>
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type a thank you message..."
                        className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[.5rem] outline-none h-24 focus:ring-2 ring-green-100 text-sm font-medium" />
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => handleVerifyAction(selectedDonation._id, 'received', note)}
                        className="flex-[3] bg-[#166534] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all">
                        VERIFY & DEPLOY
                      </button>
                      <button onClick={() => handleVerifyAction(selectedDonation._id, 'rejected', note || 'Invalid Reference Number')}
                        className="flex-1 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all uppercase px-4">
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* RECEIVED: Show issued receipt confirmation */}
                {selectedDonation.status === 'received' && (
                  <div className="bg-white p-12 rounded-[.5rem] shadow-2xl border-4 border-green-100 space-y-6 h-fit">
                    <div className="text-center space-y-3">
                      <ShieldCheck size={60} className="text-[#166534] mx-auto"/>
                      <h3 className="text-2xl font-black text-[#166534]">Receipt Issued</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MaCync Provincial Treasury</p>
                    </div>
                    <div className="space-y-4 px-4 text-sm border-t pt-6">
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Donor:</span> <span className="font-black text-gray-800">{selectedDonation.donorName}</span></div>
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Reference:</span> <span className="font-mono font-bold text-blue-600">{selectedDonation.referenceNumber}</span></div>
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Receipt No:</span> <span className="font-mono font-bold text-green-700">{selectedDonation.officialReceiptNo}</span></div>
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Fund:</span> <span className="font-bold text-green-700 italic">{selectedDonation.category}</span></div>
                      <div className="bg-green-50 p-8 rounded-3xl text-center mt-4">
                        <p className="text-[10px] font-black text-green-600 uppercase mb-2">Verified Amount</p>
                        <p className="text-5xl font-black text-[#166534]">₱{selectedDonation.amount}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[#166534] text-[#bef264] rounded-[.5rem] text-center font-black uppercase tracking-widest flex items-center justify-center gap-3">
                      <ShieldCheck size={18}/> Receipt Successfully Deployed
                    </div>
                  </div>
                )}

                {/* REJECTED: Show rejection notice */}
                {selectedDonation.status === 'rejected' && (
                  <div className="bg-white p-12 rounded-[.5rem] shadow-sm border-4 border-red-100 space-y-6 h-fit">
                    <div className="text-center space-y-3">
                      <XCircle size={60} className="text-red-500 mx-auto"/>
                      <h3 className="text-2xl font-black text-red-600">Donation Rejected</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">This transaction was not verified</p>
                    </div>
                    <div className="p-6 bg-red-50 rounded-[.5rem] space-y-3 border border-red-100">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Admin Note</p>
                      <p className="text-sm font-bold text-red-700">{selectedDonation.adminNote || 'No reason provided.'}</p>
                    </div>
                    <div className="space-y-3 px-4 text-sm border-t pt-6">
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Donor:</span> <span className="font-black text-gray-800">{selectedDonation.donorName}</span></div>
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Reference:</span> <span className="font-mono font-bold text-gray-500">{selectedDonation.referenceNumber}</span></div>
                      <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-400 font-bold uppercase text-[10px]">Amount:</span> <span className="font-black text-gray-500">₱{selectedDonation.amount}</span></div>
                    </div>
                  </div>
                )}

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

const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-4 rounded-[.5rem] shadow-sm border border-gray-100 flex flex-col justify-between h-28 transition-all hover:-translate-y-2 hover:shadow-xl`}>
    <div className="flex justify-between items-start opacity-70 uppercase font-black text-[10px] tracking-[2px]">{title} {icon}</div>
    <p className="text-[40px] font-black tracking-tighter">{value}</p>
  </div>
);

export default AdminDonation;