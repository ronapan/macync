import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { 
  ShieldCheck, Eye, FileText, MapPin, CheckCircle, Clock, 
  User, Phone, ArrowUpRight, History, Zap, AlertTriangle, Filter 
} from 'lucide-react';
import '../../index.css';
import API_URL from '../../api';

const MuniDashboard = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [note, setNote] = useState('');
  const [listFilter, setListFilter] = useState('pending'); // 'pending' or 'history'
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', msg: '' });
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA - Corrected logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // Ang endpoint na ito ay kukuha ng lahat ng reports na para sa municipality ng officer
      const { data } = await axios.get(`${API_URL}/records`, config);
      setReports(data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. ACTION HANDLER - Connected to the DB
  const handleMuniAction = async (id, status) => {
    if (!note || note.length < 5) {
      setModal({ show: true, type: 'error', title: 'Validation Error', msg: 'A descriptive note (min 5 chars) is required.' });
      return;
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${API_URL}/records/${id}/status`, { status, comment: note }, config);
      
      setModal({ show: true, type: 'success', title: 'Decision Logged', msg: 'The report status has been officially updated.' });
      setNote(''); setSelectedReport(null); fetchData();
    } catch (err) { 
      console.error(err);
      setModal({ show: true, type: 'error', title: 'System Error', msg: 'Failed to update record.' });
    }
  };

  // 3. FILTERED DATA - This logic runs after data is fetched from DB
  const pendingQueue = reports.filter(r => ['approved_brgy', 'escalated'].includes(r.status));
  const processedArchive = reports.filter(r => !['approved_brgy', 'escalated'].includes(r.status));

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* REMINDER STATS (Using real data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm flex items-center justify-between group">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Incoming for Review</p>
                 <h3 className="text-4xl font-black text-gray-900">{pendingQueue.length}</h3>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600"><Zap size={24}/></div>
           </div>

           <div className="bg-[#166534] p-8 rounded-[.5rem] text-white shadow-xl shadow-green-100 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-green-200 uppercase tracking-widest mb-1">Finalized Cases</p>
                 <h3 className="text-4xl font-black">{processedArchive.length}</h3>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl text-white"><ShieldCheck size={24}/></div>
           </div>

           <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">High Priority</p>
                 <h3 className="text-4xl font-black text-red-600">{pendingQueue.filter(r => r.urgencyLevel === 'Critical').length}</h3>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl text-red-600 animate-pulse"><AlertTriangle size={24}/></div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
          
          {/* LEFT SIDE: FILTERED LIST */}
          <div className="lg:col-span-4 space-y-6">
             <div className="flex bg-white p-1.5 rounded-full shadow-inner border border-gray-100">
                <button 
                  onClick={() => setListFilter('pending')}
                  className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase transition-all ${listFilter === 'pending' ? 'bg-[#166534] text-white shadow-md' : 'text-gray-400'}`}
                >
                  Action Queue ({pendingQueue.length})
                </button>
                <button 
                  onClick={() => setListFilter('history')}
                  className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase transition-all ${listFilter === 'history' ? 'bg-gray-100 text-gray-500' : 'text-gray-400'}`}
                >
                  Archive ({processedArchive.length})
                </button>
             </div>

             <div className="space-y-4 overflow-y-auto h-[calc(100vh-450px)] pr-2 no-scrollbar">
                {(listFilter === 'pending' ? pendingQueue : processedArchive).map((r) => (
                  <div key={r._id} onClick={() => setSelectedReport(r)} 
                    className={`p-6 bg-white rounded-[.5rem] border cursor-pointer transition-all relative group ${selectedReport?._id === r._id ? 'border-[#166534] shadow-lg ring-2 ring-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                    <div className="space-y-1">
                       <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Status: {r.status.replace(/_/g, ' ')}</span>
                       <h3 className="font-black text-gray-800 truncate">{r.title}</h3>
                       <div className="flex justify-between items-center pt-2">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{r.barangay}</p>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${r.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                             {r.urgencyLevel || 'Medium'}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
                {loading && <p className="text-center py-20 text-gray-300 font-bold italic">Syncing with DB...</p>}
             </div>
          </div>

          {/* RIGHT SIDE: FULL DETAILS */}
          <div className="lg:col-span-8 bg-white rounded-[.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {selectedReport ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                   
                   <div className="border-b border-gray-50 pb-8">
                      <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedReport.title}</h2>
                      <div className="flex gap-4 mt-2">
                         <span className="bg-gray-100 px-4 py-1 rounded-xl text-xs font-bold text-gray-500 flex items-center gap-2 uppercase"><Clock size={14}/> {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                         <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-xl text-xs font-bold flex items-center gap-2 uppercase"><MapPin size={14}/> {selectedReport.barangay}</span>
                      </div>
                   </div>

                   {/* BRGY VALIDATION HISTORY */}
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-4 text-gray-600 font-black uppercase text-[10px] tracking-widest">
                         <History size={16}/> Barangay Validation Record
                      </div>
                      <div className="space-y-4">
                         {selectedReport.reviewNotes?.length > 0 ? selectedReport.reviewNotes.map((note, index) => (
                           <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
                              <div className="w-1 bg-[#166534] rounded-full"></div>
                              <div>
                                 <p className="text-sm text-gray-700 font-medium italic">"{note.comment}"</p>
                                 <p className="text-[9px] text-gray-400 font-black mt-2 uppercase tracking-widest">Logged Status: {note.status.replace(/_/g, ' ')}</p>
                              </div>
                           </div>
                         )) : <p className="text-xs text-gray-400 italic">No previous validation notes.</p>}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center">
                         <FileText size={48} className="text-gray-300 mb-4"/>
                         <a href={`${API_URL.replace('/api/v1', '')}/${selectedReport.resolutionLetter}`} target="_blank" rel="noreferrer" className="text-xs font-black text-[#166534] underline uppercase tracking-widest">Open Resolution Letter</a>
                      </div>
                      {selectedReport.image && (
                         <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
                            <img src={`${API_URL.replace('/api/v1', '')}/${selectedReport.image}`} className="w-full h-full object-cover" alt="evidence"/>
                         </div>
                      )}
                   </div>
                </div>

                {/* MUNICIPAL ACTION BAR */}
                {listFilter === 'pending' ? (
                  <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
                     <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter final municipal audit notes..." className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 ring-green-100 h-24 shadow-inner" />
                     <div className="flex gap-3 justify-end">
                        <button onClick={() => handleMuniAction(selectedReport._id, 'resolved_municipal')} className="bg-[#166534] text-white px-10 py-3 rounded-xl font-black text-xs uppercase shadow-md hover:scale-105 transition-all">Final Resolve</button>
                        <button onClick={() => handleMuniAction(selectedReport._id, 'rejected_municipal')} className="bg-red-500 text-white px-10 py-3 rounded-xl font-black text-xs uppercase hover:scale-105 transition-all">Reject</button>
                        <button onClick={() => handleMuniAction(selectedReport._id, 'escalated_provincial')} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black text-xs uppercase shadow-md hover:scale-105 transition-all flex items-center gap-2">↑ Provincial</button>
                     </div>
                  </div>
                ) : (
                  <div className="p-8 bg-[#166534] text-white rounded-t-[.5rem] text-center font-black uppercase tracking-widest">
                     Registry Updated: This case is closed.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-gray-400 p-20 text-center">
                 <ShieldCheck size={80} className="mb-4" />
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Provincial Audit</h3>
                 <p className="font-bold text-sm max-w-xs">Select a verified report to perform final action.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.msg} onClose={() => setModal({ ...modal, show: false })} />
    </Sidebar>
  );
};

export default MuniDashboard;