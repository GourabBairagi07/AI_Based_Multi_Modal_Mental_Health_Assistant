import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../lib/gemini';

const ChatMessage = ({ message, isTyping = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`max-w-[85%] p-4 rounded-2xl ${
        message.role === 'user'
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {message.role === 'assistant' ? (
          <Bot size={16} className="text-purple-500" />
        ) : (
          <User size={16} className="text-white/80" />
        )}
        <span className="text-xs font-medium opacity-70">
          {message.role === 'assistant' ? 'AI Assistant' : 'You'}
        </span>
      </div>
      {isTyping ? (
        <div className="flex space-x-1 py-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="whitespace-pre-wrap">
          {message.content}
        </div>
      )}
    </div>
  </motion.div>
);

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with any questions or tasks you have. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateResponse(input, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting to the AI service. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200 dark:border-gray-700 transform transition-all duration-300"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isTyping && <ChatMessage message={{ role: 'assistant', content: '' }} isTyping />}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:border-gray-600"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50"
              >
                {isTyping ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBot;
