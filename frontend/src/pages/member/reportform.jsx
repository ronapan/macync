import React, { useState } from 'react';
import axios from 'axios';
import { categories } from '../../utils/categories';
import NotificationModal from '../../components/notificationmodal';
import { 
  FileText, MapPin, UploadCloud, Image, Video, 
  CheckCircle, ShieldAlert, Edit3, ArrowRight, Clock, User, Phone 
} from 'lucide-react';
import '../../index.css';
import API_URL from '../../api';

const ReportForm = ({ onSuccess, initialData }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const [formData, setFormData] = useState({
    title: initialData?.title || '', 
    contactNumber: initialData?.contactNumber || '', 
    municipality: initialData?.municipality || userInfo?.municipality || '', 
    barangay: initialData?.barangay || userInfo?.barangay || '',
    mainCategory: initialData?.mainCategory || '', 
    subCategory: initialData?.subCategory || '',
    date: initialData?.date?.split('T')[0] || new Date().toISOString().split('T')[0]
  });

  const [resolutionLetter, setResolutionLetter] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initialData && !resolutionLetter) {
      setModal({ show: true, type: 'error', title: 'Missing File', message: 'Please upload the Resolution Letter to proceed.' });
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (resolutionLetter) data.append('resolutionLetter', resolutionLetter);
    if (image) data.append('images', image);

    try {
      const config = { headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userInfo.token}` 
      }};

      if (initialData) {
        await axios.put(`${API_URL}/records/${initialData._id}`, data, config);
        setModal({ show: true, type: 'success', title: 'Update Successful', message: 'The environmental record has been updated.' });
      } else {
        await axios.post(`${API_URL}/records`, data, config);
        setModal({ show: true, type: 'success', title: 'Report Submitted', message: 'Your report has been successfully logged for review.' });
      }
      if(onSuccess) setTimeout(() => onSuccess(), 2000); 
    } catch (err) {
      setModal({ show: true, type: 'error', title: 'Action Failed', message: err.response?.data?.message || "Database connection error." });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* --- TOP STEPPER (Matching Reference) --- */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-4 bg-white p-3 rounded-full shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#166534] text-white text-[11px] font-bold uppercase tracking-wider">
              <CheckCircle size={14} /> Information
           </div>
           <div className="w-10 h-[2px] bg-gray-100"></div>
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[9px]">2</div> Evidence
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: MAIN CONTENT (Col Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Status Banner */}
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-start gap-4">
             <div className="p-3 bg-white rounded-full text-green-600 shadow-sm"><ShieldAlert size={20}/></div>
             <div>
                <h3 className="font-black text-[#166534] uppercase text-xs tracking-widest">Registry Action</h3>
                <p className="text-sm text-green-700 font-medium">Please ensure all data provided matches the details in your attached resolution letter.</p>
             </div>
          </div>

          <div className="bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100 space-y-10">
            <h2 className="text-xl font-black text-gray-900 border-b pb-4">Report details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report Identifier (Title)</p>
                <input type="text" value={formData.title} placeholder="e.g. Illegal Logging..." className="custom-input h-12 font-bold"
                  onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Contact</p>
                <input type="text" inputMode="numeric" value={formData.contactNumber} placeholder="09XXXXXXXXX" className="custom-input h-12 font-bold"
                  maxLength="11" onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/\D/g, '') })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Municipality</p>
                  <p className="font-black text-gray-800 flex items-center gap-2"><MapPin size={14} className="text-green-600"/> {formData.municipality}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Barangay</p>
                  <p className="font-black text-gray-800 flex items-center gap-2"><Clock size={14} className="text-green-600"/> {formData.barangay}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entry Date</p>
                  <p className="font-black text-gray-800">{formData.date}</p>
               </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Category Classification</h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(categories).map((cat) => (
                  <div key={cat} onClick={() => setFormData({...formData, mainCategory: cat, subCategory: categories[cat][0]})}
                    className={`px-5 py-2.5 rounded-xl cursor-pointer transition-all border font-bold text-[11px] uppercase ${
                      formData.mainCategory === cat ? 'bg-[#166534] border-[#166534] text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                    }`}>
                    {cat}
                  </div>
                ))}
              </div>
              {formData.mainCategory && (
                <div className="animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Specific Issue (Sub-category)</p>
                  <select className="custom-input bg-[#f8f9fa] h-12 font-black text-[#166534] text-xs uppercase"
                    value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} required>
                    {categories[formData.mainCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY & FILES (Col Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[.5rem] shadow-sm border border-gray-100 space-y-8">
            <h2 className="text-lg font-black text-gray-900 tracking-tighter uppercase">File Registry</h2>
            
            <div className="space-y-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Evidence</p>
               <label className="cursor-pointer group block">
                <div className="bg-[#f8f9fa] p-8 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-[#166534] group-hover:bg-white transition-all flex flex-col items-center text-center">
                    <UploadCloud size={32} className="text-gray-300 mb-2 group-hover:text-[#166534]" />
                    <p className="font-black text-gray-600 uppercase text-[10px] tracking-tighter">
                      {resolutionLetter ? "File Attached" : "Upload Letter"}
                    </p>
                    <input type="file" className="hidden" onChange={(e) => setResolutionLetter(e.target.files[0])} />
                </div>
               </label>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Attachments</p>
               <div className="grid grid-cols-2 gap-4">
                  <label className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col items-center cursor-pointer hover:bg-white hover:border-green-300 transition-all">
                    <Image size={24} className="text-gray-400 mb-1" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{image ? "Ready" : "Photo"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                  </label>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col items-center opacity-40 cursor-not-allowed">
                    <Video size={24} className="text-gray-400 mb-1" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Video</span>
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
               <button type="submit" disabled={loading} className="w-full bg-[#166534] text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                 {loading ? "Processing..." : initialData ? "Confirm Changes" : "Submit Report"}
                 <ArrowRight size={16}/>
               </button>
               <p className="text-[9px] text-center text-gray-400 mt-4 italic uppercase font-bold tracking-widest">MaCync Decentralized Data Entry</p>
            </div>
          </div>
        </div>

      </form>

      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default ReportForm;