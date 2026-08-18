import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const appliedDiscount = location.state?.discount || 0;
  const appliedCoupon = location.state?.couponCode || '';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: '',
    city: '',
    address: '',
    paymentMethod: 'creditCard'
  });


  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const processCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error(t('checkout.cartEmptyError', 'Sepetiniz boş!'));
    if (!user) return toast.error(t('checkout.loginError', 'Lütfen giriş yapın.'));
    if (!formData.phone || !formData.city || !formData.address) {
      return toast.error(t('checkout.fillAddressError', 'Lütfen teslimat bilgilerinizi eksiksiz doldurun.'));
    }

    setLoading(true);

    try {
      // 1. Create order in Go Backend
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalAmount - appliedDiscount,
        shippingAddress: `${formData.city} - ${formData.address}`,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod
      };

      let orderId = `ORD_${Math.floor(Math.random() * 1000000)}`; // Default mock ID
      
      try {
        const orderRes = await axios.post('http://localhost:4000/api/orders', orderData);
        if (orderRes.data.success) {
          orderId = orderRes.data.data.id;
        }
      } catch (backendError) {
        console.warn("Backend sipariş oluşturma hatası (RLS engeli olabilir), ancak PHP testine devam ediliyor:", backendError);
        // Hata olsa bile PHP tarafını test edebilmek için devam ediyoruz.
      }
      
      // 2. Clear frontend cart
      clearCart();

      if (formData.paymentMethod === 'creditCard') {
        toast.loading(t('checkout.redirectingToPayment', 'Ödeme sistemine (PHP/Laravel) yönlendiriliyorsunuz...'), { duration: 2000 });
        // 3. Redirect to Laravel Payment Form
        setTimeout(() => {
          window.location.href = `http://localhost:8000/payment?order_id=${orderId}&amount=${totalAmount - appliedDiscount}`;
        }, 1000);
      } else {
        toast.success(t('checkout.orderSuccess', 'Siparişiniz başarıyla alındı!'));
        navigate('/orders');
      }
    } catch (error) {
      console.error(error);
      toast.error(t('checkout.orderError', 'Sipariş oluşturulurken hata oluştu.'));
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <ShoppingBag size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('checkout.cartEmpty', 'Sepetiniz Boş')}</h2>
        <button onClick={() => navigate('/')} className="bg-primary-600 text-white px-6 py-3 rounded-full font-bold hover:bg-primary-700 transition-colors">
          {t('checkout.startShopping', 'Alışverişe Başla')}
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-12"
    >
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">{t('checkout.secureCheckout', 'Güvenli Ödeme Noktası')}</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Address Form */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-2 rounded-lg">
                <MapPin size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('checkout.deliveryInfo', 'Teslimat Bilgileri')}</h2>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('checkout.firstName', 'Adınız')}</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-colors" placeholder={t('checkout.firstName', 'Adınız')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('checkout.lastName', 'Soyadınız')}</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-colors" placeholder={t('checkout.lastName', 'Soyadınız')} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('checkout.phone', 'Telefon Numarası')}</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-colors" placeholder="05XX XXX XX XX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('checkout.city', 'İl / İlçe')}</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-colors" placeholder="İstanbul / Kadıköy" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('checkout.address', 'Açık Adres')}</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-colors" placeholder={t('checkout.addressPlaceholder', 'Mahalle, sokak, bina no, daire no...')}></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('checkout.paymentMethod', 'Ödeme Yöntemi')}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-colors ${formData.paymentMethod === 'creditCard' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input type="radio" name="paymentMethod" value="creditCard" checked={formData.paymentMethod === 'creditCard'} onChange={handleInputChange} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
                    <span className="font-bold text-gray-800 dark:text-gray-200">{t('checkout.creditCard', 'Kredi Kartı (Online Ödeme)')}</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-colors ${formData.paymentMethod === 'cashOnDelivery' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input type="radio" name="paymentMethod" value="cashOnDelivery" checked={formData.paymentMethod === 'cashOnDelivery'} onChange={handleInputChange} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
                    <span className="font-bold text-gray-800 dark:text-gray-200">{t('checkout.cashOnDelivery', 'Kapıda Ödeme')}</span>
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-28">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">{t('checkout.orderSummary', 'Sipariş Özeti')}</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{i18n.language === 'en' ? item.nameEn : item.nameTr}</p>
                    <p className="text-gray-500 dark:text-gray-400">{item.quantity} {t('checkout.pcs', 'Adet')}</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white ml-4">{(item.price * item.quantity).toFixed(2)} TL</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                <span>{t('checkout.subtotal', 'Ara Toplam')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalAmount.toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                <span>{t('checkout.shippingCost', 'Kargo Bedeli')}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{t('checkout.free', 'Ücretsiz')}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                  <span>{t('checkout.discount', 'İndirim')} ({appliedCoupon})</span>
                  <span className="font-bold">-{appliedDiscount.toFixed(2)} TL</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="font-black text-gray-900 dark:text-white">{t('checkout.totalPayable', 'Ödenecek Tutar')}</span>
                <span className="font-black text-primary-600 dark:text-primary-400">{Math.max(0, totalAmount - appliedDiscount).toFixed(2)} TL</span>
              </div>
            </div>

            <button 
              onClick={processCheckout}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold mt-8 shadow-lg shadow-primary-600/30 hover:bg-primary-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white block"></span>
              ) : (
                <>{formData.paymentMethod === 'creditCard' ? t('checkout.payWithCard', 'Ödemeye Git (Finansbank)') : t('checkout.completeOrder', 'Siparişi Tamamla')} <ArrowRight size={20} /></>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              {t('checkout.securePaymentDesc', 'Güvenli ödeme altyapısı ile korunmaktadır.')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
