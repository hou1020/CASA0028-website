import React from 'react';
import StatCard from './StatCard';

function Dashboard({ 
  year, 
  setYear, 
  severityFilter, 
  setSeverityFilter, 
  stats
}) {
  return (
    <div className="w-[360px] flex flex-col h-full bg-gray-900 border-r border-gray-800 shadow-2xl z-10 overflow-y-auto">
      
      {/* 头部区域 */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          伦敦道路安全探索仪
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          探索大伦敦地区交通事故的空间分布，识别高危路段，为城市规划提供洞察。
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">
        
        {/* 组件 1: 现代化下拉菜单 (Select) */}
        <div>
          <label htmlFor="Year" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            📅 选择年份数据
          </label>
          <div className="relative">
            <select
              id="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="2019">2019 年</option>
              <option value="2018">2018 年</option>
              <option value="2017">2017 年</option>
              <option value="2016">2016 年</option>
              <option value="2015">2015 年</option>
            </select>
            {/* 自定义下拉小箭头 */}
            <span className="pointer-events-none absolute inset-y-0 right-0 w-10 flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>

        {/* 组件 2: 高级卡片式单选框 (Radio Cards - 类似 HyperUI) */}
        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            ⚠️ 事故严重程度 (Severity)
          </label>
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="sr-only">Severity Options</legend>

            {[
              { id: 'All', label: '全部显示', color: 'text-blue-400', border: 'border-blue-500', ring: 'ring-blue-500' },
              { id: 'Fatal', label: '🔴 致命', color: 'text-red-400', border: 'border-red-500', ring: 'ring-red-500' },
              { id: 'Serious', label: '🟠 严重', color: 'text-orange-400', border: 'border-orange-500', ring: 'ring-orange-500' },
              { id: 'Slight', label: '🟡 轻微', color: 'text-yellow-400', border: 'border-yellow-500', ring: 'ring-yellow-500' }
            ].map((option) => (
              <div key={option.id}>
                <label
                  htmlFor={option.id}
                  className={`block cursor-pointer rounded-xl border p-3 text-center text-sm font-medium transition-all hover:bg-gray-800
                    ${severityFilter === option.id 
                      ? `bg-gray-800 border-transparent ring-2 ${option.ring} shadow-lg` 
                      : 'border-gray-700 bg-gray-900/50 text-gray-400'}
                  `}
                >
                  <input
                    type="radio"
                    name="SeverityOption"
                    value={option.id}
                    id={option.id}
                    className="sr-only" // 隐藏原生的圆点
                    checked={severityFilter === option.id}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  />
                  <span className={severityFilter === option.id ? option.color : 'text-gray-300'}>
                    {option.label}
                  </span>
                </label>
              </div>
            ))}
          </fieldset>
        </div>

      </div>

      {/* 组件 3: 数据统计网格卡片 (Stat Cards) */}
      <div className="p-6 bg-gray-800/50 border-t border-gray-800 mt-auto">
        <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center justify-between">
          <span>{year} 数据洞察</span>
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </h3>
      
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="总事故记录" value={stats.total} textColor="text-white" borderColor="border-gray-700" />
          <StatCard title="致命事故" value={stats.fatal} textColor="text-red-500" borderColor="border-red-900/30" />
          <StatCard title="严重事故" value={stats.serious} textColor="text-orange-400" borderColor="border-orange-900/30" />
          <StatCard title="轻微事故" value={stats.slight} textColor="text-yellow-400" borderColor="border-yellow-900/30" />
        </div>

        
        <div className="mt-4 text-center">
           <a href="https://api.tfl.gov.uk/" target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors">
              Data source: Transport for London Open API
           </a>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;