import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ALL_SPOTS } from './data/spotsData';
import { Spot, LightingMode, Region, Category, StampRecord } from './types/travel';
import { TaiwanMap3D } from './components/TaiwanMap3D';
import { MapControls } from './components/MapControls';
import { StampModal } from './components/StampModal';
import { PassportView } from './components/PassportView';
import { ItineraryModal } from './components/ItineraryModal';
import { CertificateView } from './components/CertificateView';
import {
  getStoredStamps,
  saveStampToStorage,
  removeStampFromStorage,
  seedDemoStamps,
  clearAllStampsFromStorage,
} from './utils/passportStorage';

export default function App() {
  // Atmosphere and Map View State
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  // Interactive Spot Selection Modal
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Passport & Auxiliary Modals
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // Map Movement Controls Triggers
  const [panDirection, setPanDirection] = useState<'north' | 'south' | null>(null);
  const [zoomAction, setZoomAction] = useState<'in' | 'out' | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Local Storage Stamped Records State
  const [stampedRecords, setStampedRecords] = useState<Record<string, StampRecord>>({});

  // Initialize stamped records from localStorage
  useEffect(() => {
    const saved = getStoredStamps();
    setStampedRecords(saved);
  }, []);

  // Filtered spots calculation
  const filteredSpots = useMemo(() => {
    return ALL_SPOTS.filter((s) => {
      const matchRegion = selectedRegion === 'all' || s.region === selectedRegion;
      const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return matchRegion && matchCategory;
    });
  }, [selectedRegion, selectedCategory]);

  const stampedCount = Object.keys(stampedRecords).length;

  // Stamping Actions
  const handleStamp = (spotId: string) => {
    const record = saveStampToStorage(spotId);
    setStampedRecords((prev) => ({ ...prev, [spotId]: record }));
  };

  const handleResetStamp = (spotId: string) => {
    removeStampFromStorage(spotId);
    setStampedRecords((prev) => {
      const updated = { ...prev };
      delete updated[spotId];
      return updated;
    });
  };

  const handleSeedDemo = () => {
    // Pick 15 iconic spots across the regions
    const demoIds = [
      'TW-TPE-01', // 台北 101
      'TW-NTP-02', // 九份
      'TW-TPE-04', // 士林夜市
      'TW-NAN-07', // 日月潭
      'TW-TXG-08', // 高美濕地
      'TW-CHW-10', // 鹿港老街
      'TW-NAN-11', // 清境農場
      'TW-CYI-12', // 阿里山
      'TW-TNN-13', // 安平古堡
      'TW-KHH-14', // 駁二
      'TW-PIF-15', // 墾丁白沙灣
      'TW-HUA-16', // 太魯閣
      'TW-HUA-17', // 七星潭
      'TW-TTT-18', // 伯朗大道
      'TW-PEN-20', // 澎湖雙心石滬
    ];
    const newRecords = seedDemoStamps(demoIds);
    setStampedRecords(newRecords);
  };

  const handleClearAll = () => {
    clearAllStampsFromStorage();
    setStampedRecords({});
  };

  // Pan and Zoom Trigger Handlers
  const handlePan = (direction: 'north' | 'south') => {
    setPanDirection(direction);
    // Reset immediately so subsequent clicks with same direction register
    setTimeout(() => setPanDirection(null), 50);
  };

  const handleZoom = (action: 'in' | 'out') => {
    setZoomAction(action);
    setTimeout(() => setZoomAction(null), 50);
  };

  const handleResetView = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === '3d' ? '2d' : '3d'));
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Taiwan Interactive Map Engine */}
      <TaiwanMap3D
        spots={ALL_SPOTS}
        selectedSpot={selectedSpot}
        onSelectSpot={(spot) => setSelectedSpot(spot)}
        lightingMode={lightingMode}
        viewMode={viewMode}
        selectedRegion={selectedRegion}
        selectedCategory={selectedCategory}
        stampedRecords={stampedRecords}
        panDirection={panDirection}
        zoomAction={zoomAction}
        resetTrigger={resetTrigger}
      />

      {/* Screen Controls & Bottom Dock HUD */}
      <MapControls
        lightingMode={lightingMode}
        onSelectLighting={(m) => setLightingMode(m)}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        selectedRegion={selectedRegion}
        onSelectRegion={(r) => setSelectedRegion(r)}
        selectedCategory={selectedCategory}
        onSelectCategory={(c) => setSelectedCategory(c)}
        onPan={handlePan}
        onZoom={handleZoom}
        onResetView={handleResetView}
        totalSpotsCount={ALL_SPOTS.length}
        filteredSpotsCount={filteredSpots.length}
        stampedCount={stampedCount}
        onOpenPassport={() => setIsPassportOpen(true)}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />

      {/* Spot Detail & Heavy Wooden Stamp Modal */}
      {selectedSpot && (
        <StampModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          stampRecord={stampedRecords[selectedSpot.id]}
          onStamp={handleStamp}
          onResetStamp={handleResetStamp}
        />
      )}

      {/* Stamp Passport Drawer / View Modal */}
      <PassportView
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        spots={ALL_SPOTS}
        stampedRecords={stampedRecords}
        onSelectSpot={(spot) => {
          setIsPassportOpen(false);
          setSelectedSpot(spot);
        }}
        onSeedDemoStamps={handleSeedDemo}
        onClearAllStamps={handleClearAll}
        onOpenCertificate={() => {
          setIsPassportOpen(false);
          setIsCertificateOpen(true);
        }}
      />

      {/* Slow Travel Itinerary Planner Modal */}
      <ItineraryModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        spots={ALL_SPOTS}
        stampedRecords={stampedRecords}
        onSelectSpot={(spot) => {
          setIsPlannerOpen(false);
          setSelectedSpot(spot);
        }}
      />

      {/* Achievement Certificate Modal */}
      <CertificateView
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        stampedCount={stampedCount}
        totalSpotsCount={ALL_SPOTS.length}
      />
    </div>
  );
}
