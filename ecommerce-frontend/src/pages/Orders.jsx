import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Package, MapPin, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    // Check if we came back from payment gateway
    const query = new URLSearchParams(location.search);
    const status = query.get('status');
    const orderId = query.get('order_id');
    
    if (status === 'completed') {
      toast.success(`${orderId} numaralı siparişinizin ödemesi başarıyla alındı!`, { duration: 5000 });
      // Remove query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'failed') {
      toast.error(`${orderId} numaralı siparişin ödemesi başarısız oldu.`, { duration: 5000 });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      axios.get(`http://localhost:4000/api/orders?userId=${user.id}`).then(res => {
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      }).finally(() => {
        setTimeout(() => setIsLoading(false), 400);
      });
    }
  }, [user]);

  if (!user) {
    return <div className="text-center py-20 font-bold text-xl text-gray-500">Lütfen giriş yapın.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-28">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 shadow-inner">
              <User size={40} />
            </div>
            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'orders', icon: Package, label: t('orders.myOrders', 'Siparişlerim') },
              { id: 'profile', icon: Settings, label: t('orders.accountSettings', 'Hesap Ayarları') },
              { id: 'address', icon: MapPin, label: t('orders.myAddresses', 'Adreslerim') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]"
        >
          {activeTab === 'orders' && (
            <>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t('orders.orderHistory', 'Sipariş Geçmişim')}</h2>
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 animate-pulse">
                      <div className="flex justify-between mb-6 pb-6 border-b border-gray-50 dark:border-gray-700">
                        <div className="w-1/3 space-y-2">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                        <div className="w-1/4 space-y-2 text-right">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 ml-auto"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 ml-auto"></div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl"></div>
                        <div className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Package size={40} className="text-gray-300 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 mb-2">{t('orders.noOrders', 'Henüz hiç sipariş vermediniz.')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{t('orders.noOrdersDesc', 'Yeni ürünleri keşfederek ilk alışverişinizi hemen yapabilirsiniz.')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-6 border-b border-gray-50 dark:border-gray-700">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{order.id}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'tr-TR')}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('orders.totalAmount', 'Toplam Tutar')}</p>
                            <p className="font-black text-primary-600 dark:text-primary-400 text-xl">{order.totalAmount.toFixed(2)} TL</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full font-bold text-sm ${order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : order.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                            {order.status === 'completed' ? t('orders.approved', 'Onaylandı') : order.status === 'failed' ? t('orders.failed', 'Başarısız') : t('orders.pending', 'Bekliyor')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold text-gray-400 dark:text-gray-500">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{i18n.language === 'en' ? item.nameEn : item.nameTr}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('orders.quantity', 'Adet')}: {item.quantity} x {item.price.toFixed(2)} TL</p>
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 dark:text-white">{(item.quantity * item.price).toFixed(2)} TL</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t('orders.accountSettings', 'Hesap Ayarları')}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t('orders.mockProfile', 'Bu alan henüz mock aşamasındadır. Yakında şifre değiştirme ve profil güncelleme eklenecektir.')}</p>
            </>
          )}

          {activeTab === 'address' && (
            <>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t('orders.savedAddresses', 'Kayıtlı Adreslerim')}</h2>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 font-semibold flex flex-col items-center">
                <MapPin size={32} className="mb-2 text-gray-400 dark:text-gray-500" />
                {t('orders.addNewAddress', 'Yeni Adres Ekle')}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Orders;
