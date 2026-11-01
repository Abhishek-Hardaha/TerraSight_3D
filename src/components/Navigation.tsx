'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Layers, Cpu, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { AboutProjectShowcase } from './AboutProjectShowcase';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);

  const navItems = [
    {
      name: 'Model Comparison',
      href: '/',
      icon: Box,
      description: 'Actual vs VGGT-Ω vs DUSt3R vs DA3 vs COLMAP'
    },
    {
      name: 'Sparsity Evaluation',
      href: '/sparsity-evaluation',
      icon: Layers,
      description: 'COLMAP vs VGGT-Ω (100%, 70%, 50%, 25%)'
    },
    {
      name: '3D Spatial Lab',
      href: '/spatial-inspector',
      icon: Compass,
      description: 'Split Wipe, 3D Ruler, Drone Flight & Slicer'
    },
    {
      name: 'Vis3D Studio',
      href: '/vis3d',
      icon: Sparkles,
      description: 'Single-Image Neural 3D Reconstruction Platform'
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80 w-full">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            {/* Top Left: About Project Button & Brand Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
              <button
                onClick={() => setIsShowcaseOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-cyan-500/60 text-xs font-mono font-semibold transition-all shadow-sm hover:shadow-cyan-500/10 hover:scale-[1.02] active:scale-95 group whitespace-nowrap shrink-0"
                title="Click to view Project Team, Mentorship & 3D Showcase"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform animate-pulse shrink-0" />
                <span className="whitespace-nowrap">About Project</span>
              </button>

              <div className="h-5 w-px bg-zinc-800 hidden sm:block shrink-0" />

              <Link href="/" className="flex items-center space-x-3 group shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-zinc-800 via-zinc-700 to-zinc-600 border border-zinc-700/80 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-105 transition-transform shrink-0">
                  <Box className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col shrink-0">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                      TerraSight
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/90 text-cyan-400 border border-zinc-700 font-mono font-semibold tracking-wider whitespace-nowrap">
                      3D BENCHMARK
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono whitespace-nowrap hidden md:block">
                    Verified Ground Truth Evaluation
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Navigation Links */}
            <nav className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${isActive
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                      }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Dual GPU Telemetry Status */}
            <div className="hidden xl:flex items-center space-x-3 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 text-[11px] font-mono text-zinc-300 whitespace-nowrap shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-zinc-200 whitespace-nowrap">Dual Tesla T4</span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-400 whitespace-nowrap">VGGT-Ω + DA3 + DUSt3R</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 whitespace-nowrap shrink-0">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="whitespace-nowrap">REAL EVALUATION</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Project Showcase Modal */}
      <AboutProjectShowcase
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
      />
    </>
  );
};
