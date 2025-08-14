import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Brain, 
  ArrowLeft,
  Edit,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    full_name: 'Loading...',
    email: 'Loading...',
    guardianEmail: 'Loading...',
    lastAssessment: 'Loading...',
    stressLevel: 0,
    anxietyLevel: 0,
    depressionLevel: 0
  });
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    full_name: '',
    guardianEmail: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

        const response = await fetch('http://localhost:8000/api/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        // Get the last assessment date
        const assessmentsResponse = await fetch('http://localhost:8000/api/assessment/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let lastAssessmentDate = 'No assessments yet';
        if (assessmentsResponse.ok) {
          const assessments = await assessmentsResponse.json();
          if (assessments.length > 0) {
            lastAssessmentDate = new Date(assessments[0].date_taken).toLocaleDateString();
          }
        }

        const userInfo = {
          name: data.full_name || 'User',
          email: data.email || 'No email',
          guardianEmail: data.guardian_email || 'Not set',
          lastAssessment: lastAssessmentDate,
          stressLevel: data.stress_level || 0,
          anxietyLevel: data.anxiety_level || 0,
          depressionLevel: data.depression_level || 0
        };

        setUserData(userInfo);
        setEditForm({
          name: userInfo.name,
          guardianEmail: userInfo.guardianEmail
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: editForm.name,
          guardian_email: editForm.guardianEmail
        })
      });

      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          name: editForm.name,
          guardianEmail: editForm.guardianEmail
        }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({
      full_name: userData.full_name,
      guardianEmail: userData.guardianEmail
    });
    setIsEditing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
      {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between mb-8"
        >
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/dashboard" className="mr-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors">
              <ArrowLeft className="h-6 w-6 text-purple-600" />
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Profile
            </h1>
          </motion.div>
          
          <motion.button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center ${
              isEditing 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <motion.div 
            variants={cardVariants}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center">
                <User className="h-7 w-7 mr-3 text-purple-600" />
                Personal Information
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <motion.input
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur-sm transition-all duration-300"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-purple-50/50 rounded-xl border border-purple-200">
                        <span className="text-gray-900">{userData.full_name}</span>
                </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-600">{userData.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Email
                  </label>
                  {isEditing ? (
                    <motion.input
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      type="email"
                      value={editForm.guardianEmail}
                      onChange={(e) => setEditForm(prev => ({ ...prev, guardianEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur-sm transition-all duration-300"
                      placeholder="guardian@example.com"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-purple-50/50 rounded-xl border border-purple-200">
                      <span className="text-gray-900">{userData.guardianEmail}</span>
                  </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Used for crisis alerts</p>
                </div>
                
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex space-x-3 pt-4"
                  >
                    <motion.button
                      onClick={handleSave}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Save className="h-4 w-4 mr-2 inline" />
                      Save Changes
                    </motion.button>
                    
                    <motion.button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Assessment History */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center">
                <Calendar className="h-7 w-7 mr-3 text-purple-600" />
                Assessment History
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-200">
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">Last Assessment</span>
                  </div>
                  <span className="text-gray-900 font-medium">{userData.lastAssessment}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Stress Level', value: userData.stressLevel, color: 'bg-yellow-500', icon: TrendingUp },
                    { label: 'Anxiety Level', value: userData.anxietyLevel, color: 'bg-orange-500', icon: AlertTriangle },
                    { label: 'Depression Level', value: userData.depressionLevel, color: 'bg-blue-500', icon: Heart }
                  ].map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <motion.div 
                        key={metric.label}
                        className="p-4 bg-white/50 rounded-xl border border-gray-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center mb-3">
                          <Icon className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}/10</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className={`${metric.color} h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value * 10}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                  </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Quick Stats */}
          <motion.div 
            variants={cardVariants}
            className="space-y-6"
          >
            {/* Profile Summary */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 text-center"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white text-2xl font-bold">{userData.full_name.charAt(0)}</span>
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{userData.full_name}</h3>
              <p className="text-gray-600 mb-4">{userData.email}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Member since</span>
                  <span className="text-gray-900 font-medium">2024</span>
                  </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assessments</span>
                  <span className="text-gray-900 font-medium">Active</span>
                </div>
              </div>
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-purple-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  New Assessment
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-purple-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                  View Progress
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
    </div>
    </motion.div>
  );
};

export default Profile;