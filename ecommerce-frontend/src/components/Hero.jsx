import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white min-h-[500px] flex items-center shadow-2xl mt-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-24 -left-24 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-10 md:px-20 relative z-10 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold text-primary-200 mb-6">
              Yeni Sezon İndirimleri Başladı!
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Teknolojiye <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
                Yön Verin.
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed">
              En son teknoloji ürünleri, eşsiz tasarımlar ve muazzam performans. Şimdi Yıldırım kalitesiyle keşfedin.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2"
              >
                Hemen Keşfet <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        <div className="w-full md:w-1/2 hidden md:block">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=1000" 
              alt="Premium Headphones" 
              className="w-full h-auto object-cover rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/10"
            />
            
            {/* Floating badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  %40
                </div>
                <div>
                  <p className="font-bold text-white leading-tight">Büyük<br/>İndirim</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
