import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebar';
import { locations } from '../../utils/location';
import { 
  Users, User, FileText, MapPin, Trash2, ShieldAlert, 
  ChevronRight, ArrowLeft, Loader2, Calendar, Phone, 
  AlertTriangle, Eye, ShieldCheck, Activity, FileDown, Clock, Shield
} from 'lucide-react';
import NotificationModal from '../../components/notificationmodal';
import '../../index.css';
import API_URL from '../api';

const AdminDashboard = () => {
  
  // 1. STATE MANAGEMENT & HOOKS
  const [activeModule, setActiveModule] = useState('reports'); 
  const [view, setView] = useState('muni'); 
  const [selection, setSelection] = useState({ municipality: '', barangay: '', level: '' });
  const [analytics, setAnalytics] = useState(null);
  const [drillCounts, setDrillCounts] = useState({}); 
  const [dataList, setDataList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  
  // 2. DATA FETCHING (API Consumption)
  
  /**
   * Fetches overall analytics and computes dynamic counts for location badges.
   * Demonstrates state optimization by computing keys dynamically.
   */
  const fetchAnalytics = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/admin/analytics`, config);
      setAnalytics(data);
      
      const counts = {};
      // Mapping reports data to dynamic keys for the drill-down view
      data.reportingStats?.forEach(item => {
        counts[`reports_muni_${item._id.municipality}`] = (counts[`reports_muni_${item._id.municipality}`] || 0) + item.total;
        counts[`reports_brgy_${item._id.barangay}`] = item.total;
        if (item._id.urgencyLevel) {
           counts[`urgency_${item._id.urgencyLevel}_muni_${item._id.municipality}`] = (counts[`urgency_${item._id.urgencyLevel}_muni_${item._id.municipality}`] || 0) + item.total;
           counts[`urgency_${item._id.urgencyLevel}_brgy_${item._id.barangay}`] = item.total;
        }
      });
      // Mapping registry data to dynamic keys
      data.userStats?.forEach(item => {
        counts[`members_muni_${item._id.municipality}`] = (counts[`members_muni_${item._id.municipality}`] || 0) + item.total;
        counts[`members_brgy_${item._id.barangay}`] = item.total;
      });
      setDrillCounts(counts);
    } catch (err) { 
      console.error("Analytics Fetch Failed:", err); 
    }
  }, []);

  /**
   * Fetches full lists based on drill-down parameters.
   * Demonstrates query parameter utilization in RESTful routing.
   */
  const fetchListData = useCallback(async () => {
    if (view !== 'list') return;
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // Constructing dynamic query strings
      let url = `http://localhost:3000/api/v1/admin/drill?type=${activeModule === 'urgency' ? 'reports' : activeModule}&municipality=${selection.municipality}&barangay=${selection.barangay}`;
      if (activeModule === 'urgency') url += `&urgencyLevel=${selection.level}`;
      
      const { data } = await axios.get(url, config);
      setDataList(data);
    } catch (err) { 
      console.error("List Fetch Failed:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [view, activeModule, selection]);

  // React Hook Lifecycle synchronization
  useEffect(() => {
    fetchAnalytics();
    fetchListData();
  }, [fetchAnalytics, fetchListData]);

  
  // 3. EVENT HANDLERS (CRUD Operations)
  
  const resetToMuni = (module) => {
    setActiveModule(module);
    setSelectedItem(null);
    setSelection({ municipality: '', barangay: '', level: '' });
    setView(module === 'urgency' ? 'urgency-select' : 'muni');
  };

  /**
   * Deletes a record or a user from the database.
   * Demonstrates strict compliance with the DELETE operation in CRUD.
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Confirm permanent removal?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // Dynamic endpoint selection based on the active module
      const endpoint = activeModule === 'members' ? `http://localhost:3000/api/v1/admin/users/${id}` : `http://localhost:3000/api/v1/records/${id}`;
      
      await axios.delete(endpoint, config);
      
      setModal({ show: true, type: 'success', title: 'Registry Updated', message: 'Data deleted' });
      setSelectedItem(null); 
      setView('list'); 
      fetchAnalytics(); 
      fetchListData();
    } catch (err) {
      setModal({ show: true, type: 'error', title: 'Auth Error', message: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl overflow-hidden mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white p-8  bg-gradient-to-r from-[#166534] to-[#507d02] rounded-[.5rem] shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter ">Executive Command</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[3px] text-[9px] mt-1">Provincial Data Integration</p>
          </div>
          <button className="p-4 bg-gray-50 rounded-[.5rem] text-green-700 border border-green-100 shadow-sm"><FileDown size={20}/></button>
        </header>

        {/* TABS */}
        <div className="flex flex-wrap  gap-6 items-center">
           <TabButton label="Reports" active={activeModule === 'reports'} onClick={() => resetToMuni('reports')} count={analytics?.stats?.totalReports} badgeColor="bg-orange-500" icon={<FileText size={18}/>} />
           <TabButton label="Registry" active={activeModule === 'members'} onClick={() => resetToMuni('members')} count={analytics?.stats?.totalRegistry} badgeColor="bg-blue-500" icon={<Users size={18}/>} />
           <TabButton label="Urgency" active={activeModule === 'urgency'} onClick={() => resetToMuni('urgency')} />
        </div>

        {/* BREADCRUMBS */}
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-white w-fit px-8 py-3 rounded-full border border-gray-100 shadow-sm uppercase tracking-widest">
           <button onClick={() => setView(activeModule === 'urgency' ? 'urgency-select' : 'muni')} className="hover:text-green-700">MARINDUQUE</button>
           {selection.level && <><ChevronRight size={12}/> <span className="text-red-600">{selection.level}</span></>}
           {selection.municipality && <><ChevronRight size={12}/> <button onClick={() => setView('brgy')} className="hover:text-green-700">{selection.municipality}</button></>}
           {selection.barangay && <><ChevronRight size={12}/> <span className="text-[#166534]">{selection.barangay}</span></>}
        </div>

        <div className="min-h-[500px]">
          
          {/* 1. DETAIL VIEW (OVERRIDE) */}
          {view === 'details' && selectedItem ? (
            <div className="animate-in slide-in-from-right-10 duration-500">
               <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase mb-8 hover:text-[#166534] tracking-widest"><ArrowLeft size={14}/> Close File</button>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 bg-white p-12 rounded-[.5rem] shadow-sm border border-gray-100 space-y-12">
                     <div className="border-b border-gray-50 pb-10 flex justify-between items-start">
                        <div>
                           <p className="text-green-600 font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2 font-black"><ShieldCheck size={12}/> Verified Entry</p>
                           <h2 className="text-2xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">{selectedItem.title || selectedItem.name}</h2>
                           <div className="flex flex-wrap gap-4">
                              <span className="bg-gray-50 text-gray-500 px-5 py-2 rounded-[.5rem] text-[10px] font-black uppercase flex items-center gap-2 border border-gray-100"><Clock size={12}/> {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                              <span className="bg-blue-50 text-blue-700 px-5 py-2 rounded-[.5rem] text-[10px] font-black uppercase flex items-center gap-2 border border-blue-100"><MapPin size={12}/> {selectedItem.barangay || selectedItem.municipality}</span>
                              {selectedItem.urgencyLevel && <span className="bg-red-50 text-red-600 px-5 py-2 rounded-[.5rem] text-[10px] font-black uppercase border border-red-100 animate-pulse">! {selectedItem.urgencyLevel}</span>}
                           </div>
                        </div>
                        <button onClick={() => handleDelete(selectedItem._id)} className="p-5 bg-red-50 text-red-500 rounded-[.5rem] hover:bg-red-500 hover:text-white transition-all"><Trash2 size={28}/></button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="p-8 bg-gray-50 rounded-[.5rem] space-y-5 border border-gray-100">
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporter Profile</h4>
                           <p className="text-base font-bold text-gray-800 flex items-center gap-3"><User className="text-green-600" size={18}/> {selectedItem.createdBy?.name || selectedItem.reporter?.name || selectedItem.name}</p>
                           <p className="text-base font-bold text-gray-700 flex items-center gap-3"><Phone className="text-green-600" size={18}/> {selectedItem.reporter?.contactNumber || selectedItem.email}</p>
                        </div>
                        <div className="p-8 bg-[#166534] rounded-[.5rem] text-white shadow-2xl">
                           <p className="font-black text-[20px] uppercase tracking-tighter">{selectedItem.mainCategory || selectedItem.role}</p>
                           <p className="text-[15px] opacity-70 mt-1 italic uppercase font-bold">{selectedItem.subCategory || "Provincial Database"}</p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-[#166534] p-10 rounded-[.5rem] text-white shadow-2xl h-fit">
                     <h3 className="text-xl font-black mb-10 flex items-center gap-3 border-b border-white/10 pb-6"><Activity className="text-[#bef264]" size={15}/> PROCESS HISTORY</h3>
                     <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:w-0.5 before:bg-white/10 h-full">
                        {selectedItem.reviewNotes?.length > 0 ? selectedItem.reviewNotes.map((note, i) => (
                           <div key={i} className="relative pl-12"><div className="absolute left-3 w-4 h-4 bg-[#bef264] rounded-full border-4 border-[#166534]"></div><p className="text-[11px] font-black italic text-green-100">" {note.comment} "</p><p className="text-[9px] font-black uppercase text-white/40 mt-3">{note.status} • {new Date(note.date).toLocaleDateString()}</p></div>
                        )) : <div className="text-center py-10 opacity-30 italic">No Logs recorded.</div>}
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            /* 2. NAVIGATION VIEWS */
            <>
              {view === 'urgency-select' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
                  {['Critical', 'High', 'Medium', 'Low'].map(lvl => (
                    <div key={lvl} onClick={() => {setSelection({...selection, level: lvl}); setView('muni');}}
                        className="bg-white p-12 rounded-[.5rem] border border-gray-100 hover:border-red-500 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-center relative overflow-hidden">
                        <AlertTriangle size={40} className={`mx-auto mb-4 ${lvl === 'Critical' ? 'text-red-800 animate-pulse' : 'text-orange-500 group-hover:text-black'}`}/>
                        <h3 className="text-xl font-black text-black">{lvl}</h3>
                        <div className="absolute top-4 right-6 text-3xl font-black text-black group-hover:text-red-50">{analytics?.urgencyStats?.find(u => u._id === lvl)?.count || 0}</div>
                    </div>
                  ))}
                </div>
              )}

              {view === 'muni' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                  {Object.keys(locations).map(muni => {
                    const badgeKey = activeModule === 'urgency' ? `urgency_${selection.level}_muni_${muni}` : `${activeModule}_muni_${muni}`;
                    const count = drillCounts[badgeKey] || 0;
                    return (
                      <div key={muni} onClick={() => {setSelection({...selection, municipality: muni}); setView('brgy');}}
                        className="bg-white p-10 rounded-[.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-green-300 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden">
                         <div><h3 className="text-2xl font-black text-gray-800">{muni}</h3><p className="text-[10px] font-bold text-green-600 uppercase mt-1">Registry: {count} Items</p></div>
                         <div className="p-4 bg-gray-50 rounded-[.5rem] group-hover:bg-green-100 text-gray-300 group-hover:text-green-600 transition-colors"><MapPin size={24}/></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'brgy' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-right-4">
                  {locations[selection.municipality].map(brgy => {
                    const badgeKey = activeModule === 'urgency' ? `urgency_${selection.level}_brgy_${brgy}` : `${activeModule}_brgy_${brgy}`;
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
                   {loading ? <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest">SYNCHRONIZING...</div> : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[2px]"><tr className="border-b"><th className="p-8">Subject Identity</th><th className="p-8">Status/Role</th><th className="p-8 text-right">Actions</th></tr></thead>
                           <tbody className="divide-y divide-gray-50">
                              {dataList.map((item, index) => (
                                <tr key={item._id} className="hover:bg-green-50/40 transition-all">
                                   <td className="p-8 flex items-center gap-5"><span className="text-gray-200 font-black italic text-2xl">{index + 1}</span><div><p className="font-black text-gray-800 text-lg leading-none mb-1">{item.title || item.name}</p><p className="text-[10px] font-bold text-gray-400 uppercase">{item.email || item.mainCategory}</p></div></td>
                                   <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${item.status ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{item.status || item.role}</span></td>
                                   <td className="p-8 text-right flex justify-end gap-3">
                                      <button onClick={() => {setSelectedItem(item); setView('details');}} className="p-4 bg-[#166534] text-white rounded-2xl hover:scale-110 shadow-md"><Eye size={18}/></button>
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