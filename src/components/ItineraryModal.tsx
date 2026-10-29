import React, { useState } from 'react';
import {
  X,
  Compass,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Car,
  Train,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Spot, StampRecord } from '../types/travel';

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  spots: Spot[];
  stampedRecords: Record<string, StampRecord>;
  onSelectSpot: (spot: Spot) => void;
}

interface CuratedRoute {
  id: string;
  name: string;
  duration: string;
  transport: string;
  description: string;
  tag: string;
  spotIds: string[];
}

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  spots,
  stampedRecords,
  onSelectSpot,
}) => {
  const [activeTab, setActiveTab] = useState<'smart' | 'curated'>('smart');
  const [selectedRouteId, setSelectedRouteId] = useState('r1');

  // Curated Signature Routes
  const curatedRoutes: CuratedRoute[] = [
    {
      id: 'r1',
      name: '北部山海與文青探索線',
      duration: '3天2夜',
      transport: '捷運 ＋ 台灣好行公車 ＋ 鐵道',
      tag: '都會漫遊 & 海洋地質',
      description: '從台北 101 高空漫步，穿梭故宮文明與士林夜市，再探訪九份黃金山城與野柳女王頭奇岩。',
      spotIds: ['TW-TPE-01', 'TW-TPE-03', 'TW-TPE-04', 'TW-NTP-02', 'TW-NTP-05', 'TW-TPE-06'],
    },
    {
      id: 'r2',
      name: '中台灣山林療癒與古鎮之旅',
      duration: '4天3夜',
      transport: '高鐵 ＋ 租車自駕',
      tag: '高山森林 & 湖光山色',
      description: '享受日月潭水天一色自行車道、清境小瑞士高山草坡，順遊鹿港紅磚老街品嚐傳統糕點。',
      spotIds: ['TW-TXG-08', 'TW-TXG-09', 'TW-NAN-07', 'TW-NAN-11', 'TW-CHW-10', 'TW-NAN-55'],
    },
    {
      id: 'r3',
      name: '南台灣陽光古蹟美食環線',
      duration: '3天2夜',
      transport: '高鐵 ＋ 輕軌 ＋ 在地機車',
      tag: '古蹟巡禮 & 港都微風',
      description: '登上阿里山觀祝山日出，再探訪台南安平古堡與神農老街，夜晚沉浸在駁二藝術特區與大港橋港灣夜色。',
      spotIds: ['TW-CYI-12', 'TW-CYI-66', 'TW-TNN-13', 'TW-TNN-72', 'TW-KHH-14', 'TW-PIF-15'],
    },
    {
      id: 'r4',
      name: '東部蔚藍太平洋慢活療癒線',
      duration: '4天3夜',
      transport: '台鐵新自強號 ＋ 縱谷鐵馬自行車',
      tag: '世界級峽谷 & 稻浪天際',
      description: '深入太魯閣大理石燕子口，漫步七星潭月牙灣聽海濤，再騎乘單車縱橫台東池上伯朗大道與三仙台八拱橋。',
      spotIds: ['TW-HUA-16', 'TW-HUA-17', 'TW-HUA-84', 'TW-TTT-18', 'TW-TTT-19', 'TW-TTT-90'],
    },
    {
      id: 'r5',
      name: '離島風情與海洋秘境尋跡線',
      duration: '5天4夜',
      transport: '國內航班 ＋ 跳島交通快艇',
      tag: '雙心石滬 & 閩東石屋 & 海龜共游',
      description: '尋訪澎湖七美雙心石滬花火節、馬祖芹壁地中海石屋與藍眼淚，再到小琉球花瓶岩與綠蠵龜悠遊。',
      spotIds: ['TW-PEN-20', 'TW-MZU-22', 'TW-KIN-21', 'TW-XLU-25', 'TW-LYD-23', 'TW-LNY-24'],
    },
  ];

  // Smart User Route: Connect user's collected spots into a customized round-island plan
  const stampedSpots = spots.filter((s) => !!stampedRecords[s.id]);

  // Sort stamped spots from North to South, then East to West for a smooth logical travel sequence
  const smartItinerary = [...stampedSpots].sort((a, b) => {
    // Primary sort: Z (North to South)
    return a.z - b.z;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-slate-900 dark:to-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                台灣環島慢活行程規劃
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                以最舒心的步調，智慧串聯您的集章足跡與推薦旅行路線
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-800 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('smart')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'smart'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>智慧已集章專屬串聯路線 ({stampedSpots.length} 個點)</span>
          </button>
          <button
            onClick={() => setActiveTab('curated')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'curated'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>觀光局推薦 5 大慢活經典航線</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'smart' ? (
            // TAB 1: SMART USER ITINERARY
            <div className="space-y-4">
              {smartItinerary.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3">
                    🗺️
                  </div>
                  <h4 className="font-bold text-base text-slate-700 dark:text-slate-200 mb-1">
                    尚未收集任何紀念章
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">
                    請先在 3D 地圖上點擊景點並蓋上印章，系統將自動為您串聯成專屬順暢的環島慢活行程！
                  </p>
                  <button
                    onClick={() => setActiveTab('curated')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                  >
                    查看 5 大經典推薦航線 ➜
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">
                        依地理順序推薦慢活環島路線
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        已為您由北向南順向串聯 {smartItinerary.length} 個已解鎖的寶島名景
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded-full">
                      推薦週期：{Math.ceil(smartItinerary.length / 3)} 天
                    </span>
                  </div>

                  {/* Connected Spots Timeline */}
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-red-500 before:to-emerald-500">
                    {smartItinerary.map((spot, idx) => (
                      <div
                        key={spot.id}
                        className="relative group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow"
                        onClick={() => onSelectSpot(spot)}
                      >
                        {/* Timeline Node Icon */}
                        <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shadow-md">
                          {idx + 1}
                        </div>

                        {/* Spot Info */}
                        <div className="flex items-start gap-3">
                          <img
                            src={spot.image}
                            alt={spot.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-bold font-mono">
                                {spot.id}
                              </span>
                              <span className="text-xs text-slate-500">{spot.county}</span>
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                {spot.categoryName}
                              </span>
                            </div>
                            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                              {spot.name}
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {spot.highlights[0]}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            已蓋紀念章
                          </span>
                          <span className="text-slate-400 group-hover:text-amber-500 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // TAB 2: CURATED SIGNATURE 5 ROUTES
            <div className="space-y-6">
              {/* Route Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {curatedRoutes.map((route) => {
                  const isCuratedActive = selectedRouteId === route.id;
                  return (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                        isCuratedActive
                          ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {route.name}
                    </button>
                  );
                })}
              </div>

              {/* Active Curated Route Details */}
              {(() => {
                const currentRoute = curatedRoutes.find((r) => r.id === selectedRouteId) || curatedRoutes[0];
                const routeSpots = currentRoute.spotIds
                  .map((id) => spots.find((s) => s.id === id))
                  .filter(Boolean) as Spot[];

                return (
                  <div className="space-y-5">
                    {/* Route Card Header */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                          {currentRoute.tag}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {currentRoute.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-sky-500" />
                            {currentRoute.transport}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {currentRoute.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {currentRoute.description}
                      </p>
                    </div>

                    {/* Spot Nodes in this Route */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {routeSpots.map((spot, i) => {
                        const isStamped = !!stampedRecords[spot.id];
                        return (
                          <div
                            key={spot.id}
                            onClick={() => onSelectSpot(spot)}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer flex items-center justify-between gap-3 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <div>
                                <h6 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                  {spot.name}
                                </h6>
                                <span className="text-[10px] text-slate-400">
                                  {spot.county} • {spot.categoryName}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isStamped
                                  ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                                  : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                              }`}
                            >
                              {isStamped ? '★ 已蓋章' : '未收集'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
