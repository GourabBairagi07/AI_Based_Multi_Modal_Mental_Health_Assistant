import { useState } from 'react';
import { motion } from 'framer-motion';

const HealthTracker = () => {
  const [activeTab, setActiveTab] = useState('mood');
  
  const tabs = [
    { id: 'mood', label: 'Mood' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'stress', label: 'Stress Level' },
    { id: 'activity', label: 'Activity' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mood':
        return (
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Mood Tracker</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Mood chart will be displayed here</p>
            </div>
          </div>
        );
      case 'sleep':
        return (
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Sleep Tracker</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Sleep data will be displayed here</p>
            </div>
          </div>
        );
      case 'stress':
        return (
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Stress Level</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Stress level data will be displayed here</p>
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Activity Tracker</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Activity data will be displayed here</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Health Tracker</h1>
          
          <div className="border-b border-white/10 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {renderTabContent()}
        </div>
      </motion.div>
    </div>
  );
};

export default HealthTracker;
