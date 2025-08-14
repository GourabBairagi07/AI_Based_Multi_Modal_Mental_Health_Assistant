import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield, Heart, CheckCircle, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    guardianEmail: '',
    password: '',
    confirmPassword: '',
    isStressed: '',
    hasMentalHealthCondition: '',
    feelingScale: 5,
    dataConsent: false,
    termsConsent: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';

    // Length check
    if (password.length >= 8) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set message based on score
    if (score === 0) message = 'Very weak';
    else if (score === 1) message = 'Weak';
    else if (score === 2) message = 'Fair';
    else if (score === 3) message = 'Good';
    else if (score === 4) message = 'Strong';
    else if (score === 5) message = 'Very strong';

    setPasswordStrength({ score, message });
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score === 0) return 'bg-red-500';
    if (score === 1) return 'bg-red-400';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-yellow-400';
    if (score === 4) return 'bg-green-400';
    if (score === 5) return 'bg-green-500';
    return 'bg-gray-200';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (passwordStrength.score < 3) {
      alert('Please choose a stronger password!');
      setIsSubmitting(false);
      return;
    }

    // Validate consents
    if (!formData.dataConsent || !formData.termsConsent) {
      alert('You must agree to the data consent and terms of use!');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          guardian_email: formData.guardianEmail || null,
          password: formData.password,
          confirm_password: formData.confirmPassword
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        localStorage.setItem('token', token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Create an initial assessment using available form inputs (best-effort)
        try {
          const feeling = parseInt(formData.feelingScale);
          const assessmentPayload = {
            stress_level: feeling,
            anxiety_level: feeling,
            depression_level: feeling,
            sleep_quality: feeling,
            energy_level: feeling,
            notes: `isStressed=${formData.isStressed || 'n/a'}; condition=${formData.hasMentalHealthCondition || 'n/a'}`
          };
          await fetch('http://localhost:8000/api/assessment/', {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(assessmentPayload)
          });
        } catch (err) {
          console.error('Initial assessment creation failed:', err);
        }

        window.dispatchEvent(new Event('auth-change'));
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        let errorMessage = 'Registration failed';
        if (errorData.error) {
          errorMessage = `Registration failed: ${errorData.error}`;
        } else if (errorData.email) {
          errorMessage = `Registration failed: ${errorData.email[0]}`;
        } else if (errorData.full_name) {
          errorMessage = `Registration failed: ${errorData.full_name[0]}`;
        } else if (errorData.password) {
          errorMessage = `Registration failed: ${errorData.password[0]}`;
        } else if (errorData.confirm_password) {
          errorMessage = `Registration failed: ${errorData.confirm_password[0]}`;
        } else if (errorData.guardian_email) {
          errorMessage = `Registration failed: ${errorData.guardian_email[0]}`;
        } else if (errorData.non_field_errors) {
          errorMessage = `Registration failed: ${errorData.non_field_errors[0]}`;
        }
        
        try {
          navigate('/dashboard');
        } catch (navError) {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      try {
        navigate('/dashboard');
      } catch (navError) {
        alert('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="max-w-2xl mx-auto relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div 
            className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <User className="h-10 w-10 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3"
          >
            Join Your Journey
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 text-lg"
          >
            Create your account and start your mental health journey today
          </motion.p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Basic Details Section */}
            <motion.div 
              variants={sectionVariants}
              className="space-y-6"
            >
              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-2"
              >
                <User className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Basic Details
                </h3>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <motion.input
                id="fullName"
                name="fullName"
                type="text"
                required
                      className="pl-10 w-full px-4 py-4 border border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur-sm transition-all duration-300"
                value={formData.fullName}
                onChange={handleChange}
                      whileFocus={{ scale: 1.02 }}
              />
            </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <motion.input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                      className="pl-10 w-full px-4 py-4 border border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur-sm transition-all duration-300"
                value={formData.email}
                onChange={handleChange}
                      whileFocus={{ scale: 1.02 }}
              />
                  </div>
                </motion.div>
            </div>

              <motion.div variants={itemVariants}>
                <label htmlFor="guardianEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Email (for crisis alerts)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <motion.input
                id="guardianEmail"
                name="guardianEmail"
                type="email"
                placeholder="guardian@example.com"
                    className="pl-10 w-full px-4 py-4 border border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur-sm transition-all duration-300"
                value={formData.guardianEmail}
                onChange={handleChange}
                    whileFocus={{ scale: 1.02 }}
              />
            </div>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <motion.input
                id="password"
                name="password"
                type="password"
                required
                      className="pl-10 w-full px-4 py-4 border border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur-sm transition-all duration-300"
                value={formData.password}
                onChange={handleChange}
                      whileFocus={{ scale: 1.02 }}
              />
                  </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                      className={`h-2.5 rounded-full ${getPasswordStrengthColor()}`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Password strength: {passwordStrength.message}
                  </p>
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <motion.input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                      className="pl-10 w-full px-4 py-4 border border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur-sm transition-all duration-300"
                value={formData.confirmPassword}
                onChange={handleChange}
                      whileFocus={{ scale: 1.02 }}
              />
                  </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-xs text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </motion.p>
                  )}
                </motion.div>
            </div>
            </motion.div>
          
          {/* Mental Health Questions Section */}
            <motion.div 
              variants={sectionVariants}
              className="space-y-6 pt-8 border-t border-purple-200"
            >
              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-2"
              >
                <Heart className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Mental Health Assessment
                </h3>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you currently feel stressed, anxious, or sad often?
                  </label>
                  <div className="space-y-3">
                    {['yes', 'no'].map((option) => (
                      <motion.label
                        key={option}
                        className="flex items-center space-x-3 cursor-pointer group"
                        whileHover={{ x: 5 }}
                      >
                  <input
                          type="radio"
                    name="isStressed"
                          value={option}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300"
                          checked={formData.isStressed === option}
                    onChange={handleChange}
                    required
                  />
                        <span className="text-sm text-gray-700 capitalize group-hover:text-purple-600 transition-colors">
                          {option}
                        </span>
                      </motion.label>
                    ))}
                </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Have you been diagnosed with a mental health condition before?
                  </label>
                  <div className="space-y-3">
                    {['yes', 'no', 'prefer_not_to_say'].map((option) => (
                      <motion.label
                        key={option}
                        className="flex items-center space-x-3 cursor-pointer group"
                        whileHover={{ x: 5 }}
                      >
                  <input
                    type="radio"
                    name="hasMentalHealthCondition"
                          value={option}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300"
                          checked={formData.hasMentalHealthCondition === option}
                    onChange={handleChange}
                    required
                  />
                        <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                          {option === 'prefer_not_to_say' ? 'Prefer not to say' : option}
                        </span>
                      </motion.label>
                    ))}
                </div>
                </motion.div>
            </div>
            
              <motion.div variants={itemVariants}>
                <label htmlFor="feelingScale" className="block text-sm font-medium text-gray-700 mb-3">
                On a scale of 1 to 10, how are you feeling today?
              </label>
                <div className="bg-white/50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">😢 Very Low</span>
                    <span className="text-sm text-gray-500">😊 Very High</span>
                  </div>
                  <motion.input
                  id="feelingScale"
                  name="feelingScale"
                  type="range"
                  min="1"
                  max="10"
                    className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.feelingScale}
                  onChange={handleChange}
                />
                  <div className="text-center mt-4">
                    <motion.span 
                      key={formData.feelingScale}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-purple-600"
                    >
                      {formData.feelingScale}
                    </motion.span>
              </div>
            </div>
              </motion.div>
            </motion.div>
          
          {/* Consent Checkboxes */}
            <motion.div 
              variants={sectionVariants}
              className="space-y-6 pt-8 border-t border-purple-200"
            >
              <motion.div 
                variants={itemVariants}
                className="flex items-start space-x-4 p-4 bg-purple-50/50 rounded-xl border border-purple-200"
              >
                <motion.div 
                  className="flex items-center h-5"
                  whileHover={{ scale: 1.1 }}
                >
                <input
                  id="dataConsent"
                  name="dataConsent"
                  type="checkbox"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                  checked={formData.dataConsent}
                  onChange={handleChange}
                  required
                />
                </motion.div>
                <div className="text-sm">
                <label htmlFor="dataConsent" className="font-medium text-gray-700">Data Consent</label>
                <p className="text-gray-500">I agree to share my data for mental health analysis purposes. My data will be handled confidentially.</p>
              </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="flex items-start space-x-4 p-4 bg-purple-50/50 rounded-xl border border-purple-200"
              >
                <motion.div 
                  className="flex items-center h-5"
                  whileHover={{ scale: 1.1 }}
                >
                <input
                  id="termsConsent"
                  name="termsConsent"
                  type="checkbox"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                  checked={formData.termsConsent}
                  onChange={handleChange}
                  required
                />
                </motion.div>
                <div className="text-sm">
                <label htmlFor="termsConsent" className="font-medium text-gray-700">Terms & Privacy</label>
                <p className="text-gray-500">I agree to the Terms of Use and Privacy Policy.</p>
              </div>
              </motion.div>
            </motion.div>
          
            <motion.div variants={itemVariants}>
              <motion.button
              type="submit"
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
              Create Account
                  </span>
                )}
              </motion.button>
            </motion.div>
        </form>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Register;