import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Circular Categories Data
const topCategories = [
  { name: "Elektronik", icon: "💻" },
  { name: "Giyim", icon: "👕" },
  { name: "Aksesuar", icon: "🎒" },
  { name: "Ev & Yaşam", icon: "🏠" },
  { name: "Spor", icon: "⚽" },
  { name: "Kozmetik", icon: "✨" }
];

// Tree Categories Data
const categoryTree = [
  {
    main: "Elektronik",
    subs: ["Telefonlar", "Bilgisayarlar", "Aksesuarlar"]
  },
  {
    main: "Giyim",
    subs: ["Tişörtler", "Pantolonlar", "Ceketler"]
  },
  {
    main: "Aksesuar",
    subs: ["Saatler", "Çantalar", "Gözlükler"]
  }
];

const Home = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flashSales, setFlashSales] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const location = useLocation();

  // Countdown Helper
  const calculateTimeLeft = (endTime) => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };
  const [timeLeft, setTimeLeft] = useState({});

  // Parse URL Params
  const queryParams = new URLSearchParams(location.search);
  const activeCategory = queryParams.get('category') || '';
  const activeSubCategory = queryParams.get('subCategory') || '';
  const activeSearch = queryParams.get('search') || '';

  useEffect(() => {
    // Build query string
    const params = new URLSearchParams();
    if (activeCategory) params.append('category', activeCategory);
    if (activeSubCategory) params.append('subCategory', activeSubCategory);
    if (activeSearch) params.append('search', activeSearch);

    setIsLoading(true);
    axios.get(`http://localhost:4000/api/products?${params.toString()}`).then(res => {
      if (res.data.success) {
        let fetchedProducts = res.data.data || [];
        // Apply sorting locally for now
        if (sortOption === 'price-asc') {
          fetchedProducts.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
          fetchedProducts.sort((a, b) => b.price - a.price);
        }
        setProducts(fetchedProducts);
      }
    }).finally(() => {
      // Small timeout for visual smoothness
      setTimeout(() => setIsLoading(false), 400);
    });

    // Fetch Flash Sales
    axios.get(`http://localhost:4000/api/marketing/flash-sales`).then(res => {
      if (res.data.success && res.data.data.length > 0) {
        setFlashSales(res.data.data);
        setTimeLeft(calculateTimeLeft(res.data.data[0].endTime));
      }
    }).catch(err => console.error("Flash sale err:", err));
  }, [sortOption, activeCategory, activeSubCategory, activeSearch]);

  useEffect(() => {
    if (flashSales.length > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(flashSales[0].endTime));
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} sepete eklendi!`);
  };

  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div className="pb-12">
      {/* HERO SECTION */}
      {!activeSearch && !activeCategory && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-16 mb-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500 rounded-full blur-[120px] opacity-20 translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="md:w-1/2 relative z-10">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-300 font-bold text-sm mb-6 border border-primary-500/30">
              {t('home.heroBadge', 'Yeni Sezon İndirimleri Başladı!')}
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              {t('home.heroTitle', 'Teknolojinin')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-pink-500">{t('home.heroTitleHighlight', 'Zirvesi')}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-300 mb-8 max-w-lg">
              {t('home.heroSubtitle', 'Varunet kalitesiyle en yeni cihazlar, benzersiz donanımlar ve inanılmaz fiyatlar.')}
            </motion.p>
            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-primary-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/30 flex items-center gap-2">
              {t('home.exploreNow', 'Hemen Keşfet')} <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      )}

      {/* FLASH SALES */}
      {!activeSearch && !activeCategory && flashSales.length > 0 && (
        <div className="mb-16 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col items-start z-10">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-xl mb-2 uppercase tracking-wider">
              <span>🔥</span> {flashSales[0].title}
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-6 max-w-md">
              {flashSales[0].description} {t('home.flashSaleDesc', 'Seçili ürünlerde anında %{{discount}} indirim!', { discount: flashSales[0].discountPct })}
            </p>
            <div className="flex gap-4">
              <div className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-black text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-red-100 dark:border-gray-700">
                {timeLeft.h || '00'}
              </div>
              <span className="text-2xl font-bold text-red-400 mt-3">:</span>
              <div className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-black text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-red-100 dark:border-gray-700">
                {timeLeft.m || '00'}
              </div>
              <span className="text-2xl font-bold text-red-400 mt-3">:</span>
              <div className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-black text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-red-100 dark:border-gray-700">
                {timeLeft.s || '00'}
              </div>
            </div>
          </div>
          <div className="z-10 relative">
            {/* Example of showing a few products from the sale */}
            <div className="flex gap-4">
              {products.filter(p => flashSales[0].productIds.includes(p.id)).slice(0, 2).map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center w-32 group">
                  <img src={p.imageUrl} alt="product" className="w-20 h-20 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate w-full text-center">{i18n.language === 'en' ? p.nameEn : p.nameTr}</span>
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-xs text-gray-400 line-through">{(p.price).toFixed(2)} TL</span>
                    <span className="text-sm font-black text-red-600 dark:text-red-400">{(p.price * (1 - flashSales[0].discountPct/100)).toFixed(2)} TL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative Background */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500 rounded-full blur-[80px] opacity-20"></div>
        </div>
      )}

      {/* CIRCULAR CATEGORIES (DEMSAY STYLE) */}
      {!activeSearch && !activeCategory && (
        <div className="mb-16">
          <h2 className="text-center font-bold text-gray-400 mb-8 tracking-widest uppercase text-sm">{t('home.popularCategories', 'Popüler Kategoriler')}</h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {topCategories.map((cat, i) => (
              <Link to={`/?category=${cat.name}`} key={i} className="flex flex-col items-center gap-3 group">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl shadow-sm border border-gray-100 dark:border-gray-700 group-hover:border-primary-500 group-hover:shadow-lg transition-all group-hover:-translate-y-2">
                  {cat.icon}
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDEBAR (KOSKA STYLE) */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-36">
            <h3 className="font-black text-xl text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">{t('home.categories', 'Kategoriler')}</h3>
            <div className="space-y-2">
              <Link 
                to="/" 
                className={`block py-2 px-4 rounded-xl font-bold transition-colors ${!activeCategory ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {t('home.allProducts', 'Tüm Ürünler')}
              </Link>
              
              {categoryTree.map((cat, i) => (
                <div key={i} className="pt-2">
                  <Link 
                    to={`/?category=${cat.main}`}
                    className={`block py-2 px-4 rounded-xl font-bold transition-colors flex justify-between items-center ${activeCategory === cat.main ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {cat.main} <ChevronRight size={16} className={`transition-transform ${activeCategory === cat.main ? 'rotate-90' : ''}`} />
                  </Link>
                  
                  {activeCategory === cat.main && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pl-4 mt-2 space-y-1 border-l-2 border-gray-100 ml-6">
                      {cat.subs.map((sub, j) => (
                        <Link 
                          key={j} 
                          to={`/?category=${cat.main}&subCategory=${sub}`}
                          className={`block py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${activeSubCategory === sub ? 'text-primary-600 bg-primary-50/50' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          {sub}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: PRODUCTS GRID */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {activeSearch ? `"${activeSearch}" ${t('home.results', 'Sonuçları')}` : activeSubCategory ? activeSubCategory : activeCategory ? activeCategory : t('home.allProducts', 'Tüm Ürünler')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{t('home.showingProducts', '{{count}} ürün listeleniyor', { count: products.length })}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-400 dark:text-gray-500">{t('home.sortBy', 'Sırala:')}</span>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 font-bold outline-none cursor-pointer"
              >
                <option value="newest">{t('home.sortNewest', 'En Yeniler')}</option>
                <option value="price-asc">{t('home.sortPriceAsc', 'Fiyat (Artan)')}</option>
                <option value="price-desc">{t('home.sortPriceDesc', 'Fiyat (Azalan)')}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <ShoppingCart size={40} className="text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-gray-200 mb-2">{t('home.noProductsFound', 'Ürün bulunamadı.')}</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">{t('home.tryChangingSearch', 'Arama kriterlerinizi değiştirerek tekrar deneyin. Veya farklı kategorilere göz atın.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p, idx) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group relative"
                >
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleWishlistToggle(e, p)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-pink-500 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <Heart size={20} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-pink-500" : ""} />
                  </motion.button>

                  <Link to={`/product/${p.id}`} className="block relative overflow-hidden aspect-square bg-gray-50 dark:bg-gray-900">
                    <motion.img 
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      src={p.imageUrl} 
                      alt={i18n.language === 'en' ? p.nameEn : p.nameTr} 
                      className="w-full h-full object-cover" 
                    />
                  </Link>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1 block">
                          {p.subCategory ? p.subCategory : p.category}
                        </span>
                        <Link to={`/product/${p.id}`} className="text-lg font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">
                          {i18n.language === 'en' ? p.nameEn : p.nameTr}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div>
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{p.price.toFixed(2)} TL</span>
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleAddToCart(e, p)}
                        className="bg-gray-900 dark:bg-gray-700 text-white p-3 rounded-2xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-all shadow-md group-hover:shadow-lg hover:rotate-3"
                      >
                        <ShoppingCart size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
