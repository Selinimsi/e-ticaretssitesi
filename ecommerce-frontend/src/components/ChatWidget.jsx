import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && (user.role === 'customer' || user.role === 'seller')) {
      // Connect to WebSocket
      ws.current = new WebSocket(`ws://localhost:4000/ws/chat?role=${user.role}&id=${user.id}`);
      
      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        setMessages(prev => [...prev, msg]);
      };

      return () => {
        if (ws.current) ws.current.close();
      };
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (!user || user.role === 'admin' || user.role === 'support') return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const message = { text: inputValue };
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      setInputValue('');
    }
  };

  // Only show messages that belong to this user or from support
  const filteredMessages = messages.filter(m => m.senderId === user.id || m.role === 'support');

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
      >
        <MessageSquare size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl overflow-hidden z-50 border border-gray-100 flex flex-col"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">Canlı Destek</h3>
                <p className="text-xs text-primary-100">Size nasıl yardımcı olabiliriz?</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary-500 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
              <div className="text-center text-xs text-gray-400 my-2">Uçtan uca şifreli (AES-256)</div>
              {filteredMessages.map((msg, idx) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'}`}>
                      {!isMe && <p className="text-[10px] font-bold text-gray-400 mb-1">Destek Ekibi</p>}
                      <p className="text-sm">{msg.text}</p>
                      <span className={`text-[10px] block mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Mesajınızı yazın..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 transition-colors flex-shrink-0">
                <Send size={18} className="translate-x-[1px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
