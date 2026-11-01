# 🌐 TerraSight 3D: High-Fidelity 3D Reconstruction, Benchmark & Spatial Analytics Platform

[![Next.js](https://img.shields.io/badge/Next.js-14%20%7C%2015-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-blue?style=flat-square&logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

An end-to-end photogrammetry, computer vision benchmark, and neural 3D reconstruction platform integrating:
1. **TerraSight 3D Benchmark Platform**: Quantitative & visual evaluation of foundation vision models (**VGGT-Ω**, **Depth Anything 3**, **DUSt3R**, and **COLMAP**) evaluated against high-accuracy LiDAR/DSLR ground truth scans (ETH3D and TerraSky3D).
2. **Vis3D Suite**: An interactive, production-ready single-image 3D reconstruction platform powered by **Meta AI SAM 3D Objects** with free **Kaggle Dual-GPU (Tesla T4 × 2)** acceleration.

---

## 🏛️ Platform Highlights

### 1. TerraSight 3D Benchmark & Inspection Platform (`/`)
* **Multi-Model Evaluation**: Side-by-side comparison across Ground Truth, VGGT-Ω, DUSt3R, Depth Anything 3 (DA3), and COLMAP.
* **Sparsity Degradation Analysis (`/sparsity-evaluation`)**: Stress-tests reconstruction resilience across image sparsity tiers ($100\%$, $70\%$, $50\%$, and $25\%$).
* **Interactive 3D Spatial Lab (`/spatial-inspector`)**:
  * **Split Wipe Tool**: Real-time interactive curtain wipe comparing reconstructed geometry against ground truth.
  * **3D Calibrated Ruler**: Euclidean distance measurement across reconstructed point clouds in metric space.
  * **Volumetric Slicer**: Planar cross-sectioning to inspect internal geometry, structural hollows, and wall thickness.
  * **Cinematic Drone Flight**: Automated orbital inspection paths around target structures.
  * **Depth & Error Heatmaps**: Turbo and inferno false-color metric depth and residual error projections.

### 2. Vis3D Reconstruction Suite (`/vis3d` & `vis3d-suite/`)
* **3-Step Interactive Workflow**:
  * **Step 1: Intake & Preset Portfolio**: Drag-and-drop 2D photos, webcam capture, or select from 26 verified pre-reconstructed daily object presets.
  * **Step 2: Interactive SAM Segmentation**: Foreground guidance using positive/negative point prompts, bounding boxes, precision brush, or automated SAM saliency isolation.
  * **Step 3: Neural 3D Reconstruction**: Dual-stage sparse structure sampling and latent synthesis generating manifold, watertight meshes (`.glb`) and 3D Gaussian Splats (`.ply`).
* **Interactive Three.js Studio**:
  * PBR textured meshes, sculptural clay matcap, dense point clouds, and polygon wireframe topology.
  * Studio lighting presets: Studio Neutral, Golden Sunset, Cyberpunk Neon.
  * Metric bounding boxes, turntable auto-rotation, high-resolution PNG snapshot exporter, and direct downloads.
* **Free Kaggle Dual Tesla T4 Backend**:
  * Free dual GPU execution (30 GB total VRAM) with zero local GPU hardware requirements.
  * Cloudflare Tunnel streaming for instant web connectivity.

---

## 📁 Repository Structure

```
TerraSight_3D/
├── src/                               # TerraSight Benchmark Platform (Next.js 14)
│   ├── app/
│   │   ├── page.tsx                   # Main Model Comparison Benchmark
│   │   ├── sparsity-evaluation/       # Sparsity Degradation Stress Tests
│   │   ├── spatial-inspector/         # 3D Spatial Lab (Wipe, Ruler, Slicer, Drone)
│   │   ├── vis3d/                     # Vis3D Reconstruction Suite Gateway
│   │   └── globals.css
│   ├── components/                    # Three.js PointCloudViewer, Canvas & Controls
│   ├── lib/                           # Benchmark telemetry, manifests & datasets
│   └── types/                         # TypeScript interfaces & definitions
│
├── public/                            # Benchmark Datasets & Pre-computed Models
│   └── data/
│       ├── scenes/                    # Verified ground truth & reconstructed .ply models
│       ├── sparsity/                  # Sparsity evaluation models (100%, 70%, 50%, 25%)
│       ├── images/                    # Source reference photographs
│       ├── depth_maps/                # Metric depth visualizations
│       ├── benchmark_manifest.json    # Quantitative scene metrics
│       └── sparsity_manifest.json     # Sparsity degradation metrics
│
├── vis3d-suite/                       # Vis3D Single-Image 3D Reconstruction Platform
│   ├── frontend/                      # Next.js 15 + Three.js Reconstruction Studio
│   │   ├── src/                       # MaskEditor, ImageUploader, ThreeViewer, Gallery
│   │   ├── public/                    # 26 Pre-Reconstructed Object Presets & Models
│   │   └── package.json
│   ├── kaggle_notebook/               # Free Kaggle Dual-GPU Server Notebook
│   │   └── SAM_3D_Suite_Kaggle_GPU.ipynb
│   ├── Setup_Guide.html               # Offline interactive visual setup guide
│   ├── start.bat                      # Windows 1-Click launcher
│   ├── start.sh                       # Linux / macOS 1-Click launcher
│   └── README.md                      # Vis3D technical documentation
│
├── package.json                       # Root monorepo workspace configuration
├── tailwind.config.ts
├── tsconfig.json
└── README.md                          # Platform documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.18 or higher recommended)
* `npm` or `yarn` / `pnpm`

### 1. Launching TerraSight 3D Benchmark Platform

```bash
# Clone the repository
git clone https://github.com/Abhishek-Hardaha/TerraSight_3D.git
cd TerraSight_3D

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the benchmark platform.

---

### 2. Launching Vis3D Reconstruction Suite

To run the Vis3D single-image reconstruction studio:

```bash
# From the repository root
npm run dev:vis3d

# Alternatively, launch directly from the vis3d-suite directory
cd vis3d-suite/frontend
npm install
npm run dev -p 3000
```

#### Running the Free Kaggle GPU Backend:
1. Open [Kaggle](https://www.kaggle.com/) and create a new Notebook.
2. Select **Settings -> Accelerator -> GPU T4 x 2**.
3. Import `vis3d-suite/kaggle_notebook/SAM_3D_Suite_Kaggle_GPU.ipynb`.
4. Run the notebook cells to start the FastAPI server and Cloudflare Tunnel.
5. In the Vis3D web interface, click **Server Settings** and enter your generated tunnel URL (e.g., `https://...trycloudflare.com`).

---

## 📊 Benchmark Datasets & Metrics

TerraSight evaluates 3D scene reconstruction performance across standardized datasets:
* **ETH3D Benchmark**: High-precision DSLR imagery calibrated against millimeter-accurate terrestrial FARO LiDAR scans (*Kicker, Pipes, Playground, Relief, Terrace*).
* **TerraSky3D Benchmark**: Aerial drone photogrammetry and urban structure scanning.

### Quantitative Metrics Tracked:
* **Chamfer Distance (CD $\downarrow$)**: Surface-to-surface alignment accuracy in centimeters.
* **F-Score @ 5mm / 10mm ($\uparrow$)**: Precision and recall harmonic mean of reconstructed point density.
* **Structural Completeness ($\%$)**: Volume coverage relative to ground truth scans.
* **Latency & VRAM Consumption**: Time-to-mesh and memory footprint across GPU architectures.

---

## 📄 License

This project is licensed under the MIT License.
