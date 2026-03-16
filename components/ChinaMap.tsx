
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ContactsState } from '../types';

// 主要城市坐标映射数据库
const CITY_COORDS: Record<string, [number, number]> = {
  "北京市": [39.9042, 116.4074], "上海市": [31.2304, 121.4737], "天津市": [39.0841, 117.2009], "重庆市": [29.5630, 106.5516],
  "广州市": [23.1291, 113.2644], "深圳市": [22.5431, 114.0579], "杭州市": [30.2741, 120.1551], "成都市": [30.5728, 104.0668],
  "武汉市": [30.5928, 114.3055], "南京市": [32.0603, 118.7969], "西安市": [34.3416, 108.9398], "长沙市": [28.2282, 112.9388],
  "沈阳市": [41.6772, 123.4631], "大连市": [38.9140, 121.6147], "济南市": [36.6512, 117.1201], "青岛市": [36.0671, 120.3826],
  "福州市": [26.0745, 119.2965], "厦门市": [24.4798, 118.0894], "郑州市": [34.7466, 113.6253], "昆明市": [25.0406, 102.7122],
  "合肥市": [31.8206, 117.2272], "南昌市": [28.6820, 115.8579], "长春市": [43.8171, 125.3235], "哈尔滨市": [45.8038, 126.5350],
  "太原市": [37.8706, 112.5489], "石家庄市": [38.0423, 114.5149], "南宁市": [22.8170, 108.3665], "贵阳市": [26.5982, 106.7072],
  "兰州市": [36.0611, 103.8343], "乌鲁木齐市": [43.8256, 87.6177], "呼和浩特市": [40.8423, 111.7487], "海口市": [20.0174, 110.3492],
  "银川市": [38.4872, 106.2309], "西宁市": [36.6171, 101.7782], "拉萨市": [29.6441, 91.1145], "香港岛": [22.2800, 114.1700],
  "九龙": [22.3200, 114.1700], "新界": [22.4000, 114.1500], "澳门半岛": [22.1900, 113.5400], "台北市": [25.0330, 121.5654],
  "苏州市": [31.2989, 120.5853], "无锡市": [31.4912, 120.3119], "东莞市": [23.0205, 113.7518], "佛山市": [23.0215, 113.1214],
  "宁波市": [29.8603, 121.5440], "温州市": [27.9943, 120.6993], "烟台市": [37.4638, 121.4479], "无锡": [31.49, 120.31]
};

interface ChinaMapProps {
  onProvinceSelect: (id: string) => void;
  selectedProvince: string | null;
  contacts: ContactsState;
}

export const ChinaMap: React.FC<ChinaMapProps> = ({ onProvinceSelect, selectedProvince, contacts }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [35.0, 105.0],
      zoom: 4,
      zoomControl: true,
      minZoom: 3,
      maxZoom: 8,
      attributionControl: true,
      zoomSnap: 0.25
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      opacity: 0.5
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(res => res.json())
      .then(data => {
        const filtered = {
          ...data,
          features: data.features.filter((f: any) => f.properties.level === 'province' || f.properties.adcode !== 100000)
        };
        setGeoData(filtered);
      })
      .catch(err => console.error("GeoJSON Loading Error:", err));

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 当选择省份时，平移聚焦
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonLayerRef.current || !selectedProvince) return;

    const layers = geoJsonLayerRef.current.getLayers();
    const targetLayer = layers.find((l: any) => l.feature.properties.name === selectedProvince) as L.Path;
    
    if (targetLayer) {
      const bounds = (targetLayer as any).getBounds();
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 6,
        animate: true,
        duration: 1
      });
    } else {
      // 如果没选中，回到全国视野
      mapInstanceRef.current.setView([35.0, 105.0], 4, { animate: true });
    }
  }, [selectedProvince]);

  // 渲染地级市脉冲标记和省份样式
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return;

    if (geoJsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
    }
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const style = (feature: any) => {
      const name = feature.properties.name;
      const isSelected = name === selectedProvince;
      const provinceContacts = contacts[name] || [];
      const hasContacts = provinceContacts.length > 0;

      return {
        fillColor: isSelected ? '#79a1ff' : (hasContacts ? '#dfe9ff' : '#f8f9fb'),
        weight: isSelected ? 1.8 : 1,
        opacity: 1,
        color: isSelected ? '#f8fbff' : '#cfd6e2',
        fillOpacity: isSelected ? 0.92 : (hasContacts ? 0.86 : 0.96)
      };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
      const name = feature.properties.name;
      const provinceContacts = contacts[name] || [];
      const count = provinceContacts.length;

      layer.bindTooltip(`
        <div class="px-1">
          <div class="text-[10px] font-semibold uppercase text-[#8a9099] mb-1 tracking-[0.22em]">${name}</div>
          <div class="text-xs font-semibold text-[#1f2329]">${count > 0 ? `${count} 位联系人` : '点击开始记录'}</div>
        </div>
      `, { sticky: true, className: 'apple-tooltip' });

      layer.on({
        mouseover: (e) => {
          const l = e.target;
          if (l.feature.properties.name !== selectedProvince) {
            l.setStyle({ fillColor: '#edf3ff', color: '#b9c9ea', fillOpacity: 1 });
          }
        },
        mouseout: (e) => {
          geoJsonLayerRef.current?.resetStyle(e.target);
        },
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onProvinceSelect(name);
        }
      });
    };

    geoJsonLayerRef.current = L.geoJSON(geoData, {
      style,
      onEachFeature
    }).addTo(mapInstanceRef.current);

    // 绘制所有联系人的城市脉冲点
    Object.entries(contacts).forEach(([province, list]) => {
      const cityGroups = new Map<string, number>();
      list.forEach(c => {
        if (c.city) cityGroups.set(c.city, (cityGroups.get(c.city) || 0) + 1);
      });

      cityGroups.forEach((count, cityName) => {
        const coords = CITY_COORDS[cityName];
        if (coords && markersLayerRef.current) {
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="flex items-center justify-center">
                    <div class="marker-pulse"></div>
                    <div class="marker-core"></div>
                   </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker(coords, { icon: customIcon })
            .bindTooltip(`
              <div class="px-1">
                <div class="text-[9px] font-semibold text-[#8a9099] uppercase tracking-[0.18em] mb-1">${cityName}</div>
                <div class="text-xs font-semibold text-[#1f2329]">${count} 位联络人</div>
              </div>
            `, { className: 'apple-tooltip', direction: 'top', offset: [0, -5] })
            .on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              onProvinceSelect(province);
            })
            .addTo(markersLayerRef.current);
        }
      });
    });

  }, [geoData, selectedProvince, contacts, onProvinceSelect]);

  // 当侧边栏出现或消失时，触发地图重新计算大小
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: true });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [selectedProvince]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute inset-0 pointer-events-none rounded-[32px] border border-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.88),inset_0_0_120px_rgba(255,255,255,0.18)] z-20"></div>
      <div className="absolute left-5 top-5 z-20 pointer-events-none rounded-full border border-white/80 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a9099] backdrop-blur-md shadow-[0_14px_30px_rgba(18,24,40,0.08)]">
        Province Coverage
      </div>
    </div>
  );
};
