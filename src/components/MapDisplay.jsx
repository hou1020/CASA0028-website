import { useState, useCallback, useMemo } from 'react';
import { Map, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

function MapDisplay({ data }) {
  // 记录鼠标悬停的事故点
  const [hoverInfo, setHoverInfo] = useState(null);

  // 地图样式配置 (使用 useMemo 防止每次渲染都重新创建对象)
  const accidentLayerStyle = useMemo(() => ({
    id: 'accidents-layer',
    type: 'circle',
    source: 'accidents-data',
    paint: {
      // 大小映射：致命=大，严重=中，轻微=小
      'circle-radius': [
        'match',
        ['get', 'severity'],
        'Fatal', 8,
        'Serious', 5,
        3
      ],
      // 颜色映射：跟侧边栏的数据面板颜色对应
      'circle-color': [
        'match',
        ['get', 'severity'],
        'Fatal', '#ef4444',   // 红色
        'Serious', '#fb923c', // 橙色
        '#facc15'             // 黄色
      ],
      'circle-opacity': 0.7,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#111827' // 黑色描边让点在地图上更清晰
    }
  }), []);

  // 鼠标移动事件：检测是否悬停在数据点上
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
        longitude: -0.1276, // 伦敦市中心
        latitude: 51.5072,
        zoom: 10.5,
        pitch: 0
      }}
      // 💡 1. 限制缩放级别
      minZoom={9}    // 最小缩放级别：防止缩得太小（9大约是整个大伦敦的视野）
      maxZoom={18}   // 最大缩放级别：防止放得太大（18大约能看清具体的街道）
      
      // 💡 2. 限制拖拽范围 (Bounding Box)，把视野锁死在伦敦周边
      maxBounds={[
        [-1, 51], // 西南角 (Southwest)
        [0.8, 52] // 东北角 (Northeast)
      ]}
      style={{ width: '100%', height: '100%' }}
      // 使用带科技感的暗色底图，极大地凸显高亮的事故数据点
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      attributionControl={false}
      interactiveLayerIds={['accidents-layer']}
      onMouseMove={onHover}
      onMouseLeave={() => setHoverInfo(null)}
      // 鼠标变成指针形状提示可交互
      cursor={hoverInfo ? 'pointer' : 'grab'} 
    >
      <Source id="accidents-data" type="geojson" data={data}>
        <Layer {...accidentLayerStyle} />
      </Source>

      {/* 悬停气泡 (Popup) */}
      {hoverInfo && (
        <Popup
          longitude={hoverInfo.lngLat[0]}
          latitude={hoverInfo.lngLat[1]}
          closeButton={false} // 悬停不需要关闭按钮
          closeOnClick={false}
          anchor="bottom"
          offset={10}
          className="z-50"
        >
          {/* 使用 Tailwind 渲染漂亮的弹窗 */}
          <div className="p-1 min-w-[200px]">
            <div className={`font-bold text-sm mb-2 pb-2 border-b ${
              hoverInfo.feature.properties.severity === 'Fatal' ? 'text-red-600 border-red-100' :
              hoverInfo.feature.properties.severity === 'Serious' ? 'text-orange-500 border-orange-100' :
              'text-yellow-600 border-yellow-100'
            }`}>
              {hoverInfo.feature.properties.severity === 'Fatal' && '🔴 致命事故 (Fatal)'}
              {hoverInfo.feature.properties.severity === 'Serious' && '🟠 严重事故 (Serious)'}
              {hoverInfo.feature.properties.severity === 'Slight' && '🟡 轻微事故 (Slight)'}
            </div>
            <div className="text-xs text-gray-600 space-y-1.5">
              <p><span className="font-semibold">📅 日期:</span> {hoverInfo.feature.properties.date}</p>
              <p className="truncate"><span className="font-semibold">📍 地点:</span> {hoverInfo.feature.properties.location}</p>
              <div className="flex gap-2 mt-3 pt-2">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded shadow-sm">
                  🩸 伤亡: <span className="font-bold">{hoverInfo.feature.properties.casualties}</span>
                </span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded shadow-sm">
                  🚗 车辆: <span className="font-bold">{hoverInfo.feature.properties.vehicles}</span>
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