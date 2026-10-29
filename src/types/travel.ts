export type Region = 'all' | 'north' | 'central' | 'south' | 'east' | 'islands';

export type Category = 'nature' | 'coast' | 'culture' | 'landmark' | 'food';

export type LightingMode = 'day' | 'sunset' | 'night';

export interface Spot {
  id: string; // e.g. "TW-TPE-01"
  name: string; // e.g. "台北 101 觀景台"
  englishName: string;
  region: 'north' | 'central' | 'south' | 'east' | 'islands';
  regionName: string; // "北部", "中部", etc.
  county: string; // "台北市", "花蓮縣", etc.
  category: Category;
  categoryName: string; // "休閒樂園", "壯麗自然", etc.
  x: number; // 3D map X (-10 to 10)
  z: number; // 3D map Z (-15 to 15)
  altitude: string; // "508m", "海平面", "2,190m"
  rating: number; // 4.8
  image: string; // Unsplash scenery URL
  bestSeason: string; // "全年皆宜", "秋季賞楓", "夏季日出"
  highlights: string[];
  description: string;
  history: string;
  insiderFood: string[];
  aiTip: string;
}

export interface StampRecord {
  spotId: string;
  stampedAt: string; // ISO date string
  formattedDate: string;
}

export interface ExplorerTitle {
  title: string;
  minStamps: number;
  badgeColor: string;
  description: string;
}
