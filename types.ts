
export interface Contact {
  id: string;
  name: string;
  city: string; // 新增城市字段
  note: string;
  category?: 'friend' | 'colleague' | 'local-expert';
  addedAt: number;
}

export interface ProvinceData {
  id: string;
  name: string;
  chineseName: string;
  contacts: Contact[];
}

export interface ContactsState {
  [provinceId: string]: Contact[];
}

export interface GeoJsonFeature {
  type: string;
  id: string;
  properties: {
    name: string;
    cp: [number, number];
    id: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}
