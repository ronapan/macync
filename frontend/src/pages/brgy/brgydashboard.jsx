import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { 
  ClipboardList, CheckCircle, Eye, User, Phone, 
  MapPin, Calendar, FileText, ImageIcon, 
  AlertTriangle, XCircle, ArrowUpRight,
  ExternalLink, // Idinagdag ito para sa Resolution Letter link
  ShieldCheck   // <--- ETO ANG FIX para sa error mo
} from 'lucide-react';
import API_URL from '../api';

const BrgyDashboard = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [note, setNote] = useState('');
  const [urgency, setUrgency] = useState('Medium'); // Default Urgency
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', msg: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/records`, config);
      setReports(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    if (!note || note.length < 5) {
      setModal({ show: true, type: 'error', title: 'Action Denied', msg: 'A descriptive note (min 5 chars) is required.' });
      return;
    }
    
    // URGENCY IS REQUIRED
    if (!urgency) {
      setModal({ show: true, type: 'error', title: 'Action Denied', msg: 'Please select an Urgency Level for this report.' });
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // PASSING URGENCY LEVEL TO BACKEND
      await axios.put(`${API_URL}/records/${reportId}/status`, 
        { status: newStatus, comment: note, urgencyLevel: urgency }, 
        config
      );
      
      setModal({ show: true, type: 'success', title: 'Status Updated', msg: `Report marked as ${newStatus.replace('_', ' ')} with ${urgency} urgency.` });
      setNote('');
      setSelectedReport(null);
      fetchData();
    } catch (err) {
      setModal({ show: true, type: 'error', title: 'Update Failed', msg: err.response?.data?.message });
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Barangay Action Center</h1>
            <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">Validating Community Reports</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-500px)]">
          {/* LEFT: LIST */}
          <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-10 no-scrollbar">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 px-2">
              <ClipboardList size={20} className="text-green-600"/> Incoming ({reports.length})
            </h2>
            {loading ? <p className="p-10 text-center">Fetching data...</p> : reports.map((report) => (
              <div key={report._id} onClick={() => setSelectedReport(report)}
                className={`p-6 bg-white rounded-[.5rem] border transition-all cursor-pointer ${selectedReport?._id === report._id ? 'border-[#166534] ring-4 ring-green-50 shadow-xl' : 'border-gray-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[9px] font-black uppercase text-gray-400">{report.mainCategory}</span>
                   <span className={`px-3 py-1 rounded-[.5rem] text-[9px] font-black uppercase ${getStatusColor(report.status)}`}>{report.status.replace('_', ' ')}</span>
                </div>
                <h3 className="font-black text-gray-900 leading-tight truncate">{report.title}</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1"><MapPin size={12}/> {report.barangay}</p>
              </div>
            ))}
          </div>

          {/* RIGHT: FULL DETAIL VIEW (8/12 columns) */}
        <div className="lg:col-span-8 bg-white rounded-[.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-80px)]">
          {selectedReport ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
              
              {/* 1. SCROLLABLE CASE FOLDER */}
              <div className="flex-1 overflow-y-auto p-10 space-y-7 custom-scrollbar">
                
                {/* Header: Title & Urgency */}
                <div className="border-b border-gray-50 pb-8 flex justify-between items-start">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-2 text-green-600 font-black uppercase text-[10px] tracking-widest">
                        <ShieldCheck size={14}/> MaCync Official Case Record
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4">{selectedReport.title}</h2>
                    <div className="flex gap-4">
                        <span className="bg-gray-100 px-4 py-1.5 rounded-xl text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                          <Calendar size={14}/> {new Date(selectedReport.createdAt).toLocaleDateString()}
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                          <MapPin size={14}/> {selectedReport.barangay}
                        </span>
                    </div>
                  </div>
                  {/* Visual Urgency Indicator */}
                  <div className="bg-red-50 p-4 rounded-3xl border border-red-100 text-center">
                    <p className="text-[9px] font-black text-red-600 uppercase mb-1">Status</p>
                    <p className="font-black text-gray-800 uppercase text-xs">{selectedReport.status}</p>
                  </div>
                </div>

                {/* Info Grid: Reporter & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Reporter Identity</h4>
                    <div className="p-6 bg-gray-50 rounded-[.5rem] space-y-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><User size={18} className="text-green-600"/></div>
                          <div><p className="text-[10px] text-gray-400 font-bold uppercase">Full Name</p><p className="font-bold text-gray-800 text-sm">{selectedReport.reporter?.name || "Anonymous Member"}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Phone size={18} className="text-green-600"/></div>
                          <div><p className="text-[10px] text-gray-400 font-bold uppercase">Contact No.</p><p className="font-bold text-gray-800 text-sm">{selectedReport.reporter?.contactNumber}</p></div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Case Classification</h4>
                    <div className="p-8 bg-[#166534] rounded-[.5rem] text-white shadow-xl shadow-green-100 flex flex-col justify-center">
                        <p className="text-[10px] opacity-60 font-bold uppercase mb-1">Violation Category</p>
                        <p className="text-2xl font-black tracking-tighter">{selectedReport.mainCategory}</p>
                        <p className="text-sm opacity-80 mt-2 italic font-medium">"{selectedReport.subCategory}"</p>
                    </div>
                  </div>
                </div>

                {/* 🔥 EVIDENCE SECTION (Resolution Letter & Media) */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Evidence & Documentation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* RESOLUTION LETTER PREVIEW CARD */}
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-bold text-gray-600 ml-4">Official Resolution Letter</p>
                        <a 
                          href={`http://localhost:3000/${selectedReport.resolutionLetter}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="group p-8 border-2 border-dashed border-gray-200 rounded-[.5rem] bg-gray-50 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-white transition-all"
                        >
                            <FileText size={48} className="text-gray-300 group-hover:text-green-600 transition-all mb-4" />
                            <p className="font-black text-gray-800 text-sm">Download / View Document</p>
                            <span className="text-[9px] font-bold text-gray-400 uppercase mt-2 group-hover:text-green-600 flex items-center gap-1">Open Registry File <ArrowUpRight size={10}/></span>
                        </a>
                      </div>

                      {/* PHOTO/VIDEO PREVIEW CARD */}
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-bold text-gray-600 ml-4">Media Attachment</p>
                        {selectedReport.image ? (
                          <div className="rounded-[.5rem] overflow-hidden border-4 border-white shadow-2xl relative group h-full min-h-[180px]">
                              <img 
                                src={`http://localhost:3000/${selectedReport.image}`} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                                alt="Environmental Evidence" 
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="text-white" size={32}/>
                              </div>
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-[.5rem] h-full min-h-[180px] flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                              <ImageIcon size={40} className="opacity-20 mb-2" />
                              <p className="text-[10px] font-black uppercase">No visual evidence attached</p>
                          </div>
                        )}
                      </div>

                  </div>
                </div>
              </div>

              {/* 2. STICKY ACTION PANEL */}
              <div className="p-8 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* URGENCY SELECTOR (Required as per your last request) */}
                    <div className="flex flex-col w-full md:w-48">
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-2 ml-2">Identify Urgency</label>
                      <select 
                        value={urgency} 
                        onChange={(e) => setUrgency(e.target.value)}
                        className="bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold text-[#166534] outline-none shadow-sm focus:ring-2 ring-green-100"
                      >
                        <option value="Low"> Low</option>
                        <option value="Medium"> Medium</option>
                        <option value="High"> High</option>
                        <option value="Critical"> Critical</option>
                      </select>
                    </div>

                    {/* ACTION NOTE */}
                    <div className="flex-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-2 ml-2">Official Validation Note</label>
                      <textarea 
                        value={note} 
                        onChange={(e) => setNote(e.target.value)} 
                        placeholder="Type your findings or instructions for the member..." 
                        className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-green-100 shadow-inner h-14"
                      />
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button onClick={() => handleUpdateStatus(selectedReport._id, 'resolved_brgy')} className="bg-[#166534] text-white px-10 py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-all">Resolve Case</button>
                    <button onClick={() => handleUpdateStatus(selectedReport._id, 'rejected_brgy')} className="bg-red-500 text-white px-10 py-3 rounded-xl font-black text-xs uppercase hover:bg-red-600 shadow-lg transition-all">Reject</button>
                    <button onClick={() => handleUpdateStatus(selectedReport._id, 'escalated')} className="bg-[#bef264] text-[#166534] px-10 py-3 rounded-xl font-black text-xs uppercase shadow-md flex items-center gap-2 hover:bg-white">Escalate <ArrowUpRight size={14}/></button>
                </div>
              </div>

            </div>
          ) : (
            /* EMPTY STATE remains the same */
            <div className="h-full flex flex-col items-center justify-center opacity-20"><Eye size={60}/><p className="font-bold mt-4 tracking-tighter">Select a report to validate evidence</p></div>
          )}
        </div>

        </div>
      </div>
      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.msg} onClose={() => setModal({ ...modal, show: false })} />
    </Sidebar>
  );
};

const getStatusColor = (status) => {
  if (status.includes('approved') || status.includes('resolved')) return 'bg-green-100 text-green-700';
  if (status.includes('rejected')) return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

export default BrgyDashboard;