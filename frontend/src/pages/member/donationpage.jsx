import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { 
  Heart, CreditCard, History, ArrowRight, ArrowLeft, 
  CheckCircle, Trash2, FileText, ChevronRight, Loader2, 
  ShieldAlert, Receipt, Clock, UploadCloud, MapPin, User, Phone, Edit3, XCircle, AlertTriangle
} from 'lucide-react';
import '../../index.css';
import API_URL from '../../api';

const DonatePage = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  // 1. STATES
  const [step, setStep] = useState('form'); 
  const [myDonations, setMyDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    referenceNumber: '',
    category: '',
    contactNumber: '',
    municipality: userInfo?.municipality || '',
    barangay: userInfo?.barangay || ''
  });
  
  const [proof, setProof] = useState(null);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 2. FETCH DATA Logic
  const fetchMyDonations = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get(`${API_URL}/donations/my`, config);
      setMyDonations(data);
      
      // I-update ang selectedDonation kung ito ay naka-open para makita ang live verification
      if (selectedDonation) {
        const updated = data.find(d => d._id === selectedDonation._id);
        if (updated) setSelectedDonation(updated);
      }
    } catch (err) {
      console.error("Fetch Error:", err.message);
    }
  }, [userInfo?.token, selectedDonation]);

  useEffect(() => {
    fetchMyDonations();
  }, [step, fetchMyDonations]);

  // 3. EVENT HANDLERS
  const handleEditInitiate = (donation) => {
    setFormData({
      _id: donation._id,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod || 'GCash',
      referenceNumber: donation.referenceNumber,
      category: donation.category,
      contactNumber: donation.contactNumber,
      municipality: donation.municipality,
      barangay: donation.barangay
    });
    setStep('form');
    setIsEditing(true);
    setSelectedDonation(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pending record?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/donations/${id}`, config);
      setModal({ show: true, type: 'success', title: 'Removed', message: 'The record has been purged.' });
      setSelectedDonation(null);
      fetchMyDonations();
    } catch (error) {
      setModal({ show: true, type: 'error', title: 'Denied', message: error.response?.data?.message || 'Delete failed.' });
    }
  };

  // 🔥 THE FINAL SUBMIT LOGIC (Used in Step 2)
  const handleFinalSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    // Use .set() to ensure single values for each key
    Object.keys(formData).forEach(key => data.set(key, formData[key]));
    data.set('donorName', userInfo.name);
    if (proof) data.set('proofOfPayment', proof);

    try {
      const config = { headers: { 
        Authorization: `Bearer ${userInfo.token}`, 
        'Content-Type': 'multipart/form-data' 
      }};
      
      if (isEditing && formData._id) {
        await axios.put(`${API_URL}/donations/${formData._id}`, data, config);
      } else {
        await axios.post(`${API_URL}/donations`, data, config);
      }
      
      setModal({ 
        show: true, 
        type: 'success', 
        title: isEditing ? 'Update Success' : 'Success', 
        message: 'Record successfully synchronized with the MaCync database.' 
      });

      setFormData({ ...formData, amount: '', referenceNumber: '', category: '', contactNumber: '', paymentMethod: '' });
      setProof(null);
      setIsEditing(false);
      setStep('history');
      fetchMyDonations(); 
    } catch (error) {
      setModal({ show: true, type: 'error', title: 'Error', message: error.response?.data?.message || 'Submission failed.' });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20 px-4">
        
        {/* --- STEPPER --- */}
        {!selectedDonation && (
          <div className="flex justify-center">
            <div className="flex items-center gap-4 bg-white p-3 rounded-full shadow-sm border border-gray-100">
              <div onClick={() => {setStep('form'); setIsEditing(false);}} className={`px-6 py-2 rounded-full font-bold text-xs cursor-pointer transition-all ${step !== 'history' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                <div className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center text-[10px] mr-2">1</div> Details
              </div>
              <div className="w-8 h-[2px] bg-gray-100"></div>
              <div onClick={() => setStep('history')} className={`px-6 py-2 rounded-full font-bold text-xs cursor-pointer transition-all ${step === 'history' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                <div className="w-5 h-5 rounded-full bg-gray-100 inline-flex items-center justify-center text-[10px] text-gray-400 mr-2">2</div> Track
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('preview'); }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
             <div className="lg:col-span-2 bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100 space-y-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{isEditing ? "Edit record" : "New contribution"}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financial Info</label>
                      <input type="number" placeholder="PHP Amount" className="custom-input h-14 font-black text-2xl text-[#166534]" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                      <input type="text" placeholder="Reference ID" className="custom-input h-12 font-bold" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} required />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registry Link</label>
                      <select className="custom-input h-12 font-bold" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} required>
                        <option value="">Select Mode</option><option value="GCash">GCash</option><option value="Bank Transfer">Bank Transfer</option>
                      </select>
                      <select className="custom-input h-12 font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                        <option value="">Target Fund</option><option value="Environmental Monitoring">Environmental Monitoring</option><option value="Disaster Relief">Disaster Relief</option>
                      </select>
                   </div>
                </div>
                <div className="pt-6 border-t flex justify-between items-center">
                   <div className="flex items-center gap-3"><MapPin size={18} className="text-green-600"/><p className="text-sm font-bold text-gray-700 uppercase">{formData.barangay}, {formData.municipality}</p></div>
                   <button type="submit" className="bg-[#166534] text-white px-10 py-3 rounded-lg font-black shadow-lg hover:scale-105 transition-all uppercase text-xs tracking-widest">Verify <ArrowRight className="inline ml-2" size={14}/></button>
                </div>
             </div>
             <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 flex flex-col justify-center items-center text-center space-y-6 shadow-sm">
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Supporting Evidence</h3>
                <label className="cursor-pointer group w-full">
                  <div className="bg-gray-50 p-12 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-[#166534] transition-all flex flex-col items-center">
                    <UploadCloud size={48} className="text-gray-300 mb-4 group-hover:text-[#166534]" />
                    <p className="font-black text-[10px] text-gray-500 uppercase">{proof ? proof.name : "Attach Receipt"}</p>
                    <input type="file" onChange={(e) => setProof(e.target.files[0])} className="hidden" />
                  </div>
                </label>
             </div>
          </form>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && (
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[.5rem] shadow-2xl border border-gray-100 space-y-8 animate-in zoom-in-95 text-center">
             <div className="space-y-2">
                <ShieldAlert size={48} className="mx-auto text-green-600 mb-4" />
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Double Check</h2>
                <p className="text-sm text-gray-400 font-medium">Please ensure the Reference Number matches your receipt exactly.</p>
             </div>
             <div className="p-8 bg-gray-50 rounded-2xl text-left space-y-4 border border-gray-100 shadow-inner">
                <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[9px]">Amount</span> <span className="font-black text-3xl text-[#166534]">₱{formData.amount}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[9px]">ID</span> <span className="font-mono font-bold text-blue-600">#{formData.referenceNumber}</span></div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setStep('form')} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold text-gray-400 uppercase text-xs">Back</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-[#166534] text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3">
                   {loading ? <Loader2 className="animate-spin" /> : "PROCEED & LOG DATA"}
                </button>
             </div>
          </div>
        )}

        {/* STEP 3: HISTORY & AMAZON STYLE RECEIPT */}
        {step === 'history' && (
          <div className="space-y-8">
            {!selectedDonation ? (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                  <div className="lg:col-span-8 bg-white rounded-[.5rem] border shadow-sm overflow-hidden h-fit">
                    <div className="p-6 bg-gray-50 border-b flex justify-between items-center"><h2 className="font-black text-xs uppercase tracking-widest text-gray-500 italic">Audit Registry</h2></div>
                    <div className="divide-y">
                      {myDonations.map(d => (
                        <div key={d._id} onClick={() => setSelectedDonation(d)} className="p-6 flex justify-between items-center cursor-pointer hover:bg-green-50 transition-all group">
                          <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-xl ${d.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}><Receipt size={24}/></div>
                            <div><p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(d.createdAt).toLocaleDateString()}</p><h3 className="text-xl font-black text-gray-800 leading-none mt-1">₱{d.amount}</h3></div>
                          </div>
                          <ChevronRight size={24} className="text-gray-200 group-hover:text-green-600" />
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            ) : (
               /* --- 📜 AMAZON-STYLE TECHNICAL RECEIPT UI 📜 --- */
               <div className="max-w-4xl mx-auto bg-white p-12 rounded-[.5rem] shadow-2xl border border-gray-100 animate-in slide-in-from-right-8 duration-500 space-y-10 relative">
                  <button onClick={() => setSelectedDonation(null)} className="absolute top-6 left-6 text-gray-300 hover:text-green-700 transition-all"><ArrowLeft size={24} /></button>
                  
                  {/* Receipt Header */}
                  <div className="flex justify-between items-center border-b pb-8 border-gray-100">
                    <div className="flex items-center gap-2"><div className="w-10 h-10 bg-[#166534] rounded-lg flex items-center justify-center text-white font-black text-xl">M</div><span className="font-black text-2xl tracking-tighter text-gray-900 uppercase">MaCync</span></div>
                    {selectedDonation.status === 'pending' && (
                      <div className="flex gap-2">
                         <button onClick={() => handleEditInitiate(selectedDonation)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={18}/></button>
                         <button onClick={() => handleDelete(selectedDonation._id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                      </div>
                    )}
                  </div>

                  {/* Summary Header */}
                  <div className="space-y-4">
                     <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                      {selectedDonation.status === 'received' ? "Your contribution is verified!" : 
                       selectedDonation.status === 'rejected' ? "Verification Rejected" : "Audit in Progress"}
                     </h1>
                     <div className="space-y-1">
                        <p className="text-lg font-bold text-gray-800">Hello {userInfo.name},</p>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                          {selectedDonation.status === 'received' 
                            ? "This official record confirms your fund transfer to the MaCEC provincial environmental registry. A digital copy has been issued below." 
                            : "Your submission has been logged into the MaCync database at boac provincial center. Verification typically completes within 48 hours."}
                        </p>
                     </div>
                  </div>

                  {/* 4-Column Horizontal Data Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-gray-100 py-10">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Submission Time</p>
                        <p className="font-black text-gray-800 text-sm">{new Date(selectedDonation.createdAt).toLocaleDateString()}</p>
                        <p className="text-[9px] text-gray-400 italic">{new Date(selectedDonation.createdAt).toLocaleTimeString()}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Reference No.</p>
                        <p className="font-mono font-black text-blue-600 text-sm tracking-tighter uppercase">{selectedDonation.referenceNumber}</p>
                        {selectedDonation.status === 'received' && <p className="text-green-600 font-black text-[8px] uppercase">Verified Record</p>}
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Registry Level</p>
                        <p className="font-black text-gray-800 text-sm uppercase">{userInfo.role.replace('_', ' ')}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Address Origin</p>
                        <p className="font-black text-[#166534] text-sm uppercase">{selectedDonation.barangay}</p>
                     </div>
                  </div>

                  {/* Itemized Detail */}
                  <div className="space-y-8">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner"><Heart className="text-[#166534] scale-125" /></div>
                           <div>
                              <p className="font-black text-gray-900 text-xl tracking-tighter uppercase">{selectedDonation.category}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest leading-none">Internal Registry ID: {selectedDonation._id}</p>
                              <p className="text-[9px] text-gray-300 font-bold mt-2 flex items-center gap-1"><MapPin size={10}/> {selectedDonation.municipality}, Marinduque</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-gray-900 tracking-tighter">₱{selectedDonation.amount}.00</p>
                        </div>
                     </div>

                     {/* Final Verification Block */}
                     {selectedDonation.status === 'received' && (
                        <div className="bg-green-50 p-6 rounded-2xl flex items-center justify-between border border-green-100 animate-in fade-in duration-1000">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-50"><CheckCircle size={24}/></div>
                              <div>
                                 <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Authorized MaCEC Verification</p>
                                 <p className="text-xs font-bold text-green-900 mt-0.5">Officially Logged: {new Date(selectedDonation.verifiedAt).toLocaleString()}</p>
                              </div>
                           </div>
                           <div className="text-right"><p className="text-[9px] font-black text-green-700 uppercase tracking-widest">Official Receipt</p><p className="font-mono font-bold text-[#166534] text-sm">#{selectedDonation.officialReceiptNo}</p></div>
                        </div>
                     )}
                  </div>

                  {/* Financial Summary & Barcode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-10 border-t border-gray-100">
                     <div className="space-y-6 flex flex-col justify-center items-center">
                        <div className="w-full h-20 bg-gray-50 rounded-xl flex items-center justify-center opacity-30 border-2 border-white"><div className="flex gap-1.5">{[...Array(40)].map((_, i) => (<div key={i} className={`h-12 w-[1px] bg-black ${i % 4 === 0 ? 'w-[3px]' : ''}`}></div>))}</div></div>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[4px]">Verified MaCync System</p>
                     </div>
                     <div className="space-y-4 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400 font-bold uppercase text-[10px]">Net Contribution</span> <span className="font-black text-gray-800 tracking-tighter">₱{selectedDonation.amount}.00</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 font-bold uppercase text-[10px]">Registry Fees</span> <span className="font-black text-gray-800">₱0.00</span></div>
                        <div className="flex justify-between pt-6 border-t border-gray-100"><span className="font-black text-[#166534] uppercase tracking-widest text-[12px]">Final Registry Fund</span> <span className="text-4xl font-black text-[#166534] tracking-tighter leading-none">₱{selectedDonation.amount}.00</span></div>
                     </div>
                  </div>

                  {/* Footer Notes */}
                  <div className="pt-10 border-t border-gray-100 text-center">
                     <p className="text-[11px] font-black text-gray-800 uppercase tracking-[3px] mb-6 italic">Empowering Communities, Protecting Nature</p>
                     <div className="flex justify-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="hover:text-[#166534] cursor-pointer">Help Center</span><span className="hover:text-[#166534] cursor-pointer">Legal Documentation</span><span className="hover:text-[#166534] cursor-pointer">Contact Treasury</span>
                     </div>
                     {selectedDonation.adminNote && (
                        <div className="mt-8 p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center relative animate-in slide-in-from-bottom-2">
                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[9px] font-black text-gray-300 uppercase italic border-x">TREASURER'S OFFICIAL REMARK</div>
                           <p className="text-sm text-gray-600 font-medium italic leading-relaxed italic">" {selectedDonation.adminNote} "</p>
                        </div>
                     )}
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