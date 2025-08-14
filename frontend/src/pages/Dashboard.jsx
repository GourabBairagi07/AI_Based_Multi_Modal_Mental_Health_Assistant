import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import KpiCards from '../components/KpiCards';
import AnalysisWidgets from '../components/AnalysisWidgets';
import MentalHealthAssessment from '../components/MentalHealthAssessment';

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Welcome back, {firstName} 👋
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
          <p className="text-gray-300">
            Here's what's happening with your dashboard today.
          </p>
          <Link
            to="/assessment"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/20 whitespace-nowrap"
          >
            Take Mental Health Assessment
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <KpiCards />

      {/* Analysis Widgets */}
      <AnalysisWidgets />

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">
            Recent Activity
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { id: 1, action: 'New patient assessment completed', time: '2 hours ago', icon: '📝', color: 'from-blue-400 to-blue-600' },
            { id: 2, action: 'High stress level detected in session', time: '5 hours ago', icon: '⚠️', color: 'from-amber-400 to-amber-600' },
            { id: 3, action: 'Weekly report generated', time: '1 day ago', icon: '📊', color: 'from-purple-400 to-purple-600' },
            { id: 4, action: 'New therapy session scheduled', time: '2 days ago', icon: '📅', color: 'from-emerald-400 to-emerald-600' },
          ].map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 5 }}
              className="px-6 py-4 flex items-center group hover:bg-white/5 transition-colors duration-200"
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center text-white shadow-lg`}>
                {activity.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-400">
                  {activity.time}
                </p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Mental Health Assessment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        <MentalHealthAssessment />
      </motion.div>
    </div>
  );
};

export default Dashboard;
