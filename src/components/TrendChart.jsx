import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function TrendChart({ rawData, severityFilter }) {
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    const filtered = rawData.filter(accident => {
      if (severityFilter === 'All') return true;
      return accident.severity === severityFilter;
    });

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const counts = new Array(12).fill(0);

    filtered.forEach(accident => {
      const dateObj = new Date(accident.date);
      const monthIndex = dateObj.getMonth();
      if (!isNaN(monthIndex)) {
        counts[monthIndex]++;
      }
    });

    return monthNames.map((month, index) => ({
      name: month,
      count: counts[index]
    }));
  }, [rawData, severityFilter]);

  const getBarColor = () => {
    switch (severityFilter) {
      case 'Fatal': return '#ef4444';
      case 'Serious': return '#fb923c';
      case 'Slight': return '#facc15';
      default: return '#60a5fa';
    }
  };

  return (
    // 💡 修改点：宽度高度设为全满 (w-full h-full)，去除毛玻璃和背景色
    <div className="w-full h-full flex flex-col">
      <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider px-2 flex justify-between">
        <span>📈 每月事故趋势</span>
        <span className="text-gray-500">
           {severityFilter === 'All' ? '全部' : severityFilter === 'Fatal' ? '致命' : severityFilter === 'Serious' ? '严重' : '轻微'}级别
        </span>
      </h4>
      <div className="flex-1 w-full outline-none [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: '#374151', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
              itemStyle={{ color: getBarColor(), fontWeight: 'bold' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor()} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendChart;