"use client";

import React, { useState, useEffect } from "react";
import { Server, Images } from "lucide-react";
import { checkServerHealth, getApiBaseUrl } from "@/lib/api";
import { GALLERY_ITEMS } from "@/lib/galleryData";

interface HeaderProps {
  onOpenServerConfig: () => void;
  onOpenPresets?: () => void;
  onOpenGallery?: () => void;
  isConnected: boolean;
}

export default function Header({ onOpenServerConfig, onOpenPresets, onOpenGallery, isConnected }: HeaderProps) {
  const [gpuName, setGpuName] = useState<string>("");

  useEffect(() => {
    checkServerHealth()
      .then((data) => {
        if (data.gpus && data.gpus.length > 0) {
          setGpuName(data.gpus[0].name.replace("NVIDIA ", ""));
        }
      })
      .catch(() => {
        setGpuName("");
      });
  }, [isConnected]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-xl border-b border-white/10 px-6 py-3.5 flex items-center justify-end">
      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Gallery Button - Just on the left of Connect to Kaggle */}
        {onOpenGallery && (
          <button
            onClick={onOpenGallery}
            className="px-3.5 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm group"
            title="Open 3D Reconstruction Gallery"
          >
            <Images className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Gallery</span>
            <span className="px-1.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 text-[10px] font-mono font-bold">
              71
              {GALLERY_ITEMS.length}
            </span>
          </button>
        )}

        {/* Server Connection Pill */}
        <button
          onClick={onOpenServerConfig}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-zinc-900/90 border-white/10 text-zinc-400 hover:text-white"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
          <span>{isConnected ? `GPU: ${gpuName || "Tesla T4"}` : "Connect Kaggle GPU"}</span>
          <Server className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </header>
  );
}
