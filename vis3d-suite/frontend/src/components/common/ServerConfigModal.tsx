"use client";

import React, { useState, useEffect } from "react";
import { Server, CheckCircle2, AlertCircle, X, ExternalLink, Cpu, RefreshCw } from "lucide-react";
import { getApiBaseUrl, setApiBaseUrl, checkServerHealth, HealthResponse } from "@/lib/api";

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export default function ServerConfigModal({ isOpen, onClose, onConnected }: ServerConfigModalProps) {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getApiBaseUrl());
      testConnection(getApiBaseUrl());
    }
  }, [isOpen]);

  const testConnection = async (targetUrl?: string) => {
    const url = (targetUrl || urlInput).trim();
    if (!url) {
      setErrorMsg("Please enter a valid URL.");
      return;
    }
    setIsChecking(true);
    setErrorMsg(null);
    setHealthData(null);

    try {
      setApiBaseUrl(url);
      const data = await checkServerHealth();
      setHealthData(data);
      onConnected();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to server.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    setApiBaseUrl(urlInput);
    testConnection();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Kaggle / Remote GPU Endpoint
            </h3>
            <p className="text-xs text-slate-400">
              Connect to your free Tesla T4 GPU instance via Cloudflare Tunnel
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">
            Public Cloudflare Tunnel URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://...trycloudflare.com"
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-400"
            />
            <button
              onClick={() => testConnection()}
              disabled={isChecking}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
              Test
            </button>
          </div>
          <span className="text-[11px] text-slate-500">
            From Cell 5 of <code>SAM_3D_Suite_Kaggle_GPU.ipynb</code>
          </span>
        </div>

        {/* Health Status Result */}
        {healthData && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Connected to Meta SAM 3D Objects Server!
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px] mt-1">
              {healthData.gpus?.map((g, idx) => (
                <div key={idx} className="bg-slate-950/60 p-2 rounded border border-white/5">
                  <div className="text-slate-400 font-sans text-[10px]">{g.name}</div>
                  <div className="text-sky-300 font-bold">{g.free_vram_gb} GB Free / {g.total_vram_gb} GB</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">Connection Failed</div>
              <div className="text-[11px] text-rose-300/80">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <a
            href="https://www.kaggle.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1"
          >
            Open Kaggle Notebooks <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
