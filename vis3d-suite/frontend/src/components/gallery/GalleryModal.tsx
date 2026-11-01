"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  Search,
  Box,
  Images,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  RotateCw,
  Sparkles,
  Info,
  Check,
  ExternalLink,
  Layers,
  ZoomIn,
  SlidersHorizontal,
} from "lucide-react";
import ThreeViewer from "@/components/viewer/ThreeViewer";
import { GALLERY_ITEMS, GalleryItem } from "@/lib/galleryData";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModelForStudio?: (glbUrl: string, name: string, previewUrl?: string) => void;
}

const HIGH_LEVEL_CATEGORIES = [
  "All",
  "Monuments & Heritage",
  "Architecture & Buildings",
  "Computers & Hardware",
  "Vehicles & Transport",
  "Isometric Rooms",
  "Living Room Furniture",
  "Home Decor & Botanical",
  "Kids & Storage",
  "Realistic Benchmarks",
  "Living Room & Furniture",
  "Decor & Lighting",
  "Characters & Art",
  "Cultural Artifacts",
];

export default function GalleryModal({
  isOpen,
  onClose,
  onSelectModelForStudio,
}: GalleryModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [leftTab, setLeftTab] = useState<"image" | "turntable">("image");
  const [imageFit, setImageFit] = useState<"contain" | "cover">("contain");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Reset tab and fit mode when item changes
  useEffect(() => {
    setLeftTab("image");
    setImageFit("contain");
    setIsLightboxOpen(false);
  }, [selectedItemId]);

  // Filtered items based on search and category
  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((item) => {
      // Category match
      const catLower = (item.category + " " + item.collection).toLowerCase();
      let matchCat = activeCategory === "All";
      if (!matchCat) {
        if (activeCategory === "Living Room & Furniture") {
          matchCat = ["living", "furniture", "chair", "desk"].some((k) => catLower.includes(k));
        } else if (activeCategory === "Decor & Lighting") {
          matchCat = ["decor", "botanical", "lighting", "lamp", "vase", "clock", "dining"].some((k) => catLower.includes(k));
        } else if (activeCategory === "Realistic Benchmarks") {
          matchCat = catLower.includes("realistic");
        } else if (activeCategory === "Characters & Art") {
          matchCat = ["character", "robot", "art", "sport", "fencer", "collectibles"].some((k) => catLower.includes(k));
        } else {
          matchCat = catLower.includes(activeCategory.toLowerCase());
        }
      }

      // Search match
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.collection.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  const selectedItem = useMemo(() => {
    return GALLERY_ITEMS.find((it) => it.id === selectedItemId) || null;
  }, [selectedItemId]);

  const currentIndex = useMemo(() => {
    if (!selectedItem) return -1;
    return filteredItems.findIndex((it) => it.id === selectedItem.id);
  }, [selectedItem, filteredItems]);

  const handlePrev = useCallback(() => {
    if (filteredItems.length === 0) return;
    if (currentIndex <= 0) {
      setSelectedItemId(filteredItems[filteredItems.length - 1].id);
    } else {
      setSelectedItemId(filteredItems[currentIndex - 1].id);
    }
  }, [currentIndex, filteredItems]);

  const handleNext = useCallback(() => {
    if (filteredItems.length === 0) return;
    if (currentIndex >= filteredItems.length - 1) {
      setSelectedItemId(filteredItems[0].id);
    } else {
      setSelectedItemId(filteredItems[currentIndex + 1].id);
    }
  }, [currentIndex, filteredItems]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else if (selectedItemId) {
          setSelectedItemId(null);
        } else {
          onClose();
        }
      } else if (selectedItemId) {
        if (e.key === "ArrowLeft") {
          handlePrev();
        } else if (e.key === "ArrowRight") {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedItemId, isLightboxOpen, handlePrev, handleNext, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/95 backdrop-blur-2xl flex flex-col overflow-hidden text-zinc-100 select-none animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. TOP HEADER (Shared across views) */}
      {/* ============================================================== */}
      <header className="h-16 px-6 border-b border-white/10 bg-zinc-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {selectedItem ? (
            <button
              onClick={() => setSelectedItemId(null)}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Gallery</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    3D Reconstruction Gallery & Exhibition
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 font-mono text-[11px] font-bold">
                    {GALLERY_ITEMS.length} Models
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Interactive multi-angle 3D models with original input/source photographs
                </p>
              </div>
            </div>
          )}

          {/* If viewing single item: title and navigation controls in header */}
          {selectedItem && (
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Previous Model (Left Arrow Key)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-zinc-400 px-1">
                  {currentIndex + 1} / {filteredItems.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Next Model (Right Arrow Key)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {selectedItem.name}
                </h3>
                <span className="text-[10px] text-sky-400 font-medium tracking-wide uppercase">
                  {selectedItem.category} • {selectedItem.collection}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {selectedItem && onSelectModelForStudio && (
            <button
              onClick={() => {
                onSelectModelForStudio(
                  selectedItem.modelUrl,
                  selectedItem.name,
                  selectedItem.imageUrl
                );
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
              title="Open in Main 3D Studio"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Open in 3D Studio</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Gallery (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. BODY CONTENT: GRID VIEW OR SIDE-BY-SIDE SPLIT VIEW */}
      {/* ============================================================== */}
      {!selectedItem ? (
        /* ------------------------------------------------------------- */
        /* GALLERY GRID VIEW                                             */
        /* ------------------------------------------------------------- */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Category Filter Sub-Header */}
          <div className="p-5 border-b border-white/10 bg-zinc-900/40 flex flex-col gap-3.5 shrink-0">
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 71 models by name, category, or tags..."
                  placeholder={`Search across ${GALLERY_ITEMS.length} models by name, category, or tags...`}
                  className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Summary count */}
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                Showing {filteredItems.length} of {GALLERY_ITEMS.length} models
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {HIGH_LEVEL_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-bold"
                        : "bg-zinc-900/90 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <Images className="w-10 h-10 opacity-40" />
                <p className="text-sm">No models found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="group bg-zinc-900/70 hover:bg-zinc-900/95 border border-white/10 hover:border-sky-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/10 flex flex-col relative"
                  >
                    {/* Source / Input Image Container */}
                    <div className="w-full h-48 bg-black/60 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-300 font-semibold border border-white/10 truncate max-w-[150px]">
                          {item.category}
                        </span>
                        <span className="bg-sky-500/20 border border-sky-400/40 text-sky-300 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                          3D Solid
                        </span>
                      </div>

                      {/* Hover Overlay Prompt */}
                      <div className="absolute inset-0 bg-sky-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-xl">
                          <Box className="w-3.5 h-3.5 text-sky-600" />
                          Inspect 3D Model
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Stats */}
                    <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                          {item.collection}
                        </p>
                      </div>

                      {/* Metrics bar */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>🔺 {item.vertices.toLocaleString()} verts</span>
                        <span>🔷 {item.faces.toLocaleString()} faces</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* SIDE-BY-SIDE SPLIT VIEW: SOURCE IMAGE LEFT, 3D MODEL RIGHT    */
        /* ------------------------------------------------------------- */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6">
          {/* ========================================================== */}
          {/* LEFT SIDE: SOURCE / INPUT IMAGE & DETAILED METADATA        */}
          {/* ========================================================== */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* Source Image Card */}
            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Header with image toggle & zoom */}
              <div className="px-4 py-3 border-b border-white/10 bg-zinc-950/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Source / Input Visual
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Turntable toggle if available */}
                  {selectedItem.turntableUrl && (
                    <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-white/10 text-[11px] font-semibold">
                      <button
                        onClick={() => setLeftTab("image")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          leftTab === "image"
                            ? "bg-sky-500 text-slate-950 font-bold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Input Image
                      </button>
                      <button
                        onClick={() => setLeftTab("turntable")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          leftTab === "turntable"
                            ? "bg-sky-500 text-slate-950 font-bold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        360° GIF
                      </button>
                    </div>
                  )}

                  {/* Fit Mode Toggle */}
                  <button
                    onClick={() => setImageFit(imageFit === "contain" ? "cover" : "contain")}
                    className="p-1.5 px-2.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 text-[11px] font-semibold"
                    title={imageFit === "contain" ? "Switch to Fill Frame" : "Switch to Fit Whole Image (No Clip)"}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                    <span>{imageFit === "contain" ? "Fit: Whole Image" : "Fit: Fill Frame"}</span>
                  </button>

                  {/* High-res Lightbox Zoom */}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-1.5 px-2.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1 text-[11px] font-semibold"
                    title="Zoom Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Zoom</span>
                  </button>
                </div>
              </div>

              {/* Image Frame - 100% Fit, Zero Clipping */}
              <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[500px] bg-black/95 flex items-center justify-center p-3 overflow-hidden">
                {leftTab === "image" ? (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className={`w-full h-full select-none ${
                      imageFit === "contain" ? "object-contain" : "object-cover"
                    } cursor-pointer hover:opacity-95 transition-all`}
                    onClick={() => setIsLightboxOpen(true)}
                  />
                ) : (
                  <img
                    src={selectedItem.turntableUrl || selectedItem.imageUrl}
                    alt={`${selectedItem.name} 360 Turntable`}
                    className="w-full h-full object-contain select-none"
                  />
                )}

                {/* Source origin badge */}
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-zinc-300 pointer-events-none">
                  📷 {leftTab === "image" ? "Primary Input Photograph" : "360° Turntable Orbit"}
                </div>
              </div>
            </div>

            {/* Specifications & Overview Details */}
            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {selectedItem.name}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Watertight 3D
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              {/* Technical Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Vertices</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedItem.vertices.toLocaleString()}
                  </span>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Triangles / Faces</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedItem.faces.toLocaleString()}
                  </span>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Mesh Format</span>
                  <span className="text-sm font-bold text-sky-400 font-mono mt-0.5">
                    glTF 2.0 (.glb)
                  </span>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Splat Spline</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedItem.plyUrl ? "3D Splat (.ply)" : "Standard Mesh"}
                  </span>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Category</span>
                  <span className="text-xs font-semibold text-zinc-300 truncate mt-1">
                    {selectedItem.category}
                  </span>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Origin Collection</span>
                  <span className="text-xs font-semibold text-zinc-300 truncate mt-1">
                    {selectedItem.collection}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={selectedItem.imageUrl}
                  download={`${selectedItem.name}_source.png`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-2 border border-white/10 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Download Source Image</span>
                </a>

                {onSelectModelForStudio && (
                  <button
                    onClick={() => {
                      onSelectModelForStudio(
                        selectedItem.modelUrl,
                        selectedItem.name,
                        selectedItem.imageUrl
                      );
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-200 flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Box className="w-3.5 h-3.5 text-sky-600" />
                    <span>Open in 3D Studio Studio</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* RIGHT SIDE: INTERACTIVE 3D MODEL VIEWPORT                  */}
          {/* ========================================================== */}
          <div className="w-full lg:w-1/2 h-[550px] lg:h-full flex flex-col">
            <ThreeViewer
              key={selectedItem.id}
              modelUrl={selectedItem.modelUrl}
              plyUrl={selectedItem.plyUrl}
              modelName={selectedItem.name}
              vertices={selectedItem.vertices}
              faces={selectedItem.faces}
              className="h-full min-h-[550px]"
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. LIGHTBOX IMAGE ZOOM MODAL                                   */}
      {/* ============================================================== */}
      {isLightboxOpen && selectedItem && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-150"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={selectedItem.imageUrl}
            alt={selectedItem.name}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs text-zinc-400 font-mono mt-3">
            {selectedItem.name} • Original Input Image
          </span>
        </div>
      )}
    </div>
  );
}

