import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-gray-900">{question}</span>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-5 text-gray-600 leading-relaxed"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
      className="max-w-3xl mx-auto py-12"
    >
      <div className="text-center mb-12">
        <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
          <MessageCircleQuestion size={40} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">{t('faq.title')}</h1>
        <p className="text-lg text-gray-500">Alışveriş sürecinizle ilgili en çok merak edilenleri aşağıda derledik.</p>
      </div>

      <div className="space-y-4">
        <FaqItem question={t('faq.q1')} answer={t('faq.a1')} />
        <FaqItem question={t('faq.q2')} answer={t('faq.a2')} />
        <FaqItem question={t('faq.q3')} answer={t('faq.a3')} />
      </div>
      
      <div className="mt-12 bg-gray-50 p-8 rounded-3xl text-center border border-gray-100">
        <p className="text-gray-600 mb-4">Aradığınız cevabı bulamadınız mı?</p>
        <a href="/contact" className="inline-block bg-white text-primary-600 font-bold px-8 py-3 rounded-xl shadow-sm border border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-colors">
          Bizimle İletişime Geçin
        </a>
      </div>
    </motion.div>
  );
};

export default Faq;
