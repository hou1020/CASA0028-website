// src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import MapDisplay from './components/MapDisplay';
import Dashboard from './components/Dashboard'; // Import the newly extracted component / 引入新拆分的组件
import TrendChart from './components/TrendChart';

function App() {
  // State variables / 定义状态变量
  const [year, setYear] = useState('2019');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter state / 过滤器状态
  const [severityFilter, setSeverityFilter] = useState('All');

  // 1. Fetch real TfL data / 获取 TfL 真实数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.tfl.gov.uk/AccidentStats/${year}`);
        if (!response.ok) throw new Error('API request failed, please try again later'); // Update error message to English
        const data = await response.json();
        setRawData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]); // Re-fetch data when 'year' changes / 当 year 改变时，重新获取数据

  // 2. Data processing & filtering -> Convert to GeoJSON format for MapLibre / 数据处理与过滤 -> 转换为 MapLibre 需要的 GeoJSON 格式
  const geojsonData = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    // Filter data based on sidebar selection / 先根据侧边栏的选项过滤数据
    const filtered = rawData.filter(accident => {
      if (severityFilter === 'All') return true;
      return accident.severity === severityFilter;
    });

    // Assemble into GeoJSON structure / 组装成 GeoJSON 结构
    return {
      type: 'FeatureCollection',
      features: filtered.map(accident => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [accident.lon, accident.lat]
        },
        properties: {
          id: accident.id,
          severity: accident.severity,
          date: new Date(accident.date).toLocaleDateString(),
          location: accident.location,
          casualties: accident.casualties ? accident.casualties.length : 0,
          vehicles: accident.vehicles ? accident.vehicles.length : 0
        }
      }))
    };
  }, [rawData, severityFilter]); // Only recalculate when data or filter changes / 只有当数据或过滤器改变时才重新计算

  // 3. Dynamically calculate stats for the dashboard / 动态计算统计数据 (供侧边栏展示)
  const stats = useMemo(() => {
    if (!rawData) return { total: 0, fatal: 0, serious: 0, slight: 0 };
    return {
      total: rawData.length,
      fatal: rawData.filter(d => d.severity === 'Fatal').length,
      serious: rawData.filter(d => d.severity === 'Serious').length,
      slight: rawData.filter(d => d.severity === 'Slight').length,
    };
  }, [rawData]);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white font-sans overflow-hidden">
      
      {/* ===== Left Control Panel / 左侧控制面板 ===== */}
      <Dashboard 
        year={year} 
        setYear={setYear} 
        severityFilter={severityFilter} 
        setSeverityFilter={setSeverityFilter} 
        stats={stats}
      />

      {/* ===== Right Main Area / 右侧主区域 ===== */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Loading Animation / 加载动画 */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-medium tracking-widest text-blue-400 animate-pulse">
              Fetching massive spatial data...
            </div>
          </div>
        )}
        
        {/* Error Message / 错误提示 */}
        {error && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-2xl z-20 flex items-center">
            <span className="mr-2">⚠️</span> Data loading failed: {error}
          </div>
        )}
        
        {/* Map and Chart Components / 地图与图表组件 */}
        {geojsonData && (
          <>
            {/* 1. Map container on top (flex-1 takes up remaining space) / 地图在上面 (flex-1 占据上方所有剩余空间) */}
            <div className="flex-1 relative">
              <MapDisplay data={geojsonData} />
            </div>

            {/* 2. Chart container on bottom (fixed height) / 图表在下面 (固定高度 h-56，使用 border-t 顶部边框) */}
            <div className="h-56 w-full p-4 bg-gray-900 border-t border-gray-800 shrink-0 shadow-sm z-10">
              <TrendChart rawData={rawData} severityFilter={severityFilter} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;