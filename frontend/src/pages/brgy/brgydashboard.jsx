import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { 
  ClipboardList, CheckCircle, Eye, User, Phone, 
  MapPin, Calendar, FileText, ImageIcon, 
  AlertTriangle, XCircle, ArrowUpRight, Zap, Clock, ShieldCheck 
} from 'lucide-react';
import API_URL from '../../api';

const BrgyDashboard = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [note, setNote] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  
  // 🔥 Bagong State para sa Filtering
  const [listFilter, setListFilter] = useState('pending'); // 'pending' or 'history'
  
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', msg: '' });
  const [ setLoading] = useState(true);

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
      setModal({ show: true, type: 'error', title: 'Action Denied', msg: 'Please provide feedback (min 5 chars).' });
      return;
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${API_URL}/records/${reportId}/status`, 
        { status: newStatus, comment: note, urgencyLevel: urgency }, config
      );
      setModal({ show: true, type: 'success', title: 'Success', msg: `Report is now ${newStatus.replace(/_/g, ' ')}.` });
      setNote(''); setSelectedReport(null); fetchData();
    } catch (err) {
      setModal({ show: true, type: 'error', title: 'Update Failed', msg: err.response?.data?.message });
    }
  };

  // 🔥 Logic para sa Time Constraint (Reminder)
  const pendingReports = reports.filter(r => r.status === 'pending');
  const historyReports = reports.filter(r => r.status !== 'pending');

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* 1. REMINDER STATS (Actionable Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Needs Attention</p>
                 <h3 className="text-4xl font-black text-gray-900">{pendingReports.length}</h3>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                 <Zap size={24} fill="currentColor"/>
              </div>
           </div>

           <div className="bg-[#166534] p-8 rounded-[.5rem] text-white shadow-xl shadow-green-100 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-green-200 uppercase tracking-widest mb-1">Total Validated</p>
                 <h3 className="text-4xl font-black">{historyReports.length}</h3>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                 <ShieldCheck size={24}/>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Critical Response</p>
                 <h3 className="text-4xl font-black text-red-600">
                    {pendingReports.filter(r => r.urgencyLevel === 'Critical').length}
                 </h3>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl text-red-600 animate-pulse">
                 <AlertTriangle size={24}/>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 2. FILTERED LIST SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex bg-white p-1.5 rounded-full shadow-inner border border-gray-100">
               <button 
                onClick={() => setListFilter('pending')}
                className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase transition-all ${listFilter === 'pending' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400'}`}
               >
                 Pending ({pendingReports.length})
               </button>
               <button 
                onClick={() => setListFilter('history')}
                className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase transition-all ${listFilter === 'history' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400'}`}
               >
                 History ({historyReports.length})
               </button>
            </div>

            <div className="space-y-4 overflow-y-auto h-[calc(100vh-450px)] pr-2 no-scrollbar">
              {(listFilter === 'pending' ? pendingReports : historyReports).map((report) => (
                <div key={report._id} onClick={() => setSelectedReport(report)}
                  className={`p-6 bg-white rounded-[.5rem] border transition-all cursor-pointer relative group ${selectedReport?._id === report._id ? 'border-[#166534] shadow-lg ring-2 ring-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                   
                   {/* Time Indicator for Pending */}
                   {listFilter === 'pending' && (
                     <div className="absolute top-4 right-6 flex items-center gap-1 text-[8px] font-black text-orange-500 uppercase">
                        <Clock size={10}/> New Entry
                     </div>
                   )}

                   <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">{report.mainCategory}</span>
                      <h3 className="font-black text-gray-900 leading-tight group-hover:text-[#166534] truncate">{report.title}</h3>
                      <div className="flex justify-between items-center pt-2">
                         <p className="text-[10px] text-gray-400 font-bold uppercase">{report.barangay}</p>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${listFilter === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {report.status}
                         </span>
                      </div>
                   </div>
                </div>
              ))}
              {(listFilter === 'pending' ? pendingReports : historyReports).length === 0 && (
                <div className="text-center py-20 opacity-20 italic">No records to display.</div>
              )}
            </div>
          </div>

          {/* 3. DETAIL VIEW (Same logic as before but with UI enhancements) */}
          <div className="lg:col-span-8 bg-white rounded-[.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)]">
            {selectedReport ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  <div className="border-b border-gray-50 pb-8">
                     <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedReport.title}</h2>
                     <p className="text-[10px] font-black text-green-600 uppercase tracking-[3px] mt-2 italic">Ref ID: {selectedReport._id.slice(-6).toUpperCase()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="p-6 bg-gray-50 rounded-[.5rem] space-y-4 border border-gray-100 shadow-inner">
                        <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Reporter Identification</h4>
                        <p className="font-bold flex items-center gap-3 text-gray-800"><User size={18} className="text-green-600"/> {selectedReport.reporter?.name}</p>
                        <p className="text-sm font-bold flex items-center gap-3 text-gray-500"><Phone size={16} className="text-green-600"/> {selectedReport.reporter?.contactNumber}</p>
                     </div>
                     <div className="p-8 bg-[#166534] rounded-[.5rem] text-white shadow-xl flex flex-col justify-center">
                        <p className="text-[10px] opacity-60 font-black uppercase mb-1">Assigned Urgency</p>
                        <p className="text-2xl font-black tracking-tighter">{selectedReport.urgencyLevel || 'Not Set'}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Stored Documentation</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <a href={`http://localhost:3000/${selectedReport.resolutionLetter}`} target="_blank" rel="noreferrer" className="p-8 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center hover:border-green-500 transition-all bg-gray-50 group hover:bg-white">
                          <FileText size={32} className="text-gray-300 group-hover:text-green-600 mb-2"/>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">View Resolution</span>
                       </a>
                       {selectedReport.image && <div className="rounded-[.5rem] overflow-hidden border-4 border-white shadow-lg h-32"><img src={`http://localhost:3000/${selectedReport.image}`} className="w-full h-full object-cover" alt="evidence"/></div>}
                    </div>
                  </div>
                </div>

                {/* DYNAMIC ACTION BAR (Visible only in Pending tab) */}
                <div className="p-8 bg-gray-50 border-t flex flex-col gap-4">
                   <div className="flex gap-4">
                      <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="bg-white border-2 border-green-100 rounded-xl px-4 py-2 text-xs font-black text-[#166534] outline-none shadow-sm focus:border-[#166534]">
                         <option value="Low">Low</option>
                         <option value="Medium">Medium</option>
                         <option value="High">High</option>
                         <option value="Critical">Critical</option>
                      </select>
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type official validation note..." className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 ring-green-100 h-16 shadow-inner" />
                   </div>
                   <div className="flex gap-3 justify-end">
                      <button onClick={() => handleUpdateStatus(selectedReport._id, 'resolved_brgy')} className="bg-[#166534] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">Resolve</button>
                      <button onClick={() => handleUpdateStatus(selectedReport._id, 'rejected_brgy')} className="bg-red-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">Reject</button>
                      <button onClick={() => handleUpdateStatus(selectedReport._id, 'escalated')} className="bg-[#bef264] text-[#166534] px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg flex items-center gap-2 hover:bg-white">Escalate <ArrowUpRight size={14}/></button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-gray-400 p-20 text-center">
                 <ClipboardList size={100} strokeWidth={1} />
                 <h3 className="text-2xl font-black uppercase mt-4">Case Registry</h3>
                 <p className="font-bold text-sm">Select an environmental report to start the audit process.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.msg} onClose={() => setModal({ ...modal, show: false })} />
    </Sidebar>
  );
};

export default BrgyDashboard;