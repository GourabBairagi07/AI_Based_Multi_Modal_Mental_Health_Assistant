import { motion } from 'framer-motion';

const KpiCards = () => {
  const kpis = [
    { 
      title: 'Patients Screened', 
      value: '1,248',
      change: '+12.5%',
      icon: '👥',
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      iconBg: 'bg-blue-500/20',
      changeColor: 'text-green-400',
      changeIcon: '↑',
      progress: 75
    },
    { 
      title: 'High-Risk Cases', 
      value: '24',
      change: '+2.4%',
      icon: '⚠️',
      trend: 'up',
      color: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-500/10',
      iconBg: 'bg-rose-500/20',
      changeColor: 'text-rose-400',
      changeIcon: '↑',
      progress: 65
    },
    { 
      title: 'Avg. Sentiment', 
      value: '78%',
      change: '+5.2%',
      icon: '😊',
      trend: 'up',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500/20',
      changeColor: 'text-green-400',
      changeIcon: '↑',
      progress: 78
    },
    { 
      title: 'Avg. Stress', 
      value: '3.2',
      change: '0.8',
      icon: '📊',
      trend: 'down',
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      iconBg: 'bg-amber-500/20',
      changeColor: 'text-amber-400',
      changeIcon: '↓',
      progress: 32
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className={`relative overflow-hidden rounded-2xl ${kpi.bg} backdrop-blur-sm border border-white/10 shadow-xl`}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
              style={{
                maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 70%)',
              }}
            />
          </div>
          
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">{kpi.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <span className={`text-sm font-medium ${kpi.changeColor} flex items-center`}>
                    {kpi.changeIcon} {kpi.change}
                  </span>
                </div>
              </div>
              
              <div className={`p-3 rounded-xl ${kpi.iconBg} backdrop-blur-sm`}>
                <span className="text-2xl">{kpi.icon}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-6 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${kpi.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${kpi.progress}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 1, type: 'spring' }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KpiCards;
