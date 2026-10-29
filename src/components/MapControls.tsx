import React, { useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Category, LightingMode, Region } from '../types/travel';

interface MapControlsProps {
  lightingMode: LightingMode;
  onSelectLighting: (mode: LightingMode) => void;
  viewMode: '3d' | '2d';
  onToggleViewMode: () => void;
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  onPan: (direction: 'north' | 'south') => void;
  onZoom: (action: 'in' | 'out') => void;
  onResetView: () => void;
  totalSpotsCount: number;
  filteredSpotsCount: number;
  stampedCount: number;
  onOpenPassport: () => void;
  onOpenPlanner: () => void;
  onOpenCertificate: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  lightingMode,
  onSelectLighting,
  viewMode,
  onToggleViewMode,
  selectedRegion,
  onSelectRegion,
  selectedCategory,
  onSelectCategory,
  onPan,
  onZoom,
  onResetView,
  totalSpotsCount,
  filteredSpotsCount,
  stampedCount,
  onOpenPassport,
  onOpenPlanner,
  onOpenCertificate,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const regions: { id: Region; label: string }[] = [
    { id: 'all', label: '全台灣' },
    { id: 'north', label: '北部' },
    { id: 'central', label: '中部' },
    { id: 'south', label: '南部' },
    { id: 'east', label: '東部' },
    { id: 'islands', label: '離島' },
  ];

  const categories: { id: Category | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: '全部景點', icon: '✨' },
    { id: 'landmark', label: '休閒樂園', icon: '🎡' },
    { id: 'nature', label: '壯麗自然', icon: '⛰️' },
    { id: 'culture', label: '人文古蹟', icon: '🏮' },
    { id: 'food', label: '夜市美食', icon: '🌽' },
    { id: 'coast', label: '海岸海島', icon: '🌴' },
  ];

  return (
    <>
      {/* Top Floating App Header & Atmosphere Lighting Bar */}
      <header className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Brand Title Card */}
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl text-white">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-md font-bold text-lg">
            台
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base tracking-wide bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
              台灣 3D 旅遊導覽與觀光集章冊
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Taiwan 3D Travel Guide & Stamp Passport</p>
          </div>
        </div>

        {/* Top-Right Quick Action Group (Lighting Switcher & Passport Shortlinks) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Lighting Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl text-white">
            <button
              onClick={() => onSelectLighting('day')}
              title="日間清朗 (明亮環境光)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                lightingMode === 'day'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">日間</span>
            </button>
            <button
              onClick={() => onSelectLighting('sunset')}
              title="金黃夕陽 (溫暖金黃暮光)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                lightingMode === 'sunset'
                  ? 'bg-orange-500 text-white font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">夕陽</span>
            </button>
            <button
              onClick={() => onSelectLighting('night')}
              title="璀璨夜景 (暗色發光效果)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                lightingMode === 'night'
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">夜景</span>
            </button>
          </div>

          {/* 3D / 2D Perspective Toggle Button */}
          <button
            onClick={onToggleViewMode}
            title={viewMode === '3d' ? '切換為 2D 俯視視角' : '切換為 3D 透視視角'}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl text-white text-xs font-semibold hover:bg-slate-800 transition-all active:scale-95"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{viewMode === '3d' ? '3D 視角' : '2D 俯視'}</span>
          </button>

          {/* 集章冊 Passport Button with Live Counter Badge */}
          <button
            onClick={onOpenPassport}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl shadow-lg text-xs font-bold transition-all active:scale-95"
          >
            <span className="text-sm">📮</span>
            <span>集章冊</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[11px] font-mono">
              {stampedCount}/{totalSpotsCount}
            </span>
          </button>
        </div>
      </header>

      {/* Screen Navigation Control Buttons (Floating on Mid-Right: Up, Down, Zoom, Reset) */}
      <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-col p-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-white gap-1">
          {/* Pan North (Up) */}
          <button
            onClick={() => onPan('north')}
            title="視角往北移動"
            className="p-2.5 rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-slate-200 hover:text-white flex items-center justify-center"
          >
            <ChevronUp className="w-5 h-5 text-amber-400" />
          </button>

          {/* Reset / Center */}
          <button
            onClick={onResetView}
            title="地圖回歸中心"
            className="p-2.5 rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-slate-200 hover:text-white flex items-center justify-center"
          >
            <Compass className="w-5 h-5 text-sky-400" />
          </button>

          {/* Pan South (Down) */}
          <button
            onClick={() => onPan('south')}
            title="視角往南移動"
            className="p-2.5 rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-slate-200 hover:text-white flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 text-amber-400" />
          </button>

          <div className="w-full h-px bg-slate-700/80 my-0.5" />

          {/* Zoom In */}
          <button
            onClick={() => onZoom('in')}
            title="放大地圖"
            className="p-2.5 rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-slate-200 hover:text-white flex items-center justify-center"
          >
            <ZoomIn className="w-5 h-5 text-emerald-400" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => onZoom('out')}
            title="縮小地圖"
            className="p-2.5 rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-slate-200 hover:text-white flex items-center justify-center"
          >
            <ZoomOut className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* Quick Menu Launcher (Itinerary & Certificate) */}
        <div className="flex flex-col p-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-white gap-1 mt-1">
          <button
            onClick={onOpenPlanner}
            title="行程規劃 (智慧環島慢活路線)"
            className="p-2.5 rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-amber-300 hover:text-amber-200 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenCertificate}
            title="成就證書 (榮譽專屬證書)"
            className="p-2.5 rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-rose-300 hover:text-rose-200 flex items-center justify-center"
          >
            <span className="text-base leading-none">🏆</span>
          </button>
        </div>
      </div>

      {/* Unified Bottom Control Dock (Collapsible, Ergonomic, Zero Central Occlusion) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl transition-all duration-300 pointer-events-auto ${
          isDockCollapsed ? 'translate-y-[calc(100%-2.25rem)]' : 'translate-y-0'
        }`}
      >
        {/* Dock Collapse / Expand Handle */}
        <div className="flex justify-center -mb-2">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-4 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-t-xl border-t border-x border-slate-700/80 shadow-md flex items-center gap-1 backdrop-blur-md transition-all"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>展開控制與篩選面版</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>收起面版 (進入沉浸全景)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Main Glass Container */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 sm:p-4 text-white flex flex-col gap-2.5">
          {/* Row 1: Region Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1 pl-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              區域：
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {regions.map((reg) => {
                const isActive = selectedRegion === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => onSelectRegion(reg.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {reg.label}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto text-[11px] text-slate-400 shrink-0 pr-1 hidden sm:block">
              顯示 <span className="text-amber-300 font-mono font-bold">{filteredSpotsCount}</span> /{' '}
              {totalSpotsCount} 處景點
            </div>
          </div>

          {/* Row 2: Category 3D Landmark Shape Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-slate-800/80 pt-2">
            <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1 pl-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              類別：
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
