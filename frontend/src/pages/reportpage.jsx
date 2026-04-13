import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import ReportForm from './member/reportform';
import BrgyDashboard from './brgy/brgydashboard';
import NotificationModal from '../components/notificationmodal';
import { 
  FileText, Plus, Clock, ChevronRight, ArrowLeft, 
  History, MapPin, ShieldCheck, Trash2, ShieldAlert, Edit3, XCircle 
} from 'lucide-react';
import '../index.css';
import API_URL from './api'; // Centralized API URL configuration

const ReportPage = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userRole = userInfo?.role;

  // 1. STATES
  const [activeTab, setActiveTab] = useState('status'); 
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 🔥 DITO ANG FIX: State para sa Edit Mode
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 2. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      if (userRole === 'barangay_officer' || activeTab !== 'status') return;
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.get(`${API_URL}/records/my-reports`, config);
        setReports(data);
      } catch (err) {
        console.error("Error loading reports:", err);
      }
    };
    fetchData();
  }, [activeTab, userRole, userInfo?.token]);

  // 3. DELETE HANDLER
  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/records/${reportId}`, config);
      setModal({ show: true, type: 'success', title: 'Deleted', message: 'Report removed successfully.' });
      setReports(prev => prev.filter(r => r._id !== reportId));
      setSelectedReport(null);
    } catch (err) {
      setModal({ show: true, type: 'error', title: 'Denied', message: err.response?.data?.message || 'Delete failed.' });
    }
  };

  if (userRole === 'barangay_officer') return <BrgyDashboard />;

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* HEADER & SWITCHER (Hidden during Edit or Detail View) */}
        {!selectedReport && (
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">My Submissions</h1>
              <p className="text-gray-400 font-medium">Manage and track your environmental concerns.</p>
            </div>
            <div className="flex bg-white p-2 rounded-[.5rem] shadow-sm border border-gray-100">
              <button onClick={() => setActiveTab('status')} className={`px-8 py-3 rounded-[.5rem] font-black text-sm transition-all ${activeTab === 'status' ? 'bg-[#166534] text-white shadow-lg' : 'text-gray-400'}`}>Status</button>
              <button onClick={() => {setActiveTab('create'); setSelectedReport(null); setIsEditing(false);}} className={`px-8 py-3 rounded-[.5rem] font-black text-sm transition-all ${activeTab === 'create' ? 'bg-[#166534] text-white shadow-lg' : 'text-gray-400'}`}>+ New</button>
            </div>
          </div>
        )}

        {/* --- 1. DETAIL / EDIT VIEW HUB --- */}
        {selectedReport ? (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
            <button onClick={() => {setSelectedReport(null); setIsEditing(false);}} className="flex items-center gap-2 text-gray-400 font-bold hover:text-green-700 uppercase text-[10px] tracking-widest">
              <ArrowLeft size={16} /> Back to List
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT CARD: Summary & Action Buttons */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100 relative group">
                  
                  {/*  DYNAMIC ACTION BUTTONS (Visible if Pending) */}
                  {selectedReport.status === 'pending' && (
                    <div className="absolute top-6 right-6 flex gap-2">
                      <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`p-3 rounded-[.5rem] shadow-sm transition-all ${isEditing ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white'}`}
                        title="Edit Report"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedReport._id)}
                        className="p-3 bg-red-50 text-red-500 rounded-[.5rem] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Delete Report"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}

                  <span className={`px-4 py-1 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest ${getStatusStyles(selectedReport.status)}`}>
                    {selectedReport.status.replace(/_/g, ' ')}
                  </span>
                  <h2 className="text-3xl font-black text-gray-900 mt-6 mb-2 leading-tight">{selectedReport.title}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mt-4"><MapPin size={14} className="text-green-600"/> {selectedReport.barangay}, {selectedReport.municipality}</p>
                </div>
              </div>

              {/* RIGHT CARD: SWITCH BETWEEN TIMELINE OR EDIT FORM */}
              <div className="lg:col-span-2">
                {isEditing ? (
                  <div className="bg-white p-2 rounded-[.5rem] shadow-xl border-4 border-blue-50 animate-in zoom-in-95">
                     <div className="p-8 pb-0 flex justify-between items-center">
                        <h3 className="text-xl font-black text-blue-600 uppercase tracking-widest">Editing Mode</h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-300 hover:text-red-500 transition-colors"><XCircle size={28}/></button>
                     </div>
                     {/*  PASSING DATA TO FORM */}
                     <ReportForm 
                        initialData={selectedReport} 
                        onSuccess={() => {
                          setIsEditing(false); 
                          setSelectedReport(null); 
                        }} 
                     />
                  </div>
                ) : (
                  <div className="bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3"><History className="text-green-600" /> Process History</h3>
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-green-500 before:to-transparent">
                      <div className="relative flex items-center space-x-10 group pl-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-[.5rem] bg-green-600 text-white z-10"><Plus size={18} /></div>
                        <div className="flex-1 bg-gray-50 p-6 rounded-[.5rem] border border-gray-100"><h4 className="font-black text-gray-800">Report Submitted</h4><p className="text-sm text-gray-500 italic mt-1">"Your concern has been received by MaCync."</p></div>
                      </div>
                      {selectedReport.reviewNotes?.map((note, idx) => (
                        <div key={idx} className="relative flex items-center space-x-10 group pl-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-[.5rem] bg-white border-2 border-green-500 text-green-600 z-10"><ShieldCheck size={18} /></div>
                          <div className="flex-1 bg-green-50/50 p-6 rounded-[.5rem] border border-green-100"><h4 className="font-black text-green-800 uppercase text-xs tracking-widest">Update: {note.status}</h4><p className="text-sm text-gray-700 font-medium">"{note.comment}"</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- 2. MAIN TABS CONTENT --- */
          <>
            {activeTab === 'status' ? (
              <div className="grid gap-4">
                {reports.map((r) => (
                  <div key={r._id} onClick={() => setSelectedReport(r)} className="group bg-white p-8 rounded-[.5rem] shadow-sm border border-gray-50 flex justify-between items-center transition-all hover:translate-x-2 cursor-pointer hover:border-green-300">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-[.5rem] ${getStatusIconBg(r.status)}`}><FileText size={28} /></div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-[#166534]">{r.title}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tracking ID: #{r._id.substring(18).toUpperCase()}</p>
                      </div>
                    </div>
                    <span className={`px-5 py-2 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest ${getStatusStyles(r.status)}`}>{r.status.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#F8F9FA] rounded-[.5rem]">
                <ReportForm onSuccess={() => setActiveTab('status')} />
              </div>
            )}
          </>
        )}
      </div>

      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
    </Sidebar>
  );
};

// --- HELPER STYLES ---
const getStatusIconBg = (s) => (s.includes('approved') || s.includes('resolved')) ? 'bg-green-50 text-green-600' : s.includes('rejected') ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600';
const getStatusStyles = (s) => (s.includes('approved') || s.includes('resolved')) ? 'bg-green-100 text-green-700' : s.includes('rejected') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

export default ReportPage;