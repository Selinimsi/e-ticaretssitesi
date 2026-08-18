import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import SupportDashboard from './pages/SupportDashboard';
import ProductDetails from './pages/ProductDetails';
import PaymentSimulation from './pages/PaymentSimulation';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { Toaster } from 'react-hot-toast';

import About from './pages/About';
import Contact from './pages/Contact';
import Faq from './pages/Faq';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200 selection:bg-primary-200 dark:selection:bg-primary-700">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8 mt-24">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/support" element={<SupportDashboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/payment-simulation" element={<PaymentSimulation />} />
                </Routes>
                <ChatWidget />
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
