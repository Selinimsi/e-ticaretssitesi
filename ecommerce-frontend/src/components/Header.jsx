import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Heart, Menu, X, Search, ChevronDown, Globe, Moon, Sun } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../contexts/ThemeContext';
import CartDrawer from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const categories = ["Elektronik", "Giyim", "Aksesuar", "Ev & Yaşam", "Spor", "Kozmetik"];

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        {/* Top Info Bar */}
        <div className="bg-gray-900 text-gray-300 text-xs py-1.5 px-6 hidden md:flex justify-between items-center">
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-white transition-colors">{t('footer.about')}</Link>
            <Link to="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link>
            <Link to="/faq" className="hover:text-white transition-colors">{t('footer.faq')}</Link>
          </div>
          <div className="flex items-center gap-4">
            <span>Türkiye'nin En Büyük Teknoloji Marketi</span>
            <span>Destek: 0850 123 45 67</span>
            <div className="flex items-center gap-2 border-l border-gray-700 pl-4 ml-2">
              <Globe size={14} />
              <button 
                onClick={() => changeLanguage('tr')} 
                className={`hover:text-white transition-colors ${i18n.language === 'tr' ? 'text-white font-bold' : ''}`}
              >
                TR
              </button>
              <span>|</span>
              <button 
                onClick={() => changeLanguage('en')} 
                className={`hover:text-white transition-colors ${i18n.language === 'en' ? 'text-white font-bold' : ''}`}
              >
                EN
              </button>
            </div>
            <button onClick={toggleTheme} className="ml-4 p-1 rounded-full hover:bg-gray-800 transition-colors">
              {isDarkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Main Header */}
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="w-full md:w-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 text-white p-2 rounded-xl shadow-inner">
                <Package size={24} />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Varunet<span className="text-primary-600">Shop</span></span>
            </Link>
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-800 dark:text-gray-200">
              <Menu size={28} />
            </button>
          </div>
          
          {/* Search Bar & Categories Dropdown */}
          <div className="hidden md:flex flex-1 max-w-3xl items-center relative">
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-r-0 px-4 py-3 rounded-l-full text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors h-12">
                <Menu size={16} /> Kategoriler <ChevronDown size={14} />
              </button>
              
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl py-2 z-50"
                  >
                    {categories.map((cat, idx) => (
                      <Link key={idx} to={`/?category=${cat}`} className="block px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {cat}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <form onSubmit={handleSearch} className="flex-1 flex h-12">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                className="w-full h-full px-6 border-y border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 transition-colors"
              />
              <button type="submit" className="bg-primary-600 text-white px-8 rounded-r-full font-bold hover:bg-primary-700 transition-colors h-full flex items-center justify-center">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 font-semibold">{t('header.myAccount').split('/')[0]}</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-primary-600 hover:text-primary-800 font-bold px-3 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-lg transition-colors text-sm">{t('header.adminPanel')}</Link>
                )}
                {user.role === 'seller' && (
                  <Link to="/admin" className="text-primary-600 hover:text-primary-800 font-bold px-3 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-lg transition-colors text-sm">{t('header.sellerPanel')}</Link>
                )}
                {user.role === 'support' && (
                  <Link to="/support" className="text-primary-600 hover:text-primary-800 font-bold px-3 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-lg transition-colors text-sm">{t('header.supportPanel')}</Link>
                )}
                <Link to="/orders" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 font-semibold transition-colors" title={t('header.myAccount')}>
                  <User size={20} />
                </Link>
                <button onClick={logout} className="text-red-500 hover:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-full transition-colors" title={t('header.logout')}>
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-bold bg-gray-50 dark:bg-gray-800 px-5 py-2.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                <User size={20} /> {t('header.login')}
              </Link>
            )}

            <div className="flex items-center gap-3">
              <Link to="#" className="relative p-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-all shadow-sm text-gray-700 dark:text-gray-300">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-900">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 rounded-full bg-gray-900 text-white hover:bg-primary-600 transition-colors shadow-md flex items-center gap-2"
              >
                <ShoppingCart size={20} />
                <span className="font-bold text-sm hidden lg:block">{t('header.cart')}</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900">
                    {itemCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden px-6 pb-4">
          <form onSubmit={handleSearch} className="flex h-12 relative shadow-sm">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.searchPlaceholder')}
              className="w-full h-full px-6 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button type="submit" className="absolute right-1 top-1 bottom-1 bg-primary-600 text-white px-5 rounded-full flex items-center justify-center">
              <Search size={18} />
            </button>
          </form>
        </div>
      </header>

      {/* Adjust padding for fixed header */}
      <div className="pt-[140px] md:pt-[110px]"></div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black bg-opacity-60 z-50 md:hidden" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col md:hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-4 items-center">
                  <span className="text-xl font-black text-gray-900 dark:text-white">Menü</span>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                    <button onClick={() => changeLanguage('tr')} className={`text-sm ${i18n.language === 'tr' ? 'font-bold text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>TR</button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button onClick={() => changeLanguage('en')} className={`text-sm ${i18n.language === 'en' ? 'font-bold text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>
                  </div>
                  <button onClick={toggleTheme} className="p-2 ml-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                    {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
                  </button>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{user.name}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-primary-600 dark:text-primary-400 py-2">{t('header.adminPanel')}</Link>
                    )}
                    {user.role === 'seller' && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-primary-600 dark:text-primary-400 py-2">{t('header.sellerPanel')}</Link>
                    )}
                    {user.role === 'support' && (
                      <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-primary-600 dark:text-primary-400 py-2">{t('header.supportPanel')}</Link>
                    )}
                    <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700 dark:text-gray-300 py-2">{t('header.myAccount')}</Link>
                    <Link to="#" className="text-lg font-bold text-gray-700 dark:text-gray-300 py-2 flex items-center justify-between">
                      Favorilerim
                      {wishlistCount > 0 && <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">{wishlistCount}</span>}
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-red-500 dark:text-red-400 py-2 text-left mt-auto">{t('header.logout')}</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary-600 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30">
                    {t('header.login')} / {t('header.register')}
                  </Link>
                )}
                
                <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col gap-4">
                  <h3 className="font-black text-gray-900 dark:text-white mb-2">Kategoriler</h3>
                  {categories.map((cat, idx) => (
                    <Link key={idx} to={`/?category=${cat}`} onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-400 font-semibold py-1">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
