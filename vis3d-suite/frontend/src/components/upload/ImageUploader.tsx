"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Camera,
  Sparkles,
  Smartphone,
  QrCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowRight,
  Clock,
  Radio,
} from "lucide-react";
import { generateQRCodeSVG } from "@/lib/qrcode";

interface ImageUploaderProps {
  onImageSelected: (file: File, src: string, name: string) => void;
  onSelectPreset?: (presetGlb: string, presetName: string, previewImg: string) => void;
  onProceedToSegmentation?: () => void;
}

export default function ImageUploader({
  onImageSelected,
  onProceedToSegmentation,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mobile Sync State
  const [sessionId, setSessionId] = useState<string>("");
  const [phoneUrl, setPhoneUrl] = useState<string>("");
  const [qrSvgUrl, setQrSvgUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [mobilePhotoReceived, setMobilePhotoReceived] = useState<boolean>(false);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);

  // Initialize unique session ID and dynamic origin URL
  useEffect(() => {
    const sid = "vis_" + Math.random().toString(36).substring(2, 9);
    setSessionId(sid);

    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const fullUrl = `${origin}/phone?session=${sid}`;
      setPhoneUrl(fullUrl);
      setQrSvgUrl(generateQRCodeSVG(fullUrl, 260));
    }
  }, []);

  // Poll for mobile photo upload
  useEffect(() => {
    if (!sessionId || mobilePhotoReceived) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mobile-sync?session=${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.uploaded && data.imageBase64) {
          clearInterval(interval);
          setMobilePhotoReceived(true);
          setMobilePreview(data.imageBase64);

          // Convert base64 data URI to File object
          const resBlob = await fetch(data.imageBase64);
          const blob = await resBlob.blob();
          const file = new File([blob], data.filename || "phone_capture.jpg", {
            type: blob.type || "image/jpeg",
          });

          onImageSelected(file, data.imageBase64, data.name || "Mobile Capture");
        }
      } catch (err) {
        // Silent polling error
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [sessionId, mobilePhotoReceived, onImageSelected]);

  // 5-Second countdown when mobile photo is received
  useEffect(() => {
    if (!mobilePhotoReceived) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0 -> auto-proceed to segmentation
      if (onProceedToSegmentation) {
        onProceedToSegmentation();
      }
    }
  }, [mobilePhotoReceived, countdown, onProceedToSegmentation]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(file, e.target.result as string, file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const copyPhoneLink = () => {
    if (!phoneUrl) return;
    navigator.clipboard.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
      {/* Mobile Photo Received Overlay Notification */}
      {mobilePhotoReceived && (
        <div className="w-full bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-indigo-500/20 border border-emerald-400/40 rounded-2xl p-5 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4">
            {mobilePreview && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-400/50 shrink-0 shadow-lg">
                <img src={mobilePreview} alt="Mobile capture" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  Mobile Photo Received Successfully!
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Photo selected from your phone camera. Auto-proceeding to segmentation in{" "}
                <span className="font-mono font-bold text-emerald-300 text-sm">{countdown}s</span>...
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onProceedToSegmentation) onProceedToSegmentation();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <span>Proceed Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Upload & Phone Camera Side-by-Side Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Drag and Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative overflow-hidden lg:col-span-7 flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-sky-400 bg-sky-500/10 scale-[1.01] shadow-2xl shadow-sky-500/20"
              : "border-white/[0.12] hover:border-sky-400/50 bg-[#0c1017]/70 hover:bg-[#0f1420]/80 shadow-2xl shadow-black/50"
          } backdrop-blur-2xl group min-h-[390px]`}
        >
          {/* Subtle Ambient Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/[0.04] via-transparent to-indigo-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            accept="image/*"
            className="hidden"
          />

          <div className="relative mb-5 group-hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-sky-500/10 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10 group-hover:border-sky-400/60 transition-colors">
              <Upload className="w-8 h-8 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 tracking-tight text-center">
            Drop your object image here, or{" "}
            <span className="text-sky-400 underline underline-offset-4 group-hover:text-sky-300 transition-colors">Browse</span>
          </h3>
          <p className="text-sm text-zinc-400 max-w-md text-center mb-6 leading-relaxed">
            Upload any single-perspective photo of an everyday object (vehicles, furniture, architecture, products).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {["PNG", "JPG", "WEBP", "MAX 25MB"].map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wide bg-white/[0.04] text-zinc-400 border border-white/[0.08]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Scan QR Code to Snap from Phone Camera */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-[#0c1017]/70 border border-white/[0.12] rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Snap & Upload from Phone
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Live Sync Active</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Scan this QR code with your phone camera to click a photo and upload it instantly to this desktop screen.
            </p>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl shadow-sky-500/10 border border-white/20 transition-transform hover:scale-105">
                {qrSvgUrl ? (
                  <img
                    src={qrSvgUrl}
                    alt="Scan to upload from phone"
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Direct Link & Copy Option */}
          <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="truncate max-w-[200px] font-mono opacity-70">
                {phoneUrl || "Loading link..."}
              </span>
              <button
                onClick={copyPhoneLink}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                title="Copy phone URL"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <a
              href={phoneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Or Open Mobile Camera in New Tab</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
