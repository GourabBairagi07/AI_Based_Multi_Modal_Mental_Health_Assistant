import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { 
  ArrowLeft, User, Mail, Calendar, Phone, MapPin, Edit, 
  Activity, BarChart, Clock, Award, Settings, LogOut, 
  ChevronRight, Heart, Moon, Sun, Bell, Lock, Shield, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const slideIn = {
  hidden: { x: -50, opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, user: currentUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Start animations when in view
  useEffect(() => {
    if (isInView) {
      controls.start('show');
    }
  }, [controls, isInView]);
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [userId, token]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/accounts/users/${userId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch user details');
        }

        const data = await response.json();
        setUser({
          ...data,
          name: data.full_name || 'User',
          email: data.email,
          phone: data.phone_number,
          date_joined: data.date_joined,
          last_login: data.last_login,
          address: {
            street: data.address || '123 Main St',
            city: data.city || 'City',
            state: data.state || 'State',
            zip: data.zip_code || '12345',
            country: data.country || 'Country'
          }
        });
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUserDetails();
    }
  }, [userId, token]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-50'}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div 
              animate={{ 
                rotate: 360,
                transition: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'linear' 
                } 
              }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 opacity-20"></div>
              <div className="absolute inset-0 border-t-2 border-l-2 border-purple-500 rounded-full animate-spin"></div>
            </motion.div>
            <div className="space-y-2 text-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-32 animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-50'}`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-w-md w-full text-center`}
        >
          <motion.div 
            animate={{
              scale: [1, 1.1, 1],
              transition: { repeat: Infinity, duration: 2 }
            }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-red-500 dark:text-red-400 mb-6">{error}</p>
          </motion.div>
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium rounded-lg hover:shadow-md transition-all duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-50'}`}>
      {/* Animated background elements */}
      {!darkMode && (
        <div className="fixed inset-0 overflow-hidden -z-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-purple-200 to-indigo-200 opacity-20"
              style={{
                width: Math.random() * 200 + 100,
                height: Math.random() * 200 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(40px)'
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className={`flex items-center ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-purple-600 hover:text-purple-800'} font-medium transition-colors`}
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </motion.button>
        </motion.div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={container}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden`}
        >
          {/* Profile Header with Gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="relative z-10 p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-6">
                  <motion.div 
                    variants={fadeIn}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                    <div className={`relative h-24 w-24 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center overflow-hidden`}>
                      {user?.profile_picture ? (
                        <img 
                          src={user.profile_picture} 
                          alt={user.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={40} className="text-purple-600" />
                      )}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-700"
                    >
                      <Edit size={16} className="text-purple-600" />
                    </motion.button>
                  </motion.div>
                  
                  <motion.div variants={slideIn} className="text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-1">{user?.name || 'User'}</h1>
                    <p className="text-purple-100 flex items-center">
                      <Mail size={16} className="mr-2" />
                      {user?.email}
                    </p>
                    {user?.last_login && (
                      <p className="text-purple-100 text-sm mt-2 flex items-center">
                        <Clock size={14} className="mr-1" />
                        Last active: {new Date(user.last_login).toLocaleString()}
                      </p>
                    )}
                  </motion.div>
                </div>
                
                {user?.id === currentUser?.id && (
                  <motion.div 
                    variants={fadeIn}
                    className="mt-6 md:mt-0"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center px-5 py-2.5 rounded-lg ${darkMode ? 'bg-white text-gray-900' : 'bg-black text-white'} font-medium shadow-lg`}
                    >
                      <Settings size={18} className="mr-2" />
                      Edit Profile
                    </motion.button>
                  </motion.div>
                )}
              </div>
              
              {/* Tabs */}
              <motion.div 
                variants={fadeIn}
                className="flex space-x-1 mt-8 border-b border-white/10"
              >
                {['overview', 'activity', 'stats', 'settings'].map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === tab 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info Card */}
                    <motion.div 
                      variants={item}
                      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                      className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-purple-600">
                          <User className="mr-2" size={20} />
                          Personal Information
                        </h3>
                        <button className="p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors">
                          <Edit size={16} className="text-gray-500" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Full Name', value: user?.name, icon: User },
                          { label: 'Email', value: user?.email, icon: Mail },
                          { label: 'Phone', value: user?.phone || 'Not provided', icon: Phone },
                          { label: 'Member Since', value: new Date(user?.date_joined).toLocaleDateString(), icon: Calendar },
                        ].map((item, index) => (
                          <div key={index} className="flex items-start">
                            <item.icon size={16} className={`mt-0.5 mr-3 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <div className="flex-1">
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Wellness Stats Card */}
                    <motion.div 
                      variants={item}
                      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                      className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all duration-300`}
                    >
                      <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-600">
                        <Activity className="mr-2" size={20} />
                        Wellness Stats
                      </h3>
                      <div className="space-y-4">
                        {[
                          { 
                            label: 'Stress Level', 
                            value: user?.stress_level || 0, 
                            max: 10,
                            color: 'from-yellow-400 to-yellow-600',
                            icon: '😰'
                          },
                          { 
                            label: 'Anxiety Level', 
                            value: user?.anxiety_level || 0, 
                            max: 10,
                            color: 'from-red-400 to-red-600',
                            icon: '😨'
                          },
                          { 
                            label: 'Happiness', 
                            value: user?.happiness_level || 7, 
                            max: 10,
                            color: 'from-green-400 to-green-600',
                            icon: '😊'
                          },
                          { 
                            label: 'Energy', 
                            value: user?.energy_level || 6, 
                            max: 10,
                            color: 'from-blue-400 to-blue-600',
                            icon: '⚡'
                          },
                        ].map((stat, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {stat.icon} {stat.label}
                              </span>
                              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stat.value}/{stat.max}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                                style={{ width: `${(stat.value / stat.max) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div 
                      variants={item}
                      className={`md:col-span-2 p-6 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center text-purple-600">
                          <Clock className="mr-2" size={20} />
                          Recent Activity
                        </h3>
                        <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                          View All
                        </button>
                      </div>
                      <div className="space-y-4">
                        {[
                          { 
                            id: 1, 
                            title: 'Completed Daily Check-in', 
                            time: 'Just now',
                            icon: '✅',
                            description: 'You completed your daily mental health check-in.'
                          },
                          { 
                            id: 2, 
                            title: 'New Achievement Unlocked', 
                            time: '2 hours ago',
                            icon: '🏆',
                            description: 'You earned the "Mindful Master" badge for 7 consecutive days of meditation.'
                          },
                          { 
                            id: 3, 
                            title: 'Wellness Report Ready', 
                            time: '1 day ago',
                            icon: '📊',
                            description: 'Your weekly wellness report is ready to view.'
                          },
                        ].map((activity) => (
                          <motion.div 
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: activity.id * 0.1 }}
                            className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50 hover:bg-gray-700/70' : 'bg-white hover:bg-gray-50'} shadow-sm transition-colors border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">{activity.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {activity.title}
                                  </h4>
                                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {activity.time}
                                  </span>
                                </div>
                                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {activity.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="text-lg font-semibold mb-6 text-purple-600">Activity Timeline</h3>
                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <motion.div 
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: item * 0.1 }}
                          className={`relative pl-8 pb-6 border-l-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <div className={`absolute w-4 h-4 rounded-full -left-2 top-1 ${darkMode ? 'bg-purple-500' : 'bg-purple-400'}`}></div>
                          <div className={`absolute w-2 h-2 rounded-full -left-1 top-1 ${darkMode ? 'bg-white' : 'bg-white'}`}></div>
                          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {item === 1 ? 'Completed Meditation Session' : 
                                 item === 2 ? 'Posted a Journal Entry' : 
                                 item === 3 ? 'Completed Daily Check-in' : 
                                 item === 4 ? 'Earned New Badge' : 'Shared Progress'}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {item === 1 ? 'Just now' : 
                                 item === 2 ? '2 hours ago' : 
                                 item === 3 ? '1 day ago' : 
                                 item === 4 ? '2 days ago' : '3 days ago'}
                              </span>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item === 1 ? 'You completed a 10-minute mindfulness meditation session.' : 
                               item === 2 ? 'You wrote about your day and how you\'re feeling.' : 
                               item === 3 ? 'You checked in and rated your current mental state.' : 
                               item === 4 ? 'You earned the "Consistency Champion" badge!' : 
                               'You shared your weekly progress with your support group.'}
                            </p>
                            {item === 1 && (
                              <div className="mt-3 flex items-center text-sm text-purple-600 dark:text-purple-400">
                                <span>View Session Details</span>
                                <ChevronRight size={16} className="ml-1" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="text-lg font-semibold mb-6 text-purple-600">Your Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { 
                          title: 'Total Sessions', 
                          value: '24', 
                          change: '+12%', 
                          trend: 'up',
                          icon: <Activity size={20} className="text-blue-500" />
                        },
                        { 
                          title: 'Meditation Minutes', 
                          value: '1,245', 
                          change: '+8%', 
                          trend: 'up',
                          icon: <Clock size={20} className="text-purple-500" />
                        },
                        { 
                          title: 'Mood Average', 
                          value: '7.8/10', 
                          change: '+0.5', 
                          trend: 'up',
                          icon: <Heart size={20} className="text-pink-500" />
                        },
                        { 
                          title: 'Goals Completed', 
                          value: '15', 
                          change: '+3', 
                          trend: 'up',
                          icon: <Award size={20} className="text-yellow-500" />
                        },
                        { 
                          title: 'Stress Level', 
                          value: '5.2/10', 
                          change: '-1.2', 
                          trend: 'down',
                          icon: <Activity size={20} className="text-red-500" />
                        },
                        { 
                          title: 'Sleep Quality', 
                          value: '7.1/10', 
                          change: '+0.8', 
                          trend: 'up',
                          icon: <Moon size={20} className="text-indigo-500" />
                        },
                      ].map((stat, index) => (
                        <motion.div 
                          key={stat.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-5 rounded-xl ${darkMode ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white hover:bg-gray-50'} shadow-sm transition-colors`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-opacity-20" style={{ backgroundColor: stat.icon.props.className.includes('text-') ? stat.icon.props.className.split(' ')[1].replace('text-', 'bg-').replace('-500', '-500/20') : 'bg-gray-100' }}>
                              {stat.icon}
                            </div>
                            <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                              {stat.trend === 'up' ? (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              )}
                              {stat.change}
                            </div>
                          </div>
                          <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {stat.title}
                          </h4>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {stat.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="text-lg font-semibold mb-6 text-purple-600">Account Settings</h3>
                    <div className="space-y-4">
                      {[
                        { 
                          title: 'Personal Information', 
                          description: 'Update your name, email, and profile picture',
                          icon: <User size={20} className="text-purple-500" />,
                          action: () => {}
                        },
                        { 
                          title: 'Security', 
                          description: 'Change password and enable two-factor authentication',
                          icon: <Lock size={20} className="text-blue-500" />,
                          action: () => {}
                        },
                        { 
                          title: 'Notifications', 
                          description: 'Manage your notification preferences',
                          icon: <Bell size={20} className="text-yellow-500" />,
                          action: () => {}
                        },
                        { 
                          title: 'Privacy', 
                          description: 'Control your privacy settings',
                          icon: <Shield size={20} className="text-green-500" />,
                          action: () => {}
                        },
                        { 
                          title: 'Appearance', 
                          description: 'Change theme and display settings',
                          icon: darkMode ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-indigo-500" />,
                          action: toggleTheme
                        },
                        { 
                          title: 'Help & Support', 
                          description: 'Get help or contact support',
                          icon: <HelpCircle size={20} className="text-gray-500" />,
                          action: () => {}
                        },
                      ].map((setting, index) => (
                        <motion.button
                          key={setting.title}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={setting.action}
                          className={`w-full text-left p-4 rounded-xl ${darkMode ? 'bg-gray-800/50 hover:bg-gray-700/70' : 'bg-white hover:bg-gray-50'} shadow-sm transition-colors flex items-start`}
                        >
                          <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: setting.icon.props.className.includes('text-') ? setting.icon.props.className.split(' ')[1].replace('text-', 'bg-').replace('-500', '-500/20') : 'bg-gray-100' }}>
                            {setting.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {setting.title}
                            </h4>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {setting.description}
                            </p>
                          </div>
                          <ChevronRight size={20} className={`ml-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </motion.button>
                      ))}
                      
                      <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <button 
                          onClick={() => {}}
                          className="flex items-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          <LogOut size={18} className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDetails;
