import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Star, Truck, ShieldCheck, RotateCcw, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:4000/api/products`)
      .then(res => {
        if (res.data.success) {
          const found = res.data.data.find(p => p.id === id);
          setProduct(found);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast.success(`${quantity} adet ${i18n.language === 'en' ? product.nameEn : product.nameTr} sepete eklendi!`, {
        icon: '🛒',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('product.notFound', 'Ürün Bulunamadı')}</h2>
        <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 hover:underline">{t('product.backToHome', 'Ana Sayfaya Dön')}</button>
      </div>
    );
  }

  const productName = i18n.language === 'en' ? product.nameEn : product.nameTr;
  const productDescription = i18n.language === 'en' ? product.descriptionEn : product.descriptionTr;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mt-4 border border-gray-100 dark:border-gray-700 relative"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left: Image */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 z-10"
          >
            <ArrowLeft size={24} />
          </button>
          <button 
            onClick={() => toggleWishlist(product)}
            className="absolute top-6 right-6 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition-transform z-10"
          >
            <Heart size={24} className={isInWishlist(product.id) ? "fill-pink-500 text-pink-500" : "text-gray-400"} />
          </button>

          <motion.img 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            src={product.imageUrl} 
            alt={productName} 
            className="w-full h-auto max-h-[500px] object-contain drop-shadow-2xl relative z-0"
          />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-2">
            <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-bold border border-primary-100">
              {product.category}
            </span>
            <div className="flex items-center text-yellow-400">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} className="text-gray-300" />
              <span className="text-gray-500 text-sm ml-2 font-medium">(24)</span>
            </div>
          </div>

          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{productName}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
            {productDescription}
          </p>

          <div className="flex items-end gap-4 mb-8">
            <span className="text-5xl font-black text-primary-600 dark:text-primary-400 tracking-tight">{product.price.toFixed(2)} TL</span>
            <span className="text-xl text-gray-400 dark:text-gray-500 line-through mb-1">{(product.price * 1.2).toFixed(2)} TL</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 w-full sm:w-auto h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-xl font-bold"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-xl text-gray-900 dark:text-white">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-14 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-xl font-bold"
              >
                +
              </button>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex-1 w-full bg-primary-600 hover:bg-primary-500 text-white h-14 rounded-full font-bold text-lg shadow-xl shadow-primary-600/30 transition-all flex items-center justify-center gap-3"
            >
              <ShoppingCart size={24} /> {t('home.addToCart', 'Sepete Ekle')}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <Truck className="text-primary-500 mb-2" size={28} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('product.freeShipping', 'Ücretsiz Kargo')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('product.over200', '200 TL üzeri')}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <ShieldCheck className="text-green-500 mb-2" size={28} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('product.originalProduct', 'Orijinal Ürün')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('product.guaranteedDelivery', 'Garantili Teslimat')}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <RotateCcw className="text-blue-500 mb-2" size={28} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('product.easyReturn', 'Kolay İade')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('product.within14Days', '14 Gün İçinde')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
