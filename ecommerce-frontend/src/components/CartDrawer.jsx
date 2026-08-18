import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  const handleApplyCoupon = async () => {
    try {
      setCouponError('');
      const res = await axios.post('http://localhost:4000/api/marketing/coupons/validate', {
        code: couponCode,
        cartTotal: total
      });
      if (res.data.success) {
        const c = res.data.data;
        let d = 0;
        if (c.type === 'fixed') d = c.value;
        else if (c.type === 'percentage') d = total * (c.value / 100);
        setDiscount(d);
        toast.success(t('cart.couponApplied', 'Kupon uygulandı! {{amount}} TL indirim kazandınız.', { amount: d.toFixed(2) }));
      }
    } catch (err) {
      setDiscount(0);
      setCouponError(err.response?.data?.message || t('cart.invalidCoupon', 'Kupon geçersiz.'));
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout', { state: { discount, couponCode } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <ShoppingBag className="text-primary-600 dark:text-primary-400" /> {t('header.cart', 'Sepetim')}
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center relative shadow-inner">
                    <ShoppingBag size={48} className="text-gray-300 dark:text-gray-600" />
                    <div className="absolute top-2 right-2 w-6 h-6 bg-red-400 rounded-full border-4 border-white dark:border-gray-900 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-gray-800 dark:text-gray-200 mb-2">{t('header.cartEmpty', 'Sepetiniz henüz boş')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto text-sm">Onlarca harika ürün arasından size uygun olanı hemen keşfedin.</p>
                  </div>
                  <button onClick={onClose} className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold py-3 px-8 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                    Alışverişe Başla
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 relative group">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={14} />
                    </button>
                    <img src={item.imageUrl} alt={i18n.language === 'en' ? item.nameEn : item.nameTr} className="w-20 h-20 object-cover rounded-xl shadow-sm bg-white dark:bg-gray-800" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{i18n.language === 'en' ? item.nameEn : item.nameTr}</h4>
                        <p className="text-sm font-black text-primary-600 dark:text-primary-400">{item.price.toFixed(2)} TL</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 bg-white dark:bg-gray-700 rounded-full w-max border border-gray-200 dark:border-gray-600 px-2 py-1 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-sm w-6 text-center text-gray-800 dark:text-gray-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                
                {/* Coupon Area */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder={t('cart.couponCode', 'Kupon Kodu')}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                      {t('cart.apply', 'Uygula')}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs font-semibold">{couponError}</p>}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">{t('checkout.subtotal', 'Ara Toplam')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{total.toFixed(2)} TL</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                    <span className="font-semibold">{t('checkout.discount', 'İndirim')} ({couponCode})</span>
                    <span className="font-bold">-{discount.toFixed(2)} TL</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white font-bold">{t('cart.grandTotal', 'Genel Toplam')}</span>
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400">{(Math.max(0, total - discount)).toFixed(2)} TL</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary-600/30 flex justify-center items-center gap-2"
                >
                  {t('checkout.completeOrder', 'Siparişi Tamamla')} <ArrowRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
