"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Upload, CheckCircle2, RefreshCw, Send, Smartphone, ArrowRight } from "lucide-react";
import Scanner from "@/components/ui/Scanner";

function PhoneUploadContent() {
  const searchParams = useSearchParams();
  const session = searchParams.get("session") || "default_session";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);
    setIsSent(false);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !session) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("session", session);
      formData.append("image", selectedFile);
      formData.append("name", selectedFile.name.replace(/\.[^/.]+$/, "") || "Mobile Capture");

      const res = await fetch("/api/mobile-sync", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setIsSent(true);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Failed to send photo to desktop.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsSent(false);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-slate-100 flex flex-col items-center justify-between p-4 max-w-md mx-auto selection:bg-sky-500/30 overflow-hidden">
      {/* Background Interactive Scanner Shader */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Scanner
          color1="#3b82f6"
          color2="#38bdf8"
          color3="#ffffff"
          speed={0.45}
          sweepSpeed={0.25}
          sweepWidth={1.8}
          trail={0.5}
          ripple={0.2}
          bandDensity={10}
          glow={0.55}
          scanDirection="vertical"
          colorSpread={0.65}
          scanline={true}
          scanlineIntensity={0.35}
          mouseInteraction={true}
          clickEffect="ping"
          opacity={0.8}
        />
        {/* Soft Vignette and Ambient Radial Overlays */}
        <div className="absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_50%_50%,transparent_35%,#09090b_90%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/15 to-[#09090b]/75 pointer-events-none" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full flex items-center justify-end py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-6 gap-5">
        {/* Success State */}
        {isSent ? (
          <div className="relative overflow-hidden w-full max-w-sm mx-auto p-7 bg-[#0c1017]/85 backdrop-blur-3xl border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">
              Photo Sent to Desktop!
            </h2>
            <p className="text-xs text-zinc-300 mb-4 max-w-xs leading-relaxed">
              Look at your computer screen — it is automatically selecting the photo and advancing to 3D segmentation in 5 seconds!
            </p>

            {previewUrl && (
              <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl mb-5">
                <img src={previewUrl} alt="Uploaded Photo" className="w-full h-full object-cover" />
              </div>
            )}

            <button
              onClick={handleRetake}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white/[0.06] hover:bg-white/[0.1] text-sky-300 border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4" />
              Snap Another Photo
            </button>
          </div>
        ) : previewUrl ? (
          /* Preview & Confirm State */
          <div className="relative overflow-hidden w-full max-w-sm mx-auto p-6 bg-[#0c1017]/85 backdrop-blur-3xl border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in duration-200">
            <div className="relative w-full aspect-square max-h-[340px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black">
              <img src={previewUrl} alt="Snapped Preview" className="w-full h-full object-contain" />
              <button
                onClick={handleRetake}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80"
                title="Retake photo"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-center">
                {errorMessage}
              </div>
            )}

            <div className="w-full flex gap-3">
              <button
                onClick={handleRetake}
                disabled={isUploading}
                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-[2] py-3.5 px-4 rounded-2xl font-bold text-xs bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Sending to Desktop...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send to Desktop Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Ready to Snap State - Glass Card */
          <div className="relative overflow-hidden w-full max-w-sm mx-auto p-7 rounded-3xl bg-[#0c1017]/80 backdrop-blur-3xl border border-white/[0.12] shadow-2xl shadow-black/80 flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Ambient Card Highlights */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10">
              <Smartphone className="w-10 h-10" />
            </div>

            <div className="relative z-10 flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">Snap an Everyday Object</h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Take a clear single-perspective photo of any vehicle, chair, shoe, mug, or plant.
              </p>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="relative z-10 w-full flex flex-col gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 text-slate-950 flex items-center justify-center gap-2.5 shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>Open Camera & Snap Photo</span>
              </button>

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-3.5 px-5 rounded-2xl font-semibold text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-zinc-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4 text-zinc-400" />
                <span>Choose from Photo Library</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-3 text-center text-[10px] text-zinc-500 border-t border-white/[0.08]">
        Session: <span className="font-mono text-zinc-400">{session}</span>
      </footer>
    </div>
  );
}

export default function PhonePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400">
          Loading camera studio...
        </div>
      }
    >
      <PhoneUploadContent />
    </Suspense>
  );
}
