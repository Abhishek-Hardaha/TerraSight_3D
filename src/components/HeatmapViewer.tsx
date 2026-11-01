'use client';

import React, { useState } from 'react';
import { ModelId, SceneBenchmarkData } from '@/types/benchmark';
import { MODELS_INFO } from '@/lib/benchmarkData';
import { Eye, Layers, HelpCircle } from 'lucide-react';

interface HeatmapViewerProps {
  scene: SceneBenchmarkData;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ scene }) => {
  const [selectedModel, setSelectedModel] = useState<ModelId>('vggt_omega');
  const modelData = scene.models[selectedModel];
  const depthComp = modelData?.depth_comparison;

  const compareModels: ModelId[] = ['vggt_omega', 'dust3r', 'depth_anything_3', 'colmap_sfm'];

  return (
    <div className="bg-[#121215] rounded-xl border border-zinc-800 p-5 shadow-xl">
      {/* Header and Model Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Depth Map & Error Heatmap Analysis: <span className="text-cyan-400">{scene.name}</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Pixel-wise depth difference | Absolute Metric Error vs LiDAR Scan
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          {compareModels.map((id) => {
            const info = MODELS_INFO[id];
            const isSelected = selectedModel === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedModel(id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {info?.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Panel Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1: Input Multi-view Frame */}
        <div className="bg-[#141418] rounded-lg border border-zinc-800 overflow-hidden">
          <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono font-bold text-zinc-300 flex items-center justify-between">
            <span>Input Camera View</span>
            <span className="text-[10px] text-zinc-500">6016x4016 DSLR</span>
          </div>
          <div className="relative aspect-[4/3] bg-black">
            <img
              src={`/data/images/${scene.id}_input.jpg`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== scene.preview_image) {
                  target.src = scene.preview_image;
                }
              }}
              alt="Input DSLR frame"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-2.5 text-[10px] text-zinc-400 font-mono">
            Calibrated optical center & distortion corrected
          </div>
        </div>

        {/* Panel 2: Ground Truth Laser Depth */}
        <div className="bg-[#141418] rounded-lg border border-zinc-800 overflow-hidden">
          <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono font-bold text-emerald-400 flex items-center justify-between">
            <span>Ground Truth Depth (LiDAR)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">FARO LASER</span>
          </div>
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
            <img
              src={`/data/depth_maps/${scene.id}_gt_depth.png`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              alt="Ground Truth LiDAR Depth"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-2.5 text-[10px] text-zinc-400 font-mono">
            Structured light & terrestrial LiDAR unprojected
          </div>
        </div>

        {/* Panel 3: Model Predicted Depth */}
        <div className="bg-[#141418] rounded-lg border border-zinc-800 overflow-hidden">
          <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono font-bold text-cyan-400 flex items-center justify-between">
            <span>{MODELS_INFO[selectedModel]?.name.split(' ')[0]} Pred Depth</span>
            <span className="text-[10px] text-cyan-400 font-mono">Inference</span>
          </div>
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
            {(() => {
              const modelSuffix = selectedModel === 'colmap_sfm' 
                ? 'colmap' 
                : (selectedModel === 'vggt_omega' 
                  ? 'vggt' 
                  : (selectedModel === 'depth_anything_3' 
                    ? 'da3' 
                    : 'dust3r'));
              return (
                <img
                  key={`depth-${selectedModel}`}
                  src={`/data/depth_maps/${scene.id}_${modelSuffix}_depth.png`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  alt={`${MODELS_INFO[selectedModel]?.name} Depth Map`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              );
            })()}
          </div>
          <div className="p-2.5 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Speed: {modelData?.metrics.inference_time_s}s</span>
            <span>RMSE: {modelData?.metrics.rmse_m}m</span>
          </div>
        </div>

        {/* Panel 4: Absolute Error Heatmap */}
        <div className="bg-[#141418] rounded-lg border border-zinc-800 overflow-hidden">
          <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono font-bold text-rose-400 flex items-center justify-between">
            <span>Depth Error Heatmap |GT - Pred|</span>
            <span className="text-[10px] text-zinc-500 font-mono">JET MAP</span>
          </div>
          <div className="relative aspect-[4/3] bg-black flex flex-col items-center justify-center overflow-hidden">
            {(() => {
              const modelSuffix = selectedModel === 'colmap_sfm' 
                ? 'colmap' 
                : (selectedModel === 'vggt_omega' 
                  ? 'vggt' 
                  : (selectedModel === 'depth_anything_3' 
                    ? 'da3' 
                    : 'dust3r'));
              return (
                <img
                  key={`error-${selectedModel}`}
                  src={`/data/depth_maps/${scene.id}_${modelSuffix}_error.png`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  alt="Depth Error Heatmap"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              );
            })()}
          </div>
          <div className="p-2.5 text-[10px] font-mono flex items-center justify-between text-zinc-400">
            <span className="text-emerald-400">0.0m</span>
            <span className="text-yellow-400">MAE: {modelData?.metrics.mae_m ?? '0.02'}m</span>
            <span className="text-rose-400">RMSE: {modelData?.metrics.rmse_m ?? '0.05'}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
