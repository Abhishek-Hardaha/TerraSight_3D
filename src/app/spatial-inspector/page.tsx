'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { SpatialInspectionCanvas, MeasurementData } from '@/components/SpatialInspectionCanvas';
import { BENCHMARK_SCENES, MODELS_INFO } from '@/lib/benchmarkData';
import { ModelId } from '@/types/benchmark';
import {
  RotateCcw,
  Sliders,
  Eye,
  Camera,
  Compass,
  Ruler,
  SplitSquareVertical,
  Scissors,
  Crosshair,
  Maximize2,
  Sparkles,
  Layers,
  ArrowRight,
  Plane,
  Box,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';

export default function SpatialInspectorPage() {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(BENCHMARK_SCENES[0].id);
  const currentScene = BENCHMARK_SCENES.find((s) => s.id === selectedSceneId) || BENCHMARK_SCENES[0];

  const [primaryModel, setPrimaryModel] = useState<ModelId>('ground_truth');
  const [secondaryModel, setSecondaryModel] = useState<ModelId>('vggt_omega');
  const [isSplitView, setIsSplitView] = useState<boolean>(true);
  const [splitPercent, setSplitPercent] = useState<number>(50);

  const [toolMode, setToolMode] = useState<'orbit' | 'measure' | 'slice' | 'drone' | 'cameras'>('orbit');
  const [colorMode, setColorMode] = useState<'rgb' | 'elevation' | 'error' | 'normals'>('rgb');
  const [pointSize, setPointSize] = useState<number>(2.4);

  // Slicer clipping plane positions (-1 to 1)
  const [clipX, setClipX] = useState<number>(1.0);
  const [clipY, setClipY] = useState<number>(1.0);
  const [clipZ, setClipZ] = useState<number>(1.0);

  const [showCameras, setShowCameras] = useState<boolean>(false);
  const [measurement, setMeasurement] = useState<MeasurementData | null>(null);
  const [droneTelemetry, setDroneTelemetry] = useState<{ alt: number; heading: number; speed: number }>({
    alt: 1.8,
    heading: 0,
    speed: 0
  });

  // Resolve PLY URLs
  const getModelPlyUrl = (mId: ModelId) => {
    const scModel = currentScene.models[mId];
    if (scModel && scModel.point_cloud_url) return scModel.point_cloud_url;
    const suffix =
      mId === 'ground_truth'
        ? 'gt'
        : mId === 'vggt_omega'
        ? 'vggt'
        : mId === 'dust3r'
        ? 'dust3r'
        : mId === 'depth_anything_3'
        ? 'da3'
        : 'colmap';
    return `/data/scenes/${currentScene.id}_${suffix}.ply`;
  };

  const primaryUrl = getModelPlyUrl(primaryModel);
  const secondaryUrl = getModelPlyUrl(secondaryModel);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <Navigation />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-[#27272a] bg-gradient-to-b from-[#121215] via-[#09090b] to-[#09090b] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spatial Inspection Studio | Interactive 3D Measurement &amp; Flight Sandbox</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                3D Spatial Lab &amp; <span className="text-cyan-400">Drone Flight</span> Studio
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Interact with high-density laser scans and multi-view neural reconstructions. Use the real-time Split-Screen Wipe curtain, 3D laser measurement ruler, dynamic cross-section slicer, and first-person UAV drone flight simulator.
              </p>
            </div>

            {/* Quick Diagnostic Badge */}
            <div className="p-3.5 rounded-xl bg-[#121215] border border-[#27272a] font-mono space-y-1.5 max-w-sm">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Hardware Acceleration</span>
                <span className="text-emerald-400 font-bold">Dual Tesla T4</span>
              </div>
              <div className="text-xs text-zinc-300">
                100% Client-Side WebGL 60fps rendering with real millimeter Euclidean distance calculation.
              </div>
            </div>
          </div>

          {/* Scene Carousel Selector */}
          <div className="mt-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            <span className="text-xs font-mono text-zinc-500 whitespace-nowrap mr-2">Scene:</span>
            {BENCHMARK_SCENES.map((sc) => {
              const isSelected = sc.id === selectedSceneId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedSceneId(sc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                      : 'bg-[#121215] text-zinc-400 border-[#27272a] hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {sc.name.split(':')[1]?.trim() || sc.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Studio Controls & Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Control Bar: Model Selectors & Interactive Tool Tabs */}
        <div className="p-4 rounded-xl bg-[#121215] border border-[#27272a] flex flex-wrap items-center justify-between gap-4">
          {/* Left: Model Selections */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Primary Model */}
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">Left Model:</span>
              <select
                value={primaryModel}
                onChange={(e) => setPrimaryModel(e.target.value as ModelId)}
                className="bg-[#181b2e] text-white border border-[#2a304a] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
              >
                {(Object.keys(MODELS_INFO) as ModelId[]).map((mId) => (
                  <option key={mId} value={mId}>
                    {MODELS_INFO[mId].name}
                  </option>
                ))}
              </select>
            </div>

            {/* Split View Toggle */}
            <button
              onClick={() => setIsSplitView(!isSplitView)}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
                isSplitView
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-[bg-zinc-900] text-zinc-500 border-[#27272a] hover:text-zinc-300'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split Wipe Curtain</span>
            </button>

            {/* Secondary Model (if split enabled) */}
            {isSplitView && (
              <div className="flex items-center space-x-2">
                <span className="text-zinc-400">Right Model:</span>
                <select
                  value={secondaryModel}
                  onChange={(e) => setSecondaryModel(e.target.value as ModelId)}
                  className="bg-[#181b2e] text-indigo-300 border border-indigo-500/40 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-indigo-400 focus:outline-none"
                >
                  {(Object.keys(MODELS_INFO) as ModelId[]).map((mId) => (
                    <option key={mId} value={mId}>
                      {MODELS_INFO[mId].name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Active Tool Modes */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setToolMode('orbit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                toolMode === 'orbit'
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-[bg-zinc-900] text-zinc-400 border-[#27272a] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Orbit</span>
            </button>

            <button
              onClick={() => setToolMode('measure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                toolMode === 'measure'
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-[bg-zinc-900] text-zinc-400 border-[#27272a] hover:text-white'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>3D Ruler</span>
            </button>

            <button
              onClick={() => setToolMode('slice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                toolMode === 'slice'
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-[bg-zinc-900] text-zinc-400 border-[#27272a] hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Slicer</span>
            </button>

            <button
              onClick={() => {
                setToolMode('drone');
                setShowCameras(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                toolMode === 'drone'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-[bg-zinc-900] text-zinc-400 border-[#27272a] hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Drone Flight</span>
            </button>

            <button
              onClick={() => setShowCameras(!showCameras)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                showCameras
                  ? 'bg-indigo-500/30 text-indigo-300 border-indigo-400'
                  : 'bg-[bg-zinc-900] text-zinc-400 border-[#27272a] hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cameras</span>
            </button>
          </div>
        </div>

        {/* Secondary Sub-Controls Bar (Wipe Slider, Shading Mode, Slicer Sliders) */}
        <div className="p-3.5 rounded-xl bg-[#121215] border border-[#27272a] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          {/* Split Wipe Slider */}
          {isSplitView && (
            <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
              <span className="text-zinc-400 flex items-center gap-1.5 whitespace-nowrap">
                <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />
                Curtain Wipe: <strong className="text-white">{splitPercent}%</strong>
              </span>
              <input
                type="range"
                min="5"
                max="95"
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          )}

          {/* Slicer Sliders (shown when Slice mode is active) */}
          {toolMode === 'slice' && (
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-zinc-400">Clip X:</span>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={clipX}
                  onChange={(e) => setClipX(Number(e.target.value))}
                  className="w-24 accent-rose-400 cursor-pointer h-1.5 bg-zinc-800 rounded"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-zinc-400">Clip Y:</span>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={clipY}
                  onChange={(e) => setClipY(Number(e.target.value))}
                  className="w-24 accent-emerald-400 cursor-pointer h-1.5 bg-zinc-800 rounded"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-zinc-400">Clip Z:</span>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={clipZ}
                  onChange={(e) => setClipZ(Number(e.target.value))}
                  className="w-24 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded"
                />
              </div>
            </div>
          )}

          {/* Color Shading Mode */}
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-zinc-400">Shading:</span>
            {(['rgb', 'elevation', 'error', 'normals'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className={`px-2.5 py-1 rounded text-[11px] uppercase transition-all ${
                  colorMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Point Size */}
          <div className="flex items-center space-x-2">
            <span className="text-zinc-400">Size:</span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.2"
              value={pointSize}
              onChange={(e) => setPointSize(Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded"
            />
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <SpatialInspectionCanvas
          primaryModelUrl={primaryUrl}
          primaryModelName={MODELS_INFO[primaryModel].name}
          secondaryModelUrl={secondaryUrl}
          secondaryModelName={MODELS_INFO[secondaryModel].name}
          isSplitViewActive={isSplitView}
          splitPercentage={splitPercent}
          toolMode={toolMode}
          colorMode={colorMode}
          pointSize={pointSize}
          clipX={clipX}
          clipY={clipY}
          clipZ={clipZ}
          showCameras={showCameras}
          onMeasurementChange={(data) => setMeasurement(data)}
          onDroneTelemetry={(tel) => setDroneTelemetry(tel)}
        />

        {/* Scene Information & Ground Truth Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reference Image */}
          <div className="p-4 rounded-xl bg-[#121215] border border-[#27272a] space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reference Sensor Photo</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase">{currentScene.sensor_type.split('&')[0]}</span>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#27272a]">
              <img
                src={currentScene.preview_image}
                alt={currentScene.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
              {currentScene.description}
            </p>
          </div>

          {/* Metric Comparison Card */}
          <div className="p-4 rounded-xl bg-[#121215] border border-[#27272a] space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Geometric Accuracy Comparison</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400">Left: {MODELS_INFO[primaryModel].name}</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">
                    {currentScene.models[primaryModel]?.metrics.rmse_m.toFixed(4)} m RMSE
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500">Points</div>
                  <div className="text-xs font-semibold text-white">
                    {currentScene.models[primaryModel]?.metrics.point_count.toLocaleString()}
                  </div>
                </div>
              </div>

              {isSplitView && (
                <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400">Right: {MODELS_INFO[secondaryModel].name}</div>
                    <div className="text-sm font-bold text-indigo-400 mt-0.5">
                      {currentScene.models[secondaryModel]?.metrics.rmse_m.toFixed(4)} m RMSE
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500">Points</div>
                    <div className="text-xs font-semibold text-white">
                      {currentScene.models[secondaryModel]?.metrics.point_count.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tool Instructions Card */}
          <div className="p-4 rounded-xl bg-[#121215] border border-[#27272a] space-y-2.5 font-mono text-xs">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Tool Guide</span>
            </div>

            <ul className="text-[11px] text-zinc-400 space-y-2 leading-normal">
              <li>
                <strong className="text-zinc-200">Orbit View:</strong> Left Click + Drag to rotate 360°, Right Click + Drag to pan, Scroll wheel to zoom.
              </li>
              <li>
                <strong className="text-zinc-200">3D Laser Ruler:</strong> Click any 2 points on the 3D surface to measure Euclidean distance and bounding box $\Delta X, \Delta Y, \Delta Z$.
              </li>
              <li>
                <strong className="text-zinc-200">Drone Flight:</strong> Use <span className="text-cyan-400">W, A, S, D</span> to glide through the scene, <span className="text-cyan-400">Space / Shift</span> to ascend or descend.
              </li>
              <li>
                <strong className="text-zinc-200">Split Wipe:</strong> Drag the curtain slider to seamlessly inspect surface differences in lockstep.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

