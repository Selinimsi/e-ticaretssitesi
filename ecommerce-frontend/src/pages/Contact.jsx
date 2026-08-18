import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      message: e.target.message.value,
    };

    try {
      const res = await fetch('http://localhost:4000/api/support/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('contact.success', 'Mesajınız destek ekibine iletildi!'));
        e.target.reset();
      } else {
        toast.error('Mesaj gönderilemedi.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Sunucu ile iletişim kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
      className="max-w-6xl mx-auto py-12"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{t('contact.title')}</h1>
        <p className="text-lg text-gray-500">Bizimle her türlü soru ve öneriniz için iletişime geçebilirsiniz.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-8 lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="bg-primary-50 p-4 rounded-full text-primary-600 shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{t('contact.address')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Teknopark İstanbul, Pendik<br/>İstanbul, Türkiye</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="bg-green-50 p-4 rounded-full text-green-600 shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{t('contact.phone')}</h3>
              <p className="text-gray-600 text-sm">0850 123 45 67<br/>0216 987 65 43</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600 shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{t('contact.email')}</h3>
              <p className="text-gray-600 text-sm">info@varunet.com<br/>destek@varunet.com</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('contact.formTitle')}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.name')}</label>
                <input required name="name" type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.email')}</label>
                <input required name="email" type="email" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.message')}</label>
              <textarea required name="message" rows="5" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all resize-none"></textarea>
            </div>
            <button type="submit" disabled={loading} className="bg-primary-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading ? 'Gönderiliyor...' : t('contact.send')} <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
