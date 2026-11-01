'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { X, RotateCcw } from 'lucide-react';
import { TwoDToThreeDShowcase } from './TwoDToThreeDShowcase';
import { sound } from '@/utils/sound';

// Dynamically load ASCIIText (client-side WebGL)
const ASCIIText = dynamic(() => import('./ASCIIText'), { ssr: false });

interface AboutProjectShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

// Stage configuration with generous, elegant durations
const STAGES = [
  { id: 0, title: 'Project By -', duration: 3200 },
  { id: 1, title: 'Team Members', duration: 6000 },
  { id: 2, title: 'Under the guidance of', duration: 3200 },
  { id: 3, title: 'Dr. Tanveer Ahmed', duration: 5200 },
  { id: 4, title: '2D Image Converted to 3D', duration: 0 },
];

export const AboutProjectShowcase: React.FC<AboutProjectShowcaseProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [bgLoaded, setBgLoaded] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const isTransitioningRef = useRef<boolean>(false);

  // Smooth stage transition helper
  const transitionToStage = useCallback((nextStage: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsFading(true);

    setTimeout(() => {
      setStage(nextStage);
      setProgressPercent(0);
      setIsFading(false);
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 400);
    }, 400);
  }, []);

  // Reset and initialize when showcase opens
  useEffect(() => {
    if (isOpen) {
      setStage(0);
      setIsFading(false);
      setProgressPercent(0);
      isTransitioningRef.current = false;

      const initTimer = setTimeout(() => {
        setBgLoaded(true);
        sound.playKeypress();
      }, 250);

      return () => clearTimeout(initTimer);
    } else {
      setBgLoaded(false);
    }
  }, [isOpen]);

  // Stage timer and progress bar for slides 0-3
  useEffect(() => {
    if (!isOpen || !bgLoaded || stage === 4 || isFading) return;

    const currentDuration = STAGES[stage].duration;
    const intervalTime = 40;
    const increment = (intervalTime / currentDuration) * 100;

    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressTimer);
          if (stage < 4) {
            sound.playKeypress();
            transitionToStage(stage + 1);
          }
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(progressTimer);
  }, [isOpen, bgLoaded, stage, isFading, transitionToStage]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'ArrowRight') {
        if (stage < 4) {
          e.preventDefault();
          transitionToStage(stage + 1);
        }
      } else if (e.key === 'ArrowLeft' && stage > 0) {
        e.preventDefault();
        transitionToStage(stage - 1);
      }
    },
    [isOpen, stage, onClose, transitionToStage]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        // Clicking on the backdrop advances stages gently
        if (stage < 4) {
          sound.playClick();
          transitionToStage(stage + 1);
        }
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] overflow-hidden select-none cursor-pointer"
      title={stage < 4 ? 'Click anywhere to advance' : undefined}
    >
      {/* ========================================================
          1. DEEP MATTE BLACK BACKDROP WITH FINE TECH DOT GRID
          (Eliminates ugly washed-out grey radial fog)
          ======================================================== */}
      <div className="absolute inset-0 z-0 bg-[#09090b] pointer-events-none">
        {/* Subtle, crisp technical dot grid */}
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.45) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Soft, dark outer vignette for high dynamic contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,#09090b_92%)]" />
      </div>

      {/* ========================================================
          2. MINIMALIST ELEGANT CLOSE BUTTON
          ======================================================== */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full text-zinc-400 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
        title="Close (ESC)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ========================================================
          3. SMOOTH CONTENT CONTAINER (STAGES 0-3)
          ======================================================== */}
      {stage < 4 && (
        <div
          className={`relative z-20 w-full h-full flex items-center justify-center transition-all duration-400 ease-out ${
            isFading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          {/* ----------------------------------------------------
              STAGE 0: [ Project By - ] (Pure ASCIIText, blocks=0)
              ---------------------------------------------------- */}
          {stage === 0 && bgLoaded && (
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full">
                <ASCIIText
                  key="ascii-stage-0"
                  text="Project By -"
                  asciiFontSize={6}
                  colors={['#ffffff', '#e4e4e7', '#a1a1aa']}
                  textColor="#ffffff"
                  textScale={1}
                  blocks={0}
                  waves={0}
                  waveSpeed={1}
                  chroma={0}
                  tilt={0.15}
                  hueShift={0}
                  scramble={0.35}
                  clickRipple={true}
                  intro={true}
                  idle={true}
                  interactive={true}
                  theme="dark"
                />
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STAGE 1: [ Team Members: 1st & 3rd Swapped ]
              1. Adhya Agarwal (Deep Learning & Systems)
              2. Abhishek Hardaha (Geometry & Architecture)
              3. Aadya Rastogi (Computer Science & Vision)
              ---------------------------------------------------- */}
          {stage === 1 && (
            <div className="w-full max-w-5xl px-6 flex flex-col items-center justify-center space-y-12">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-zinc-400">
                  Core Research & Engineering
                </p>
              </div>

              {/* 3 Circular Monograms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-14 md:gap-16 w-full max-w-4xl justify-items-center">
                {/* Member 1: Adhya Agarwal */}
                <div className="flex flex-col items-center group">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-b from-purple-400/40 via-white/15 to-transparent shadow-[0_0_35px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_45px_rgba(168,85,247,0.35)] transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-purple-950/70 via-black to-zinc-950 flex flex-col items-center justify-center border border-purple-500/20 relative group-hover:scale-105 transition-transform duration-700">
                      <span className="text-3xl sm:text-4xl font-light font-mono tracking-widest text-purple-300">AA</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-purple-400/30 group-hover:border-purple-400/60 transition-colors pointer-events-none" />
                  </div>
                  <h3 className="mt-5 text-base sm:text-lg font-light text-white tracking-[0.18em] uppercase text-center">
                    Adhya Agarwal
                  </h3>
                  <span className="text-[11px] font-mono tracking-widest text-purple-400/90 uppercase mt-1">
                    Deep Learning & Systems
                  </span>
                </div>

                {/* Member 2: Abhishek Hardaha */}
                <div className="flex flex-col items-center group">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-b from-cyan-400/40 via-white/15 to-transparent shadow-[0_0_40px_rgba(56,189,248,0.15)] group-hover:shadow-[0_0_45px_rgba(56,189,248,0.35)] transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-cyan-950/70 via-black to-zinc-950 flex flex-col items-center justify-center border border-cyan-500/20 relative group-hover:scale-105 transition-transform duration-700">
                      <span className="text-3xl sm:text-4xl font-light font-mono tracking-widest text-cyan-300">AH</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-cyan-400/40 group-hover:border-cyan-400/70 transition-colors pointer-events-none" />
                  </div>
                  <h3 className="mt-5 text-base sm:text-lg font-light text-white tracking-[0.18em] uppercase text-center">
                    Abhishek Hardaha
                  </h3>
                  <span className="text-[11px] font-mono tracking-widest text-cyan-400/90 uppercase mt-1">
                    Geometry & Architecture
                  </span>
                </div>

                {/* Member 3: Aadya Rastogi */}
                <div className="flex flex-col items-center group">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-b from-emerald-400/30 via-white/10 to-transparent shadow-[0_0_35px_rgba(52,211,153,0.12)] group-hover:shadow-[0_0_45px_rgba(52,211,153,0.3)] transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-950/70 via-black to-zinc-950 flex flex-col items-center justify-center border border-emerald-500/20 relative group-hover:scale-105 transition-transform duration-700">
                      <span className="text-3xl sm:text-4xl font-light font-mono tracking-widest text-emerald-300">AR</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-emerald-400/30 group-hover:border-emerald-400/60 transition-colors pointer-events-none" />
                  </div>
                  <h3 className="mt-5 text-base sm:text-lg font-light text-white tracking-[0.18em] uppercase text-center">
                    Aadya Rastogi
                  </h3>
                  <span className="text-[11px] font-mono tracking-widest text-emerald-400/90 uppercase mt-1">
                    Computer Science & Vision
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STAGE 2: [ Under the guidance of ] (Pure ASCIIText)
              ---------------------------------------------------- */}
          {stage === 2 && (
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full">
                <ASCIIText
                  key="ascii-stage-2"
                  text="Under the guidance of"
                  asciiFontSize={6}
                  colors={['#ffffff', '#e4e4e7', '#a1a1aa']}
                  textColor="#ffffff"
                  textScale={1}
                  blocks={0}
                  waves={0}
                  waveSpeed={1}
                  chroma={0}
                  tilt={0.15}
                  hueShift={0}
                  scramble={0.35}
                  clickRipple={true}
                  intro={true}
                  idle={true}
                  interactive={true}
                  theme="dark"
                />
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STAGE 3: [ Dr. Tanveer Ahmed ]
              Prestigious Mentor Presentation
              ---------------------------------------------------- */}
          {stage === 3 && (
            <div className="w-full max-w-xl px-6 flex flex-col items-center justify-center space-y-6 text-center">
              {/* Circular Monogram of Dr. Tanveer Ahmed */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full p-1.5 bg-gradient-to-b from-cyan-400/50 via-white/20 to-transparent shadow-[0_0_55px_rgba(56,189,248,0.22)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-cyan-950/80 via-black to-zinc-950 flex flex-col items-center justify-center border border-cyan-400/30">
                  <span className="text-4xl sm:text-5xl font-light font-mono tracking-widest text-cyan-300">TA</span>
                  <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400/70 uppercase mt-2">MENTOR</span>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 pointer-events-none" />
              </div>

              {/* Typography */}
              <div className="space-y-2 mt-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-[0.25em] uppercase">
                  Dr. Tanveer Ahmed
                </h2>
                <p className="text-xs sm:text-sm font-mono tracking-widest text-cyan-400/90 uppercase">
                  Faculty Mentor & Research Guide
                </p>
                <p className="text-xs font-mono tracking-wider text-zinc-400 mt-1 max-w-md mx-auto">
                  Department of Computer Science & Engineering
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. STAGE 4: INTERACTIVE 2D IMAGE CONVERTED TO 3D SHOWCASE
          (Curtain Split Wipe, Depth Extrusion, Free 3D Orbit)
          ======================================================== */}
      {stage === 4 && (
        <div className="relative z-20 w-full h-full animate-fade-in">
          <TwoDToThreeDShowcase
            onReplay={() => transitionToStage(0)}
            onClose={onClose}
          />
        </div>
      )}

      {/* ========================================================
          5. WHISPER-THIN BOTTOM PROGRESS BAR (FOR SLIDES 0-3)
          ======================================================== */}
      {stage < 4 && (
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/5 z-40 pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(56,189,248,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* ========================================================
          6. NAVIGATION DOTS (FOR SLIDES 0-3)
          ======================================================== */}
      {stage < 4 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-none text-zinc-500">
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                stage === dot ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
