"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Paintbrush,
  Eraser,
  Sparkles,
  Eye,
  CheckCircle2,
  Scissors,
  Loader2,
  Trash2,
  RefreshCw,
  Maximize2
} from "lucide-react";
import { segmentImage, resolveUrl } from "@/lib/api";

type ToolMode = "brush" | "eraser";
type ViewMode = "overlay" | "cutout" | "mask";

interface MaskEditorProps {
  imageFile: File | null;
  imageSrc: string | null;
  maskBlob: Blob | null;
  onMaskChange: (mask: Blob, maskUrl: string | null) => void;
  onProceedToReconstruction: () => void;
}

export default function MaskEditor({
  imageFile,
  imageSrc,
  maskBlob,
  onMaskChange,
  onProceedToReconstruction,
}: MaskEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const cursorPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasMaskRef = useRef<boolean>(false);
  const lastLoadedSrcRef = useRef<string | null>(null);

  // Tool & View States
  const [activeTool, setActiveTool] = useState<ToolMode>("brush");
  const [viewMode, setViewMode] = useState<ViewMode>("overlay");
  const [brushSize, setBrushSize] = useState<number>(35);
  const [maskOpacity, setMaskOpacity] = useState<number>(0.65);
  const [maskColor, setMaskColor] = useState<string>("#38bdf8"); // Cyan
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [isSegmenting, setIsSegmenting] = useState<boolean>(false);
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Synchronous, High-Performance Canvas Redraw Loop
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (viewMode === "mask") {
      // 1. Black & White Binary Mask Mode
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (maskCanvas && hasMaskRef.current) {
        ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
      }
    } else if (viewMode === "cutout") {
      // 2. Cutout Mode (Isolated foreground on dark checkered transparency pattern)
      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = 16;
      patternCanvas.height = 16;
      const pctx = patternCanvas.getContext("2d");
      if (pctx) {
        pctx.fillStyle = "#18181b";
        pctx.fillRect(0, 0, 16, 16);
        pctx.fillStyle = "#09090b";
        pctx.fillRect(0, 0, 8, 8);
        pctx.fillRect(8, 8, 8, 8);
        ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat") || "#09090b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (maskCanvas && hasMaskRef.current) {
        ctx.save();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    } else {
      // 3. Overlay Mode (Original image + glowing tinted mask)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (maskCanvas && hasMaskRef.current) {
        if (!tintCanvasRef.current) {
          tintCanvasRef.current = document.createElement("canvas");
        }
        const tint = tintCanvasRef.current;
        if (tint.width !== canvas.width || tint.height !== canvas.height) {
          tint.width = canvas.width;
          tint.height = canvas.height;
        }

        const tctx = tint.getContext("2d");
        if (tctx) {
          tctx.save();
          tctx.clearRect(0, 0, tint.width, tint.height);
          tctx.globalCompositeOperation = "source-over";
          tctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
          tctx.globalCompositeOperation = "source-in";
          tctx.fillStyle = maskColor;
          tctx.fillRect(0, 0, tint.width, tint.height);
          tctx.restore();

          ctx.save();
          ctx.globalAlpha = maskOpacity;
          ctx.drawImage(tint, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    }

    // Brush Indicator Ring Following Cursor
    const pos = cursorPosRef.current;
    if (pos) {
      const displayScale = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1;
      ctx.save();
      // Outer indicator circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, displayScale * 2);
      ctx.strokeStyle = activeTool === "brush" ? "#00f0ff" : "#ff0055";
      ctx.stroke();
      ctx.fillStyle = activeTool === "brush" ? "rgba(0, 240, 255, 0.25)" : "rgba(255, 0, 85, 0.25)";
      ctx.fill();

      // Precision center reticle dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, Math.max(2, displayScale * 1.5), 0, Math.PI * 2);
      ctx.fillStyle = activeTool === "brush" ? "#ffffff" : "#ff0055";
      ctx.fill();
      ctx.restore();
    }
  }, [viewMode, maskOpacity, maskColor, activeTool, brushSize]);

  // Export current mask as standard binary/alpha PNG blob (White object with full opacity, transparent background)
  const commitMask = useCallback(() => {
    const mc = maskCanvasRef.current;
    const img = imageElementRef.current;
    if (!mc) return;

    // Target image dimensions ensure 1:1 pixel alignment
    const exportWidth = img ? (img.naturalWidth || img.width) : mc.width;
    const exportHeight = img ? (img.naturalHeight || img.height) : mc.height;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const ectx = exportCanvas.getContext("2d");
    if (!ectx) return;

    // Clear background to ensure Alpha = 0 (transparent) and RGB = 0
    ectx.clearRect(0, 0, exportWidth, exportHeight);

    // Draw white foreground mask scaled to match image (Alpha = 255, RGB = 255)
    ectx.drawImage(mc, 0, 0, exportWidth, exportHeight);

    exportCanvas.toBlob((blob) => {
      if (blob) {
        onMaskChange(blob, null);
      }
    }, "image/png");
  }, [onMaskChange]);

  // Convert an 8-bit black/white or RGBA mask image into an alpha-channel mask canvas
  const loadMaskOntoCanvas = useCallback((maskImg: HTMLImageElement, triggerCommit: boolean = true) => {
    let mc = maskCanvasRef.current;
    if (!mc) {
      mc = document.createElement("canvas");
      maskCanvasRef.current = mc;
    }

    const img = imageElementRef.current;
    // Strict alignment: always map mask canvas to the source image's exact dimensions
    const targetWidth = img ? (img.naturalWidth || img.width) : (maskImg.naturalWidth || maskImg.width);
    const targetHeight = img ? (img.naturalHeight || img.height) : (maskImg.naturalHeight || maskImg.height);

    mc.width = targetWidth;
    mc.height = targetHeight;

    const ctx = mc.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    // Draw mask stretched/scaled to exactly cover the entire image
    ctx.drawImage(maskImg, 0, 0, targetWidth, targetHeight);

    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imgData.data;

    let nonZero = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114);

      // If already transparent or luminance is dark (< 100), make 100% transparent background
      if (a < 50 || luminance < 100) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      } else {
        // Solid white foreground with full opacity
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
        nonZero++;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const validMask = nonZero > 100;
    hasMaskRef.current = validMask;
    setHasMask(validMask);
    if (triggerCommit) {
      commitMask();
    }
    redraw();
  }, [commitMask, redraw]);

  // Load and cache Image ONCE when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    if (lastLoadedSrcRef.current === imageSrc && imageElementRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageElementRef.current = img;
      lastLoadedSrcRef.current = imageSrc;
      setImgDims({ w: img.width, h: img.height });

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      if (!maskCanvasRef.current) {
        const mc = document.createElement("canvas");
        mc.width = img.width;
        mc.height = img.height;
        maskCanvasRef.current = mc;
      } else {
        maskCanvasRef.current.width = img.width;
        maskCanvasRef.current.height = img.height;
        const mctx = maskCanvasRef.current.getContext("2d");
        if (mctx) mctx.clearRect(0, 0, img.width, img.height);
      }
      hasMaskRef.current = false;
      setHasMask(false);

      // If initial maskBlob was passed in, load it without triggering commit feedback loop
      if (maskBlob) {
        const maskImg = new Image();
        maskImg.onload = () => {
          loadMaskOntoCanvas(maskImg, false);
        };
        maskImg.src = URL.createObjectURL(maskBlob);
      } else {
        redraw();
        // Automatically isolate foreground object from table/background on arrival
        if (imageFile) {
          handleAutoSegment();
        }
      }
    };
    img.src = imageSrc;
  }, [imageSrc]); // Only depends on imageSrc to prevent endless reload loops

  // Re-render when tool or view settings change
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Accurate Canvas Mouse Coordinates Calculation
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Continuous Smooth Stroke Painting & Erasing
  const paintStroke = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    isAdd: boolean
  ) => {
    let mc = maskCanvasRef.current;
    if (!mc && canvasRef.current) {
      mc = document.createElement("canvas");
      mc.width = canvasRef.current.width;
      mc.height = canvasRef.current.height;
      maskCanvasRef.current = mc;
    }
    if (!mc) return;

    const ctx = mc.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize * 2;

    if (isAdd) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = "rgba(0,0,0,1)";
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p2.x, p2.y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (!hasMaskRef.current) {
      hasMaskRef.current = true;
      setHasMask(true);
    }
    redraw();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    cursorPosRef.current = coords;
    redraw();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    lastPointRef.current = coords;
    cursorPosRef.current = coords;
    paintStroke(coords, coords, activeTool === "brush");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    cursorPosRef.current = coords;

    if (isDrawing && lastPointRef.current) {
      paintStroke(lastPointRef.current, coords, activeTool === "brush");
      lastPointRef.current = coords;
    } else {
      redraw();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      commitMask();
    }
  };

  const handleMouseLeave = () => {
    cursorPosRef.current = null;
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      commitMask();
    }
    redraw();
  };

  // ✨ ONE-CLICK AI AUTO-SEGMENTATION
  const handleAutoSegment = async (): Promise<boolean> => {
    if (!imageFile) {
      alert("No image file loaded to auto-segment.");
      return false;
    }

    try {
      setIsSegmenting(true);
      const res = await segmentImage(imageFile);

      return await new Promise<boolean>((resolve) => {
        const maskImg = new Image();
        maskImg.crossOrigin = "anonymous";
        maskImg.onload = () => {
          loadMaskOntoCanvas(maskImg);
          setIsSegmenting(false);
          resolve(true);
        };
        maskImg.onerror = () => {
          setIsSegmenting(false);
          resolve(false);
        };

        if (res.mask_base64) {
          maskImg.src = res.mask_base64;
        } else if (res.mask_url) {
          maskImg.src = resolveUrl(res.mask_url);
        } else {
          setIsSegmenting(false);
          resolve(false);
        }
      });
    } catch (err: any) {
      console.error("AI Auto-segment failed:", err);
      setIsSegmenting(false);
      return false;
    }
  };

  // Safe Proceed Guard: Ensure object is isolated before 3D reconstruction
  const handleSafeProceed = async () => {
    if (isSegmenting) return;
    if (!hasMaskRef.current) {
      // If no mask painted, automatically isolate object from table
      const success = await handleAutoSegment();
      if (!success) {
        alert("Please draw or auto-segment the target object first so SAM 3D knows what to reconstruct.");
        return;
      }
    }
    onProceedToReconstruction();
  };

  // Invert Mask
  const invertMask = () => {
    const mc = maskCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, mc.width, mc.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      } else {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    hasMaskRef.current = true;
    setHasMask(true);
    commitMask();
    redraw();
  };

  // Fill All Frame as Foreground
  const fillAllMask = () => {
    let mc = maskCanvasRef.current;
    if (!mc && canvasRef.current) {
      mc = document.createElement("canvas");
      mc.width = canvasRef.current.width;
      mc.height = canvasRef.current.height;
      maskCanvasRef.current = mc;
    }
    if (!mc) return;

    const ctx = mc.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, mc.width, mc.height);

    hasMaskRef.current = true;
    setHasMask(true);
    commitMask();
    redraw();
  };

  // Clear / Reset Mask
  const resetMask = () => {
    const mc = maskCanvasRef.current;
    if (mc) {
      const ctx = mc.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, mc.width, mc.height);
    }
    hasMaskRef.current = false;
    setHasMask(false);
    commitMask();
    redraw();
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full animate-in fade-in zoom-in-95 duration-200">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121214]/90 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
        {/* Left: AI Auto-Segment + Primary Tools */}
        <div className="flex items-center gap-2">
          {/* ✨ ONE-CLICK AUTOMATIC BUTTON */}
          <button
            onClick={handleAutoSegment}
            disabled={isSegmenting}
            className="px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            title="Automatically detect and extract object foreground using AI"
          >
            {isSegmenting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            )}
            <span>{isSegmenting ? "AI Segmenting..." : "✨ AI Auto-Segment"}</span>
          </button>

          {/* Brush / Eraser Mode Toggle */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTool("brush")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeTool === "brush"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Brush</span>
            </button>

            <button
              onClick={() => setActiveTool("eraser")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeTool === "eraser"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>
          </div>
        </div>

        {/* Center: Brush Size Slider & Quick Presets */}
        <div className="flex items-center gap-3 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/5 text-xs text-zinc-300">
          <span className="font-semibold text-zinc-400">Brush Size:</span>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 accent-sky-400 cursor-pointer"
          />
          <span className="font-mono text-sky-400 font-bold w-12 text-right">{brushSize}px</span>

          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            {[15, 35, 70, 110].map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${brushSize === sz ? "bg-sky-400/20 text-sky-300 font-bold" : "text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Mode Toggle & Quick Canvas Operations */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setViewMode("overlay")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${viewMode === "overlay" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                }`}
              title="Overlay view (Original Image + Tinted Mask)"
            >
              Overlay
            </button>
            <button
              onClick={() => setViewMode("cutout")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${viewMode === "cutout" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                }`}
              title="Cutout view (Isolated foreground subject)"
            >
              Cutout
            </button>
            <button
              onClick={() => setViewMode("mask")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${viewMode === "mask" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                }`}
              title="Binary mask view (Black & White)"
            >
              Mask Only
            </button>
          </div>

          <button
            onClick={invertMask}
            disabled={!hasMask}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 disabled:opacity-40 transition-all cursor-pointer"
            title="Invert current mask"
          >
            Invert
          </button>

          <button
            onClick={fillAllMask}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 transition-all cursor-pointer"
            title="Fill entire frame as foreground"
          >
            Fill All
          </button>

          <button
            onClick={resetMask}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 bg-zinc-800/80 hover:bg-rose-500/10 border border-white/10 transition-all cursor-pointer"
            title="Clear Mask"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[480px] bg-[#09090b] rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center p-4 shadow-2xl select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseEnter={handleMouseEnter}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="max-w-full max-h-[580px] object-contain rounded-2xl shadow-2xl cursor-crosshair border border-white/5"
        />

        {/* Guidance Overlay */}
        <div className="absolute bottom-4 left-4 bg-zinc-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>
            {isSegmenting
              ? "Running AI segmentation model..."
              : activeTool === "brush"
                ? "🎨 Click & drag on the object to paint mask, or click ✨ AI Auto-Segment."
                : "🧹 Click & drag to erase mask regions."}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-4 right-4 bg-zinc-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-3 shadow-lg">
          <span>{imgDims.w} × {imgDims.h}px</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${hasMask
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-zinc-800 text-zinc-500"
              }`}
          >
            {hasMask ? "● Mask Ready" : "○ No Mask (Draw or Auto-Segment)"}
          </span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between bg-[#121214]/90 p-4 rounded-2xl border border-white/10 shadow-xl">
        <div className="text-xs text-zinc-400">
          Tip: Click <span className="text-sky-300 font-semibold">✨ AI Auto-Segment</span> for instant cutout, or paint manually with Brush.
        </div>
        <button
          onClick={handleSafeProceed}
          disabled={isSegmenting}
          className="px-6 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 text-slate-950 hover:brightness-110 shadow-lg shadow-sky-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          {isSegmenting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Isolating Object from Table...</span>
            </>
          ) : (
            <>
              <span>Proceed to 3D Reconstruction</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
