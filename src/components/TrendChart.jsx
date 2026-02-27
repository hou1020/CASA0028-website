// src/components/TrendChart.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function TrendChart({ rawData, severityFilter }) {
  // Advanced Data Processing: Aggregate messy data into monthly statistics
  // 高级数据处理：将杂乱的数据按“月份”进行聚类统计
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    // 1. Filter data based on severity / 根据严重程度过滤数据
    const filtered = rawData.filter(accident => {
      if (severityFilter === 'All') return true;
      return accident.severity === severityFilter;
    });

    // 2. Initialize 12 months (English labels) / 初始化 12 个月的英文标签
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    // 3. Iterate and accumulate monthly counts / 遍历并累加每月事故数
    filtered.forEach(accident => {
      const dateObj = new Date(accident.date);
      const monthIndex = dateObj.getMonth(); // returns 0-11 / 返回 0-11
      if (!isNaN(monthIndex)) {
        counts[monthIndex]++;
      }
    });

    // 4. Assemble into Recharts format / 组装成 Recharts 格式
    return monthNames.map((month, index) => ({
      name: month,
      count: counts[index]
    }));
  }, [rawData, severityFilter]);

  // Dynamically change bar colors based on filter / 根据过滤器动态改变柱状图颜色
  const getBarColor = () => {
    switch (severityFilter) {
      case 'Fatal': return '#ef4444';   // red
      case 'Serious': return '#fb923c'; // orange
      case 'Slight': return '#facc15';  // yellow
      default: return '#60a5fa';        // blue
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Header / 图表头部 */}
      <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider px-2 flex justify-between">
        <span>📈 Monthly Accident Trend</span>
        <span className="text-gray-500 capitalize">
           {severityFilter.toLowerCase()} Level
        </span>
      </h4>

      {/* Chart Container / 图表容器 */}
      {/* 💡 outline-none and selector added to remove focus blue border / 加上了 outline-none 去掉点击时的蓝色边框 */}
      <div className="flex-1 w-full outline-none [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            {/* Axis Configuration / 坐标轴配置 */}
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            
            {/* Dark-themed Tooltip / 暗黑风格提示框 */}
            <Tooltip 
              cursor={{ fill: '#374151', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
              itemStyle={{ color: getBarColor(), fontWeight: 'bold' }}
            />

            {/* Bar Styling / 柱状图样式 */}
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