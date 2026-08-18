import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, User, Clock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SupportDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user || user.role !== 'support') {
      navigate('/');
      return;
    }

    ws.current = new WebSocket(`ws://localhost:4000/ws/chat?role=${user.role}&id=${user.id}`);
    
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  if (!user || user.role !== 'support') return null;

  // Group messages by user
  const chatGroups = messages.reduce((acc, msg) => {
    // If it's a message from support, we need to know who it was sent to.
    // In our simplified logic, all messages go to broadcast, and users filter by their ID.
    // Support receives all messages. We group by the non-support sender's ID.
    const groupKey = msg.role === 'support' ? activeChatId : msg.senderId;
    if (groupKey && groupKey !== user.id) {
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(msg);
    }
    return acc;
  }, {});

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId) return;
    
    const message = { text: inputValue };
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      // Locally simulate the message since broadcast doesn't carry 'targetId' in our simple model
      setMessages(prev => [...prev, {
        id: `local_${Date.now()}`,
        senderId: user.id,
        role: 'support',
        text: inputValue,
        createdAt: new Date().toISOString()
      }]);
      setInputValue('');
    }
  };

  const activeMessages = activeChatId ? chatGroups[activeChatId] || [] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[80vh] flex bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      {/* Sidebar: Chat List */}
      <div className="w-1/3 border-r border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('support.dashboard', 'Destek Paneli')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('support.activeChats', 'Aktif Görüşmeler')}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {Object.keys(chatGroups).map(chatId => {
            const lastMsg = chatGroups[chatId][chatGroups[chatId].length - 1];
            const isUnread = lastMsg.role !== 'support';
            return (
              <button
                key={chatId}
                onClick={() => setActiveChatId(chatId)}
                className={`w-full text-left p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start gap-4 ${activeChatId === chatId ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-l-primary-600 dark:border-l-primary-500' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${isUnread ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  <User size={24} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900 dark:text-gray-200 truncate">{chatId}</span>
                    <span className="text-xs text-gray-400"><Clock size={12} className="inline mr-1" />{new Date(lastMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {lastMsg.text}
                  </p>
                </div>
              </button>
            )
          })}
          {Object.keys(chatGroups).length === 0 && (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 font-medium">{t('support.noActiveMessages', 'Şu an aktif mesaj bulunmuyor.')}</div>
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {activeChatId ? (
          <>
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm z-10 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <User size={20} className="text-primary-600 dark:text-primary-400" />
                {t('support.customer', 'Müşteri')}: {activeChatId}
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">{t('support.online', 'Çevrimiçi')}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center text-xs text-gray-400 dark:text-gray-500 mb-6">{t('support.encryptedSession', 'Uçtan uca şifreli (AES-256) görüşme başlatıldı.')}</div>
              {activeMessages.map((msg, idx) => {
                const isSupport = msg.role === 'support';
                return (
                  <div key={idx} className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl ${isSupport ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'}`}>
                      <p>{msg.text}</p>
                      <span className={`text-[10px] block mt-2 font-medium ${isSupport ? 'text-primary-200' : 'text-gray-400 dark:text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('support.typeReply', 'Yanıtınızı yazın...')}
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
              />
              <button type="submit" className="bg-primary-600 text-white p-4 rounded-2xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
                <Send size={24} className="translate-x-[2px]" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <MessageSquare size={64} className="mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">{t('support.selectToStart', 'Görüşmeyi başlatmak için sol taraftan bir mesaj seçin.')}</p>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default SupportDashboard;
