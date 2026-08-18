import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto py-12"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">{t('about.title')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t('about.p1')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600">
            <Eye size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.vision')}</h2>
          <p className="text-gray-600 leading-relaxed">
            {t('about.p2')}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
            <Target size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.mission')}</h2>
          <p className="text-gray-600 leading-relaxed">
            Müşterilerimize ve satıcılarımıza pürüzsüz, güvenli ve yenilikçi bir teknoloji ekosistemi sunmak.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 bg-primary-600 w-32 h-32 rounded-full blur-3xl opacity-50"></div>
        <ShieldCheck size={48} className="mx-auto text-primary-400 mb-6" />
        <h3 className="text-3xl font-black mb-4">Güvenli ve Şifreli Sistem</h3>
        <p className="text-gray-400 max-w-xl mx-auto">
          Gerçek zamanlı destek sistemimiz AES-256 ile uçtan uca şifrelenmiştir. Verileriniz bizimle tamamen güvende.
        </p>
      </div>
    </motion.div>
  );
};

export default About;
