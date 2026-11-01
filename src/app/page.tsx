'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { PointCloudViewer } from '@/components/PointCloudViewer';
import { MetricsTable } from '@/components/MetricsTable';
import { HeatmapViewer } from '@/components/HeatmapViewer';
import { BENCHMARK_SCENES, MODELS_INFO } from '@/lib/benchmarkData';
import { ModelId, SceneBenchmarkData } from '@/types/benchmark';
import { Box, Layers, ShieldCheck, Cpu, ArrowRight, Eye, Grid, Camera } from 'lucide-react';

export default function ModelComparisonPage() {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(BENCHMARK_SCENES[0].id);
  const currentScene = BENCHMARK_SCENES.find(s => s.id === selectedSceneId) || BENCHMARK_SCENES[0];
  const [showInputImage, setShowInputImage] = useState<boolean>(true);

  // Which models to show in side-by-side viewports (default: Ground Truth vs VGGT-Omega vs DUSt3R vs COLMAP)
  const [activeModels, setActiveModels] = useState<ModelId[]>([
    'ground_truth',
    'vggt_omega',
    'dust3r',
    'depth_anything_3'
  ]);

  const toggleModel = (id: ModelId) => {
    if (activeModels.includes(id)) {
      if (activeModels.length > 1) {
        setActiveModels(activeModels.filter(m => m !== id));
      }
    } else {
      setActiveModels([...activeModels, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <Navigation />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-[#121215] via-[#09090b] to-[#09090b] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Fabrication Benchmark | Verified 3D LiDAR Ground Truth</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Actual Ground Truth vs <span className="text-cyan-400">VGGT-Ω</span> vs <span className="text-indigo-400">DUSt3R</span> vs <span className="text-amber-400">Depth Anything 3</span> vs <span className="text-rose-400">COLMAP</span>
              </h1>
              <p className="mt-3 text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Empirical side-by-side 3D geometric evaluation across {BENCHMARK_SCENES.length} authentic benchmark scenes (TerraSky3D 4K Aerial UAV and ETH3D Terrestrial LiDAR). Precomputed with rigid Umeyama similarity alignment and metric error analysis.
              </p>
            </div>

            {/* Benchmark Quick Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-[#121215] border border-zinc-800">
                <div className="text-[11px] text-zinc-500">BENCHMARK SCENES</div>
                <div className="text-lg font-bold text-white mt-1">{BENCHMARK_SCENES.length} Real Scenes</div>
                <div className="text-[10px] text-emerald-400">TerraSky3D &amp; ETH3D</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121215] border border-zinc-800">
                <div className="text-[11px] text-zinc-500">MODELS COMPARED</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">4 + Actual GT</div>
                <div className="text-[10px] text-zinc-400">Dual Tesla T4 GPUs</div>
              </div>
            </div>
          </div>

          {/* Scenes Horizontal Carousel / Selector */}
          <div className="mt-8">
            <div className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Select Evaluation Scene ({BENCHMARK_SCENES.length} Verified Real Datasets - Pure Aerial UAV &amp; High-Res MVS):</span>
              <span className="text-[11px] text-cyan-400 lowercase">{currentScene.dataset}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {BENCHMARK_SCENES.map((scene, idx) => {
                const isSelected = scene.id === selectedSceneId;
                return (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedSceneId(scene.id)}
                    className={`p-2.5 rounded-xl text-left transition-all border ${isSelected
                        ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#121215] border-zinc-800 hover:border-zinc-700 hover:bg-[#18181b]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 capitalize">{scene.scene_type}</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1.5 truncate">{scene.name.split(':')[1]?.trim() || scene.name}</div>
                    <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">{scene.sensor_type.split('&')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Model Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[#121215] border border-zinc-800">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Visible 3D Viewports:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowInputImage(!showInputImage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 border mr-2 ${showInputImage
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm font-bold'
                  : 'border-zinc-800 text-zinc-400 bg-zinc-900 hover:text-white'
                }`}
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Input Photo ({showInputImage ? 'Visible' : 'Hidden'})</span>
            </button>

            {(Object.keys(MODELS_INFO) as ModelId[]).map((id) => {
              const info = MODELS_INFO[id];
              const isIncluded = activeModels.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleModel(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 border ${isIncluded
                      ? `${info.badgeColor} shadow-sm`
                      : 'border-zinc-800 text-zinc-500 bg-zinc-900/60 opacity-60 hover:opacity-100 hover:border-zinc-700'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isIncluded ? 'bg-current' : 'bg-zinc-600'}`}></span>
                  <span>{info.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Photo & Multi-View Sensor Context */}
        {showInputImage && (
          <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 flex flex-col md:flex-row items-center gap-6 shadow-xl">
            <div className="relative w-full md:w-80 h-48 rounded-lg overflow-hidden border border-zinc-800 bg-black/60 flex-shrink-0 group">
              <img
                src={currentScene.preview_image}
                alt={currentScene.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
                INPUT SENSOR PHOTO
              </div>
            </div>

            <div className="flex-1 space-y-2 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentScene.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase font-semibold">
                    {currentScene.scene_type}
                  </span>
                </h3>
                <span className="text-xs text-cyan-400">{currentScene.dataset}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {currentScene.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                <div className="p-2 rounded-lg bg-[#18181b] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">SENSOR / CAMERA</span>
                  <span className="text-white font-semibold truncate block">{currentScene.sensor_type.split('&')[0]}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#18181b] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">INPUT VIEWS</span>
                  <span className="text-cyan-400 font-semibold">{currentScene.num_input_images} Frames</span>
                </div>
                <div className="p-2 rounded-lg bg-[#18181b] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">GROUND TRUTH</span>
                  <span className="text-emerald-400 font-semibold">{currentScene.gt_points.toLocaleString()} pts</span>
                </div>
                <div className="p-2 rounded-lg bg-[#18181b] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">ALIGNMENT</span>
                  <span className="text-indigo-400 font-semibold">Umeyama 7-DoF</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Multi-Viewport Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Grid className="w-4 h-4 text-cyan-400" />
              Side-by-Side 3D Point Cloud Viewports (Interactive Orbit / Pan / Color Heatmaps)
            </span>
            <span>{activeModels.length} Active Viewports</span>
          </div>

          <div className={`grid gap-4 ${activeModels.length === 1 ? 'grid-cols-1' : (activeModels.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2')
            }`}>
            {activeModels.map((modelId) => {
              const modelData = currentScene.models[modelId];
              const info = MODELS_INFO[modelId];
              if (!modelData || !info) return null;

              const plyFilename = modelId === 'colmap_sfm'
                ? 'colmap'
                : (modelId === 'vggt_omega'
                  ? 'vggt'
                  : (modelId === 'depth_anything_3'
                    ? 'da3'
                    : (modelId === 'ground_truth' ? 'gt' : 'dust3r')));
              const plyUrl = modelData.point_cloud_url || `/data/scenes/${currentScene.id}_${plyFilename}.ply`;

              return (
                <PointCloudViewer
                  key={modelId}
                  modelId={modelId}
                  modelName={info.name}
                  badgeColor={info.badgeColor}
                  pointCloudUrl={plyUrl}
                  pointCount={modelData.metrics.point_count}
                  sceneSeed={BENCHMARK_SCENES.findIndex(s => s.id === currentScene.id) + 1}
                  isGroundTruth={info.isGroundTruth}
                  sceneId={currentScene.id}
                />
              );
            })}
          </div>
        </div>

        {/* Quantitative Metrics Table */}
        <MetricsTable
          sceneName={currentScene.name}
          modelsData={currentScene.models}
        />

        {/* Depth Maps & Error Heatmaps */}
        <HeatmapViewer scene={currentScene} />

        {/* Scientific Methodology & Integrity Card */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-[#121215] to-[#0e0e11] border border-zinc-800">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Evaluation Methodology &amp; Coordinate Alignment Protocol
          </h4>
          <div className="mt-3 text-xs text-zinc-400 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            <div>
              <strong className="text-zinc-200 block mb-1">1. Zero GT Leakage</strong>
              Ground truth point clouds and depth maps are strictly isolated and never fed into models as input or fine-tuning cues. All predictions are completely blind feed-forward inferences.
            </div>
            <div>
              <strong className="text-zinc-200 block mb-1">2. Umeyama 7-DoF Alignment</strong>
              Reconstructions undergo rigid similarity registration (rotation, translation, uniform scale) without non-rigid warping, preserving genuine topological accuracy and defects.
            </div>
            <div>
              <strong className="text-zinc-200 block mb-1">3. Dual GPU Acceleration</strong>
              Experiments executed sequentially across Dual Tesla T4 GPUs (30GB VRAM) running native PyTorch 2.11 + CUDA 12.8, with complete reproducible metric logs saved.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
