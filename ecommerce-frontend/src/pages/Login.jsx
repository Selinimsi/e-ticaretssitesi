import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? 'http://localhost:4000/api/login' : 'http://localhost:4000/api/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const res = await axios.post(endpoint, payload);
      if (res.data.success) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(res.data.error || 'Bir hata oluştu.');
      }
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.error || (isLogin ? 'E-posta veya şifre hatalı!' : 'Kayıt başarısız oldu. E-posta kullanımda olabilir.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-10 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-center mb-8 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            {t('header.login')}
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Kayıt Ol
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900 dark:text-white">
          {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
        </h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center font-semibold text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Ad Soyad</label>
                <input 
                  type="text" 
                  required={!isLogin} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-shadow text-gray-900 dark:text-white" 
                  placeholder="Adınız Soyadınız" 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">E-posta</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-shadow text-gray-900 dark:text-white" 
              placeholder="ornek@email.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Şifre</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-shadow text-gray-900 dark:text-white" 
              placeholder="********" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg mt-4 disabled:opacity-70"
          >
            {loading ? 'Bekleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
