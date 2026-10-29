import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  MapPin,
  Mountain,
  Clock,
  Sparkles,
  Utensils,
  BookOpen,
  RotateCcw,
  Star,
  CheckCircle2,
  Calendar,
  Share2,
} from 'lucide-react';
import { Spot, StampRecord } from '../types/travel';
import { playWoodStampSound, playStampResetSound, playMilestoneChime } from '../utils/audio';

interface StampModalProps {
  spot: Spot | null;
  onClose: () => void;
  stampRecord: StampRecord | undefined;
  onStamp: (spotId: string) => void;
  onResetStamp: (spotId: string) => void;
}

export const StampModal: React.FC<StampModalProps> = ({
  spot,
  onClose,
  stampRecord,
  onStamp,
  onResetStamp,
}) => {
  const [isStampingAnimation, setIsStampingAnimation] = useState(false);
  const [showStampImpact, setShowStampImpact] = useState(false);

  if (!spot) return null;

  const isCollected = !!stampRecord;

  const handleTriggerStamp = () => {
    if (isStampingAnimation) return;
    setIsStampingAnimation(true);

    // Timing of the heavy wooden stamp slamming down
    setTimeout(() => {
      // 1. Play procedural resonant wooden mallet impact sound
      playWoodStampSound();

      // 2. Trigger screen shake & impact ripple
      setShowStampImpact(true);

      // 3. Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }

      // 4. Save stamp record
      onStamp(spot.id);

      // Play milestone chime slightly after
      setTimeout(() => {
        playMilestoneChime();
      }, 250);

      setTimeout(() => {
        setIsStampingAnimation(false);
        setShowStampImpact(false);
      }, 600);
    }, 450);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    playStampResetSound();
    onResetStamp(spot.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Hero Photo & Basic Info */}
        <div className="relative h-56 sm:h-64 w-full shrink-0 overflow-hidden bg-slate-950">
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90 z-10"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on Top Left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-slate-950 shadow-md backdrop-blur-md">
              {spot.categoryName}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white border border-slate-700/80 shadow-md backdrop-blur-md">
              {spot.regionName}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/20 text-white backdrop-blur-md">
              {spot.id}
            </span>
          </div>

          {/* Title and Ratings on Bottom Left of Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {spot.rating}
              </span>
              <span className="text-slate-300 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {spot.county}
              </span>
              <span className="text-slate-300 text-xs flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                {spot.altitude}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
              {spot.name}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium opacity-90 drop-shadow">
              {spot.englishName}
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          {/* SECTION 1: IMMERSIVE STAMP INTERACTION AREA */}
          <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-slate-800/40 border-2 border-dashed border-amber-300 dark:border-amber-700/50 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Wooden Stamp Mallet Slamming Down Animation Object */}
            {isStampingAnimation && (
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <div className="animate-stamp-slam flex flex-col items-center">
                  {/* Heavy Wooden Stamp Mallet Handle */}
                  <div className="w-8 h-20 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-t-xl shadow-2xl border-x border-amber-950" />
                  {/* Cylindrical Wooden Base with Brass Ring */}
                  <div className="w-24 h-10 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 rounded-sm shadow-xl flex items-center justify-center border-t-2 border-yellow-300" />
                  <div className="w-20 h-6 bg-red-800 rounded-b-md shadow-2xl flex items-center justify-center text-white text-[10px] font-bold">
                    朱紅印泥
                  </div>
                </div>
              </div>
            )}

            {/* Impact Flash Shockwave Ring */}
            {showStampImpact && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-4 border-red-500/80 animate-ping" />
              </div>
            )}

            {isCollected ? (
              // ALREADY COLLECTED STAMP BADGE VIEW
              <div className="flex flex-col items-center w-full animate-in zoom-in-90 duration-300">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 mb-3 bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-300 dark:border-red-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>【 已收集此章 】</span>
                </div>

                {/* The Traditional Vermilion Cinnabar Stamp (朱紅印泥紀念章) */}
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl border-4 border-red-600 dark:border-red-500 p-2.5 flex flex-col items-center justify-between shadow-inner bg-amber-50/80 dark:bg-red-950/20 rotate-[-1.5deg]">
                  {/* Decorative Double Ring */}
                  <div className="w-full h-full border-2 border-dashed border-red-500/80 rounded-xl p-3 flex flex-col items-center justify-between text-red-700 dark:text-red-400 font-serif">
                    {/* Top Spot ID */}
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
                      {spot.id} • TAIWAN
                    </span>

                    {/* Middle Seal Name with Traditional Calligraphy Feel */}
                    <div className="my-auto text-center">
                      <div className="text-xl sm:text-2xl font-black tracking-widest leading-tight">
                        {spot.name}
                      </div>
                      <div className="text-[10px] tracking-wide mt-1 font-sans text-red-600/80 dark:text-red-300/80 font-bold">
                        觀光紀念章
                      </div>
                    </div>

                    {/* Bottom Date of Stamping */}
                    <div className="text-[10px] font-sans font-medium text-red-600/90 dark:text-red-300/90 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{stampRecord?.formattedDate || '已蓋章'}</span>
                    </div>
                  </div>
                </div>

                {/* Reset Button (In case of accidental click or replay) */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重置印章 (重新收集)</span>
                  </button>
                </div>
              </div>
            ) : (
              // NOT COLLECTED: PROMINENT STAMP NOW BUTTON
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 border-2 border-red-300 dark:border-red-800 flex items-center justify-center text-3xl mb-3 shadow-inner">
                  📮
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                  尚未收集此處觀光紀念章
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                  點擊下方按鈕，伴隨真實木槌敲擊與朱紅印泥特效，將本景點永久珍藏於您的數位集章冊中！
                </p>
                <button
                  onClick={handleTriggerStamp}
                  disabled={isStampingAnimation}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold shadow-xl hover:shadow-red-500/30 active:scale-95 transition-all text-sm sm:text-base"
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>立即蓋上紀念章</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: GEMINI AI LOCAL GUIDE CARD (介面展示，未接 API) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/60 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                  ✦
                </div>
                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
                  Gemini AI 在地深度導遊私房叮嚀
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-800">
                介面展示，未接 API
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              "{spot.aiTip}"
            </p>
          </div>

          {/* SECTION 3: HIGHLIGHTS & BEST TIMING */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Highlights */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-600 dark:text-amber-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>必訪亮點</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {spot.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 shrink-0">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Season & Timing */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                <Clock className="w-4 h-4" />
                <span>最佳參觀時機</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {spot.bestSeason}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Mountain className="w-3.5 h-3.5" />
                <span>海拔高度：{spot.altitude}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: INSIDER GOURMET FOOD PICKS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs text-orange-600 dark:text-orange-400 mb-2">
              <Utensils className="w-4 h-4" />
              <span>在地內行推薦美食</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {spot.insiderFood.map((food, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-xs font-medium border border-orange-200 dark:border-orange-800"
                >
                  🥢 {food}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 5: BACKGROUND & HISTORY */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-600 dark:text-slate-400">
              <BookOpen className="w-4 h-4" />
              <span>景點簡介與歷史沿革</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {spot.description}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {spot.history}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            編號代碼：<span className="font-mono font-bold text-slate-700 dark:text-slate-300">{spot.id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            返回地圖
          </button>
        </div>
      </div>
    </div>
  );
};
