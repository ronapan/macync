import React from 'react';
import logo from '../assets/images/logo.png'; 

const Hero = () => {
  return (
    /* Base Font: Open Sans */
    <div className="max-w-2xl animate-fade-in font-['Open_Sans']">
      <div className="flex items-center gap-4 mb-6">
        <img src={logo} alt="MaCEC Logo" className="w-20 h-20 md:w-28 md:h-28 object-contain" />
        
        {/* Header Font: Poppins */}
        <h1 className="text-6xl md:text-8xl font-bold drop-shadow-md font-['Poppins'] tracking-tight">
          <span className="text-[#166534]">Ma</span>
          <span className="text-green-600">Cync</span>
        </h1>
      </div>

      {/* Subheader Font: Poppins */}
      <h2 className="text-[20px] font-bold text-[#166534] leading-tight mb-8 font-['Poppins']">
        A Centralized Environmental Records and Reporting Database System for the Marinduque Council for Environmental Concerns
      </h2>

      {/* Body Font: Open Sans */}
      <p className="text-[16px] text-[#166534] font-semibold leading-relaxed mb-10">
        MaCEC is a church-based and multi-sectoral NGO under the Diocese of Boac, 
        committed to empowering communities toward sustainable development.
      </p>

      <div className="flex gap-4">
        {/* Buttons usually look better with the Header font for extra punch */}
        <button className="bg-[#166534] text-[16px] text-white px-10 py-3 rounded-xl  text-xl shadow-lg hover:bg-black transition-all font-['Poppins']">
          Join Us
        </button>
        <button className="border-2 text-[16px] border-[#166534] text-[#166534] px-10 py-3 rounded-xl  text-xl hover:bg-[#166534] hover:text-white transition-all font-['Poppins']">
          Read More
        </button>
      </div>
    </div>
  );
};

export default Hero;