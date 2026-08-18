import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign, Plus, Edit2, Trash2, X, Upload, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

import { useTranslation } from 'react-i18next';

// Sabit Kategoriler
const CATEGORIES = {
  "Elektronik": ["Telefonlar", "Bilgisayarlar", "Aksesuarlar"],
  "Giyim": ["Tişörtler", "Pantolonlar", "Ceketler", "Ayakkabılar"],
  "Aksesuar": ["Saatler", "Çantalar", "Gözlükler", "Takılar"],
  "Ev & Yaşam": ["Mobilya", "Dekorasyon", "Mutfak", "Aydınlatma"],
  "Spor": ["Fitness", "Outdoor", "Spor Giyim", "Ekipmanlar"],
  "Kozmetik": ["Parfüm", "Makyaj", "Cilt Bakımı", "Saç Bakımı"]
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, marketing
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', imageUrl: '', category: '', subCategory: '', stock: '', isActive: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  const fetchProducts = () => {
    let url = 'http://localhost:4000/api/products?all=true';
    if (isSeller) {
      url += `&sellerId=${user.id}`;
    }
    axios.get(url).then(res => {
      if (res.data.success) setProducts(res.data.data || []);
    });
  };

  useEffect(() => {
    if (!user || (!isAdmin && !isSeller)) {
      navigate('/');
      return;
    }
    let ordersUrl = 'http://localhost:4000/api/orders';
    if (isSeller) {
      ordersUrl += `?sellerId=${user.id}`;
    }
    axios.get(ordersUrl).then(res => {
      if (res.data.success) setOrders(res.data.data || []);
    });
    fetchProducts();
    
    if (isAdmin) {
      axios.get('http://localhost:4000/api/marketing/admin/abandoned-carts').then(res => {
        if (res.data.success) setAbandonedCarts(res.data.data || []);
      });
    }
  }, [user, navigate, isAdmin]);

  if (!user || (!isAdmin && !isSeller)) return null;

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const data = [
    { name: 'Oca', satis: 4000 }, { name: 'Şub', satis: 3000 }, { name: 'Mar', satis: 2000 },
    { name: 'Nis', satis: 2780 }, { name: 'May', satis: 1890 }, { name: 'Haz', satis: 2390 }, { name: 'Tem', satis: 3490 },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'category') {
      // Kategori değiştiğinde alt kategoriyi sıfırla
      setFormData({ ...formData, category: value, subCategory: '' });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imageUrl: urlData.publicUrl });
      toast.success('Görsel başarıyla yüklendi!');
    } catch (err) {
      console.error(err);
      toast.error('Görsel yüklenemedi. (Supabase Storage "products" bucket public olarak açık mı?)');
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, description: product.description, price: product.price,
        imageUrl: product.imageUrl, category: product.category, subCategory: product.subCategory || '', stock: product.stock || 0,
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', imageUrl: '', category: '', subCategory: '', stock: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if(!formData.imageUrl) {
      toast.error('Lütfen bir görsel ekleyin.');
      return;
    }
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      sellerId: user.id
    };

    try {
      if (editingProduct) {
        await axios.put(`http://localhost:4000/api/products/${editingProduct.id}`, payload);
        toast.success('Ürün başarıyla güncellendi!');
      } else {
        await axios.post('http://localhost:4000/api/products', payload);
        toast.success('Yeni ürün başarıyla eklendi!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/products/${id}`);
      toast.success('Ürün silindi.');
      fetchProducts();
    } catch (err) {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const payload = { ...product, isActive: !product.isActive };
      await axios.put(`http://localhost:4000/api/products/${product.id}`, payload);
      toast.success(payload.isActive ? 'Ürün Aktif edildi.' : 'Ürün Pasif edildi.');
      fetchProducts();
    } catch (err) {
      toast.error('Durum değiştirilemedi.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {isAdmin ? t('admin.systemManagement', 'Sistem Yönetimi') : t('admin.sellerPanel', 'Satıcı Paneli')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{t('admin.welcome', 'Hoş geldiniz')}, {user.name}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'overview' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {t('admin.overview', 'Genel Bakış')}
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'products' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {t('admin.productManagement', 'Ürün Yönetimi')}
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'orders' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {t('admin.orderManagement', 'Sipariş Yönetimi')}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('marketing')}
              className={`px-6 py-2 rounded-full font-bold transition-colors flex items-center gap-2 ${activeTab === 'marketing' ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              🚀 {t('admin.marketing', 'Pazarlama')}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { title: t('admin.totalRevenue', 'Toplam Ciro'), value: `${totalRevenue.toFixed(2)} TL`, icon: DollarSign, color: "bg-green-500" },
              { title: t('admin.totalOrders', 'Toplam Sipariş'), value: orders.length, icon: ShoppingBag, color: "bg-blue-500" },
              { title: t('admin.myCatalog', 'Kataloğum'), value: products.length, icon: TrendingUp, color: "bg-purple-500" },
              { title: t('admin.myRating', 'Puanım'), value: "9.8", icon: Users, color: "bg-orange-500" }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className={`p-4 ${stat.color} text-white rounded-2xl`}><stat.icon size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t('admin.monthlySales', 'Aylık Satış Grafiği')}</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }} />
                    <Bar dataKey="satis" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full">
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t('admin.recentOrders', 'Son Siparişler')}</h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-600">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{o.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(o.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'tr-TR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary-600 dark:text-primary-400">{o.totalAmount.toFixed(2)} TL</p>
                      <span className="text-xs px-2 py-1 rounded-full font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'products' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('admin.productCatalog', 'Ürün Kataloğu')}</h2>
            <button onClick={() => openModal()} className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-700 flex items-center gap-2">
              <Plus size={20} /> {t('admin.addProduct', 'Yeni Ürün Ekle')}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-600">
                  <th className="p-4 rounded-tl-xl">{t('admin.image', 'Görsel')}</th>
                  <th className="p-4">{t('admin.productName', 'Ürün Adı')}</th>
                  <th className="p-4">{t('admin.category', 'Kategori')}</th>
                  <th className="p-4">{t('admin.price', 'Fiyat')}</th>
                  <th className="p-4">{t('admin.status', 'Durum')}</th>
                  <th className="p-4 text-right rounded-tr-xl">{t('admin.actions', 'İşlemler')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className={`border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors ${!p.isActive && 'opacity-60'}`}>
                    <td className="p-4"><img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" /></td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{i18n.language === 'en' ? p.nameEn || p.name : p.nameTr || p.name}</p>
                      <p className="text-xs text-gray-400">Stok: {p.stock}</p>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{p.category} {p.subCategory && `> ${p.subCategory}`}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{p.price} TL</td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleProductStatus(p)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${p.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200'}`}
                        title={p.isActive ? 'Pasife Al' : 'Aktife Al'}
                      >
                        <Power size={14} /> {p.isActive ? t('admin.active', 'Aktif') : t('admin.inactive', 'Pasif')}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors mr-2"><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('admin.orderManagement', 'Sipariş Yönetimi')}</h2>
          
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-6 border-b border-gray-50 dark:border-gray-700">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'tr-TR')}</p>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-semibold text-gray-800 dark:text-gray-300">{t('admin.deliveryAddress', 'Teslimat Adresi')}:</span> {order.address || t('admin.notSpecified', 'Belirtilmedi')}</p>
                      <p><span className="font-semibold text-gray-800 dark:text-gray-300">{t('admin.paymentMethod', 'Ödeme Yöntemi')}:</span> {order.paymentMethod || t('admin.creditCard', 'Kredi Kartı')}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-full font-bold text-sm ${order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : order.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                      {order.status === 'completed' ? t('admin.approved', 'Onaylandı') : order.status === 'failed' ? t('admin.failed', 'Başarısız') : t('admin.pending', 'Bekliyor')}
                    </span>
                    <div className="text-right">
                      <p className="font-black text-primary-600 dark:text-primary-400 text-xl">{order.totalAmount.toFixed(2)} TL</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('admin.orderContent', 'Sipariş İçeriği')}:</h4>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 flex items-center justify-center font-bold text-gray-400 dark:text-gray-300">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{i18n.language === 'en' ? item.nameEn || `Product ID: ${item.productId}` : item.nameTr || `Ürün ID: ${item.productId}`}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.quantity', 'Adet')}: {item.quantity} x {item.price.toFixed(2)} TL</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">{(item.quantity * item.price).toFixed(2)} TL</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium text-lg">{t('admin.noOrders', 'Henüz siparişiniz bulunmuyor.')}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'marketing' && isAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-pink-100 dark:border-pink-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-[80px] opacity-10"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 relative z-10">{t('admin.abandonedCarts', 'Terk Edilen Sepetler')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {abandonedCarts.length === 0 ? (
                <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">{t('admin.noAbandonedCarts', 'Terk edilmiş sepet bulunmuyor.')}</div>
              ) : (
                abandonedCarts.map(cart => (
                  <div key={cart.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">User: {cart.userId}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.lastUpdate', 'Son Güncelleme')}: {new Date(cart.lastUpdated).toLocaleString(i18n.language === 'en' ? 'en-US' : 'tr-TR')}</p>
                      </div>
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">{t('admin.lostSale', 'Kaçan Satış')}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2 text-gray-700 dark:text-gray-300">
                      {cart.items.map(item => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="truncate flex-1 pr-2">{i18n.language === 'en' ? item.nameEn : item.nameTr}</span>
                          <span className="font-semibold">{item.quantity}x</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">{t('admin.totalAmount', 'Toplam Tutar')}</span>
                      <span className="font-black text-lg text-gray-900 dark:text-white">{cart.totalAmount.toFixed(2)} TL</span>
                    </div>
                    <button className="w-full mt-4 bg-gray-900 dark:bg-gray-700 text-white font-bold py-2 rounded-xl text-sm hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                      {t('admin.sendReminder', 'Hatırlatma Maili Gönder (Yakında)')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur z-10">
                <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100">{editingProduct ? t('admin.editProduct', 'Ürünü Düzenle') : t('admin.addNewProduct', 'Yeni Ürün Ekle')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('admin.productName', 'Ürün Adı')}</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('admin.description', 'Açıklama')}</label>
                    <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('admin.mainCategory', 'Ana Kategori')}</label>
                    <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="" disabled>{t('admin.selectCategory', 'Kategori Seçin')}</option>
                      {Object.keys(CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('admin.subCategory', 'Alt Kategori')}</label>
                    <select required name="subCategory" value={formData.subCategory} onChange={handleInputChange} disabled={!formData.category} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="" disabled>{t('admin.selectSubCategory', 'Alt Kategori Seçin')}</option>
                      {formData.category && CATEGORIES[formData.category].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('admin.price', 'Fiyat')} (TL)</label>
                    <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('admin.stockAmount', 'Stok Miktarı')}</label>
                    <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('admin.productImage', 'Ürün Görseli')}</label>
                    <div className="flex items-center gap-4">
                      {formData.imageUrl && (
                        <img src={formData.imageUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-600" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()} 
                        disabled={isUploading}
                        className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl py-4 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Upload size={24} className="mb-2" />
                        <span className="font-semibold text-sm">{isUploading ? t('admin.uploading', 'Yükleniyor...') : t('admin.selectImage', 'Görsel Seç / Yükle')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center mt-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      name="isActive" 
                      checked={formData.isActive} 
                      onChange={handleInputChange} 
                      className="w-5 h-5 text-primary-600 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-primary-500"
                    />
                    <label htmlFor="isActive" className="ml-3 text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                      {t('admin.publishImmediately', 'Ürün Aktif (Hemen Yayına Al)')}
                    </label>
                  </div>

                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('admin.cancel', 'İptal')}</button>
                  <button type="submit" disabled={isUploading} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 disabled:opacity-50">
                    {editingProduct ? t('admin.saveChanges', 'Değişiklikleri Kaydet') : t('admin.addProduct', 'Ürünü Ekle')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
