# Vis-Sam-3D Suite: Single-Image Interactive 3D Reconstruction Platform

Vis-Sam-3D Suite transforms any single 2D photograph into **photorealistic, watertight 3D models (`.glb`)** and **3D Gaussian Splats (`.ply`)** powered by **Meta AI SAM 3D Objects** with free **Kaggle Dual-GPU (Tesla T4 × 2)** acceleration.

---

## 🌟 Key Features

1. **3-Step Intuitive Workflow**:
   - **Step 1: Upload Image**: Drag & drop any object photo, select from daily object sample presets (16 reconstructed models), or capture via webcam.
   - **Step 2: Interactive Segmentation & Masking**:
     - 🟢 **Positive Point Prompts**: Click object features to guide foreground selection.
     - 🔴 **Negative Point Prompts**: Click background regions to exclude.
     - 🔲 **Bounding Box Prompt**: Drag an area box directly over object boundaries.
     - 🖌️ **Precision Brush / Eraser**: Manually refine intricate contours (leaves, handles, spokes).
     - ⚡ **Auto-Segment (SAM AI)**: 1-click automatic background removal and saliency isolation.
     - 👁️ **Visual Modes**: Live Tint Overlay, Cutout Transparency, and Inverted Masks.
   - **Step 3: Dual-Stage 3D Reconstruction**:
     - Sparse Structure Sampling ($25$ steps)
     - Sparse Latent Synthesis ($25$ steps)
     - Watertight Geometry Marching Cubes
     - 3D Gaussian Splats Spherical Harmonics Texture Baking
2. **Interactive Three.js 3D Studio & Viewer**:
   - **PBR Textured Mesh**: Photorealistic diffuse and surface color textures.
   - **Sculptural Clay / Matcap**: Clean geometric topology and reflection analysis.
   - **Wireframe Topology**: Polygon triangulation display.
   - **Dense Point Cloud**: Particle visualization.
   - **Studio Lighting**: Studio Neutral, Cyberpunk Neon, Golden Sunset.
   - **Turntable Orbit**: Auto-rotation, ground contact shadows, metric bounding box dimensions ($W \times H \times D$), and high-res snapshot exporter.
   - **1-Click Model Downloads**: Direct download of `.glb` (polygon mesh) and `.ply` (Gaussian Splats).
3. **Free Kaggle Dual-GPU Backend (`SAM_3D_Suite_Kaggle_GPU.ipynb`)**:
   - Zero local GPU required.
   - Runs on Kaggle's free dual Tesla T4 GPUs (30GB total VRAM).
   - Instant HTTPS Cloudflare Tunnel (`https://...trycloudflare.com`) connection.

---

## 📁 Project Structure

```
Vis-Sam-3D suite/
├── frontend/                     # Next.js 15 + Three.js Application
│   ├── public/
│   │   └── presets/              # 16 Daily Objects Pre-Reconstructed Models & Previews
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # 3-Step Dynamic Workflow Interface
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx    # Logo, GPU Status badge
│   │   │   │   └── ServerConfigModal.tsx # Kaggle Tunnel URL manager
│   │   │   ├── upload/
│   │   │   │   └── ImageUploader.tsx # File dropzone & daily objects gallery
│   │   │   ├── segment/
│   │   │   │   └── MaskEditor.tsx    # Interactive Canvas with Points, Box, Brush & SAM
│   │   │   ├── progress/
│   │   │   │   └── ReconstructionProgress.tsx # Animated 5-stage pipeline stepper
│   │   │   └── viewer/
│   │   │       ├── ThreeViewer.tsx   # Three.js 3D Studio (Texture, Clay, Wireframe)
│   │   │       └── SampleModelsModal.tsx # 16 Reconstructed Daily Objects Gallery
│   │   └── lib/
│   │       └── api.ts            # Client communicating with Kaggle SAM 3D endpoint
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── kaggle_notebook/              # Free GPU Deployment
│   ├── SAM_3D_Suite_Kaggle_GPU.ipynb # Plug-and-play Kaggle Notebook
│   └── sam3d_server.py           # Production FastAPI Server
│
├── backend/                      # Python FastAPI Local Bridge
│   └── server.py
│
├── presets/                      # 16 Daily Objects GLB Meshes and Side-by-Side Images
├── start.bat                     # Windows 1-Click Launcher
├── start.sh                      # Linux/macOS 1-Click Launcher
├── Setup_Guide.html              # Interactive Visual Setup Walkthrough
└── README.md
```

---

## 🚀 Quick Start Guide

### Step 1: Start Free GPU on Kaggle
1. Open [Kaggle](https://www.kaggle.com) and create a new Notebook.
2. In the right panel under **Notebook Options** -> **Accelerator**, select **GPU T4 x 2**.
3. Upload and open [`kaggle_notebook/SAM_3D_Suite_Kaggle_GPU.ipynb`](file:///a:/Cursor/Platoforms/DL%20Report/Vis-Sam-3D%20suite/kaggle_notebook/SAM_3D_Suite_Kaggle_GPU.ipynb).
4. Click **Run All**.
5. Once Cell 4/5 finishes, copy your public **Cloudflare Tunnel URL** (e.g., `https://...trycloudflare.com`).

### Step 2: Start Vis-Sam-3D Web Studio
- **Windows**: Double click `start.bat`
- **Linux/macOS**: Run `./start.sh`
- Or manually:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 3: Connect & Reconstruct
1. Click **Connect Kaggle GPU** in the top-right header and paste your Cloudflare Tunnel URL.
2. Drop in any photo of an object (or pick from the daily object presets).
3. Use the **Segment / Masking** canvas to refine the object outline with point clicks, box prompt, or click **✨ Auto-Segment**.
4. Click **🚀 Generate 3D Model**.
5. Orbit your high-fidelity, fully textured 3D model in the Three.js Studio and download `.glb` and `.ply`!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Returns dual GPU VRAM stats, model pipeline status, and active jobs |
| `POST` | `/api/segment` | Runs promptable segmentation (points, bbox, or auto-saliency) |
| `POST` | `/api/reconstruct` | Submits single image + mask for full 3D reconstruction |
| `GET` | `/api/jobs/{id}` | Polls real-time reconstruction progress and pipeline stage |
| `GET` | `/api/jobs/{id}/events` | Server-Sent Events (SSE) live progress stream |
| `GET` | `/api/models/{id}/model.glb` | Streams watertight polygonal 3D model |
| `GET` | `/api/models/{id}/model.ply` | Streams 3D Gaussian Splats with view-dependent appearance |
| `GET` | `/api/models/{id}/preview.png` | 4-angle shaded preview render |
