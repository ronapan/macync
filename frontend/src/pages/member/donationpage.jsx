import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { 
  Heart, CreditCard, History, ArrowRight, ArrowLeft, 
  CheckCircle, Trash2, FileText, ChevronRight, Loader2, 
  ShieldAlert, Receipt, Clock, UploadCloud, MapPin, User, Phone 
} from 'lucide-react';
import '../../index.css';
import API_URL from '../api';

const DonatePage = () => {
  // 1. INITIALIZATION & STATES
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [step, setStep] = useState('form'); // form | preview | history
  const [myDonations, setMyDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    referenceNumber: '',
    category: '',
    comment: '',
    contactNumber: '',
    municipality: userInfo?.municipality || '',
    barangay: userInfo?.barangay || ''
  });
  
  const [proof, setProof] = useState(null);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 2. DATA RETRIEVAL (Factual Data Logic)
  const fetchMyDonations = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get(`${API_URL}/donate/my`, config);
      setMyDonations(data);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchMyDonations();
  }, [fetchMyDonations]);

  // 3. DELETE LOGIC (Restricted to Pending)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pending record?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/donate/${id}`, config);
      
      setModal({ show: true, type: 'success', title: 'Record Removed', message: 'The pending donation record has been purged.' });
      setSelectedDonation(null);
      fetchMyDonations();
    } catch (error) {
      setModal({ 
        show: true, 
        type: 'error', 
        title: 'Action Denied', 
        message: error.response?.data?.message || 'Delete failed.' 
      });
    }
  };

  // 4. SUBMISSION LOGIC (Fixes the "Cast to String" Array Error)
  const handleFinalSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    
    // Using .set() ensures each key has only ONE value (prevents array doubling)
    data.set('amount', formData.amount);
    data.set('paymentMethod', formData.paymentMethod);
    data.set('referenceNumber', formData.referenceNumber);
    data.set('contactNumber', formData.contactNumber);
    data.set('category', formData.category);
    data.set('donorName', userInfo.name);
    data.set('municipality', formData.municipality);
    data.set('barangay', formData.barangay);
    if (proof) data.set('proofOfPayment', proof);

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${userInfo.token}`, 
          'Content-Type': 'multipart/form-data' 
        } 
      };
      
      await axios.post(`${API_URL}/donate`, data, config);
      
      setModal({ 
        show: true, 
        type: 'success', 
        title: 'Donation Submitted', 
        message: 'Record successfully logged. View your Digital Receipt in the Track Progress tab.' 
      });

      // Reset & Redirect
      setFormData({ ...formData, amount: '', referenceNumber: '', category: '', contactNumber: '' });
      setProof(null);
      setStep('history');
      fetchMyDonations();

    } catch (error) {
      setModal({ 
        show: true, 
        type: 'error', 
        title: 'Submission Error', 
        message: error.response?.data?.message || 'Could not reach MaCync DB.' 
      });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-10">
        
        {/* TOP NAVIGATION / TAB SWITCHER */}
        {!selectedDonation && (
          <div className="flex bg-white p-2 rounded-[.5rem] w-fit shadow-sm border border-gray-100">
            <button onClick={() => setStep('form')} className={`px-10 py-3 rounded-[.5rem] font-black text-sm transition-all ${step !== 'history' ? 'bg-[#166534] text-white shadow-lg shadow-green-100' : 'text-gray-400 hover:bg-gray-50'}`}>
               <Heart size={16} className="inline mr-2" /> Donation Form
            </button>
            <button onClick={() => setStep('history')} className={`px-10 py-3 rounded-[.5rem] font-black text-sm transition-all ${step === 'history' ? 'bg-[#166534] text-white shadow-lg shadow-green-100' : 'text-gray-400 hover:bg-gray-50'}`}>
               <Clock size={16} className="inline mr-2" /> Track Progress
            </button>
          </div>
        )}

        {/* STEP 1: FORM INPUT */}
        {step === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('preview'); }} className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-12 rounded-[.5rem] shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
             <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-3 bg-green-50 rounded-2xl text-[#166534]"></div>
                   <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Support Us</h2>
                </div>

                <div className="bg-[#f8f9fa] p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
                   <MapPin className="text-green-600" />
                   <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Linked Registry Address</p>
                      <p className="font-bold text-gray-800">{formData.barangay}, {formData.municipality}</p>
                   </div>
                </div>

                <input type="number" placeholder="Amount (PHP)" className="custom-input h-14 text-1xl font-black text-[#166534]" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                
                <div className="grid grid-cols-2 gap-4">
                   <select className="custom-input h-14 font-bold" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} required>
                     <option value="" disabled hidden>Payment Mode</option>
                     <option value="GCash">GCash</option>
                     <option value="Bank Transfer">Bank Transfer</option>
                   </select>
                   <input type="text" placeholder="Contact No." className="custom-input h-14 font-bold" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value.replace(/\D/g,'')})} maxLength="11" required />
                </div>

                <input type="text" placeholder="Reference Number" className="custom-input h-14 font-bold" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} required />

                <select className="custom-input h-14 font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="" disabled hidden>Select Fund Category</option>
                  <option value="Environmental Monitoring">Environmental Monitoring</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                </select>
             </div>

             <div className="flex flex-col justify-between">
                <label className="cursor-pointer group">
                   <div className="bg-[#f8f9fa] p-12 rounded-[.5rem] border-2 border-dashed border-gray-200 group-hover:border-[#166534] group-hover:bg-white transition-all flex flex-col items-center justify-center text-center">
                      <UploadCloud size={56} className="text-gray-300 mb-4 group-hover:text-[#166534]" />
                      <p className="font-black text-gray-600 uppercase text-xs tracking-widest">
                         {proof ? "File Ready" : "Upload Receipt Screenshot"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">
                         {proof ? proof.name : "JPG, PNG supported"}
                      </p>
                      <input type="file" onChange={(e) => setProof(e.target.files[0])} className="hidden" required />
                   </div>
                </label>
                <button type="submit" className="w-full bg-[#166534] text-white py-3 rounded-[.5rem] font-black text-12px shadow-xl shadow-green-100 mt-8 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                   NEXT STEP: RE-VERIFY <ArrowRight size={22}/>
                </button>
             </div>
          </form>
        )}

        {/* STEP 2: PREVIEW / RE-VERIFY */}
        {step === 'preview' && (
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-[.5rem] shadow-2xl border border-gray-100 space-y-10 animate-in zoom-in-95">
             <div className="text-center">
                <h2 className="text-xl font-black text-gray-900 tracking-tighter italic">Double Check</h2>
                <p className="text-gray-400 font-medium mt-2">Please ensure the reference number is exactly as shown on your receipt.</p>
             </div>
             <div className="space-y-5 bg-[#F8F9FA] p-10 rounded-[.5rem] border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                   <span className="text-gray-400 font-bold uppercase text-[10px]">Total Contribution</span>
                   <span className="font-black text-3xl text-[#166534]">₱{formData.amount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 pt-2">
                   <span className="text-gray-400 font-bold uppercase text-[10px]">Reference Number</span>
                   <span className="font-mono font-bold text-blue-600 text-lg">#{formData.referenceNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                   <span className="text-gray-400 font-bold uppercase text-[10px]">Payment Via</span>
                   <span className="font-black text-gray-700 text-[12px] uppercase tracking-tighter">{formData.paymentMethod}</span>
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setStep('form')} className="flex-1 bg-gray-100 py-5 rounded-xl font-black text-gray-400 uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">Go Back</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-[#166534] text-white py-5 rounded-2xl font-black text-[12px] shadow-xl shadow-green-100 flex items-center justify-center gap-3">
                   {loading ? <Loader2 className="animate-spin" /> : "PROCEED & SUBMIT"}
                </button>
             </div>
          </div>
        )}

        {/* STEP 3: TRACK PROGRESS (HISTORY & DIGITAL RECEIPTS) */}
        {step === 'history' && (
          <div className="space-y-6">
            {!selectedDonation ? (
              <div className="grid gap-4">
                <h2 className="text-2xl font-black text-gray-800 px-6 flex items-center gap-3">
                   <History className="text-green-600" /> My Donation Registry ({myDonations.length})
                </h2>
                {myDonations.length === 0 ? (
                   <div className="p-24 text-center bg-white rounded-[.5rem] border-2 border-dashed border-gray-100">
                      <FileText size={60} className="mx-auto text-gray-100 mb-4" />
                      <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No transactions recorded yet.</p>
                   </div>
                ) : myDonations.map(d => (
                  <div key={d._id} onClick={() => setSelectedDonation(d)} className="group bg-white p-10 rounded-[.5rem] border border-gray-50 flex justify-between items-center cursor-pointer hover:border-green-300 hover:shadow-xl hover:translate-x-3 transition-all">
                    <div className="flex items-center gap-8">
                       <div className={`p-5 rounded-[.5rem] shadow-sm ${d.status === 'received' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>
                          {d.status === 'received' ? <Receipt size={28}/> : <Clock size={28}/>}
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-gray-900 leading-none">₱{d.amount}</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mt-2">{new Date(d.createdAt).toLocaleDateString()} • REF: {d.referenceNumber}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${d.status === 'received' ? 'bg-green-600 text-white shadow-lg' : d.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{d.status}</span>
                       <ChevronRight size={24} className="text-gray-200 group-hover:text-green-600 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-8 space-y-8 pb-20">
                <button onClick={() => setSelectedDonation(null)} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase hover:text-green-700 tracking-widest transition-all">
                   <ArrowLeft size={16}/> Back to Registry
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* LEFT COLUMN: STATUS OVERVIEW */}
                  <div className="bg-white p-5 rounded-[.5rem] border border-gray-100 shadow-sm relative h-fit space-y-10">
                    <div className="flex justify-between items-start">
                       <h3 className="font-black text-2xl tracking-tighter">Status File</h3>
                       {selectedDonation.status === 'pending' && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(selectedDonation._id); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                             <Trash2 size={24}/>
                          </button>
                       )}
                    </div>
                    <div className="p-5 bg-[#F8F9FA] rounded-[.5rem] space-y-8 border border-gray-100 shadow-inner">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification</p>
                          <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm ${selectedDonation.status === 'received' ? 'bg-green-600 text-white' : 'bg-yellow-400 text-white'}`}>{selectedDonation.status}</span>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logged Amount</p>
                          <p className="text-2xl font-black text-[#166534] tracking-tighter">₱{selectedDonation.amount}</p>
                       </div>
                    </div>
                    {selectedDonation.status !== 'pending' && (
                       <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-3">
                          <ShieldAlert size={18} className="text-blue-500 shrink-0 mt-1" />
                          <p className="text-[9px] font-black text-blue-700 uppercase leading-relaxed tracking-widest">Immutable Record: This donation has been processed and cannot be deleted or modified.</p>
                       </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: DIGITAL RECEIPT / TIMELINE */}
                  <div className="lg:col-span-2">
                    {selectedDonation.status === 'received' ? (
                      /* --- OFFICIAL RECEIPT UI --- */
                      <div className="bg-white p-16 rounded-[.5rem] shadow-2xl border-t-[16px] border-[#166534] space-y-5 relative overflow-hidden animate-in zoom-in-95">
                         <div className="absolute -right-20 w-64 h-30 bg-green-50 rounded-full opacity-40"></div>
                         
                         <div className="text-center  border-b border-dashed border-gray-200">
                            <Receipt size={30} className="mx-auto text-green-600 opacity-20" />
                            <h2 className="text-2xl font-black text-[#166534] tracking-tighter">OFFICIAL RECEIPT</h2>
                            <p className="text-[11px] font-bold text-gray-400 ">Marinduque Council for Environmental Concerns</p>
                            <div className="pt-4">
                               <span className="bg-gray-100 px-5 py-2 rounded-xl text-[10px] font-black text-gray-500 uppercase font-mono tracking-widest">OR NO: {selectedDonation.officialReceiptNo}</span>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2  text-sm px-4">
                            <div className="space-y-0">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Received From</p>
                                  <p className="font-black text-gray-800 text-2xl uppercase tracking-tighter flex items-center gap-2"><User size={20} className="text-green-600"/> {selectedDonation.donorName}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Origin Jurisdiction</p>
                                  <p className="font-bold text-gray-600 flex items-center gap-2"><MapPin size={16} className="text-green-600"/> {selectedDonation.barangay}, {selectedDonation.municipality}</p>
                               </div>
                            </div>
                            <div className="space-y-6 md:text-right">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Verification Date</p>
                                  <p className="font-black text-gray-800 text-xl">{new Date(selectedDonation.verifiedAt).toLocaleDateString()}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Payment Reference</p>
                                  <p className="text-blue-600 font-mono font-black text-lg">#{selectedDonation.referenceNumber}</p>
                               </div>
                            </div>
                         </div>

                         <div className="bg-green-50 p-3 rounded-[.5rem] text-center border border-green-100 shadow-inner">
                            <p className="text-xs font-black text-green-700 uppercase tracking-[3px] mb-1">Net Contribution Received</p>
                            <p className="text-xl font-black text-[#166534] tracking-tighter">₱{selectedDonation.amount}</p>
                            <div className="mt-8 pt-2 border-t border-green-100">
                               <p className="text-[11px] font-bold text-green-800 uppercase tracking-widest">Fund Allocation: {selectedDonation.category}</p>
                            </div>
                         </div>

                         <div className="p-2 bg-gray-50 rounded-[.5rem] border border-gray-100 text-center relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[9px] font-black text-gray-300 uppercase italic">Provincial Audit Note</div>
                            <p className="text-base text-gray-700 font-medium leading-relaxed italic">" {selectedDonation.adminNote} "</p>
                         </div>
                      </div>
                    ) : (
                      /* --- PENDING/REJECTED TRACKER --- */
                      <div className="bg-white p-16 rounded-[.5rem] border border-gray-100 shadow-sm space-y-12">
                         <h3 className="text-2xl font-black flex items-center gap-4 tracking-tighter">Process Tracker</h3>
                         <div className="space-y-16 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-1 before:bg-gray-50">
                            <div className="relative pl-20 group">
                               <div className="absolute left-5 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-xl shadow-green-100 z-10 transition-transform group-hover:scale-125"></div>
                               <p className="font-black text-gray-900 text-xl tracking-tighter">Request Logged in System</p>
                               <p className="text-base text-gray-400 font-medium italic mt-1">"Your donation data is secured. Awaiting treasury verification."</p>
                               <p className="text-[11px] font-bold text-[#166534] mt-3 uppercase bg-green-50 w-fit px-3 py-1 rounded-lg">{new Date(selectedDonation.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="relative pl-20 opacity-30">
                               <div className="absolute left-5 w-6 h-6 bg-gray-200 rounded-full border-4 border-white z-10"></div>
                               <p className="font-black text-gray-900 text-xl tracking-tighter uppercase">Audit Verification</p>
                               <p className="text-base text-gray-400 font-medium italic mt-1">Status: {selectedDonation.status.replace(/_/g, ' ')}</p>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </Sidebar>
  );
};

export default DonatePage;