
import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { ContactsState } from '../types';
import {
  buildCityMarkerGroups,
  CityCoordinate,
  getCityCoordinateSync,
  resolveCityCoordinate,
} from '../utils/cityCoordinates';

interface ChinaMapProps {
  onProvinceSelect: (id: string) => void;
  selectedProvince: string | null;
  contacts: ContactsState;
}

export const ChinaMap: React.FC<ChinaMapProps> = ({ onProvinceSelect, selectedProvince, contacts }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedProvinceLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [resolvedCoordinates, setResolvedCoordinates] = useState<Record<string, CityCoordinate>>({});

  const cityMarkerGroups = useMemo(() => buildCityMarkerGroups(contacts), [contacts]);

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
      opacity: 0.36
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

  fetch(`${import.meta.env.BASE_URL}100000_full.json`)
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to load GeoJSON: ${res.status}`);
    }
    return res.json();
  })
  .then((data) => {
    const filtered = {
      ...data,
      features: data.features.filter(
        (f: any) =>
          f.properties.level === "province" || f.properties.adcode !== 100000
      ),
    };
    setGeoData(filtered);
  })
  .catch((err) => console.error("GeoJSON Loading Error:", err));
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

  useEffect(() => {
    let cancelled = false;
    const nextResolved: Record<string, CityCoordinate> = {};
    const unresolved = cityMarkerGroups.filter((group) => {
      const cached = getCityCoordinateSync(group.province, group.city);
      if (cached) {
        nextResolved[group.key] = cached;
        return false;
      }
      return true;
    });

    if (Object.keys(nextResolved).length > 0) {
      setResolvedCoordinates((prev) => {
        const merged = { ...prev };
        let changed = false;

        Object.entries(nextResolved).forEach(([key, value]) => {
          if (!merged[key]) {
            merged[key] = value;
            changed = true;
          }
        });

        return changed ? merged : prev;
      });
    }

    if (unresolved.length === 0) return;

    Promise.all(
      unresolved.map(async (group) => {
        const coordinate = await resolveCityCoordinate(group.province, group.city);
        return [group.key, coordinate] as const;
      })
    ).then((results) => {
      if (cancelled) return;

      const resolvedEntries = results.reduce<Record<string, CityCoordinate>>((acc, [key, coordinate]) => {
        if (coordinate) {
          acc[key] = coordinate;
        }
        return acc;
      }, {});

      if (Object.keys(resolvedEntries).length > 0) {
        setResolvedCoordinates((prev) => ({ ...prev, ...resolvedEntries }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cityMarkerGroups]);

  // 渲染地级市脉冲标记和省份样式
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData) return;

    if (geoJsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
    }
    if (selectedProvinceLayerRef.current) {
      mapInstanceRef.current.removeLayer(selectedProvinceLayerRef.current);
    }
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const style = (feature: any) => {
      const name = feature.properties.name;
      const provinceContacts = contacts[name] || [];
      const hasContacts = provinceContacts.length > 0;

      return {
        fillColor: hasContacts ? '#e7efff' : '#f5f7fb',
        weight: 1,
        opacity: 1,
        color: '#d2d9e4',
        fillOpacity: hasContacts ? 0.9 : 0.98,
        lineCap: 'round' as const,
        lineJoin: 'round' as const,
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
            l.setStyle({
              fillColor: '#edf3ff',
              color: '#bfcce3',
              fillOpacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
            });
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

    if (selectedProvince) {
      const selectedFeature = geoData.features.find((feature: any) => feature.properties.name === selectedProvince);
      if (selectedFeature) {
        selectedProvinceLayerRef.current = L.geoJSON(selectedFeature, {
          interactive: false,
          style: {
            fillColor: '#eef4ff',
            fillOpacity: 0.72,
            color: '#7f9fd9',
            opacity: 0.98,
            weight: 1.6,
            lineCap: 'round',
            lineJoin: 'round',
          },
        }).addTo(mapInstanceRef.current);
        selectedProvinceLayerRef.current.bringToFront();
      }
    }

    cityMarkerGroups.forEach((group) => {
      const coords = resolvedCoordinates[group.key] || getCityCoordinateSync(group.province, group.city);
      if (!coords || !markersLayerRef.current) return;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="flex items-center justify-center">
                <div class="marker-pulse"></div>
                <div class="marker-core"></div>
               </div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      L.marker(coords, { icon: customIcon })
        .bindTooltip(`
          <div class="px-1">
            <div class="text-[9px] font-semibold text-[#8a9099] uppercase tracking-[0.18em] mb-1">${group.city}</div>
            <div class="text-xs font-semibold text-[#1f2329]">${group.count} 位联络人</div>
          </div>
        `, { className: 'apple-tooltip', direction: 'top', offset: [0, -5] })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onProvinceSelect(group.province);
        })
        .addTo(markersLayerRef.current);
    });

  }, [cityMarkerGroups, geoData, onProvinceSelect, resolvedCoordinates, selectedProvince, contacts]);

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
      <div className="absolute inset-0 pointer-events-none rounded-[26px] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_0_90px_rgba(255,255,255,0.10)] z-20"></div>
    </div>
  );
};
