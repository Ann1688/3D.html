import React, { useState } from 'react';
import { X, Printer, Award, Sparkles, Check, Share2 } from 'lucide-react';
import { getExplorerTitle } from '../utils/passportStorage';

interface CertificateViewProps {
  isOpen: boolean;
  onClose: () => void;
  stampedCount: number;
  totalSpotsCount: number;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  isOpen,
  onClose,
  stampedCount,
  totalSpotsCount,
}) => {
  const [travelerName, setTravelerName] = useState('熱愛寶島的探索旅人');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const currentTitle = getExplorerTitle(stampedCount);
  const today = new Date();
  const dateFormatted = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShare = () => {
    const text = `🏆 我在「台灣 3D 旅遊導覽與觀光集章冊」中榮獲【${currentTitle.title}】頭銜！已成功收集 ${stampedCount}/${totalSpotsCount} 個寶島百大景點紀念章！`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              台灣觀光探險榮譽證書
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{isCopied ? '已複製成就' : '分享榮耀'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div className="p-6 sm:p-10 bg-[#fdfbf7] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
          {/* Ornate Golden Certificate Frame */}
          <div className="relative border-8 border-double border-amber-600/70 p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[#fffefc] to-[#fbf8f0] dark:from-slate-900 dark:to-slate-950 shadow-inner flex flex-col items-center text-center">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-600/60 text-lg">❖</div>
            <div className="absolute top-2 right-2 text-amber-600/60 text-lg">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-600/60 text-lg">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-600/60 text-lg">❖</div>

            {/* Emblem Header */}
            <div className="w-16 h-16 rounded-full border-2 border-amber-500/80 p-1 flex items-center justify-center mb-3 bg-amber-50 dark:bg-amber-950/40 shadow-sm">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white text-2xl font-serif font-black shadow-inner">
                台
              </div>
            </div>

            <div className="text-[11px] uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400 font-mono font-bold mb-1">
              TAIWAN 3D TRAVEL GUIDE & EXPLORER PASSPORT
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-widest mb-3">
              台灣觀光探索榮譽證書
            </h1>

            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-6" />

            {/* Traveler Name Input */}
            <div className="w-full max-w-md mb-6">
              <span className="text-xs text-slate-400 block mb-1">茲證明探索旅人：</span>
              <input
                type="text"
                value={travelerName}
                onChange={(e) => setTravelerName(e.target.value)}
                className="w-full text-center text-xl sm:text-2xl font-bold font-serif bg-transparent border-b-2 border-dashed border-amber-400 focus:outline-none focus:border-amber-600 text-slate-900 dark:text-amber-200 pb-1"
                placeholder="點擊輸入您的尊姓大名"
              />
            </div>

            {/* Citation Text */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-lg leading-relaxed mb-6 font-serif">
              閣下以熱愛土地的赤子之心，探訪台灣北中南東及各離島秘境，親歷寶島壯麗山海與深厚風土人文，並於觀光集章冊中積累輝煌足跡，特頒此狀以資表彰。
            </p>

            {/* Title & Stats Medallion */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md p-4 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 mb-8">
              <div className="text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">榮獲尊爵稱號</span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-serif">
                  {currentTitle.title}
                </span>
              </div>
              <div className="text-center border-l border-amber-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 block mb-0.5">累計解鎖章數</span>
                <span className="text-base sm:text-lg font-black font-mono text-red-600 dark:text-red-400">
                  {stampedCount} / {totalSpotsCount} 景點
                </span>
              </div>
            </div>

            {/* Official Stamps & Date on Bottom */}
            <div className="w-full flex items-center justify-between pt-6 border-t border-amber-200/80 dark:border-slate-800 text-left">
              <div>
                <span className="text-[11px] text-slate-400 block">核發日期</span>
                <span className="text-xs sm:text-sm font-serif font-bold text-slate-700 dark:text-slate-300">
                  {dateFormatted}
                </span>
              </div>

              {/* Official Seal Impression */}
              <div className="w-20 h-20 rounded-full border-4 border-red-600 text-red-600 flex flex-col items-center justify-center p-1 rotate-[-6deg] shadow-inner font-serif select-none">
                <div className="w-full h-full border border-red-500 rounded-full flex flex-col items-center justify-center text-[9px] font-black leading-tight text-center">
                  <span>台灣觀光</span>
                  <span className="text-xs my-0.5">認證印</span>
                  <span>PASSPORT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
