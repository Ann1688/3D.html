import { StampRecord, ExplorerTitle } from '../types/travel';

const STORAGE_KEY = 'taiwan_3d_passport_stamps_v1';

export const EXPLORER_TITLES: ExplorerTitle[] = [
  {
    title: '台灣初探者',
    minStamps: 0,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    description: '踏上台灣寶島的集章旅程，隨處發現驚喜。',
  },
  {
    title: '寶島漫遊旅人',
    minStamps: 10,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    description: '足跡漸次鋪展，在各大知名地標留下旅途印記。',
  },
  {
    title: '風土文化尋跡者',
    minStamps: 25,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    description: '深度穿梭古鎮老街與在地夜市，品味台灣濃厚人情味。',
  },
  {
    title: '百嶽海岸行家',
    minStamps: 50,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    description: '縱橫中央山脈與太平洋海岸線，山海美景盡收眼底。',
  },
  {
    title: '台灣深度旅人',
    minStamps: 75,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    description: '涉足外島秘境與幽境小鎮，成為無所不知的台灣通。',
  },
  {
    title: '福爾摩沙巡禮宗師',
    minStamps: 100,
    badgeColor: 'bg-gradient-to-r from-amber-500 to-red-500 text-white border-amber-300 shadow-md',
    description: '達成百大景點大滿貫！榮獲台灣觀光至高無上的巡禮宗師頭銜。',
  },
];

export function getStoredStamps(): Record<string, StampRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored stamps:', e);
    return {};
  }
}

export function saveStampToStorage(spotId: string): StampRecord {
  const current = getStoredStamps();
  const now = new Date();
  const record: StampRecord = {
    spotId,
    stampedAt: now.toISOString(),
    formattedDate: `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  };
  current[spotId] = record;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to write stamp to localStorage:', e);
  }
  return record;
}

export function removeStampFromStorage(spotId: string): void {
  const current = getStoredStamps();
  delete current[spotId];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to remove stamp:', e);
  }
}

export function clearAllStampsFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear stamps:', e);
  }
}

export function seedDemoStamps(spotIds: string[]): Record<string, StampRecord> {
  const records: Record<string, StampRecord> = {};
  const baseDate = new Date();
  spotIds.forEach((id, idx) => {
    const d = new Date(baseDate.getTime() - idx * 86400000 * 1.5);
    records[id] = {
      spotId: id,
      stampedAt: d.toISOString(),
      formattedDate: `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to seed demo stamps:', e);
  }
  return records;
}

export function getExplorerTitle(stampsCount: number): ExplorerTitle {
  for (let i = EXPLORER_TITLES.length - 1; i >= 0; i--) {
    if (stampsCount >= EXPLORER_TITLES[i].minStamps) {
      return EXPLORER_TITLES[i];
    }
  }
  return EXPLORER_TITLES[0];
}

export function getNextMilestone(stampsCount: number): { nextTitle: ExplorerTitle | null; remaining: number } {
  for (let i = 0; i < EXPLORER_TITLES.length; i++) {
    if (EXPLORER_TITLES[i].minStamps > stampsCount) {
      return {
        nextTitle: EXPLORER_TITLES[i],
        remaining: EXPLORER_TITLES[i].minStamps - stampsCount,
      };
    }
  }
  return { nextTitle: null, remaining: 0 };
}
