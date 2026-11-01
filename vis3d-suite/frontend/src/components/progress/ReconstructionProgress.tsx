"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, CheckCircle2, Clock, Cpu } from "lucide-react";
import { ReconstructionJob } from "@/lib/api";

interface ReconstructionProgressProps {
  job: ReconstructionJob | null;
  imageSrc?: string | null;
  objectName?: string;
  onCancel?: () => void;
}

const STAGES = [
  { id: 1, title: "Image Conditioning & Foreground Mask", desc: "Isolating subject silhouette and encoding tensor" },
  { id: 2, title: "Neural Pipeline Initialization", desc: "Loading transformer weights with dynamic VRAM offloading" },
  { id: 3, title: "Camera Pose & Depth Prediction", desc: "Estimating canonical frame, focal length, and point bounds" },
  { id: 4, title: "3D Sparse Latent Diffusion", desc: "Synthesizing volumetric tokens across 25 denoising steps" },
  { id: 5, title: "Mesh Extraction & Gaussian Splats", desc: "Marching cubes manifold cleanup and baking .ply & .glb" },
];

export default function ReconstructionProgress({
  job,
  objectName = "3D Object",
  onCancel,
}: ReconstructionProgressProps) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Normalized Progress percentage (0% to 100%)
  const rawProgress = job?.progress ?? 10;
  const progressPct = Math.min(
    100,
    Math.max(0, rawProgress > 1 ? Math.round(rawProgress) : Math.round(rawProgress * 100))
  );

  const stageText = job?.stage || "Processing neural reconstruction...";

  // Calculate current stage index (1 to 5)
  let currentStageIdx = 1;
  if (progressPct >= 85) currentStageIdx = 5;
  else if (progressPct >= 60) currentStageIdx = 4;
  else if (progressPct >= 38) currentStageIdx = 3;
  else if (progressPct >= 20) currentStageIdx = 2;
  else currentStageIdx = 1;

  return (
    <div className="relative overflow-hidden w-full max-w-xl mx-auto py-10 px-8 bg-[#0c1017]/80 backdrop-blur-3xl border border-white/[0.12] rounded-3xl shadow-2xl shadow-black/80 flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Ambient Radial Highlights */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-sky-500/10 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
            <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Reconstructing 3D Model
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {objectName} • 3D Sparse Diffusion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs font-mono text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Progress Metric & Slim Bar */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-light text-white font-mono tracking-tight">
            {progressPct}%
          </span>
          <span className="text-xs text-sky-300 truncate max-w-xs font-medium">
            {stageText}
          </span>
        </div>

        {/* Glowing Progress Bar */}
        <div className="w-full h-2.5 bg-zinc-950/80 rounded-full overflow-hidden p-0.5 border border-white/[0.08] shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-300 rounded-full transition-all duration-700 ease-out shadow-lg shadow-sky-500/40"
            style={{ width: `${Math.max(5, progressPct)}%` }}
          />
        </div>
      </div>

      {/* Subtle Pipeline Stages Checklist */}
      <div className="relative z-10 flex flex-col gap-1.5 py-1">
        {STAGES.map((s) => {
          const isDone = s.id < currentStageIdx;
          const isCurrent = s.id === currentStageIdx;

          return (
            <div
              key={s.id}
              className={`flex items-start gap-3.5 p-3 rounded-2xl transition-all ${
                isCurrent
                  ? "bg-white/[0.07] border border-sky-400/30 shadow-lg shadow-sky-500/5"
                  : "bg-transparent border border-transparent opacity-75"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-sky-300 animate-spin" />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs ${
                    isCurrent
                      ? "text-white font-semibold"
                      : isDone
                      ? "text-zinc-300 font-medium"
                      : "text-zinc-500 font-normal"
                  }`}
                >
                  {s.title}
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                  {s.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info & Cancel Option */}
      <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/[0.08]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Remote GPU: Dual Tesla T4 (2x 15GB VRAM)</span>
        </span>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-medium px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
