import React, { useState } from 'react';
import axios from 'axios';
import { categories } from '../../utils/categories';
import NotificationModal from '../../components/notificationmodal';
import { FileText, MapPin, UploadCloud, Image, Video, CheckCircle, ShieldAlert, Edit3 } from 'lucide-react';
import '../../index.css';
import API_URL from '../api';

const ReportForm = ({ onSuccess, initialData }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // 1. DYNAMIC STATE: Kung may initialData, gamitin yun. Kung wala, auto-retrieve sa profile.
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
    
    // Validation: Resolution Letter is required for NEW reports only
    if (!initialData && !resolutionLetter) {
      setModal({ show: true, type: 'error', title: 'Missing File', message: 'Please upload the Resolution Letter to proceed.' });
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (resolutionLetter) data.append('resolutionLetter', resolutionLetter);
    if (image) data.append('images', image); // Matches backend recordRoutes

    try {
      const config = { headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userInfo.token}` 
      }};

      if (initialData) {
        // --- EDIT MODE (PUT) ---
        await axios.put(`${API_URL}/records/${initialData._id}`, data, config);
        setModal({
          show: true,
          type: 'success',
          title: 'Update Successful',
          message: 'The environmental record has been updated in the database.'
        });
      } else {
        // --- CREATE MODE (POST) ---
        await axios.post(`${API_URL}/records`, data, config);
        setModal({
          show: true,
          type: 'success',
          title: 'Report Submitted',
          message: 'Your report has been successfully logged and sent for review.'
        });
      }

      if(onSuccess) setTimeout(() => onSuccess(), 2000); 
    } catch (err) {
      setModal({
        show: true,
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || "Database connection error."
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: INFORMATION */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-4 mb-2">
             <div className="p-3 bg-green-100 rounded-2xl text-[#166534]">
                {initialData ? <Edit3 size={28}/> : <FileText size={28}/>}
             </div>
             <h2 className="text-3xl font-black text-gray-900">
                {initialData ? "Edit Report" : "Report Details"}
             </h2>
          </div>

          <div className="space-y-6">
            {/* REGISTERED LOCATION DISPLAY */}
            <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-green-600"><MapPin size={20}/></div>
                  <div>
                     <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Target Jurisdiction</p>
                     <p className="font-bold text-gray-800 text-lg">{formData.barangay}, {formData.municipality}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">Report Name / Title</label>
              <input type="text" value={formData.title} placeholder="e.g. Illegal Quarrying Site..." className="custom-input h-14 font-bold"
                onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">
                Contact Details
              </label>
              <input 
                type="text" 
                // Nakakatulong ito para lumabas ang numeric keypad sa mobile phones
                inputMode="numeric" 
                value={formData.contactNumber} 
                placeholder="09XXXXXXXXX" 
                className="custom-input h-14 font-bold"
                // Limitahan sa 11 characters (standard PH mobile number length)
                maxLength="11" 
                onChange={(e) => {
                  // 1. Kunin ang value mula sa event
                  const val = e.target.value;
                  
                  // 2. Burahin lahat ng HINDI numero (\D means "non-digit")
                  const formattedVal = val.replace(/\D/g, '');
                  
                  // 3. I-update ang state gamit ang malinis na numero
                  setFormData({ ...formData, contactNumber: formattedVal });
                }} 
                required 
              />
            </div>

            {/* CATEGORY SELECTOR */}
            <div className="flex flex-col pt-4">
              <label className="text-sm font-black text-gray-800 mb-4 ml-2 flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#166534]"/> Update Category
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(categories).map((cat) => (
                  <div key={cat} onClick={() => setFormData({...formData, mainCategory: cat, subCategory: categories[cat][0]})}
                    className={`px-5 py-3 rounded-2xl cursor-pointer transition-all border-2 font-bold text-sm ${
                      formData.mainCategory === cat ? 'bg-[#166534] border-[#166534] text-white shadow-lg' : 'bg-[#e9ede7] border-transparent text-gray-600 hover:bg-gray-200'
                    }`}>
                    {cat}
                  </div>
                ))}
              </div>
              
              {formData.mainCategory && (
                <select className="custom-input bg-[#bef264] text-[#166534] h-14 mt-6 font-black shadow-inner"
                  value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} required>
                  {categories[formData.mainCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EVIDENCE */}
        <div className="flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100 flex-grow space-y-8">
            <h2 className="text-3xl font-black text-gray-900 mb-6">File Registry</h2>
            
            <label className="cursor-pointer group block">
              <div className="bg-[#e9ede7] p-10 rounded-[.5rem] border-2 border-dashed border-gray-300 group-hover:border-[#166534] group-hover:bg-white transition-all flex flex-col items-center text-center">
                  <div className={`p-5 rounded-[.5rem] mb-4 transition-colors ${resolutionLetter || (initialData && !resolutionLetter) ? 'bg-green-600 text-white' : 'bg-white text-gray-400'}`}>
                    <UploadCloud size={40} />
                  </div>
                  <p className="font-black text-xl text-gray-800">
                    {resolutionLetter ? "✅ New Document Attached" : initialData ? "📄 Letter Stored in DB" : "Resolution Letter"}
                  </p>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {resolutionLetter ? resolutionLetter.name : "Click to replace current document (Optional)"}
                  </p>
                  <input type="file" className="hidden" onChange={(e) => setResolutionLetter(e.target.files[0])} />
              </div>
            </label>

            <div className="grid grid-cols-2 gap-6">
               <label className="bg-[#e9ede7] p-8 rounded-[.5rem] flex flex-col items-center cursor-pointer hover:bg-white border-2 border-transparent hover:border-green-200 transition-all text-center">
                  <Image size={32} className="text-green-700 mb-2"/>
                  <span className="font-black text-gray-800 text-xs">{image ? " Photo" : "Photo"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
               </label>

               <label className="bg-[#e9ede7] p-8 rounded-[.5rem] flex flex-col items-center cursor-pointer hover:bg-white border-2 border-transparent hover:border-green-200 transition-all text-center opacity-40">
                  <Video size={32} className="text-green-700 mb-2"/>
                  <span className="font-black text-gray-800 text-xs">Video Storage</span>
               </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#166534] text-white py-3 rounded-[.5rem] font-black text-12px shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
            {loading ? "SAVING..." : <><CheckCircle size={28}/> {initialData ? "SAVE CHANGES" : "SUBMIT REPORT"}</>}
          </button>
        </div>
      </form>

      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </div>
  );
};

export default ReportForm;