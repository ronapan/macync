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

  const fetchMyDonations = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get(`${API_URL}/donations/my`, config);
      setMyDonations(data);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchMyDonations();
  }, [fetchMyDonations]);

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

  const handleFinalSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('donorName', userInfo.name);
    if (proof) data.append('proofOfPayment', proof);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } };
      
      if (isEditing && formData._id) {
        await axios.put(`${API_URL}/donations/${formData._id}`, data, config);
      } else {
        await axios.post(`${API_URL}/donations`, data, config);
      }
      
      setModal({ 
        show: true, 
        type: 'success', 
        title: isEditing ? 'Update Success' : 'Donation Submitted', 
        message: 'Record successfully logged in the central database.' 
      });

      setFormData({ amount: '', referenceNumber: '', category: '', contactNumber: '', paymentMethod: '' });
      setProof(null);
      setIsEditing(false);
      setStep('history');
      await fetchMyDonations(); 
    } catch (error) {
      setModal({ show: true, type: 'error', title: 'Error', message: error.response?.data?.message || 'DB Connection Error.' });
    } finally { setLoading(false); }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20 px-4">
        
        {/* --- STEPPER / TAB SWITCHER (Matching Header Stepper in Ref) --- */}
        {!selectedDonation && (
          <div className="flex justify-center">
            <div className="flex items-center gap-4 bg-white p-3 rounded-full shadow-sm border border-gray-100">
              <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${step !== 'history' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400'}`}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</div>
                Details
              </div>
              <div className="w-8 h-[2px] bg-gray-100"></div>
              <div onClick={() => setStep('history')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm cursor-pointer transition-all ${step === 'history' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400'}`}>
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">2</div>
                Confirmation
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 1: FORM --- */}
        {step === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
             {/* Main Info */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight border-b pb-4">Donation Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Amount (PHP)</label>
                      <input type="number" className="custom-input h-14 font-black text-2xl text-[#166534]" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref / Transaction ID</label>
                      <input type="text" className="custom-input h-14 font-bold" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Mode</label>
                      <select className="custom-input h-14 font-bold" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} required>
                        <option value="">Select Mode</option>
                        <option value="GCash">GCash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fund Category</label>
                      <select className="custom-input h-14 font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                        <option value="">Select Category</option>
                        <option value="Environmental Monitoring">Environmental Monitoring</option>
                        <option value="Disaster Relief">Disaster Relief</option>
                      </select>
                    </div>
                  </div>
                </div>
             </div>

             {/* Sidebar Actions */}
             <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                   <h3 className="font-bold text-gray-900 border-b pb-4 uppercase text-xs tracking-widest">Supporting Document</h3>
                   <label className="cursor-pointer group block">
                      <div className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-[#166534] transition-all flex flex-col items-center text-center">
                        <UploadCloud size={40} className="text-gray-300 group-hover:text-[#166534] mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase">{proof ? proof.name : "Upload Receipt"}</p>
                        <input type="file" onChange={(e) => setProof(e.target.files[0])} className="hidden" />
                      </div>
                   </label>
                   <button onClick={() => setStep('preview')} className="w-full bg-[#166534] text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                     Review Details <ArrowRight size={18}/>
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* --- STEP 2: PREVIEW --- */}
        {step === 'preview' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95">
             <div className="md:col-span-2 bg-white p-10 rounded-2xl border shadow-sm space-y-6">
                <h2 className="text-xl font-black text-gray-800">Review Contribution</h2>
                <div className="grid grid-cols-2 gap-8 text-sm">
                   <div><p className="text-gray-400 font-bold uppercase text-[10px]">Reference</p><p className="font-black text-blue-600">#{formData.referenceNumber}</p></div>
                   <div><p className="text-gray-400 font-bold uppercase text-[10px]">Mode</p><p className="font-bold">{formData.paymentMethod}</p></div>
                </div>
                <div className="p-6 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
                   <span className="font-bold text-green-800">Total PHP</span>
                   <span className="text-3xl font-black text-[#166534]">₱{formData.amount}</span>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setStep('form')} className="flex-1 bg-gray-100 py-3 rounded-lg font-bold text-gray-400 uppercase text-xs">Back</button>
                   <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-[#166534] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md">
                      {loading ? <Loader2 className="animate-spin" /> : "PROCEED & SUBMIT"}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* --- STEP 3: HISTORY & CONFIRMATION VIEW (Matching Reference Layout) --- */}
        {step === 'history' && (
          <div className="space-y-8">
            {!selectedDonation ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Donation List (Col Span 2) */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl font-black text-gray-800 px-2 uppercase tracking-tighter">Confirmation Status</h2>
                  {myDonations.map(d => (
                    <div key={d._id} onClick={() => setSelectedDonation(d)} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:shadow-md transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-xl ${d.status === 'received' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}><Receipt size={24}/></div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(d.createdAt).toDateString()}</p>
                          <h3 className="text-lg font-black text-gray-800 leading-none mt-1">₱{d.amount}</h3>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-300" />
                    </div>
                  ))}
                </div>
                {/* Summary Statistics (Col Span 1) */}
                <div className="bg-[#166534] p-8 rounded-[2rem] text-white shadow-xl shadow-green-100 h-fit">
                   <h3 className="text-lg font-bold border-b border-white/20 pb-4">Activity Summary</h3>
                   <div className="py-6 space-y-4">
                      <div className="flex justify-between text-sm opacity-80"><span>Total Entries:</span> <span className="font-black">{myDonations.length}</span></div>
                      <div className="flex justify-between text-sm opacity-80"><span>Processing:</span> <span className="font-black">{myDonations.filter(d => d.status === 'pending').length}</span></div>
                   </div>
                </div>
              </div>
            ) : (
              /* --- FULL FOLDER VIEW (Matching Confirmation Screen in Ref) --- */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-8 duration-500">
                
                {/* LEFT: MAIN CONFIRMATION (Col-8) */}
                <div className="lg:col-span-8 space-y-6">
                   <button onClick={() => setSelectedDonation(null)} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase hover:text-green-700 tracking-widest mb-2"><ArrowLeft size={16}/> Back to History</button>
                   
                   {/* SUCCESS BANNER */}
                   <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6">
                      <div className="p-4 bg-green-50 text-green-600 rounded-full border border-green-100">
                         {selectedDonation.status === 'received' ? <CheckCircle size={32}/> : <Clock size={32}/>}
                      </div>
                      <div className="flex-1">
                         <h2 className="text-xl font-black text-gray-900">{selectedDonation.status === 'received' ? "Your donation is confirmed" : "Verification in progress"}</h2>
                         <p className="text-sm text-gray-400 leading-relaxed mt-1 italic">
                           {selectedDonation.status === 'received' 
                             ? "MaCync officially recognizes this contribution to our provincial environmental funds." 
                             : "Please allow 24-48 hours for the MaCync Provincial Treasury to verify your reference number."}
                         </p>
                      </div>
                      {selectedDonation.status === 'pending' && (
                        <div className="flex gap-2">
                           <button onClick={() => handleEditInitiate(selectedDonation)} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Edit3 size={18}/></button>
                           <button onClick={() => handleDelete(selectedDonation._id)} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 size={18}/></button>
                        </div>
                      )}
                   </div>

                   {/* BOOKING DETAILS (DETAILS IN REF) */}
                   <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-black text-gray-900 border-b pb-4 mb-6 uppercase tracking-widest">Donation Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                         <div><p className="text-gray-400 font-bold uppercase text-[10px]">Donator</p><p className="font-black text-gray-800">{selectedDonation.donorName}</p></div>
                         <div><p className="text-gray-400 font-bold uppercase text-[10px]">Verified Date</p><p className="font-black text-gray-800">{selectedDonation.verifiedAt ? new Date(selectedDonation.verifiedAt).toDateString() : "Pending"}</p></div>
                         <div><p className="text-gray-400 font-bold uppercase text-[10px]">Reference</p><p className="font-black text-blue-600 font-mono">#{selectedDonation.referenceNumber}</p></div>
                         <div><p className="text-gray-400 font-bold uppercase text-[10px]">Fund Allocation</p><p className="font-bold text-[#166534] italic">{selectedDonation.category}</p></div>
                         <div><p className="text-gray-400 font-bold uppercase text-[10px]">Receipt ID</p><p className="font-bold">{selectedDonation.officialReceiptNo || "---"}</p></div>
                      </div>
                   </div>

                   {/* PROOF SECTION */}
                   <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col items-center text-center space-y-4">
                      <FileText size={40} className="text-gray-300 opacity-50" />
                      <div>
                         <p className="font-black text-gray-800 text-xs uppercase tracking-widest">Uploaded Proof</p>
                         <p className="text-[10px] text-gray-400 italic">Reference link to stored digital evidence.</p>
                      </div>
                      <a href={`http://localhost:3000/${selectedDonation.proofOfPayment}`} target="_blank" rel="noreferrer" className="bg-white border px-6 py-2 rounded-lg font-bold text-xs hover:bg-gray-100 transition-all uppercase tracking-tighter">Open Full Evidence</a>
                   </div>
                </div>

                {/* RIGHT: PRICE SUMMARY (Col-4) */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white p-8 rounded-2xl border-4 border-green-50 shadow-2xl space-y-8">
                      <h3 className="text-sm font-black text-gray-900 border-b pb-4 uppercase tracking-widest">Financial Summary</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold uppercase text-[10px]">Donation:</span> <span className="font-black text-gray-800">₱{selectedDonation.amount}</span></div>
                         <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold uppercase text-[10px]">Service Fee:</span> <span className="font-black text-gray-800">₱0.00</span></div>
                         <div className="flex justify-between pt-4 border-t border-gray-100">
                            <span className="text-lg font-black text-[#166534]">Total Amount</span>
                            <span className="text-2xl font-black text-[#166534]">₱{selectedDonation.amount}</span>
                         </div>
                      </div>
                      {selectedDonation.status === 'received' && (
                        <button className="w-full bg-[#166534] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md">
                          <CheckCircle size={18}/> Validated Record
                        </button>
                      )}
                      <p className="text-[9px] text-center text-gray-400 italic">Authenticated via MaCync Decentralized Registry</p>
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