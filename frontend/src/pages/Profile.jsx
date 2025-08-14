import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.name || 'User'}</h2>
              <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Account Information</h3>
              <p className="text-white">Member since: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Subscription</h3>
              <p className="text-white">Free Plan</p>
              <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">Upgrade</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
