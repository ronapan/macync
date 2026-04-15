import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import { locations } from '../../utils/location';
import { 
  Users, User, FileText, MapPin, Trash2, ShieldAlert, 
  ChevronRight, ArrowLeft, Loader2, Calendar, Phone, 
  AlertTriangle, Eye, ShieldCheck, Activity, FileDown, Clock, Shield, Zap
} from 'lucide-react';
import NotificationModal from '../../components/notificationmodal';
import API_URL from '../../api';
import '../../index.css';

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('reports'); 
  const [view, setView] = useState('muni'); 
  const [selection, setSelection] = useState({ municipality: '', barangay: '', level: '' });
  const [analytics, setAnalytics] = useState(null);
  const [drillCounts, setDrillCounts] = useState({}); 
  const [dataList, setDataList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 1. FETCH OVERALL ANALYTICS (Mapping DB data to UI Badges)
  const fetchAnalytics = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/admin/analytics`, config);
      setAnalytics(data);
      
      const counts = {};
      // Processing Reports & Action Queue Badges
      data.reportingStats?.forEach(item => {
        const { municipality: m, barangay: b, urgencyLevel: u } = item._id;
        
        // Reports Logic
        counts[`reports_muni_${m}`] = (counts[`reports_muni_${m}`] || 0) + item.total;
        counts[`reports_brgy_${b}`] = item.total;
        
        // Action Queue Logic (Pending only)
        counts[`pending_muni_${m}`] = (counts[`pending_muni_${m}`] || 0) + item.pending;
        counts[`pending_brgy_${b}`] = item.pending;

        // Urgency Logic
        if (u) {
           counts[`urgency_${u}_muni_${m}`] = (counts[`urgency_${u}_muni_${m}`] || 0) + item.total;
           counts[`urgency_${u}_brgy_${b}`] = item.total;
        }
      });

      // Processing Membership Registry Badges
      data.userStats?.forEach(item => {
        counts[`members_muni_${item._id.municipality}`] = (counts[`members_muni_${item._id.municipality}`] || 0) + item.total;
        counts[`members_brgy_${item._id.barangay}`] = item.total;
      });

      setDrillCounts(counts);
    } catch (err) { console.error("Database Connection Failed", err); }
  }, []);

  // 2. FETCH DRILL-DOWN DATA (Retrieve detailed records)
  const fetchListData = useCallback(async () => {
    if (view !== 'list') return;
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      let url = `${API_URL}/admin/drill?type=${activeModule === 'members' ? 'members' : 'reports'}&municipality=${selection.municipality}&barangay=${selection.barangay}`;
      if (activeModule === 'urgency') url += `&urgencyLevel=${selection.level}`;
      if (activeModule === 'pending') url += `&status=pending`;

      const { data } = await axios.get(url, config);
      setDataList(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [view, activeModule, selection]);

  useEffect(() => {
    fetchAnalytics();
    fetchListData();
  }, [fetchAnalytics, fetchListData]);

  // 3. DELETE HANDLER (CRUD Implementation)
  const handleDelete = async (id) => {
    if (!window.confirm("Purge record from Provincial Database?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const endpoint = activeModule === 'members' ? `${API_URL}/admin/users/${id}` : `${API_URL}/records/${id}`;
      
      await axios.delete(endpoint, config);
      setModal({ show: true, type: 'success', title: 'Purge Successful', message: 'The record has been permanently removed.' });
      setSelectedItem(null); setView('muni'); fetchAnalytics();
    } catch (err) {
      setModal({ show: true, type: 'error', title: 'System Denied', message: err.response?.data?.message || 'Database error.' });
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white p-10 rounded-[.5rem] shadow-sm border border-gray-100">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Executive Command</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[3px] text-[9px] mt-2 italic">Data Retrieval Mode: ACTIVE</p>
          </div>
          <button className="p-4 bg-gray-50 rounded-2xl text-green-700 hover:bg-green-50 border border-green-100"><FileDown size={20}/></button>
        </header>

        {/* 2. TAB SWITCHER WITH LIVE COUNTS (Factual Data) */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-2 rounded-[.5rem] w-fit shadow-sm border border-gray-100">
           <TabButton label="Registry" active={activeModule === 'reports'} onClick={() => {setActiveModule('reports'); setView('muni'); setSelectedItem(null);}} count={analytics?.stats?.totalReports} badgeColor="bg-gray-400" icon={<FileText size={16}/>} />
           <TabButton label="Action Queue" active={activeModule === 'pending'} onClick={() => {setActiveModule('pending'); setView('muni'); setSelectedItem(null);}} count={analytics?.stats?.pendingCount} badgeColor="bg-orange-500 animate-pulse" icon={<Zap size={16} fill="currentColor"/>} />
           <TabButton label="Membership" active={activeModule === 'members'} onClick={() => {setActiveModule('members'); setView('muni'); setSelectedItem(null);}} count={analytics?.stats?.totalRegistry} badgeColor="bg-blue-500" icon={<Users size={16}/>} />
           <TabButton label="Urgency" active={activeModule === 'urgency'} onClick={() => {setActiveModule('urgency'); setView('urgency-select'); setSelectedItem(null);}} count={analytics?.urgencyStats?.find(u => u._id === 'Critical')?.count} badgeColor="bg-red-600 animate-pulse" icon={<ShieldAlert size={16}/>} />
        </div>

        {/* 3. DYNAMIC VIEWS */}
        <div className="min-h-[500px]">
          
          {/* DETAIL VIEW (FOLDER) */}
          {view === 'details' && selectedItem ? (
            <div className="animate-in slide-in-from-right-10 duration-500">
               <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase mb-8 hover:text-[#166534] tracking-widest"><ArrowLeft size={14}/> Return to list</button>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Left Side Details */}
                  <div className="lg:col-span-2 bg-white p-12 rounded-[.5rem] shadow-sm border border-gray-100 space-y-12">
                     <div className="border-b border-gray-50 pb-10 flex justify-between items-start">
                        <div>
                           <p className="text-green-600 font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={12}/> Verified Central Entry</p>
                           <h2 className="text-5xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">{selectedItem.title || selectedItem.name}</h2>
                           <div className="flex gap-4">
                              <span className="bg-gray-50 text-gray-500 px-5 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-gray-100"><Clock size={12}/> {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                              <span className="bg-blue-50 text-blue-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-blue-100"><MapPin size={12}/> {selectedItem.barangay || selectedItem.municipality}</span>
                              {selectedItem.urgencyLevel && <span className="bg-red-50 text-red-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase border border-red-100 animate-pulse">! {selectedItem.urgencyLevel}</span>}
                           </div>
                        </div>
                        <button onClick={() => handleDelete(selectedItem._id)} className="p-5 bg-red-50 text-red-500 rounded-[.5rem] hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={28}/></button>
                     </div>
                     <div className="grid grid-cols-2 gap-10">
                        <div className="p-8 bg-gray-50 rounded-[.5rem] space-y-5 border border-gray-100">
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporter Identification</h4>
                           <p className="font-bold text-gray-800 flex items-center gap-3"><User className="text-green-600" size={18}/> {selectedItem.createdBy?.name || selectedItem.reporter?.name || selectedItem.name}</p>
                           <p className="font-bold text-gray-800 flex items-center gap-3"><Phone className="text-green-600" size={18}/> {selectedItem.reporter?.contactNumber || selectedItem.email}</p>
                        </div>
                        <div className="p-8 bg-[#166534] rounded-[.5rem] text-white shadow-2xl">
                           <h4 className="text-[10px] opacity-60 font-black uppercase tracking-widest">Database Classification</h4>
                           <p className="font-black text-2xl uppercase mt-2 tracking-tighter">{selectedItem.mainCategory || selectedItem.role}</p>
                           <p className="text-[10px] opacity-70 mt-1 italic font-bold">{selectedItem.subCategory || "MaCync Official Record"}</p>
                        </div>
                     </div>
                  </div>
                  {/* Right Side Timeline */}
                  <div className="bg-[#166534] p-10 rounded-[.5rem] text-white shadow-2xl h-fit">
                     <h3 className="text-xl font-black mb-10 flex items-center gap-3 border-b border-white/10 pb-6 uppercase tracking-widest"><Activity className="text-[#bef264]" size={24}/> AUDIT TRAIL</h3>
                     <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        {selectedItem.reviewNotes?.length > 0 ? selectedItem.reviewNotes.map((note, i) => (
                           <div key={i} className="relative pl-12">
                              <div className="absolute left-3 w-4 h-4 bg-[#bef264] rounded-full border-4 border-[#166534] shadow-[0_0_15px_#bef264]"></div>
                              <p className="text-[11px] font-black italic text-green-100">" {note.comment} "</p>
                              <p className="text-[9px] font-black uppercase text-white/40 mt-3">{note.status} • {new Date(note.date).toLocaleDateString()}</p>
                           </div>
                        )) : <div className="text-center py-10 opacity-30 italic font-black text-xs">Awaiting Validation...</div>}
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            /* NAVIGATION SCREENS (Muni, Brgy, List) */
            <>
              {view === 'urgency-select' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
                  {['Critical', 'High', 'Medium', 'Low'].map(lvl => (
                    <div key={lvl} onClick={() => {setSelection({...selection, level: lvl}); setView('muni');}}
                        className={`bg-white p-12 rounded-[.5rem] border-4 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-center relative overflow-hidden ${lvl === 'Critical' ? 'border-red-50 hover:border-red-500' : 'border-transparent hover:border-black'}`}>
                        <AlertTriangle size={40} className={`mx-auto mb-4 ${lvl === 'Critical' ? 'text-red-600 animate-pulse' : 'text-gray-300 group-hover:text-gray-900'}`}/>
                        <h3 className="text-2xl font-black text-gray-800">{lvl}</h3>
                        <div className="absolute top-4 right-6 text-3xl font-black text-gray-100 group-hover:text-red-50">{analytics?.urgencyStats?.find(u => u._id === lvl)?.count || 0}</div>
                    </div>
                  ))}
                </div>
              )}

              {view === 'muni' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                  {Object.keys(locations).map(muni => {
                    // Smart Badge Context
                    const badgeKey = activeModule === 'urgency' ? `urgency_${selection.level}_muni_${muni}` : 
                                   activeModule === 'pending' ? `pending_muni_${muni}` : `${activeModule}_muni_${muni}`;
                    const count = drillCounts[badgeKey] || 0;
                    return (
                      <div key={muni} onClick={() => {setSelection({...selection, municipality: muni}); setView('brgy');}}
                        className="bg-white p-10 rounded-[.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-green-300 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden text-center">
                         <div><h3 className="text-2xl font-black text-gray-800">{muni}</h3><p className="text-[10px] font-bold text-green-600 uppercase mt-1">Registry: {count} Items</p></div>
                         <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-green-100 text-gray-300 group-hover:text-green-600 transition-colors"><MapPin size={24}/></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'brgy' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-right-4">
                  {locations[selection.municipality].map(brgy => {
                    const badgeKey = activeModule === 'urgency' ? `urgency_${selection.level}_brgy_${brgy}` : 
                                   activeModule === 'pending' ? `pending_brgy_${brgy}` : `${activeModule}_brgy_${brgy}`;
                    const count = drillCounts[badgeKey] || 0;
                    return (
                      <div key={brgy} onClick={() => {setSelection({...selection, barangay: brgy}); setView('list');}}
                        className="bg-white p-8 rounded-[.5rem] border border-gray-100 hover:shadow-lg hover:border-green-300 cursor-pointer transition-all text-center relative group">
                        <p className="font-black text-gray-800 uppercase tracking-tighter text-lg">{brgy}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{count} items</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'list' && (
                <div className="bg-white rounded-[.5rem] shadow-sm border border-gray-100 overflow-hidden">
                   {loading ? <div className="p-20 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest">SYNCHRONIZING WITH DATABASE...</div> : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[2px]"><tr className="border-b border-gray-100"><th className="p-8">Identity</th><th className="p-8">Status/Role</th><th className="p-8 text-right">Actions</th></tr></thead>
                           <tbody className="divide-y divide-gray-50">
                              {dataList.map((item, index) => (
                                <tr key={item._id} className="hover:bg-green-50/40 transition-all">
                                   <td className="p-8 flex items-center gap-5"><span className="text-gray-200 font-black italic text-2xl">{index + 1}</span><div><p className="font-black text-gray-800 text-lg leading-none mb-1">{item.title || item.name}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.email || item.mainCategory}</p></div></td>
                                   <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${item.status ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{item.status || item.role}</span></td>
                                   <td className="p-8 text-right flex justify-end gap-3">
                                      <button onClick={() => {setSelectedItem(item); setView('details');}} className="p-4 bg-[#166534] text-white rounded-2xl hover:scale-110 shadow-md transition-all"><Eye size={18}/></button>
                                      <button onClick={() => handleDelete(item._id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                   )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <NotificationModal isOpen={modal.show} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({...modal, show: false})} />
    </Sidebar>
  );
};

// COMPONENT HELPERS
const TabButton = ({ label, active, onClick, count, badgeColor, icon }) => (
  <button onClick={onClick} className={`relative flex items-center gap-4 px-10 py-5 rounded-[.5rem] font-black text-[11px] uppercase transition-all duration-300 hover:translate-y-[-2px] ${active ? 'bg-[#166534] text-white shadow-2xl scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}>
    {icon} {label}
    {count !== undefined && count > 0 && (
      <span className={`absolute -top-3 -right-3 ${badgeColor} text-white text-[10px] min-w-[24px] h-6 px-2 flex items-center justify-center rounded-full border-4 border-[#F8F9FA] shadow-xl font-black`}>{count}</span>
    )}
  </button>
);

export default AdminDashboard;