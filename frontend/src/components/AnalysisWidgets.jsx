import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalysisWidgets = () => {
  // Voice analysis data
  const voiceData = [
    { name: 'Calm', value: 55, color: '#4F46E5' },
    { name: 'Stressed', value: 20, color: '#EC4899' },
    { name: 'Excited', value: 15, color: '#10B981' },
    { name: 'Depressed', value: 10, color: '#F59E0B' },
  ];

  // Text sentiment data
  const textData = [
    { name: 'Positive', value: 65, color: '#10B981' },
    { name: 'Neutral', value: 25, color: '#6B7280' },
    { name: 'Negative', value: 10, color: '#EF4444' },
  ];

  // Facial expression data
  const faceData = [
    { name: 'Happy', value: 60, color: '#F59E0B' },
    { name: 'Neutral', value: 25, color: '#6B7280' },
    { name: 'Sad', value: 10, color: '#3B82F6' },
    { name: 'Angry', value: 5, color: '#EF4444' },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#6B7280"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderChart = (data, title) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Analysis Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderChart(voiceData, 'Voice Analysis')}
        {renderChart(textData, 'Text Sentiment')}
        {renderChart(faceData, 'Facial Expression')}
      </div>
    </div>
  );
};

export default AnalysisWidgets;
