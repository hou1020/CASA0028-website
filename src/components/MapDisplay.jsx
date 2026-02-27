// src/components/MapDisplay.jsx
import { useState, useCallback, useMemo } from 'react';
import { Map, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

function MapDisplay({ data }) {
  // State for tracked hovered feature / 记录鼠标悬停的事故点
  const [hoverInfo, setHoverInfo] = useState(null);

  // Map layer configuration (useMemo to prevent re-creation on every render) 
  // 地图样式配置 (使用 useMemo 防止每次渲染都重新创建对象)
  const accidentLayerStyle = useMemo(() => ({
    id: 'accidents-layer',
    type: 'circle',
    source: 'accidents-data',
    paint: {
      // Radius mapping: Fatal=Large, Serious=Medium, Slight=Small
      // 大小映射：致命=大，严重=中，轻微=小
      'circle-radius': [
        'match',
        ['get', 'severity'],
        'Fatal', 8,
        'Serious', 5,
        3
      ],
      // Color mapping: Consistent with the dashboard data panel
      // 颜色映射：跟侧边栏的数据面板颜色对应
      'circle-color': [
        'match',
        ['get', 'severity'],
        'Fatal', '#ef4444',   // Red
        'Serious', '#fb923c', // Orange
        '#facc15'             // Yellow
      ],
      'circle-opacity': 0.7,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#111827' // Dark stroke for better visibility / 黑色描边让点更清晰
    }
  }), []);

  // Mouse move handler: detect hover on data points / 鼠标移动事件：检测是否悬停在数据点上
  const onHover = useCallback(event => {
    const { features, lngLat } = event;
    const hoveredFeature = features && features[0];

    if (hoveredFeature) {
      setHoverInfo({
        feature: hoveredFeature,
        lngLat: [lngLat.lng, lngLat.lat]
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: -0.1276, // Central London / 伦敦市中心
        latitude: 51.5072,
        zoom: 10.5,
        pitch: 0
      }}
      
      // 1. Zoom limits / 限制缩放级别
      minZoom={9}    
      maxZoom={18}   
      
      // 2. Map bounds (keep manually adjusted values) / 限制拖拽范围 (保留手动调整的数值)
      maxBounds={[
        [-1, 51], // Southwest / 西南角
        [0.8, 52] // Northeast / 东北角
      ]}
      
      style={{ width: '100%', height: '100%' }}
      // Tech-style dark basemap to highlight data points / 使用暗色底图凸显高亮数据点
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      attributionControl={false}
      interactiveLayerIds={['accidents-layer']}
      onMouseMove={onHover}
      onMouseLeave={() => setHoverInfo(null)}
      // Cursor style feedback / 鼠标形状反馈
      cursor={hoverInfo ? 'pointer' : 'grab'} 
    >
      <Source id="accidents-data" type="geojson" data={data}>
        <Layer {...accidentLayerStyle} />
      </Source>

      {/* Hover Popup / 悬停气泡 */}
      {hoverInfo && (
        <Popup
          longitude={hoverInfo.lngLat[0]}
          latitude={hoverInfo.lngLat[1]}
          closeButton={false} 
          closeOnClick={false}
          anchor="bottom"
          offset={10}
          className="z-50"
        >
          {/* Tailwind styled popup / 使用 Tailwind 渲染弹窗 */}
          <div className="p-1 min-w-[200px] max-w-[250px]">
            <div className={`font-bold text-sm mb-2 pb-2 border-b ${
              hoverInfo.feature.properties.severity === 'Fatal' ? 'text-red-600 border-red-100' :
              hoverInfo.feature.properties.severity === 'Serious' ? 'text-orange-500 border-orange-100' :
              'text-yellow-600 border-yellow-100'
            }`}>
              {hoverInfo.feature.properties.severity === 'Fatal' && '🔴 Fatal Accident'}
              {hoverInfo.feature.properties.severity === 'Serious' && '🟠 Serious Accident'}
              {hoverInfo.feature.properties.severity === 'Slight' && '🟡 Slight Accident'}
            </div>
            <div className="text-xs text-gray-600 space-y-1.5">
              <p><span className="font-semibold">📅 Date:</span> {hoverInfo.feature.properties.date}</p>
              <p className="whitespace-normal break-words leading-relaxed">
                <span className="font-semibold">📍 Location:</span> {hoverInfo.feature.properties.location}
              </p>
              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded shadow-sm">
                  🩸 Casualties: <span className="font-bold">{hoverInfo.feature.properties.casualties}</span>
                </span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded shadow-sm">
                  🚗 Vehicles: <span className="font-bold">{hoverInfo.feature.properties.vehicles}</span>
                </span>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}

export default MapDisplay;