import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Award,
  CheckCircle,
  Lock,
  Calendar,
  Sparkles,
  RotateCcw,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Spot, StampRecord, Region, Category } from '../types/travel';
import {
  getExplorerTitle,
  getNextMilestone,
  EXPLORER_TITLES,
} from '../utils/passportStorage';

interface PassportViewProps {
  isOpen: boolean;
  onClose: () => void;
  spots: Spot[];
  stampedRecords: Record<string, StampRecord>;
  onSelectSpot: (spot: Spot) => void;
  onSeedDemoStamps: () => void;
  onClearAllStamps: () => void;
  onOpenCertificate: () => void;
}

export const PassportView: React.FC<PassportViewProps> = ({
  isOpen,
  onClose,
  spots,
  stampedRecords,
  onSelectSpot,
  onSeedDemoStamps,
  onClearAllStamps,
  onOpenCertificate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterRegion, setSelectedFilterRegion] = useState<Region>('all');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'stamped' | 'locked'>('all');

  const stampedCount = Object.keys(stampedRecords).length;
  const totalCount = spots.length;
  const progressPercent = Math.round((stampedCount / totalCount) * 100);

  const currentTitle = getExplorerTitle(stampedCount);
  const { nextTitle, remaining } = getNextMilestone(stampedCount);

  // Filtered spots in passport
  const filteredPassportSpots = useMemo(() => {
    return spots.filter((s) => {
      // Region
      if (selectedFilterRegion !== 'all' && s.region !== selectedFilterRegion) return false;
      // Category
      if (selectedFilterCategory !== 'all' && s.category !== selectedFilterCategory) return false;
      // Status
      const isStamped = !!stampedRecords[s.id];
      if (statusFilter === 'stamped' && !isStamped) return false;
      if (statusFilter === 'locked' && isStamped) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCounty = s.county.toLowerCase().includes(q);
        const matchId = s.id.toLowerCase().includes(q);
        if (!matchName && !matchCounty && !matchId) return false;
      }
      return true;
    });
  }, [spots, selectedFilterRegion, selectedFilterCategory, statusFilter, searchQuery, stampedRecords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[94vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center text-xl shadow-lg">
              📮
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                台灣觀光百大集章冊
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold">
                  PASSPORT
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                記錄您橫跨全台灣各大美景的足跡與榮譽勳章
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCertificate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>檢視成就證書</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Passport Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Progress & Honor Title Hero Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-700/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              {/* Explorer Title Badge */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-red-500 flex items-center justify-center text-2xl shadow-md shrink-0">
                  🎖️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                      目前榮譽頭銜
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                      {currentTitle.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {currentTitle.description}
                  </p>
                </div>
              </div>

              {/* Real-time Counter */}
              <div className="flex items-baseline gap-2 shrink-0 md:text-right">
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                  {stampedCount}
                </span>
                <span className="text-slate-400 text-sm font-medium">/ {totalCount} 景點</span>
                <span className="ml-2 px-2.5 py-1 rounded-xl bg-white/10 text-xs font-mono font-bold text-emerald-400">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(2, progressPercent)}%` }}
              />
            </div>

            {/* Next Milestone Hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>起步：台灣初探者 (0章)</span>
              {nextTitle ? (
                <span>
                  距離下一榮譽「<strong className="text-amber-300">{nextTitle.title}</strong>」還差{' '}
                  <strong className="text-amber-400 font-mono">{remaining}</strong> 個章
                </span>
              ) : (
                <span className="text-amber-300 font-bold">★ 已達成百大最高榮譽！</span>
              )}
            </div>

            {/* Quick Demo & Reset Tools for Testing Convenience */}
            <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-400 text-[11px]">
                提示：點擊任何景點卡片即可查看景點細節並蓋上專屬紀念章。
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSeedDemoStamps}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 transition-all active:scale-95"
                >
                  ✨ 一鍵填滿 15 個範例章 (體驗模式)
                </button>
                {stampedCount > 0 && (
                  <button
                    onClick={onClearAllStamps}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 transition-all active:scale-95"
                  >
                    全部清除
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search & Filters Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋景點名稱、縣市 (例如：阿里山、台北、花蓮)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Status Filter Pill (All / Stamped / Locked) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                全部 ({spots.length})
              </button>
              <button
                onClick={() => setStatusFilter('stamped')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  statusFilter === 'stamped'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                已收集 ({stampedCount})
              </button>
              <button
                onClick={() => setStatusFilter('locked')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  statusFilter === 'locked'
                    ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                未解鎖 ({totalCount - stampedCount})
              </button>
            </div>
          </div>

          {/* 100 Spots Stamp Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredPassportSpots.map((spot) => {
              const isStamped = !!stampedRecords[spot.id];
              const record = stampedRecords[spot.id];

              return (
                <div
                  key={spot.id}
                  onClick={() => onSelectSpot(spot)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                    isStamped
                      ? 'bg-gradient-to-b from-red-50/60 to-amber-50/40 dark:from-red-950/20 dark:to-slate-800/80 border-red-300 dark:border-red-900 shadow-sm hover:shadow-md hover:scale-[1.02]'
                      : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 opacity-80 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                >
                  {/* Top Bar with ID & Region */}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        isStamped
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {spot.id}
                    </span>
                    <span className="text-slate-400">{spot.regionName}</span>
                  </div>

                  {/* Stamp Seal Visual Area */}
                  <div className="w-full aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center p-2 text-center my-1 relative overflow-hidden transition-all duration-300">
                    {isStamped ? (
                      // Authentic Vermilion Cinnabar Stamp
                      <div className="w-full h-full rounded-lg border-2 border-red-600 dark:border-red-500 p-1.5 flex flex-col items-center justify-between bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-400 rotate-[-1deg]">
                        <span className="text-[8px] tracking-widest font-serif uppercase">
                          TAIWAN STAMP
                        </span>
                        <div className="font-serif font-black text-xs sm:text-sm tracking-wider leading-snug line-clamp-2">
                          {spot.name}
                        </div>
                        <span className="text-[8px] font-mono text-red-500/90 dark:text-red-400/90">
                          {record?.formattedDate ? record.formattedDate.split(' ')[0] : '已收集'}
                        </span>
                      </div>
                    ) : (
                      // Locked Seal Silhouette
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <Lock className="w-6 h-6 mb-1 opacity-40 group-hover:opacity-70 transition-opacity" />
                        <span className="text-[10px] font-medium opacity-60">尚未蓋印</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Spot Name & Location */}
                  <div className="mt-2">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {spot.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center justify-between mt-0.5">
                      <span>{spot.county}</span>
                      <span className="text-amber-500 font-semibold">{spot.categoryName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPassportSpots.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">沒有找到符合條件的景點。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
