import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const NotificationModal = ({ isOpen, type, title, message, onClose }) => {
  if (!isOpen) return null;

  // Configuration based on your preferred UI image
  const config = {
    success: {
      label: 'Positive dialog',
      headerBg: 'bg-green-50',
      labelColor: 'text-green-600',
      icon: <CheckCircle size={44} className="text-green-500" />,
      btnBg: 'bg-[#166534]',
      actionText: 'Got it'
    },
    error: {
      label: 'Error dialog',
      headerBg: 'bg-red-50',
      labelColor: 'text-red-600',
      icon: <XCircle size={44} className="text-red-500" />,
      btnBg: 'bg-red-600',
      actionText: 'Try Again'
    }
  };

  const theme = config[type] || config.success;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className={`${theme.headerBg} px-6 py-3 flex justify-between items-center`}>
          <span className={`${theme.labelColor} text-[10px] font-bold uppercase tracking-widest`}>
            {theme.label}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 flex gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
            {theme.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 pb-8 flex justify-end gap-3">
          
          <button 
            onClick={onClose} 
            className={`${theme.btnBg} px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transform active:scale-95 transition-all`}
          >
            {theme.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;