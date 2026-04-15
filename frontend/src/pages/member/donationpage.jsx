import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { 
  Heart, CreditCard, History, ArrowRight, ArrowLeft, 
  CheckCircle, Trash2, FileText, ChevronRight, Loader2, 
  ShieldAlert, Receipt, Clock, UploadCloud, MapPin, User, Phone, Edit3, XCircle, AlertTriangle,
  CalendarDays, BadgeCheck, ShieldCheck, Banknote, Hash, Building2
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

  // 2. FETCH DATA (Fixed: added to dependencies)
  const fetchMyDonations = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get(`${API_URL}/donations/my`, config);
      setMyDonations(data);
      
      // I-update ang selected item kung ito ang kasalukuyang tinitingnan
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
  }, [fetchMyDonations, step]);

  // 3. HANDLERS
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
      setModal({ show: true, type: 'success', title: isEditing ? 'Update Success' : 'Donation Submitted', message: 'Record logged successfully.' });
      setFormData({ amount: '', referenceNumber: '', category: '', contactNumber: '', paymentMethod: '', municipality: userInfo?.municipality, barangay: userInfo?.barangay });
      setProof(null);
      setIsEditing(false);
      setStep('history');
      fetchMyDonations(); 
    } catch (error) {
      setModal({ show: true, type: 'error', title: 'Error', message: error.response?.data?.message || 'Submission failed.' });
    } finally { setLoading(false); }
  };

  // 4. SUB-COMPONENTS (FIXED: Added Icon Component logic)
  const StatusBadge = ({ status }) => {
    const config = {
      received: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Verified' },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500', label: 'Rejected' },
      pending:  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400', label: 'Pending' },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.bg} ${c.text} ${c.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>
        {c.label}
      </span>
    );
  };

  // 🔥 FIXED: In-assign ang 'icon' prop sa 'Icon' variable para magamit ang <Icon />
  const MetaRow = ({ icon: Icon, label, value, mono }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 text-gray-400">
        {Icon && <Icon size={12}/>}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-xs font-bold text-gray-800 ${mono ? 'font-mono text-blue-600 uppercase' : ''}`}>{value}</span>
    </div>
  );

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20 px-4">
        
        {/* TAB SWITCHER */}
        {!selectedDonation && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <button onClick={() => setStep('form')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-all ${step !== 'history' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                Details
              </button>
              <div className="w-6 h-[1px] bg-gray-200"/>
              <button onClick={() => setStep('history')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-all ${step === 'history' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                Track Progress
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('preview'); }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm space-y-8 h-fit">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight border-b pb-4">{isEditing ? "Edit Contribution" : "Contribution Form"}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Amount (PHP)</label>
                    <input type="number" className="custom-input h-14 font-black text-2xl text-[#166534]" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Contact Number</label>
                    <input type="text" placeholder="09XXXXXXXXX" maxLength="11" className="custom-input h-14 font-bold" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value.replace(/\D/g, '')})} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Reference Number</label>
                    <input type="text" className="custom-input h-14 font-bold uppercase" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Payment Mode</label>
                    <select className="custom-input h-14 font-bold" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} required>
                      <option value="">Select Mode</option>
                      <option value="GCash">GCash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Fund Category</label>
                  <select className="custom-input h-14 font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                    <option value="">Select Category</option>
                    <option value="Environmental Monitoring">Environmental Monitoring</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 h-fit text-center">
                <h3 className="font-bold text-gray-900 border-b pb-4 uppercase text-xs tracking-widest">Digital Evidence</h3>
                <label className="cursor-pointer group block">
                  <div className="bg-gray-50 p-10 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-[#166534] transition-all flex flex-col items-center">
                    <UploadCloud size={40} className="text-gray-300 group-hover:text-[#166534] mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase">{proof ? "✅ File Loaded" : "Upload Receipt"}</p>
                    <input type="file" onChange={(e) => setProof(e.target.files[0])} className="hidden" />
                  </div>
                </label>
                <button type="submit" className="w-full bg-[#166534] text-white py-4 rounded-xl font-bold hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                  Review Details <ArrowRight size={18}/>
                </button>
            </div>
          </form>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && (
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[2rem] shadow-2xl border border-gray-100 space-y-8 animate-in zoom-in-95 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase tracking-widest">Final check</h2>
            <div className="space-y-4 bg-gray-50 p-8 rounded-2xl text-left border">
              <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px]">Net Amount</span> <span className="font-black text-2xl text-[#166534]">₱{formData.amount}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px]">Reference</span> <span className="font-mono font-bold text-blue-600 uppercase">#{formData.referenceNumber}</span></div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep('form')} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold text-gray-400 uppercase text-xs">Go Back</button>
              <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-[#166534] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg uppercase text-xs tracking-widest">
                {loading ? <Loader2 className="animate-spin" /> : "PROCEED & LOG DATA"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HISTORY */}
        {step === 'history' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {!selectedDonation ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-xl font-black text-gray-800 px-2 uppercase tracking-tighter mb-4">Activity Records</h2>
                  {myDonations.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-2xl border-2 border-dashed text-gray-300 font-bold italic">No records available</div>
                  ) : myDonations.map(d => (
                    <div key={d._id} onClick={() => setSelectedDonation(d)} className="group bg-white rounded-2xl border border-gray-100 flex items-center cursor-pointer hover:shadow-lg hover:border-green-200 transition-all overflow-hidden">
                      <div className={`w-1.5 self-stretch ${d.status === 'received' ? 'bg-emerald-500' : d.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`}/>
                      <div className="flex-1 flex items-center justify-between p-5 gap-4">
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-xl ${d.status === 'received' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {d.status === 'received' ? <Receipt size={24}/> : <Clock size={24}/>}
                          </div>
                          <div><p className="font-black text-gray-800 text-base leading-none">₱{d.amount}</p><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{d.category}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={d.status}/>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-green-600"/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#166534] p-8 rounded-[2rem] text-white shadow-xl h-fit space-y-8">
                   <h3 className="text-sm font-black border-b border-white/10 pb-4 uppercase tracking-widest">MaCync Ledger</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between text-xs"><span>Registry Entries</span> <span className="font-black">{myDonations.length}</span></div>
                      <div className="flex justify-between text-xs text-[#bef264]"><span>Verified Total</span> <span className="font-black">₱{myDonations.filter(d => d.status === 'received').reduce((a, b) => a + b.amount, 0)}</span></div>
                   </div>
                </div>
              </div>
            ) : (
              /* THE FOLDER/RECEIPT VIEW */
              <div className="max-w-3xl mx-auto space-y-6">
                <button onClick={() => setSelectedDonation(null)} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase hover:text-green-700 tracking-widest transition-all"><ArrowLeft size={16}/> Back to history</button>
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                   <div className={`h-2 w-full ${selectedDonation.status === 'received' ? 'bg-emerald-500' : 'bg-amber-400'}`}/>
                   <div className="p-12 space-y-10">
                      <div className="flex justify-between items-start border-b border-dashed pb-8">
                         <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mb-1">Central Provincial Registry</p>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">OFFICIAL DOCUMENT</h2>
                            {selectedDonation.status === 'received' && <p className="text-emerald-600 font-mono text-xs font-bold mt-2 uppercase">OR#: {selectedDonation.officialReceiptNo}</p>}
                         </div>
                         <div className="flex flex-col items-end gap-3">
                            <StatusBadge status={selectedDonation.status}/>
                            {selectedDonation.status === 'pending' && (
                              <div className="flex gap-2">
                                 <button onClick={() => handleEditInitiate(selectedDonation)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16}/></button>
                                 <button onClick={() => handleDelete(selectedDonation._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                              </div>
                            )}
                         </div>
                      </div>
                      <div className={`p-8 rounded-[2rem] flex justify-between items-center ${selectedDonation.status === 'received' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                         <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Amount</p><p className="text-5xl font-black text-[#166534] tracking-tighter">₱{selectedDonation.amount}</p></div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Fund</p>
                            <p className="text-sm font-bold text-gray-700 italic max-w-[150px]">{selectedDonation.category}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-12 px-2">
                         <div className="space-y-4">
                            <MetaRow icon={User} label="Contributor" value={selectedDonation.donorName}/>
                            <MetaRow icon={Phone} label="Contact" value={selectedDonation.contactNumber}/>
                            <MetaRow icon={Hash} label="Reference" value={selectedDonation.referenceNumber} mono/>
                         </div>
                         <div className="space-y-4">
                            <MetaRow icon={MapPin} label="Jurisdiction" value={`${selectedDonation.barangay}, ${selectedDonation.municipality}`}/>
                            <MetaRow icon={CalendarDays} label="Log Date" value={new Date(selectedDonation.createdAt).toLocaleDateString()}/>
                            {selectedDonation.status === 'received' && <MetaRow icon={BadgeCheck} label="Audit Date" value={new Date(selectedDonation.verifiedAt).toLocaleDateString()}/>}
                         </div>
                      </div>
                      {selectedDonation.status === 'received' && (
                        <div className="p-6 bg-[#166534] text-green-100 rounded-2xl italic text-sm text-center relative mt-6 border border-[#064e3b]">
                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-gray-300 px-3 text-[9px] font-black uppercase">Official Audit Note</div>
                           " {selectedDonation.adminNote || "Transaction verified by MaCync Treasury."} "
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