'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Box,
  Layers,
  Cpu,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Scissors,
  Eye,
  Download,
  FolderGit2,
  Play
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export default function Vis3DGatewayPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-[#09090b] p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              INTEGRATED 3D SUITE
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Vis3D Reconstruction Suite
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
              Transform single 2D photographs into watertight, textured 3D meshes (<code className="text-cyan-300 font-mono text-xs">.glb</code>) and 3D Gaussian Splats (<code className="text-cyan-300 font-mono text-xs">.ply</code>) powered by Meta AI SAM 3D Objects with free Kaggle Dual Tesla T4 GPU acceleration.
            </p>

            {/* Launch & Terminal Quickstart */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-black" />
                Open Vis3D Studio (Port 3000)
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>

              <button
                onClick={() => copyToClipboard('npm run dev:vis3d')}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-sm font-mono transition-all"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>{copiedCmd === 'npm run dev:vis3d' ? 'Copied to Clipboard!' : 'npm run dev:vis3d'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Step Production Workflow */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-cyan-400" />
              3-Step Intuitive Workflow
            </h2>
            <p className="text-xs sm:text-sm font-mono text-zinc-400">
              End-to-end single-image reconstruction pipeline with live segmentation guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-white">Upload & Preset Library</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Drag and drop any object photo, snap live via webcam / mobile sync, or choose from 26 verified pre-reconstructed daily object presets.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-white">Interactive SAM Segmentation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Guide foreground extraction with positive/negative point prompts, bounding boxes, precision brush/eraser, or 1-click automatic SAM isolation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-white">Dual-GPU 3D Synthesis</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Generates watertight manifold geometry via Marching Cubes and bakes spherical harmonics textures with free Kaggle Dual Tesla T4 GPU workers.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Three.js Studio */}
          <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Three.js Interactive 3D Studio</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>PBR Textured Mesh, Sculptural Clay/Matcap & Dense Points</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Studio Lighting: Neutral Studio, Golden Sunset, Cyberpunk Neon</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Metric Bounding Box Dimensions (W × H × D) & Turntable Orbit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>1-Click Downloads for .glb meshes and Gaussian Splats (.ply)</span>
              </li>
            </ul>
          </div>

          {/* Dual GPU Backend */}
          <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Free Kaggle Dual-GPU Backend</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Runs on Kaggle Dual Tesla T4 GPUs (30 GB total VRAM)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero local GPU requirements or expensive cloud server costs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant HTTPS Cloudflare Tunnel connection for live web streaming</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Self-contained notebook in <code className="text-zinc-200">vis3d-suite/kaggle_notebook/</code></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Directory & Quick Reference */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
            Repository Project Structure
          </h3>
          <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto border border-zinc-800">
            <pre>{`TerraSight_3D/
├── src/                          # TerraSight 3D Benchmark & Spatial Inspector Platform
│   ├── app/                      # Model Comparison, Sparsity Evaluation, Spatial Lab
│   └── components/               # Three.js PointCloudViewer, Split Wipe, Ruler, Slicer
├── public/                       # Verified Ground Truth Scans, Depth Maps & Benchmarks
├── vis3d-suite/
│   ├── frontend/                 # Vis3D Next.js 15 + Three.js Single-Image 3D Studio
│   │   ├── src/                  # MaskEditor, ImageUploader, ThreeViewer, Gallery
│   │   └── public/               # 26 Daily Object Presets & High-Fidelity 3D Models
│   ├── kaggle_notebook/          # Free Kaggle Dual Tesla T4 GPU Server Notebook
│   ├── Setup_Guide.html          # Interactive Offline Setup & Architecture Guide
│   ├── start.bat                 # Windows 1-Click Launcher
│   ├── start.sh                  # Linux / macOS 1-Click Launcher
│   └── README.md                 # Vis3D Technical Documentation
└── README.md                     # Platform Overview & Benchmark Documentation`}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}
