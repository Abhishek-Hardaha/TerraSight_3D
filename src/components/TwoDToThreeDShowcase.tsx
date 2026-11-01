'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Layers,
  Box,
  Sparkles,
  RotateCcw,
  Camera,
  Play,
  Pause,
  Scan,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { PointCloudViewer } from './PointCloudViewer';
import { sound } from '@/utils/sound';

export interface ScenePreset {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  pointCloudOverlayUrl?: string;
  pointCloudUrl: string;
  pointCount: number;
  cameraInfo: string;
  description: string;
}

const SCENES: ScenePreset[] = [
  {
    id: 'citadel',
    name: 'Medieval Fortress Citadel',
    category: 'Aerial Drone Survey',
    imageUrl: '/data/images/terrasky_a_0002_input.jpg',
    pointCloudOverlayUrl: '/data/images/terrasky_a_0002_pointcloud_overlay.png',
    pointCloudUrl: '/data/scenes/terrasky_a_0002_gt.ply',
    pointCount: 235000,
    cameraInfo: 'UAV Optical • 4000×3000 • 24mm f/2.8',
    description: 'High-altitude drone survey converted to 235k metric LiDAR ground truth point cloud'
  },
  {
    id: 'terrace',
    name: 'Alpine Stone Sanctuary',
    category: 'ETH3D Laser Benchmark',
    imageUrl: '/data/images/eth3d_terrace_input.jpg',
    pointCloudUrl: '/data/scenes/eth3d_terrace_gt.ply',
    pointCount: 180000,
    cameraInfo: 'DSLR Full-Frame • 6000×4000 • 28mm f/8.0',
    description: 'Outdoor stone terrace with intricate masonry, trees, and sub-millimeter laser scan'
  },
  {
    id: 'relief',
    name: 'Bas-Relief Classical Facade',
    category: 'High-Frequency Geometry',
    imageUrl: '/data/images/eth3d_relief_input.jpg',
    pointCloudUrl: '/data/scenes/eth3d_relief_gt.ply',
    pointCount: 190000,
    cameraInfo: 'Macro Optical • 6000×4000 • 50mm f/5.6',
    description: 'Intricate architectural engravings unprojected from 2D relief into 3D micro-geometry'
  }
];

interface TwoDToThreeDShowcaseProps {
  onReplay: () => void;
  onClose: () => void;
}

export const TwoDToThreeDShowcase: React.FC<TwoDToThreeDShowcaseProps> = ({
  onReplay,
  onClose
}) => {
  const [selectedSceneIdx, setSelectedSceneIdx] = useState<number>(0);
  // View states:
  // 'scan'   : 2D image shown, laser sweeps down revealing dense point cloud overlay
  // 'popup'  : Pop-up burst transition where 2D plane lifts and pops forward
  // '3d'     : Full interactive 3D model with auto-orbit
  // 'split'  : Interactive Curtain Split Wipe (2D ↔ 3D slider)
  const [phase, setPhase] = useState<'scan' | 'popup' | '3d' | 'split'>('scan');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isAutoSweeping, setIsAutoSweeping] = useState<boolean>(false);
  const [showPiP, setShowPiP] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplitRef = useRef<boolean>(false);
  const sweepAnimRef = useRef<number | null>(null);

  const scene = SCENES[selectedSceneIdx];

  // Laser scan sequence animation: 2D Image -> Laser Scan -> 3D Pop Up!
  const triggerScanAndPopUp = useCallback(() => {
    setPhase('scan');
    setScanProgress(0);
    sound.playKeypress();

    let startTime: number | null = null;
    const duration = 2800; // 2.8s smooth scanning sweep
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setScanProgress(p);

      if (p < 100) {
        animId = requestAnimationFrame(step);
      } else {
        // Laser reached bottom: TRIGGER 3D POP-UP BURST!
        sound.playWarp();
        setPhase('popup');

        // Pop up into full 3D orbit after burst animation
        setTimeout(() => {
          setPhase('3d');
        }, 500);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Run automatically when scene changes or initially mounted
  useEffect(() => {
    const cancelAnim = triggerScanAndPopUp();
    return () => {
      if (cancelAnim) cancelAnim();
    };
  }, [selectedSceneIdx, triggerScanAndPopUp]);

  // Auto-sweep split line back and forth smoothly
  useEffect(() => {
    if (!isAutoSweeping || phase !== 'split') {
      if (sweepAnimRef.current) cancelAnimationFrame(sweepAnimRef.current);
      return;
    }

    let startTime = performance.now();
    const animateSweep = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const val = 50 + 35 * Math.sin(elapsed * 1.5);
      setSplitPercent(Math.round(val * 10) / 10);
      sweepAnimRef.current = requestAnimationFrame(animateSweep);
    };

    sweepAnimRef.current = requestAnimationFrame(animateSweep);
    return () => {
      if (sweepAnimRef.current) cancelAnimationFrame(sweepAnimRef.current);
    };
  }, [isAutoSweeping, phase]);

  // Pointer drag for split curtain
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingSplitRef.current = true;
    setIsAutoSweeping(false);
    updateSplitFromPointer(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSplitRef.current) return;
    updateSplitFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingSplitRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const updateSplitFromPointer = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPercent(Math.round(pct * 10) / 10);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#09090b] select-none text-zinc-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ========================================================
          1. TOP NAVIGATION / HEADER HUD
          ======================================================== */}
      <div className="absolute top-4 inset-x-6 z-40 flex items-center justify-between pointer-events-auto">
        {/* Left: Project title & scene indicator */}
        <div className="flex items-center gap-3 bg-black/85 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-white uppercase whitespace-nowrap">
              2D Optical → 3D Reconstruction
            </span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <span className="text-[11px] font-mono text-cyan-300 whitespace-nowrap">
            {scene.name}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 whitespace-nowrap">
            {(scene.pointCount / 1000).toFixed(0)}k Points
          </span>
        </div>

        {/* Center: Phase Action Buttons */}
        <div className="flex items-center bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-2xl">
          {/* Re-Scan Button */}
          <button
            onClick={() => {
              triggerScanAndPopUp();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${phase === 'scan' || phase === 'popup'
                ? 'bg-cyan-500/25 text-white border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            title="Scan 2D image and watch 3D version pop up"
          >
            <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Scan 2D → Pop-up 3D</span>
          </button>

          {/* 3D Orbit Mode */}
          <button
            onClick={() => {
              sound.playClick();
              setPhase('3d');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${phase === '3d'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Interactive 3D Orbit</span>
          </button>

          {/* Curtain Split Wipe */}
          <button
            onClick={() => {
              sound.playClick();
              setPhase('split');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${phase === 'split'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curtain Split (2D ↔ 3D)</span>
          </button>
        </div>

        {/* Right: Scene Selector Pills */}
        <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-2xl">
          {SCENES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playClick();
                setSelectedSceneIdx(idx);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${selectedSceneIdx === idx
                  ? 'bg-white/15 text-white font-medium border border-white/20'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
            >
              Scene 0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          2. MAIN VIEWPORT
          ======================================================== */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* ====================================================
            LAYER A: 3D POINT CLOUD CANVAS (POPS UP ON SCAN COMPLETE)
            ==================================================== */}
        <div
          className={`absolute inset-0 z-10 w-full h-full transition-all duration-700 ease-out ${phase === '3d' || phase === 'split'
              ? 'opacity-100 scale-100 pointer-events-auto'
              : phase === 'popup'
                ? 'opacity-90 scale-[1.04] pointer-events-none'
                : 'opacity-0 scale-[0.96] pointer-events-none'
            }`}
        >
          <PointCloudViewer
            key={`viewer-${scene.id}`}
            modelId={scene.id}
            modelName={scene.name}
            pointCloudUrl={scene.pointCloudUrl}
            pointCount={scene.pointCount}
            isGroundTruth={true}
            autoRotate={phase === '3d'}
          />
        </div>

        {/* ====================================================
            LAYER B: 2D IMAGE GETTING SCANNED (Active during 'scan' and 'popup')
            ==================================================== */}
        {(phase === 'scan' || phase === 'popup') && (
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center p-6 transition-all duration-500 ${phase === 'popup' ? 'scale-105 opacity-0 filter blur-sm' : 'scale-100 opacity-100'
              }`}
          >
            <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-cyan-500/40 bg-black shadow-[0_0_90px_rgba(6,182,212,0.35)]">
              {/* 1. Raw 2D UAV Input Photo */}
              <Image
                src={scene.imageUrl}
                alt="2D Optical Capture"
                fill
                className="object-cover"
                unoptimized
                priority
              />

              {/* 2. REVEALED POINT CLOUD OVERLAY (Unveiled behind laser scan) */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-75 z-10"
                style={{
                  clipPath: `inset(0 0 ${Math.max(0, 100 - scanProgress)}% 0)`,
                }}
              >
                {scene.pointCloudOverlayUrl ? (
                  <Image
                    src={scene.pointCloudOverlayUrl}
                    alt="Dense Point Cloud Overlay"
                    fill
                    className="object-cover filter drop-shadow-[0_0_3px_#38bdf8] drop-shadow-[0_0_1px_#ffffff]"
                    unoptimized
                  />
                ) : (
                  /* High-contrast cybernetic surfel edge mapping for benchmark scenes */
                  <div className="absolute inset-0 bg-cyan-950/40 mix-blend-color-dodge backdrop-brightness-125 backdrop-contrast-150">
                    <Image
                      src={scene.imageUrl}
                      alt="Point Cloud Filter"
                      fill
                      className="object-cover filter contrast-200 hue-rotate-180 brightness-110 drop-shadow-[0_0_5px_#22d3ee]"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* 3. Dynamic Laser Scanner Beam */}
              <div
                className="absolute inset-x-0 h-1.5 pointer-events-none z-20 transition-all duration-75"
                style={{ top: `${scanProgress}%` }}
              >
                <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_30px_#22d3ee,0_0_60px_#06b6d4]" />
                <div className="absolute -top-2 inset-x-0 h-5 bg-cyan-400/30 blur-md" />
              </div>

              {/* 4. Scanning HUD Badges */}
              <div className="absolute top-5 left-5 z-30 font-mono text-xs tracking-wider text-cyan-300 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span>2D OPTICAL SENSOR SCANNING</span>
                <div className="h-3 w-px bg-white/20" />
                <span className="text-white font-bold">{scanProgress.toFixed(0)}%</span>
              </div>

              <div className="absolute bottom-5 right-5 z-30 font-mono text-[11px] tracking-wider text-emerald-300 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/40 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>EXTRACTING 3D GEOMETRY SAMPLES...</span>
              </div>

              <div className="absolute bottom-5 left-5 z-30 font-mono text-[10px] tracking-wider text-zinc-400 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                {scene.cameraInfo}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            LAYER C: POP-UP FLASH BURST EFFECT
            ==================================================== */}
        {phase === 'popup' && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <div className="w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl animate-ping" />
            <div className="bg-black/90 border-2 border-cyan-400 px-6 py-3 rounded-2xl shadow-[0_0_50px_#22d3ee] flex items-center gap-3 animate-bounce">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
              <span className="text-base font-mono font-bold text-white tracking-widest uppercase">
                3D Point Cloud Popped Up!
              </span>
            </div>
          </div>
        )}

        {/* ====================================================
            LAYER D: CURTAIN SPLIT WIPE OVERLAY (Active during 'split')
            ==================================================== */}
        {phase === 'split' && (
          <>
            <div
              className="absolute inset-0 z-20 pointer-events-none overflow-hidden transition-[clip-path] duration-75"
              style={{
                clipPath: `inset(0 ${Math.max(0, 100 - splitPercent)}% 0 0)`,
              }}
            >
              <div className="relative w-full h-full bg-black">
                <Image
                  src={scene.imageUrl}
                  alt={scene.name}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-20 left-6 z-30 font-mono text-[11px] tracking-wider text-white/90 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/15 flex items-center gap-2.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2D OPTICAL SOURCE</span>
                  <div className="h-3 w-px bg-white/20" />
                  <span className="text-zinc-400">{scene.cameraInfo}</span>
                </div>

                <div className="absolute bottom-24 left-6 z-30 font-mono text-[11px] tracking-wider text-cyan-300 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-lg border border-cyan-500/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>INPUT: Flat RGB Pixels</span>
                </div>
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-auto cursor-ew-resize group"
              style={{ left: `${splitPercent}%` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-cyan-400 via-white to-cyan-400 shadow-[0_0_15px_#22d3ee,0_0_30px_#06b6d4]" />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/90 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center gap-2 cursor-ew-resize hover:scale-105 transition-transform backdrop-blur-md whitespace-nowrap">
                <span className="text-zinc-400">2D</span>
                <span className="text-cyan-400 font-bold">◂ ❙ ▸</span>
                <span className="text-emerald-400">3D</span>
              </div>
            </div>
          </>
        )}

        {/* ====================================================
            LAYER E: PICTURE-IN-PICTURE (PiP) IN 3D ORBIT MODE
            ==================================================== */}
        {phase === '3d' && showPiP && (
          <div className="absolute bottom-24 left-6 z-30 pointer-events-auto flex flex-col gap-2 p-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl w-64 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Original 2D Photo</span>
              </div>
              <button
                onClick={() => setShowPiP(false)}
                className="text-[10px] text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
              <Image
                src={scene.imageUrl}
                alt="Source photo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-400 px-1 leading-relaxed">
              Drag scene to orbit in 3D space. Scroll to zoom.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          3. BOTTOM FLOATING CONTROL DOCK
          ======================================================== */}
      <div className="absolute bottom-6 inset-x-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl">
          {/* Interaction status hint */}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-zinc-300 tracking-wider whitespace-nowrap">
            {phase === 'scan'
              ? 'Laser scanning 2D surface into 3D metric cloud...'
              : phase === 'split'
                ? 'Drag divider handle to wipe 2D into 3D'
                : 'Interactive 3D • Left Drag: Orbit • Right Drag: Pan • Scroll: Zoom'}
          </span>

          <div className="h-4 w-px bg-white/15 mx-1" />

          {/* Re-Scan Button */}
          <button
            onClick={triggerScanAndPopUp}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-400/50 hover:bg-cyan-500/30 transition-all whitespace-nowrap"
            title="Scan 2D image again and watch 3D version pop up"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Re-Scan & Pop-Up</span>
          </button>

          {/* Curtain Split Controls (when in split mode) */}
          {phase === 'split' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">2D</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPercent}
                  onChange={(e) => {
                    setIsAutoSweeping(false);
                    setSplitPercent(Number(e.target.value));
                  }}
                  className="w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] font-mono text-zinc-400">3D</span>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsAutoSweeping((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${isAutoSweeping
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'text-zinc-400 hover:text-white border border-white/10'
                  }`}
              >
                {isAutoSweeping ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoSweeping ? 'Pause' : 'Auto'}</span>
              </button>
            </>
          )}

          {phase === '3d' && !showPiP && (
            <button
              onClick={() => setShowPiP(true)}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full text-zinc-400 hover:text-white border border-white/10 transition-all whitespace-nowrap"
            >
              <Camera className="w-3 h-3" />
              <span>Show 2D Photo</span>
            </button>
          )}

          <div className="h-4 w-px bg-white/15 mx-1" />

          {/* Replay Presentation Button */}
          <button
            onClick={() => {
              sound.playClick();
              onReplay();
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
            title="Replay showcase presentation from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>

          {/* Close Showcase Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="ml-1 text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};
