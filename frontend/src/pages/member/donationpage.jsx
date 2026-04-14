import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { 
  Heart, CreditCard, History, ArrowRight, ArrowLeft, 
  CheckCircle, Trash2, FileText, ChevronRight, Loader2, 
  ShieldAlert, Receipt, Clock, UploadCloud, MapPin, User, Phone, Edit3, XCircle
} from 'lucide-react';
import '../../index.css';
import API_URL from '../../api';

const DonatePage = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  // 1. STATES
  const [step, setStep] = useState('form'); 
  const [myDonations, setMyDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 🔥 State para sa Edit mode
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

  // 2. FETCH DATA
  const fetchMyDonations = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get(`${API_URL}/donations/my`, config); // Siguraduhing plural 'donations'
      setMyDonations(data);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchMyDonations();
  }, [fetchMyDonations]);

  // 3. EDIT LOGIC: I-populate ang form gamit ang lumang data
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

  // 4. DELETE LOGIC
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

  // 5. SUBMISSION LOGIC (Create or Update)
  // Inside DonatePage.jsx -> handleFinalSubmit function

const handleFinalSubmit = async () => {
  if (!proof) {
    setModal({ show: true, type: 'error', title: 'File Missing', message: 'Please upload the receipt screenshot.' });
    return;
  }

  setLoading(true);
  const data = new FormData();
  
  // 🔥 CRITICAL: Match these keys to the backend destructuring
  data.append('amount', formData.amount);
  data.append('paymentMethod', formData.paymentMethod);
  data.append('referenceNumber', formData.referenceNumber);
  data.append('category', formData.category);
  data.append('contactNumber', formData.contactNumber);
  data.append('donorName', userInfo.name);
  data.append('municipality', userInfo.municipality); // Use userInfo address to be safe
  data.append('barangay', userInfo.barangay);
  data.append('proofOfPayment', proof);

  try {
    const config = { 
      headers: { 
        Authorization: `Bearer ${userInfo.token}`, 
        'Content-Type': 'multipart/form-data' 
      } 
    };
    
    const response = await axios.post(`${API_URL}/donations`, data, config);
    
    // Only show success if we get a 201
    if (response.status === 201) {
      setModal({ show: true, type: 'success', title: 'Success', message: 'Donation successfully sent to MaCync Treasury.' });
      setStep('history');
      fetchMyDonations();
    }
  } catch (error) {
    console.error("SUBMISSION ERROR:", error.response?.data);
    setModal({ 
      show: true, 
      type: 'error', 
      title: 'Submission Failed', 
      message: error.response?.data?.message || 'Database validation failed. Check your Reference Number length (min 10).' 
    });
  } finally { setLoading(false); }
};

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20">
        
        {/* TABS */}
        {!selectedDonation && (
          <div className="flex bg-white p-2 rounded-[2rem] w-fit shadow-sm border border-gray-100">
            <button onClick={() => {setStep('form'); setIsEditing(false);}} className={`px-10 py-3 rounded-[1.5rem] font-black text-sm transition-all ${step !== 'history' ? 'bg-[#166534] text-white shadow-lg' : 'text-gray-400'}`}>
               <Heart size={16} className="inline mr-2" /> {isEditing ? 'Editing Record' : 'Donation Form'}
            </button>
            <button onClick={() => setStep('history')} className={`px-10 py-3 rounded-[1.5rem] font-black text-sm transition-all ${step === 'history' ? 'bg-[#166534] text-white shadow-lg' : 'text-gray-400'}`}>
               <Clock size={16} className="inline mr-2" /> Track Progress
            </button>
          </div>
        )}

        {/* --- FORM STEP --- */}
        {step === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('preview'); }} className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
             <div className="space-y-6">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{isEditing ? 'Modify Entry' : 'Support MaCync'}</h2>
                <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 flex items-center gap-4">
                   <MapPin className="text-green-600" />
                   <div><p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Registry Address</p><p className="font-bold text-gray-800">{formData.barangay}, {formData.municipality}</p></div>
                </div>
                <input type="number" placeholder="Amount (PHP)" className="custom-input h-14 font-black text-2xl text-[#166534]" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                   <select className="custom-input h-14 font-bold" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} required>
                     <option value="">Payment Mode</option>
                     <option value="GCash">GCash</option>
                     <option value="Bank Transfer">Bank Transfer</option>
                   </select>
                   <input type="text" placeholder="Contact No." className="custom-input h-14 font-bold" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} maxLength="11" required />
                </div>
                <input type="text" placeholder="Reference Number" className="custom-input h-14 font-bold" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} required />
                <select className="custom-input h-14 font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Select Fund Category</option>
                  <option value="Environmental Monitoring">Environmental Monitoring</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                </select>
             </div>
             <div className="flex flex-col justify-between">
                <label className="cursor-pointer group">
                   <div className="bg-[#f8f9fa] p-16 rounded-[3rem] border-2 border-dashed border-gray-200 group-hover:border-[#166534] transition-all flex flex-col items-center justify-center text-center">
                      <UploadCloud size={60} className="text-gray-300 mb-4 group-hover:text-[#166534]" />
                      <p className="font-black text-gray-600 uppercase text-xs">{proof ? "✅ File Ready" : "Update Proof of Payment"}</p>
                      {proof && <p className="text-[10px] text-green-600 mt-2">{proof.name}</p>}
                      <input type="file" onChange={(e) => setProof(e.target.files[0])} className="hidden" />
                   </div>
                </label>
                <button type="submit" className="w-full bg-[#166534] text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-green-100 mt-8 flex items-center justify-center gap-3">
                   {isEditing ? 'RE-VERIFY CHANGES' : 'VERIFY DETAILS'} <ArrowRight size={22}/>
                </button>
             </div>
          </form>
        )}

        {/* --- PREVIEW STEP --- */}
        {step === 'preview' && (
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 space-y-10 animate-in zoom-in-95 text-center">
             <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Double Check</h2>
             <div className="space-y-4 bg-[#F8F9FA] p-10 rounded-[3rem] border text-left">
                <div className="flex justify-between border-b pb-4"><span className="text-[10px] font-black text-gray-400 uppercase">Amount</span><span className="font-black text-2xl text-[#166534]">₱{formData.amount}</span></div>
                <div className="flex justify-between pt-2"><span className="text-[10px] font-black text-gray-400 uppercase">Reference</span><span className="font-mono font-bold text-blue-600 text-lg">#{formData.referenceNumber}</span></div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setStep('form')} className="flex-1 bg-gray-100 py-5 rounded-2xl font-black text-gray-400 uppercase text-xs">Back</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-[#166534] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3">
                   {loading ? <Loader2 className="animate-spin" /> : "CONFIRM & SUBMIT"}
                </button>
             </div>
          </div>
        )}

        {/* --- HISTORY & DETAIL STEP --- */}
        {step === 'history' && (
          <div className="space-y-6">
            {!selectedDonation ? (
              <div className="grid gap-4">
                <h2 className="text-2xl font-black text-gray-800 px-6">Donation History ({myDonations.length})</h2>
                {myDonations.map(d => (
                  <div key={d._id} onClick={() => setSelectedDonation(d)} className="group bg-white p-10 rounded-[3rem] border border-gray-50 flex justify-between items-center cursor-pointer hover:shadow-xl transition-all">
                    <div className="flex items-center gap-8">
                       <div className={`p-5 rounded-2xl ${d.status === 'received' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}><Receipt size={28}/></div>
                       <div><h3 className="text-2xl font-black text-gray-900 leading-none">₱{d.amount}</h3><p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{new Date(d.createdAt).toLocaleDateString()} • {d.status}</p></div>
                    </div>
                    <ChevronRight size={24} className="text-gray-200 group-hover:text-green-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-8 space-y-8">
                <button onClick={() => setSelectedDonation(null)} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase hover:text-green-700"><ArrowLeft size={16}/> Back</button>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* DETAIL LEFT */}
                  <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-10">
                    <h3 className="font-black text-2xl border-b pb-4">Verification File</h3>
                    <div className="flex flex-col gap-4">
                       <span className={`w-fit px-6 py-2 rounded-full text-[10px] font-black uppercase ${selectedDonation.status === 'received' ? 'bg-green-600 text-white' : 'bg-yellow-400 text-white'}`}>{selectedDonation.status}</span>
                       <p className="text-4xl font-black text-[#166534]">₱{selectedDonation.amount}</p>
                    </div>
                    {/* 🔥 EDIT/DELETE BUTTONS FOR PENDING */}
                    {selectedDonation.status === 'pending' && (
                      <div className="flex gap-3 pt-6 border-t">
                        <button onClick={() => handleEditInitiate(selectedDonation)} className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Edit3 size={18}/> Edit</button>
                        <button onClick={() => handleDelete(selectedDonation._id)} className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Trash2 size={18}/> Delete</button>
                      </div>
                    )}
                  </div>

                  {/* RECEIPT RIGHT */}
                  <div className="lg:col-span-2">
                    {selectedDonation.status === 'received' ? (
                      <div className="bg-white p-16 rounded-[4rem] shadow-2xl border-t-[20px] border-[#166534] space-y-8 animate-in zoom-in-95">
                         <div className="text-center border-b border-dashed pb-8">
                            <h2 className="text-3xl font-black text-[#166534]">OFFICIAL RECEIPT</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase">MaCync Provincial Treasury</p>
                            <div className="mt-6 inline-block bg-gray-50 px-6 py-2 rounded-xl font-mono text-xs font-bold">OR: {selectedDonation.officialReceiptNo}</div>
                         </div>
                         <div className="space-y-4 px-6 text-sm">
                            <p className="flex justify-between uppercase"><span className="text-gray-400 font-bold">Donor:</span> <span className="font-black text-gray-800">{selectedDonation.donorName}</span></p>
                            <p className="flex justify-between uppercase"><span className="text-gray-400 font-bold">Date Verified:</span> <span className="font-black text-gray-800">{new Date(selectedDonation.verifiedAt).toLocaleDateString()}</span></p>
                            <p className="flex justify-between uppercase"><span className="text-gray-400 font-bold">Category:</span> <span className="font-black text-[#166534] italic">{selectedDonation.category}</span></p>
                            <div className="bg-green-50 p-10 rounded-[3rem] text-center mt-10 shadow-inner">
                               <p className="text-[10px] font-black text-green-600 uppercase mb-2">Total Amount Confirmed</p>
                               <p className="text-5xl font-black text-[#166534]">₱{selectedDonation.amount}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border italic text-center mt-6 text-gray-600">" {selectedDonation.adminNote} "</div>
                         </div>
                      </div>
                    ) : (
                      <div className="bg-white p-16 rounded-[4rem] text-center border-2 border-dashed flex flex-col items-center justify-center">
                         <Clock size={80} className="text-yellow-400 mb-6 animate-pulse"/>
                         <h3 className="text-2xl font-black">Awaiting Treasury Audit</h3>
                         <p className="max-w-xs mt-4 text-gray-400 font-medium italic">Our team is currently verifying Reference #{selectedDonation.referenceNumber}. Your receipt will appear here once confirmed.</p>
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