import React from 'react';
import Navbar from '../components/navbar.jsx';
import Hero from '../components/hero.jsx';
import Footer from '../components/footer.jsx';
import heroBg from '../assets/images/hero_bg.png'; 

const Landing = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans">
      
      {/* 1. THE BACKGROUND IMAGE (Deepest Layer) */}
      <div 
        className="absolute inset-0 bg-cover bg-right md:bg-center bg-no-repeat -z-20"
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>

      {/* 2. THE HORIZONTAL WHITE FADE (Middle Layer) 
          This creates the white space on the left for the text to be readable. */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent -z-10"></div>

      {/* 3. THE CONTENT */}
      <Navbar />
      
      <main className="flex-grow flex items-center px-6 md:px-20 lg:px-32">
        <Hero />
      </main>
      
      <Footer className="bg-transparent" />
    </div>
  );
};

export default Landing;