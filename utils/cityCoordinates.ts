export type CityCoordinate = [number, number];

export interface CityMarkerGroup {
  city: string;
  count: number;
  key: string;
  province: string;
}

const CACHE_KEY = 'huayu-city-coords-v1';

const KNOWN_CITY_COORDS: Record<string, CityCoordinate> = {
  '北京市': [39.9042, 116.4074],
  '上海市': [31.2304, 121.4737],
  '天津市': [39.0841, 117.2009],
  '重庆市': [29.563, 106.5516],
  '广州市': [23.1291, 113.2644],
  '深圳市': [22.5431, 114.0579],
  '杭州市': [30.2741, 120.1551],
  '成都市': [30.5728, 104.0668],
  '武汉市': [30.5928, 114.3055],
  '宜昌市': [30.6919, 111.2865],
  '南京市': [32.0603, 118.7969],
  '西安市': [34.3416, 108.9398],
  '长沙市': [28.2282, 112.9388],
  '沈阳市': [41.6772, 123.4631],
  '大连市': [38.914, 121.6147],
  '济南市': [36.6512, 117.1201],
  '青岛市': [36.0671, 120.3826],
  '福州市': [26.0745, 119.2965],
  '厦门市': [24.4798, 118.0894],
  '郑州市': [34.7466, 113.6253],
  '昆明市': [25.0406, 102.7122],
  '合肥市': [31.8206, 117.2272],
  '南昌市': [28.682, 115.8579],
  '长春市': [43.8171, 125.3235],
  '哈尔滨市': [45.8038, 126.535],
  '太原市': [37.8706, 112.5489],
  '石家庄市': [38.0423, 114.5149],
  '南宁市': [22.817, 108.3665],
  '贵阳市': [26.5982, 106.7072],
  '兰州市': [36.0611, 103.8343],
  '乌鲁木齐市': [43.8256, 87.6177],
  '呼和浩特市': [40.8423, 111.7487],
  '海口市': [20.0174, 110.3492],
  '银川市': [38.4872, 106.2309],
  '西宁市': [36.6171, 101.7782],
  '拉萨市': [29.6441, 91.1145],
  '香港岛': [22.28, 114.17],
  '九龙': [22.32, 114.17],
  '新界': [22.4, 114.15],
  '澳门半岛': [22.19, 113.54],
  '台北市': [25.033, 121.5654],
  '苏州市': [31.2989, 120.5853],
  '无锡市': [31.4912, 120.3119],
  '东莞市': [23.0205, 113.7518],
  '佛山市': [23.0215, 113.1214],
  '宁波市': [29.8603, 121.544],
  '温州市': [27.9943, 120.6993],
  '烟台市': [37.4638, 121.4479],
};

const CITY_ALIASES: Record<string, string> = {
  '北京': '北京市',
  '上海': '上海市',
  '天津': '天津市',
  '重庆': '重庆市',
  '广州': '广州市',
  '深圳': '深圳市',
  '杭州': '杭州市',
  '成都': '成都市',
  '武汉': '武汉市',
  '宜昌': '宜昌市',
  '南京': '南京市',
  '西安': '西安市',
  '长沙': '长沙市',
  '沈阳': '沈阳市',
  '大连': '大连市',
  '济南': '济南市',
  '青岛': '青岛市',
  '福州': '福州市',
  '厦门': '厦门市',
  '郑州': '郑州市',
  '昆明': '昆明市',
  '合肥': '合肥市',
  '南昌': '南昌市',
  '长春': '长春市',
  '哈尔滨': '哈尔滨市',
  '太原': '太原市',
  '石家庄': '石家庄市',
  '南宁': '南宁市',
  '贵阳': '贵阳市',
  '兰州': '兰州市',
  '乌鲁木齐': '乌鲁木齐市',
  '呼和浩特': '呼和浩特市',
  '海口': '海口市',
  '银川': '银川市',
  '西宁': '西宁市',
  '拉萨': '拉萨市',
  '台北': '台北市',
  '苏州': '苏州市',
  '无锡': '无锡市',
  '东莞': '东莞市',
  '佛山': '佛山市',
  '宁波': '宁波市',
  '温州': '温州市',
  '烟台': '烟台市',
};

function normalizeCityName(city: string): string {
  const trimmed = city.trim();
  if (!trimmed) return '';
  return CITY_ALIASES[trimmed] || trimmed;
}

function buildCacheKey(province: string, city: string): string {
  return `${province}::${normalizeCityName(city)}`;
}

function readCache(): Record<string, CityCoordinate> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(nextCache: Record<string, CityCoordinate>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(nextCache));
  } catch {
    // Ignore storage failures; marker resolution can continue in-memory.
  }
}

export function getCityCoordinateKey(province: string, city: string): string {
  return buildCacheKey(province, city);
}

export function getCityCoordinateSync(province: string, city: string): CityCoordinate | null {
  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return null;

  const cached = readCache()[buildCacheKey(province, normalizedCity)];
  if (cached) return cached;

  return KNOWN_CITY_COORDS[normalizedCity] || null;
}

export async function resolveCityCoordinate(province: string, city: string): Promise<CityCoordinate | null> {
  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return null;

  const known = getCityCoordinateSync(province, normalizedCity);
  if (known) return known;

  const query = `${normalizedCity}, ${province}, China`;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=cn&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) return null;

    const results = await response.json();
    const first = Array.isArray(results) ? results[0] : null;
    if (!first?.lat || !first?.lon) return null;

    const coordinates: CityCoordinate = [Number(first.lat), Number(first.lon)];
    const nextCache = {
      ...readCache(),
      [buildCacheKey(province, normalizedCity)]: coordinates,
    };
    writeCache(nextCache);
    return coordinates;
  } catch {
    return null;
  }
}

export function buildCityMarkerGroups(contactsByProvince: Record<string, Array<{ city: string }>>): CityMarkerGroup[] {
  const grouped = new Map<string, CityMarkerGroup>();

  Object.entries(contactsByProvince).forEach(([province, contacts]) => {
    contacts.forEach((contact) => {
      const normalizedCity = normalizeCityName(contact.city || '');
      if (!normalizedCity) return;

      const key = buildCacheKey(province, normalizedCity);
      const existing = grouped.get(key);
      if (existing) {
        existing.count += 1;
        return;
      }

      grouped.set(key, {
        city: normalizedCity,
        count: 1,
        key,
        province,
      });
    });
  });

  return Array.from(grouped.values());
}
