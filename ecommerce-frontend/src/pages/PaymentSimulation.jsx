import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PaymentSimulation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate network delay for payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await axios.post('http://localhost:4000/api/payment/callback', {
        order_id: orderId,
        status: 'completed'
      });

      if (res.data.success) {
        setSuccess(true);
        toast.success('Ödeme başarıyla alındı!');
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (err) {
      toast.error('Ödeme sırasında bir hata oluştu.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 mb-6">
          <CheckCircle size={80} />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Ödeme Başarılı!</h2>
        <p className="text-gray-500 dark:text-gray-400">Siparişlerinize yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto pt-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-primary-600"></div>
        
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-2xl">
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Güvenli Ödeme</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><ShieldCheck size={14} /> 256-bit SSL Korumalı</p>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex justify-between items-center border border-gray-100 dark:border-gray-600">
          <span className="text-gray-600 dark:text-gray-300 font-semibold">Ödenecek Tutar</span>
          <span className="text-2xl font-black text-primary-600 dark:text-primary-400">{amount} TL</span>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kart Numarası</label>
            <input type="text" required placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Son Kullanma (AA/YY)</label>
              <input type="text" required placeholder="12/25" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CVV</label>
              <input type="text" required placeholder="123" maxLength="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kart Üzerindeki İsim</label>
            <input type="text" required placeholder="Ad Soyad" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-6 shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : 'Ödemeyi Tamamla'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default PaymentSimulation;
