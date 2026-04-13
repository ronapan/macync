import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import NotificationModal from '../../components/notificationmodal';
import { ShieldCheck, Eye, FileText, MapPin, CheckCircle, Clock, User, Phone, ArrowUpRight, History } from 'lucide-react';
import '../../index.css';

const MuniDashboard = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [note, setNote] = useState('');
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', msg: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:3000/api/v1/records', config);
      setReports(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMuniAction = async (id, status) => {
    if (!note || note.length < 5) {
      setModal({ show: true, type: 'error', title: 'Note Required', msg: 'Please provide final review notes (min 5 chars).' });
      return;
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:3000/api/v1/records/${id}/status`, { status, comment: note }, config);
      setModal({ show: true, type: 'success', title: 'Action Saved', msg: 'Municipal action has been logged.' });
      setNote(''); setSelectedReport(null); fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-black text-[#166534] mb-2 tracking-tighter">Municipal Portal</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">MaCEC Provincial Coordination</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
          
          {/* LEFT: VALIDATED LIST */}
          <div className="lg:col-span-4 space-y-4  no-scrollbar pr-0">
            <h2 className="text-xl font-black text-gray-800 px-2 flex justify-between">Verified Reports <span>{reports.length}</span></h2>
            {loading ? <p className="p-10 text-center animate-pulse">Syncing...</p> : reports.map((r) => (
              <div key={r._id} onClick={() => setSelectedReport(r)} 
                className={`p-6 bg-white rounded-[.5rem] border cursor-pointer transition-all ${selectedReport?._id === r._id ? 'border-[#166534] shadow-lg scale-[1.02]' : 'border-gray-100 shadow-sm hover:border-green-300'}`}>
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{r.status.replace(/_/g, ' ')}</span>
                </div>
                <h3 className="font-black text-gray-800 truncate">{r.title}</h3>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-bold"><MapPin size={10} className="text-green-600"/> {r.barangay}</p>
              </div>
            ))}
          </div>

          {/* RIGHT: FULL DETAIL VIEW */}
          <div className="lg:col-span-8 bg-white rounded-[.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {selectedReport ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                   
                   {/* 1. HEADER */}
                   <div className="border-b border-gray-50 pb-8 flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">{selectedReport.title}</h2>
                        <div className="flex gap-4">
                           <span className="bg-gray-100 px-4 py-1 rounded-[.5rem] text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-tighter"><Clock size={14}/> {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                           <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-[.5rem] text-xs font-bold flex items-center gap-2 uppercase tracking-tighter"><MapPin size={14}/> {selectedReport.barangay}</span>
                        </div>
                      </div>
                   </div>

                   {/* 2. BRGY VALIDATION HISTORY */}
                   <div className="bg-blue-50 p-6 rounded-[.5rem] border border-blue-100">
                      <div className="flex items-center gap-2 mb-4 text-blue-600 font-black uppercase text-[10px] tracking-widest">
                         <History size={16}/> Barangay Validation History
                      </div>
                      <div className="space-y-4">
                         {selectedReport.reviewNotes?.map((note, index) => (
                           <div key={index} className="flex gap-4 p-4 bg-white/50 rounded-2xl">
                              <div className="w-1 bg-blue-300 rounded-[.5rem]"></div>
                              <div>
                                 <p className="text-sm text-blue-900 italic font-medium">"{note.comment}"</p>
                                 <p className="text-[10px] text-blue-400 font-bold mt-2 uppercase">Processed as: {note.status.replace(/_/g, ' ')}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* 3. CASE FOLDER (Evidence) */}
                   <div className="grid grid-cols-2 gap-8">
                      <div className="bg-gray-50 p-8 rounded-[.5rem] flex flex-col items-center">
                         <FileText size={48} className="text-gray-300 mb-4"/>
                         <a href={`http://localhost:3000/${selectedReport.resolutionLetter}`} target="_blank" className="text-xs font-black text-[#166534] underline uppercase tracking-widest">View Resolution Letter</a>
                      </div>
                      {selectedReport.image && (
                         <div className="rounded-[.5rem] overflow-hidden shadow-md border border-gray-100">
                            <img src={`http://localhost:3000/${selectedReport.image}`} className="w-full h-full object-cover" />
                         </div>
                      )}
                   </div>
                </div>

                {/* 4. MUNICIPAL ACTION BAR */}
                <div className="p-8 bg-gray-50 border-t flex flex-col gap-4">
                   <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter final municipal-level notes for provincial record..." className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 ring-green-100 h-24 shadow-inner" />
                   <div className="flex gap-3 justify-end">
                      {/* BUTTONS: SOLVED, REJECT, ESCALATE */}
                      <button onClick={() => handleMuniAction(selectedReport._id, 'resolved_municipal')} className="bg-[#166534] text-white px-10 py-3 rounded-[.5rem] font-black text-xs uppercase shadow-md hover:scale-105 transition-all">Solve</button>
                      <button onClick={() => handleMuniAction(selectedReport._id, 'rejected_municipal')} className="bg-red-500 text-white px-10 py-3 rounded-[.5rem] font-black text-xs uppercase hover:scale-105 transition-all">Reject</button>
                      <button onClick={() => handleMuniAction(selectedReport._id, 'escalated_provincial')} className="bg-blue-600 text-white px-10 py-3 rounded-[.5rem] font-black text-xs uppercase shadow-md hover:scale-105 transition-all flex items-center gap-2">↑ Provincial</button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-gray-400 p-20 text-center">
                 <ShieldCheck size={80} className="mb-4" />
                 <h3 className="text-2xl font-black uppercase">Final Validation</h3>
                 <p className="font-bold text-sm max-w-xs">Select a report to finalize status or escalate to Provincial Board.</p>
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