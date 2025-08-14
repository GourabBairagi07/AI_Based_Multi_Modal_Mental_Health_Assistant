import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, QuestionMarkCircleIcon, ShieldCheckIcon, BellIcon, EnvelopeIcon, HeartIcon, BookmarkIcon, UserGroupIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleMenuItemClick = (item) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };
  
  const menuItems = [
    { 
      icon: <UserCircleIcon className="h-5 w-5" />, 
      label: 'My Profile', 
      path: '/profile',
      action: () => navigate('/profile')
    },
    { 
      icon: <UserGroupIcon className="h-5 w-5" />, 
      label: 'View Public Profile', 
      path: `/users/${user?.id}`,
      action: () => navigate(`/users/${user?.id}`)
    },
    { 
      icon: <Cog6ToothIcon className="h-5 w-5" />, 
      label: 'Settings', 
      path: '/settings',
      action: () => navigate('/settings')
    },
    { 
      icon: <BookmarkIcon className="h-5 w-5" />, 
      label: 'Saved Items', 
      path: '/saved',
      action: () => alert('Saved Items will be shown here')
    },
    { 
      icon: <div className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </div>, 
      label: 'Notifications', 
      path: '/notifications',
      action: () => alert('Notifications will be shown here')
    },
    { 
      icon: <EnvelopeIcon className="h-5 w-5" />, 
      label: 'Messages', 
      path: '/messages',
      action: () => alert('Messages will be shown here')
    },
    { 
      icon: <HeartIcon className="h-5 w-5" />, 
      label: 'Health Tracker', 
      path: '/health-tracker',
      action: () => navigate('/health-tracker')
    },
    { 
      icon: <UserGroupIcon className="h-5 w-5" />, 
      label: 'Support Groups', 
      path: '/support-groups',
      action: () => alert('Support Groups will be shown here')
    },
    { 
      icon: <ShieldCheckIcon className="h-5 w-5" />, 
      label: 'Privacy & Security', 
      path: '/privacy',
      action: () => alert('Privacy & Security settings will be shown here')
    },
    { 
      icon: <QuestionMarkCircleIcon className="h-5 w-5" />, 
      label: 'Help & Support', 
      path: '/help',
      action: () => alert('Help & Support will be shown here')
    },
    { 
      icon: <InformationCircleIcon className="h-5 w-5" />, 
      label: 'About MindWell', 
      path: '/about',
      action: () => alert('About MindWell information will be shown here')
    },
  ];

  return (
    <header className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg border-b border-white/10 shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-300 hover:text-white transition-colors duration-200"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">MindWell</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white shadow-lg text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline text-sm font-medium text-white">
                  {user?.name || 'User'}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="fixed right-4 mt-2 w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-[100]"
                    style={{
                      top: '100%',
                      transformOrigin: 'top right',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                      </div>
                      
                      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {menuItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleMenuItemClick(item)}
                            className="flex items-center w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors duration-200"
                          >
                            <span className="text-gray-400 group-hover:text-white">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}
                        
                        <div className="border-t border-gray-700 my-1"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-3"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
