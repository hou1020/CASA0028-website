import { useState, useEffect, useMemo } from 'react';
import MapDisplay from './components/MapDisplay';
// 确保你已经运行过 npm install maplibre-gl react-map-gl

function App() {
  const [year, setYear] = useState('2019');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 过滤器状态
  const [severityFilter, setSeverityFilter] = useState('All');

  // 1. 获取 TfL 真实数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.tfl.gov.uk/AccidentStats/${year}`);
        if (!response.ok) throw new Error('API请求失败，请稍后再试');
        const data = await response.json();
        setRawData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]); // 当 year 改变时，重新获取数据

  // 2. 数据处理与过滤 -> 转换为 MapLibre 需要的 GeoJSON 格式
  const geojsonData = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    // 先根据侧边栏的选项过滤数据
    const filtered = rawData.filter(accident => {
      if (severityFilter === 'All') return true;
      return accident.severity === severityFilter;
    });

    // 组装成 GeoJSON
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
  }, [rawData, severityFilter]); // 只有当数据或过滤器改变时才重新计算

  // 3. 动态计算统计数据 (供侧边栏展示)
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
      
      {/* ===== 左侧控制面板 (Dashboard) ===== */}
      <div className="w-80 flex flex-col p-6 bg-gray-800 border-r border-gray-700 shadow-2xl z-10">
        <h1 className="text-2xl font-bold mb-2 text-blue-400">伦敦道路安全探索仪</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          探索大伦敦地区交通事故的空间分布，识别高危路段，为城市规划提供洞察。
        </p>

        {/* 交互：年份筛选器 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-300">📅 选择年份数据</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="2019">2019 年</option>
            <option value="2018">2018 年</option>
            <option value="2017">2017 年</option>
          </select>
        </div>

        {/* 交互：严重程度筛选器 */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3 text-gray-300">⚠️ 事故严重程度 (Severity)</label>
          <div className="flex flex-col space-y-3 bg-gray-900 p-4 rounded-md border border-gray-700">
            {['All', 'Fatal', 'Serious', 'Slight'].map(sev => (
              <label key={sev} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="severity"
                  value={sev}
                  checked={severityFilter === sev}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className={`text-sm group-hover:text-white transition-colors ${severityFilter === sev ? 'text-white font-medium' : 'text-gray-400'}`}>
                  {sev === 'All' ? '全部显示 (All)' : sev === 'Fatal' ? '🔴 致命 (Fatal)' : sev === 'Serious' ? '🟠 严重 (Serious)' : '🟡 轻微 (Slight)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 动态洞察：数据仪表盘 */}
        <div className="bg-gray-700 p-5 rounded-lg mt-auto border border-gray-600 shadow-inner">
          <h3 className="text-sm font-bold text-gray-300 mb-3 border-b border-gray-600 pb-2 uppercase tracking-wider">
            {year} 交通洞察统计
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">总事故记录</p>
              <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">致命事故</p>
              <p className="text-2xl font-black text-red-500">{stats.fatal}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">严重事故</p>
              <p className="text-2xl font-black text-orange-400">{stats.serious}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">轻微事故</p>
              <p className="text-2xl font-black text-yellow-400">{stats.slight}</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-4 text-center">Data source: Transport for London Open API</p>
      </div>

      {/* ===== 右侧主地图区域 ===== */}
      <div className="flex-1 relative">
        {/* 加载动画 */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-medium tracking-widest text-blue-400 animate-pulse">抓取海量空间数据中...</div>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-2xl z-20 flex items-center">
            <span className="mr-2">⚠️</span> 数据加载失败: {error}
          </div>
        )}
        
        {/* 地图组件 */}
        {geojsonData && <MapDisplay data={geojsonData} />}
      </div>
    </div>
  );
}

export default App;