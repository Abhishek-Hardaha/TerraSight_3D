'use client';

import React from 'react';
import { ModelId, QuantitativeMetrics, ModelInfo } from '@/types/benchmark';
import { MODELS_INFO } from '@/lib/benchmarkData';
import { Award, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';

interface MetricsTableProps {
  sceneName: string;
  modelsData: Record<ModelId, {
    model_name: string;
    model_version: string;
    metrics: QuantitativeMetrics;
    status: 'success' | 'failed' | 'partial';
  }>;
}

export const MetricsTable: React.FC<MetricsTableProps> = ({ sceneName, modelsData }) => {
  const modelOrder: ModelId[] = ['ground_truth', 'vggt_omega', 'dust3r', 'depth_anything_3', 'colmap_sfm'];

  // Identify best non-ground-truth metrics for highlighting
  const validModels = modelOrder.filter(id => id !== 'ground_truth' && modelsData[id]);
  const bestRmse = Math.min(...validModels.map(id => modelsData[id]?.metrics.rmse_m || 999));
  const bestChamfer = Math.min(...validModels.map(id => modelsData[id]?.metrics.chamfer_distance_m || 999));
  const bestCompleteness = Math.max(...validModels.map(id => modelsData[id]?.metrics.completeness_pct || 0));
  const bestTime = Math.min(...validModels.map(id => modelsData[id]?.metrics.inference_time_s || 999));

  return (
    <div className="bg-[#121215] rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      <div className="px-5 py-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Rigorous Quantitative Evaluation Metrics: <span className="text-cyan-400">{sceneName}</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Evaluated directly against Faro 3D Laser Ground Truth (Rigid Umeyama Scale-Aligned)
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Zero Fabrication
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Zap className="w-3 h-3" /> Dual Tesla T4 Benchmarked
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Model / Pipeline</th>
              <th className="py-3 px-3 font-semibold text-right">RMSE (m) ↓</th>
              <th className="py-3 px-3 font-semibold text-right">Chamfer Dist (m) ↓</th>
              <th className="py-3 px-3 font-semibold text-right">MAE (m) ↓</th>
              <th className="py-3 px-3 font-semibold text-right">Accuracy (cm) ↓</th>
              <th className="py-3 px-3 font-semibold text-right">Completeness (%) ↑</th>
              <th className="py-3 px-3 font-semibold text-right">F1 Score ↑</th>
              <th className="py-3 px-3 font-semibold text-right">Point Count</th>
              <th className="py-3 px-4 font-semibold text-right">Runtime (s) ↓</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 font-mono">
            {modelOrder.map((id) => {
              const data = modelsData[id];
              const info = MODELS_INFO[id];
              if (!data || !info) return null;

              const m = data.metrics;
              const isGt = id === 'ground_truth';
              const isBestRmse = !isGt && m.rmse_m === bestRmse;
              const isBestChamfer = !isGt && m.chamfer_distance_m === bestChamfer;
              const isBestComp = !isGt && m.completeness_pct === bestCompleteness;
              const isBestTime = !isGt && m.inference_time_s === bestTime;

              return (
                <tr
                  key={id}
                  className={`hover:bg-zinc-800/30 transition-colors ${
                    isGt ? 'bg-emerald-950/20 font-semibold' : ''
                  }`}
                >
                  {/* Model Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] border font-bold ${info.badgeColor}`}>
                        {info.name}
                      </span>
                      {isGt && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                          REFERENCE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-sans mt-0.5">{info.architecture}</div>
                  </td>

                  {/* RMSE */}
                  <td className={`py-3 px-3 text-right ${isBestRmse ? 'text-cyan-400 font-bold' : 'text-zinc-300'}`}>
                    {isGt ? '0.0000' : m.rmse_m.toFixed(3)}
                    {isBestRmse && <span className="ml-1 text-[10px] text-cyan-400">★</span>}
                  </td>

                  {/* Chamfer Distance */}
                  <td className={`py-3 px-3 text-right ${isBestChamfer ? 'text-cyan-400 font-bold' : 'text-zinc-300'}`}>
                    {isGt ? '0.0000' : m.chamfer_distance_m.toFixed(3)}
                    {isBestChamfer && <span className="ml-1 text-[10px] text-cyan-400">★</span>}
                  </td>

                  {/* MAE */}
                  <td className="py-3 px-3 text-right text-zinc-300">
                    {isGt ? '0.0000' : m.mae_m.toFixed(3)}
                  </td>

                  {/* Accuracy 90% */}
                  <td className="py-3 px-3 text-right text-zinc-300">
                    {isGt ? '0.00' : `${m.accuracy_cm.toFixed(2)} cm`}
                  </td>

                  {/* Completeness */}
                  <td className={`py-3 px-3 text-right ${isBestComp ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                    {m.completeness_pct.toFixed(1)}%
                    {isBestComp && <span className="ml-1 text-[10px] text-emerald-400">★</span>}
                  </td>

                  {/* F1 Score */}
                  <td className="py-3 px-3 text-right text-zinc-300">
                    {m.f_score.toFixed(3)}
                  </td>

                  {/* Point Count */}
                  <td className="py-3 px-3 text-right text-zinc-400">
                    {m.point_count.toLocaleString()}
                  </td>

                  {/* Runtime */}
                  <td className={`py-3 px-4 text-right ${isBestTime ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                    {isGt ? '-' : `${m.inference_time_s.toFixed(1)}s`}
                    {isBestTime && <span className="ml-1 text-[10px] text-amber-400">⚡</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div>
          <span>★ Best performing non-ground-truth model</span>
          <span className="mx-2 text-zinc-600">|</span>
          <span>⚡ Fastest wall-clock inference speed</span>
        </div>
        <div className="text-zinc-500">
          Threshold distance: 5.0 cm | Alignment: Umeyama 7-DoF Rigid
        </div>
      </div>
    </div>
  );
};
