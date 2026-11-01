"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import ServerConfigModal from "@/components/common/ServerConfigModal";
import ImageUploader from "@/components/upload/ImageUploader";
import MaskEditor from "@/components/segment/MaskEditor";
import ReconstructionProgress from "@/components/progress/ReconstructionProgress";
import ThreeViewer from "@/components/viewer/ThreeViewer";
import SampleModelsModal from "@/components/viewer/SampleModelsModal";
import GalleryModal from "@/components/gallery/GalleryModal";
import Dither from "@/components/ui/Dither";
import WebThreads from "@/components/ui/WebThreads";
import {
  checkServerHealth,
  startReconstruction,
  getJobStatus,
  resolveUrl,
  ReconstructionJob,
} from "@/lib/api";
import { Upload, Scissors, Box, Sparkles, RefreshCw, ArrowLeft } from "lucide-react";

type AppStep = "upload" | "segment" | "reconstruct" | "viewer";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>("upload");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // Workflow State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [objectName, setObjectName] = useState<string>("daily_object");
  const [maskBlob, setMaskBlob] = useState<Blob | null>(null);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  // Reconstruction State
  const [activeJob, setActiveJob] = useState<ReconstructionJob | null>(null);
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(null);
  const [activePlyUrl, setActivePlyUrl] = useState<string | null>(null);
  const [modelMetrics, setModelMetrics] = useState<{ verts?: number; faces?: number }>({});

  // Check backend server connection on startup
  useEffect(() => {
    checkServerHealth()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));
  }, []);

  // Handle Image Upload
  const handleImageSelected = (file: File, src: string, name: string) => {
    setSelectedFile(file);
    setImageSrc(src);
    setObjectName(name);
    setMaskBlob(null);
    setMaskUrl(null);
    setCurrentStep("segment");
  };

  // Handle Preset Selection
  const handleSelectPreset = (glbUrl: string, name: string, previewImg?: string) => {
    setActiveModelUrl(glbUrl);
    setActivePlyUrl(glbUrl.replace(".glb", "_splat.ply"));
    setObjectName(name);
    setCurrentStep("viewer");
  };

  // Launch Reconstruction
  const handleProceedToReconstruct = async () => {
    if (!selectedFile) return;
    setCurrentStep("reconstruct");

    try {
      const res = await startReconstruction(selectedFile, maskBlob, objectName, 25);
      const jobId = res.job_id;

      // Poll job progress
      let consecutiveErrors = 0;
      const pollInterval = setInterval(async () => {
        try {
          const job = await getJobStatus(jobId);
          consecutiveErrors = 0;
          setActiveJob(job);

          if (job.status === "completed") {
            clearInterval(pollInterval);
            if (job.model_url) {
              setActiveModelUrl(resolveUrl(job.model_url));
            }
            if (job.ply_url) {
              setActivePlyUrl(resolveUrl(job.ply_url));
            }
            setModelMetrics({ verts: job.vertices, faces: job.faces });
            setCurrentStep("viewer");
          } else if (job.status === "failed") {
            clearInterval(pollInterval);
            alert(`Reconstruction notice: ${job.error || "Job was interrupted or failed"}`);
            setCurrentStep("segment");
          }
        } catch (err: any) {
          consecutiveErrors++;
          console.warn(`Polling attempt failed (${consecutiveErrors}/10):`, err?.message || err);
          if (consecutiveErrors >= 10) {
            clearInterval(pollInterval);
            alert("Could not reach backend reconstruction status. Please check your connection or restart the job.");
            setCurrentStep("segment");
          }
        }
      }, 1500);
    } catch (err: any) {
      alert(`Could not start reconstruction: ${err.message}`);
      setCurrentStep("segment");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30 overflow-x-hidden">
      {/* Dynamic Background Shader: WebThreads during 3D Reconstruction, Dither during other steps, disabled in 3D viewer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {currentStep === "reconstruct" ? (
          <WebThreads
            colors={["#0047FF", "#FF9FFC"]}
            coreColor="#003bb8"
            backgroundColor="transparent"
            threadCount={6}
            spread={0.12}
            taper={0.6}
            speed={0.12}
            frequency={7.0}
            thickness={0.30}
            brightness={0.10}
            opacity={0.22}
            glow={0.005}
            falloff={1.6}
            fade={0.4}
            grain={0}
            dpr={3}
            pulses={0}
            pulseOnClick={false}
            mouseInteraction={true}
            mouseStrength={0.2}
            intro={true}
          />
        ) : currentStep === "viewer" ? null : (
          <Dither
            waveColor="#38bdf8"
            backgroundColor="#09090b"
            ditherMode="bayer"
            colorNum={4}
            pixelSize={2}
            waveSpeed={0.025}
            waveFrequency={2.2}
            waveAmplitude={0.23}
            contrast={0.9}
            brightness={-0.14}
            scale={1.2}
            mouseEffect="ripple"
            mouseRadius={0.35}
            mouseStrength={0.55}
            trail={0.35}
            clickRipple={true}
            className="opacity-50"
          />
        )}
        {/* Subtle Ambient Vignette (disabled in 3D viewer) */}
        {currentStep !== "viewer" && (
          <div className="absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_50%_50%,transparent_35%,rgba(9,9,11,0.75)_100%)]" />
        )}
      </div>

      {/* Header */}
      <div className="relative z-20">
        <Header
          onOpenServerConfig={() => setIsServerModalOpen(true)}
          onOpenGallery={() => setIsGalleryOpen(true)}
          isConnected={isConnected}
        />
      </div>

      {/* Main Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between bg-zinc-900/60 p-2 rounded-2xl border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2">
            {currentStep !== "upload" && (
              <button
                onClick={() => {
                  if (currentStep === "viewer" || currentStep === "reconstruct") setCurrentStep("segment");
                  else if (currentStep === "segment") setCurrentStep("upload");
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setCurrentStep("upload")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                currentStep === "upload"
                  ? "bg-white text-zinc-950 shadow-lg shadow-white/20 font-black"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              1. Upload Image
            </button>

            <button
              onClick={() => imageSrc && setCurrentStep("segment")}
              disabled={!imageSrc}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                currentStep === "segment"
                  ? "bg-white text-zinc-950 shadow-lg shadow-white/20 font-black"
                  : !imageSrc
                  ? "opacity-30 cursor-not-allowed text-zinc-600"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              2. Segment / Masking
            </button>

            <button
              onClick={() => activeModelUrl && setCurrentStep("viewer")}
              disabled={!activeModelUrl}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                currentStep === "viewer"
                  ? "bg-white text-zinc-950 shadow-lg shadow-white/20 font-black"
                  : !activeModelUrl
                  ? "opacity-30 cursor-not-allowed text-zinc-600"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              3. 3D Studio Viewer
            </button>
          </div>

          <div className="flex items-center gap-3 pr-2">
            <span className="text-xs text-zinc-400 font-mono">
              {objectName ? `Item: ${objectName}` : ""}
            </span>
            {currentStep === "viewer" && (
              <button
                onClick={() => setCurrentStep("upload")}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                New Object
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Workflow Views */}
        {currentStep === "upload" && (
          <ImageUploader
            onImageSelected={handleImageSelected}
            onSelectPreset={handleSelectPreset}
            onProceedToSegmentation={() => setCurrentStep("segment")}
          />
        )}

        {currentStep === "segment" && (
          <MaskEditor
            imageFile={selectedFile}
            imageSrc={imageSrc}
            maskBlob={maskBlob}
            onMaskChange={(b, url) => {
              setMaskBlob(b);
              setMaskUrl(url);
            }}
            onProceedToReconstruction={handleProceedToReconstruct}
          />
        )}

        {currentStep === "reconstruct" && (
          <ReconstructionProgress
            job={activeJob}
            imageSrc={imageSrc}
            objectName={objectName}
            onCancel={() => setCurrentStep("segment")}
          />
        )}

        {currentStep === "viewer" && (
          <ThreeViewer
            modelUrl={activeModelUrl}
            plyUrl={activePlyUrl}
            modelName={objectName}
            vertices={modelMetrics.verts}
            faces={modelMetrics.faces}
            onReset={() => setCurrentStep("upload")}
          />
        )}
      </main>

      {/* Modals */}
      <ServerConfigModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onConnected={() => setIsConnected(true)}
      />

      <SampleModelsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectModel={handleSelectPreset}
      />

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectModelForStudio={(glbUrl, name, previewImg) => {
          handleSelectPreset(glbUrl, name, previewImg);
          setIsGalleryOpen(false);
        }}
      />
    </div>
  );
}
