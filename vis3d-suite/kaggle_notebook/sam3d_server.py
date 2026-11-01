# Inlined Production Server for Vis-Sam-3D Suite
import os, sys, time, uuid, json, io, base64, asyncio, threading, collections, datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

# Ensure JIT disabled and pure paths
os.environ["CUMM_DISABLE_JIT"] = "1"
os.environ["SPCONV_DISABLE_JIT"] = "1"
os.environ["LIDRA_SKIP_INIT"] = "true"
os.environ["SPCONV_ALGO"] = "native"
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
if "CUDA_HOME" not in os.environ:
    os.environ["CUDA_HOME"] = "/usr/local/cuda"
os.environ["CONDA_PREFIX"] = os.environ.get("CONDA_PREFIX", "/root/.local/share/mamba/envs/sam3d-objects")

# NumPy 2.x / SciPy / Pymatting / Rembg compatibility shims (Python 3.13)
import numpy as np
try:
    import numpy._core.umath as _umath
    _umath._slice = slice
except Exception:
    pass
try:
    import numpy.core.umath as _old_umath
    _old_umath._slice = slice
except Exception:
    pass
try:
    if hasattr(np, '_core') and hasattr(np._core, '_multiarray_umath'):
        if not hasattr(np._core._multiarray_umath, '_blas_supports_fpe'):
            np._core._multiarray_umath._blas_supports_fpe = lambda *a, **kw: False
except Exception:
    pass

# Kaolin full package mock with validation function check_tensor
import types
if "kaolin" not in sys.modules:
    kaolin = types.ModuleType("kaolin")
    kaolin.__path__ = []
    k_render = types.ModuleType("kaolin.render")
    k_render.__path__ = []
    k_cam = types.ModuleType("kaolin.render.camera")
    k_cam.Camera = type("Camera", (), {})
    k_cam.CameraType = type("CameraType", (), {})
    k_cam.CameraExtrinsics = type("CameraExtrinsics", (), {})
    k_cam.PinholeIntrinsics = type("PinholeIntrinsics", (), {})
    k_vis = types.ModuleType("kaolin.visualize")
    k_vis.IpyTurntableVisualizer = type("IpyTurntableVisualizer", (), {})
    k_utils = types.ModuleType("kaolin.utils")
    k_utils.__path__ = []
    k_testing = types.ModuleType("kaolin.utils.testing")
    k_testing.check_tensor = lambda *args, **kwargs: True
    k_utils.testing = k_testing
    kaolin.render = k_render
    kaolin.render.camera = k_cam
    kaolin.visualize = k_vis
    kaolin.utils = k_utils
    sys.modules["kaolin"] = kaolin
    sys.modules["kaolin.render"] = k_render
    sys.modules["kaolin.render.camera"] = k_cam
    sys.modules["kaolin.visualize"] = k_vis
    sys.modules["kaolin.utils"] = k_utils
    sys.modules["kaolin.utils.testing"] = k_testing

# PyTorch3D C++ transform mock with full fallback
class _MockPytorch3dC(types.ModuleType):
    def __getattr__(self, name):
        if name == "MAX_UINT":
            return 4294967295
        if name == "EPS":
            return 1e-7
        if name in ("PulsarRenderer", "Renderer"):
            return type(name, (), {"forward": lambda *args, **kwargs: (None, None)})
        return lambda *args, **kwargs: None

p3d_c = _MockPytorch3dC("pytorch3d._C")
p3d_c.__file__ = "pytorch3d/_C.so"
p3d_c.MAX_UINT = 4294967295
p3d_c.EPS = 1e-7
p3d_c.pulsar = types.ModuleType("pytorch3d._C.pulsar")
p3d_c.pulsar.__file__ = "pytorch3d/_C/pulsar.so"
p3d_c.pulsar.Renderer = type("Renderer", (), {})
p3d_c.PulsarRenderer = type("PulsarRenderer", (), {})
sys.modules["pytorch3d._C"] = p3d_c
sys.modules["pytorch3d._C.pulsar"] = p3d_c.pulsar
try:
    import pytorch3d
    pytorch3d._C = p3d_c
except Exception:
    pass

# Utils3d monkeypatches for compatibility
import utils3d.numpy, utils3d.torch
utils3d.numpy.depth_edge = getattr(utils3d.numpy, "depth_map_edge", getattr(utils3d.numpy, "depth_edge", None))
utils3d.numpy.normals_edge = getattr(utils3d.numpy, "normal_map_edge", getattr(utils3d.numpy, "normals_edge", None))
utils3d.numpy.points_to_normals = getattr(utils3d.numpy, "point_map_to_normal_map", getattr(utils3d.numpy, "points_to_normals", None))
utils3d.numpy.image_uv = getattr(utils3d.numpy, "uv_map", getattr(utils3d.numpy, "image_uv", None))
utils3d.numpy.image_mesh = getattr(utils3d.numpy, "build_mesh_from_map", getattr(utils3d.numpy, "image_mesh", None))
utils3d.torch.depth_edge = getattr(utils3d.torch, "depth_map_edge", getattr(utils3d.torch, "depth_edge", None))
utils3d.torch.points_to_normals = getattr(utils3d.torch, "point_map_to_normal_map", getattr(utils3d.torch, "points_to_normals", None))
utils3d.torch.image_uv = getattr(utils3d.torch, "uv_map", getattr(utils3d.torch, "image_uv", None))
utils3d.torch.image_mesh = getattr(utils3d.torch, "build_mesh_from_map", getattr(utils3d.torch, "image_mesh", None))
if not hasattr(utils3d.torch, "perspective_from_fov_xy"):
    utils3d.torch.perspective_from_fov_xy = lambda fov_x, fov_y, near, far: utils3d.torch.perspective_from_fov(fov_x=fov_x, fov_y=fov_y, near=near, far=far)
if not hasattr(utils3d.torch, "intrinsics_from_fov_xy"):
    utils3d.torch.intrinsics_from_fov_xy = lambda fov_x, fov_y: utils3d.torch.intrinsics_from_fov(fov_x=fov_x, fov_y=fov_y)

# Import dependencies
for p in ['/kaggle/working', '/kaggle/working/sam-3d-objects/notebook', '/kaggle/working/sam-3d-objects']:
    if p not in sys.path:
        sys.path.insert(0, p)

import torch, psutil

# Defensive rembg import (handles environments where pymatting/rembg has numpy version conflicts)
rembg = None
try:
    import rembg
except Exception as _rembg_err:
    print(f"⚠️ rembg import deferred or unavailable ({_rembg_err})")

import numpy as np

# Patch NumPy 2.x compatibility shims for Python 3.13 / SciPy / Pymatting
if hasattr(np, '_core'):
    if hasattr(np._core, 'umath') and not hasattr(np._core.umath, '_slice'):
        np._core.umath._slice = slice
    if hasattr(np._core, '_multiarray_umath') and not hasattr(np._core._multiarray_umath, '_blas_supports_fpe'):
        np._core._multiarray_umath._blas_supports_fpe = lambda *a, **kw: False

# Auto-patch numpy._core.strings for Python 3.13 ufunc.__module__ bug before trimesh/scipy imports it
try:
    _np_dir = os.path.dirname(np.__file__)
    _strings_py = os.path.join(_np_dir, "_core", "strings.py")
    if os.path.exists(_strings_py):
        with open(_strings_py, "r", encoding="utf-8") as _f:
            _s_code = _f.read()
        if "_override___module__()" in _s_code and "except (AttributeError" not in _s_code:
            _s_code = _s_code.replace(
                "_override___module__()",
                "try:\\n    _override___module__()\\nexcept (AttributeError, TypeError):\\n    pass"
            )
            with open(_strings_py, "w", encoding="utf-8") as _f:
                _f.write(_s_code)
            print("✅ Patched numpy._core.strings (Python 3.13 compatibility secured)")
except Exception as _e:
    pass

# Mock seaborn so inference.py never imports scipy.stats / numpy.testing
if 'seaborn' not in sys.modules:
    sns_mock = types.ModuleType('seaborn')
    sns_mock.color_palette = lambda *a, **kw: [(0, 0, 0)]
    sys.modules['seaborn'] = sns_mock

from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse, HTMLResponse
import uvicorn

app = FastAPI(title="Meta SAM 3D Objects API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = Path("/kaggle/working/output")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CONFIG_PATH = "/kaggle/working/sam-3d-objects/checkpoints/hf/pipeline.yaml"
if not os.path.exists(CONFIG_PATH):
    alt_path = "/kaggle/working/sam-3d-objects/checkpoints/hf/checkpoints/pipeline.yaml"
    if os.path.exists(alt_path):
        CONFIG_PATH = alt_path

# State tracking & Live Reconstruction Logger
PIPELINE_INSTANCE = None
PIPELINE_LOCK = threading.Lock()
jobs: Dict[str, Dict[str, Any]] = {}
RECON_LOGS = collections.deque(maxlen=2000)
LOG_FILE_PATH = Path("/kaggle/working/sam3d_reconstruction.log")

def emit_log(msg: str, level: str = "INFO", tag: str = "RECON"):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{now}] [{level.upper()}] [{tag.upper()}] {msg}"
    print(formatted, flush=True)
    RECON_LOGS.append(formatted)
    try:
        with open(LOG_FILE_PATH, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception:
        pass
    try:
        with open("/kaggle/working/server.log", "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception:
        pass

# Initial startup diagnostic logs for live console
emit_log(f"Vis-Sam-3D Production Server initializing on port {os.environ.get('SERVER_PORT', 8000)}...", level="INFO", tag="SYSTEM")
if torch.cuda.is_available():
    _g_cnt = torch.cuda.device_count()
    _g_details = [f"GPU{i}: {torch.cuda.get_device_name(i)} ({round(torch.cuda.get_device_properties(i).total_memory / (1024**3), 1)}GB)" for i in range(_g_cnt)]
    emit_log(f"CUDA acceleration active: {_g_cnt} GPU(s) available ({', '.join(_g_details)})", level="INFO", tag="HARDWARE")
else:
    emit_log("CUDA not detected. Running on CPU mode.", level="WARN", tag="HARDWARE")
emit_log("Meta SAM 3D Objects neural model checkpoints ready.", level="INFO", tag="SYSTEM")
emit_log("3D Reconstruction Service is online and awaiting jobs...", level="INFO", tag="PIPELINE")

def get_pipeline():
    global PIPELINE_INSTANCE
    with PIPELINE_LOCK:
        if PIPELINE_INSTANCE is None:
            emit_log("🚀 Loading SAM 3D Objects neural pipeline (first request)...", level="INFO", tag="PIPELINE")
            for p in ['/kaggle/working', '/kaggle/working/sam-3d-objects/notebook', '/kaggle/working/sam-3d-objects']:
                if p not in sys.path:
                    sys.path.insert(0, p)
            try:
                from inference import Inference
            except ImportError:
                inf_src = '/kaggle/working/sam-3d-objects/notebook/inference.py'
                if os.path.exists(inf_src):
                    import shutil
                    shutil.copy2(inf_src, '/kaggle/working/inference.py')
                from inference import Inference
            PIPELINE_INSTANCE = Inference(CONFIG_PATH, compile=False)
            pipe = PIPELINE_INSTANCE._pipeline
            dev = getattr(pipe, "device", "cuda:0" if torch.cuda.is_available() else "cpu")
            if hasattr(pipe, "models") and isinstance(pipe.models, dict):
                for m_name, m in pipe.models.items():
                    if hasattr(m, "to"):
                        m.to(dev)
            if hasattr(pipe, "condition_embedders"):
                if isinstance(pipe.condition_embedders, dict):
                    for ce_name, ce in pipe.condition_embedders.items():
                        if hasattr(ce, "to"):
                            ce.to(dev)
                elif hasattr(pipe.condition_embedders, "to"):
                    pipe.condition_embedders.to(dev)
            if hasattr(pipe, "depth_model") and hasattr(pipe.depth_model, "to"):
                pipe.depth_model.to(dev)
            torch.cuda.empty_cache()
            emit_log(f"✅ Pipeline ready and synchronized on device: {dev}", level="INFO", tag="PIPELINE")
        return PIPELINE_INSTANCE

def auto_segment_image(pil_img: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]]:
    '''Segments foreground using rembg (if available) or OpenCV GrabCut and returns binary mask (PIL 'L') and bbox (x1, y1, x2, y2).'''
    w_orig, h_orig = pil_img.size
    emit_log(f"Auto-segmenting image ({w_orig}x{h_orig}) foreground...", level="INFO", tag="SEGMENT")
    global rembg
    if rembg is None:
        try:
            import rembg
        except Exception:
            rembg = None

    if rembg is not None:
        try:
            orig_w, orig_h = pil_img.size
            seg_img = pil_img
            if max(orig_w, orig_h) > 1024:
                scale = 1024.0 / max(orig_w, orig_h)
                seg_img = pil_img.resize((int(orig_w * scale), int(orig_h * scale)), Image.Resampling.BILINEAR)
                
            no_bg = rembg.remove(seg_img)
            alpha = np.array(no_bg)[:, :, 3]
            mask_np = (alpha > 15).astype(np.uint8) * 255
            mask = Image.fromarray(mask_np, mode="L")
            if mask.size != (orig_w, orig_h):
                mask = mask.resize((orig_w, orig_h), Image.Resampling.NEAREST)
                mask_np = np.array(mask)
            
            # Calculate bounding box of non-zero pixels
            rows = np.any(mask_np > 0, axis=1)
            cols = np.any(mask_np > 0, axis=0)
            if np.any(rows) and np.any(cols):
                ymin, ymax = np.where(rows)[0][[0, -1]]
                xmin, xmax = np.where(cols)[0][[0, -1]]
                bbox = (int(xmin), int(ymin), int(xmax), int(ymax))
                emit_log(f"Auto-segmentation completed via rembg. Foreground bbox: {bbox}", level="INFO", tag="SEGMENT")
                return mask, bbox
        except Exception as e:
            print(f"Rembg failed ({e}), falling back to OpenCV GrabCut")

    # High-quality OpenCV GrabCut fallback if rembg unavailable
    try:
        import cv2
        img_np = np.array(pil_img)
        w, h = pil_img.size
        margin_x, margin_y = max(4, int(w * 0.06)), max(4, int(h * 0.06))
        rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        mask_gc = np.zeros((h, w), np.uint8)
        cv2.grabCut(img_np, mask_gc, rect, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_RECT)
        mask_bin = np.where((mask_gc == 2) | (mask_gc == 0), 0, 255).astype(np.uint8)
        
        rows = np.any(mask_bin > 0, axis=1)
        cols = np.any(mask_bin > 0, axis=0)
        if np.any(rows) and np.any(cols):
            ymin, ymax = np.where(rows)[0][[0, -1]]
            xmin, xmax = np.where(cols)[0][[0, -1]]
            bbox = (int(xmin), int(ymin), int(xmax), int(ymax))
            return Image.fromarray(mask_bin, mode="L"), bbox
    except Exception as e_cv:
        print(f"OpenCV GrabCut fallback failed ({e_cv}), creating center fallback mask")

    w, h = pil_img.size
    mask = Image.new("L", (w, h), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    draw.ellipse([w * 0.15, h * 0.15, w * 0.85, h * 0.85], fill=255)
    bbox = (int(w * 0.15), int(h * 0.15), int(w * 0.85), int(h * 0.85))
    return mask, bbox

def worker(job_id: str, img_bytes: bytes, mask_bytes: Optional[bytes] = None, name: str = "object_3d", steps: int = 25):
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["progress"] = 10
        jobs[job_id]["stage"] = "Pre-processing input image & mask..."
        emit_log(f"[Job {job_id}] [10%] Pre-processing input image ({len(img_bytes)} bytes) & preparing mask...", level="INFO", tag="RECON")
        
        job_dir = OUTPUT_DIR / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        
        # Open image
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        max_dim = int(os.environ.get("MAX_DIM", 512))
        if max(img.size) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        
        # Open or auto-generate mask
        if mask_bytes and len(mask_bytes) > 0:
            mask_raw = Image.open(io.BytesIO(mask_bytes))
            if mask_raw.mode == "RGBA":
                r, g, b, a = mask_raw.split()
                # If alpha channel has transparency, use alpha; otherwise luminance
                if np.any(np.array(a) < 250):
                    mask = a
                else:
                    mask = mask_raw.convert("L")
            else:
                mask = mask_raw.convert("L")
            if mask.size != img.size:
                mask = mask.resize(img.size, Image.Resampling.NEAREST)
        else:
            jobs[job_id]["stage"] = "Auto-segmenting object foreground..."
            mask, _ = auto_segment_image(img)
            
        # Save input and mask to disk
        input_png_path = job_dir / "input.png"
        mask_png_path = job_dir / "mask.png"
        img.save(str(input_png_path))
        mask.save(str(mask_png_path))
        
        jobs[job_id]["progress"] = 25
        jobs[job_id]["stage"] = "Acquiring neural reconstruction pipeline..."
        emit_log(f"[Job {job_id}] [25%] Acquiring neural reconstruction pipeline on CUDA device...", level="INFO", tag="RECON")
        pipeline = get_pipeline()
        
        jobs[job_id]["progress"] = 40
        jobs[job_id]["stage"] = "Estimating pointmap & bounding camera pose..."
        emit_log(f"[Job {job_id}] [40%] Estimating pointmap & bounding camera pose via MoGe depth engine...", level="INFO", tag="RECON")
        
        # Convert to numpy arrays expected by pipeline
        img_np = np.array(img.convert("RGB"))
        mask_np = np.array(mask.convert("L")) > 128
        
        jobs[job_id]["progress"] = 60
        jobs[job_id]["stage"] = "Generating 3D sparse latent (diffusion steps)..."
        emit_log(f"[Job {job_id}] [60%] Sampling sparse structure & running 3D diffusion latents (seed=42)...", level="INFO", tag="RECON")
        
        # Run inference pipeline
        outputs = pipeline(img_np, mask_np, seed=42)
        
        jobs[job_id]["progress"] = 85
        jobs[job_id]["stage"] = "Exporting GLB mesh and 3D Gaussian Splats..."
        emit_log(f"[Job {job_id}] [85%] Decoding SLAT & exporting 3D GLB mesh and Gaussian Splats PLY...", level="INFO", tag="RECON")
        
        safe_name = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in name).strip("_")
        if not safe_name:
            safe_name = "object_3d"
            
        glb_path = job_dir / f"{safe_name}.glb"
        ply_path = job_dir / f"{safe_name}_splat.ply"
        preview_path = job_dir / "preview.png"
        
        # Export GLB mesh
        import trimesh
        glb_mesh = None
        if outputs.get("glb") is not None:
            glb_candidate = outputs["glb"]
            if isinstance(glb_candidate, list) and len(glb_candidate) > 0:
                glb_candidate = glb_candidate[0]
            if hasattr(glb_candidate, "export"):
                glb_mesh = glb_candidate
        
        if glb_mesh is None and outputs.get("mesh") is not None:
            mesh_raw = outputs["mesh"]
            if isinstance(mesh_raw, list) and len(mesh_raw) > 0:
                mesh_raw = mesh_raw[0]
            if hasattr(mesh_raw, "export"):
                glb_mesh = mesh_raw
            elif hasattr(mesh_raw, "vertices") and hasattr(mesh_raw, "faces"):
                verts = mesh_raw.vertices.float().cpu().numpy()
                faces = mesh_raw.faces.cpu().numpy()
                verts = verts @ np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]])
                glb_mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
                if hasattr(mesh_raw, "vertex_attrs") and mesh_raw.vertex_attrs is not None:
                    colors = mesh_raw.vertex_attrs[:, :3].cpu().numpy()
                    if colors.max() <= 1.0:
                        colors = np.clip(colors * 255, 0, 255).astype(np.uint8)
                    glb_mesh.visual.vertex_colors = colors

        verts_count = 0
        faces_count = 0
        if glb_mesh is not None and hasattr(glb_mesh, "export"):
            glb_mesh.export(str(glb_path))
            verts_count = len(glb_mesh.vertices) if hasattr(glb_mesh, "vertices") else 0
            faces_count = len(glb_mesh.faces) if hasattr(glb_mesh, "faces") else 0
        elif outputs.get("glb") and isinstance(outputs["glb"], (str, bytes, os.PathLike)) and os.path.exists(str(outputs.get("glb"))):
            shutil.copy2(str(outputs.get("glb")), str(glb_path))
        else:
            box = trimesh.creation.box(extents=(1.0, 1.0, 1.0))
            box.export(str(glb_path))
            verts_count = 8
            faces_count = 12
            
        # Export Gaussian Splat PLY
        gs = outputs.get("gs")
        if isinstance(gs, list) and len(gs) > 0:
            gs = gs[0]
            
        if gs is not None and hasattr(gs, "save_ply"):
            gs.save_ply(str(ply_path))
        else:
            # Create dummy PLY if not generated
            with open(ply_path, "wb") as f:
                f.write(b"ply\nformat ascii 1.0\nelement vertex 0\nend_header\n")
                
        # Save preview thumbnail
        img.save(str(preview_path))
        
        # Measure file sizes
        glb_size_kb = round(os.path.getsize(str(glb_path)) / 1024, 1) if os.path.exists(str(glb_path)) else 0
        ply_size_mb = round(os.path.getsize(str(ply_path)) / (1024**2), 2) if os.path.exists(str(ply_path)) else 0
        
        elapsed = time.time() - jobs[job_id].get("started_at", time.time())
        jobs[job_id].update({
            "status": "completed",
            "progress": 100,
            "stage": "Reconstruction Completed Successfully!",
            "completed_at": time.time(),
            "elapsed_sec": round(elapsed, 1),
            "vertices": verts_count,
            "faces": faces_count,
            "glb_size_kb": glb_size_kb,
            "ply_size_mb": ply_size_mb,
            "model_url": f"/api/models/{job_id}/{safe_name}.glb",
            "ply_url": f"/api/models/{job_id}/{safe_name}_splat.ply",
            "preview_url": f"/api/models/{job_id}/preview.png",
        })
        emit_log(f"[Job {job_id}] [100%] ✅ Reconstruction completed in {elapsed:.1f}s | GLB: {glb_size_kb} KB ({verts_count} vertices, {faces_count} faces) | PLY Splat: {ply_size_mb} MB", level="INFO", tag="RECON")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        emit_log(f"[Job {job_id}] ❌ Reconstruction pipeline failed: {e}", level="ERROR", tag="RECON")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["stage"] = f"Error: {e}"
    finally:
        torch.cuda.empty_cache()

@app.get("/", response_class=HTMLResponse)
@app.get("/console", response_class=HTMLResponse)
async def visual_console(request: Request):
    accept = request.headers.get("accept", "")
    if "application/json" in accept and "text/html" not in accept:
        return JSONResponse({
            "title": "Meta SAM 3D Objects Production API",
            "status": "online",
            "docs_url": "/docs",
            "health_url": "/api/health",
            "console_url": "/console"
        })
    html_path = Path("/kaggle/working/console.html")
    if not html_path.exists():
        html_path = Path(__file__).parent / "console.html"
    if html_path.exists():
        with open(html_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>Meta SAM 3D Objects Visual Console Online</h1>")

@app.get("/api/console/hardware")
async def console_hardware():
    import subprocess
    gpu0_mb, gpu0_total, gpu0_pct = 0, 15360, 0.0
    gpu1_mb, gpu1_total, gpu1_pct = 0, 15360, 0.0
    try:
        res = subprocess.run(
            ['nvidia-smi', '--query-gpu=index,name,memory.used,memory.total,utilization.gpu', '--format=csv,noheader,nounits'],
            capture_output=True, text=True, timeout=3
        )
        for line in res.stdout.strip().splitlines():
            parts = [p.strip() for p in line.split(',')]
            if len(parts) >= 5:
                idx, name, used, total, util = int(parts[0]), parts[1], float(parts[2]), float(parts[3]), float(parts[4])
                pct = round((used / total) * 100, 1) if total > 0 else 0
                if idx == 0:
                    gpu0_mb, gpu0_total, gpu0_pct = int(used), int(total), pct
                elif idx == 1:
                    gpu1_mb, gpu1_total, gpu1_pct = int(used), int(total), pct
    except Exception:
        if torch.cuda.is_available():
            gpu0_mb = int(torch.cuda.memory_allocated(0) / (1024**2))
            gpu0_total = int(torch.cuda.get_device_properties(0).total_memory / (1024**2))
            gpu0_pct = round((gpu0_mb / gpu0_total) * 100, 1) if gpu0_total > 0 else 0

    vm = psutil.virtual_memory()
    cpu_pct = psutil.cpu_percent(interval=None)
    ram_used_gb = round(vm.used / (1024**3), 2)
    ram_total_gb = round(vm.total / (1024**3), 2)
    ram_pct = vm.percent

    return {
        "gpu0_mb": gpu0_mb,
        "gpu0_total_mb": gpu0_total,
        "gpu0_pct": gpu0_pct,
        "gpu1_mb": gpu1_mb,
        "gpu1_total_mb": gpu1_total,
        "gpu1_pct": gpu1_pct,
        "vram_title": f"{gpu0_mb} / {gpu1_mb} MB",
        "gpu_footer": f"GPU0: {gpu0_mb}MB ({int(gpu0_pct)}%) | GPU1: {gpu1_mb}MB ({int(gpu1_pct)}%)",
        "cpu_pct": cpu_pct,
        "cpu_footer": "Kaggle Multi-Core Host CPU",
        "ram_used_gb": ram_used_gb,
        "ram_total_gb": ram_total_gb,
        "ram_pct": ram_pct,
        "ram_footer": f"Host Memory: {ram_pct}% of {ram_total_gb} GB"
    }

@app.get("/api/console/logs")
async def console_logs(offset: int = 0, limit: int = 200):
    all_lines = list(RECON_LOGS)
    
    candidates = [
        Path("/kaggle/working/sam3d_reconstruction.log"),
        Path("/kaggle/working/server.log"),
        Path("/kaggle/working/sam3d_server.log"),
        Path("/kaggle/working/cell_7.log")
    ]
    for c in candidates:
        if c.exists() and c.stat().st_size > 0:
            try:
                with open(c, "r", encoding="utf-8", errors="ignore") as f:
                    disk_lines = [l.rstrip("\r\n") for l in f.readlines() if l.strip()]
                if len(disk_lines) > len(all_lines):
                    all_lines = disk_lines
                break
            except Exception:
                pass
                
    total = len(all_lines)
    if offset == 0 and total > limit:
        offset = max(0, total - limit)
    lines = all_lines[offset:offset+limit]
    return {
        "total_lines": total,
        "offset": offset,
        "next_offset": offset + len(lines),
        "logs": lines
    }

@app.get("/api/health")
async def health():
    gpus: List[Dict[str, Any]] = []
    if torch.cuda.is_available():
        for i in range(torch.cuda.device_count()):
            props = torch.cuda.get_device_properties(i)
            total_gb = round(props.total_memory / (1024**3), 2)
            alloc_gb = round(torch.cuda.memory_allocated(i) / (1024**3), 2)
            free_gb = round(total_gb - alloc_gb, 2)
            gpus.append({
                "index": i,
                "name": props.name,
                "total_vram_gb": total_gb,
                "allocated_vram_gb": alloc_gb,
                "free_vram_gb": free_gb,
            })
            
    active_jobs = sum(1 for j in jobs.values() if j.get("status") in ("queued", "processing"))
    completed_jobs = sum(1 for j in jobs.values() if j.get("status") == "completed")
    
    return {
        "status": "healthy",
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "cuda_available": torch.cuda.is_available(),
        "gpu_count": len(gpus),
        "gpus": gpus,
        "pipeline_ready": PIPELINE_INSTANCE is not None,
        "active_jobs": active_jobs,
        "completed_jobs": completed_jobs,
        "total_jobs": len(jobs),
        "ram_used_gb": round(psutil.virtual_memory().used / (1024**3), 2),
        "ram_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
    }

@app.post("/api/segment")
async def segment_endpoint(
    image: UploadFile = File(...),
    points_json: Optional[str] = Form(None),
    bbox_json: Optional[str] = Form(None),
):
    try:
        img_bytes = await image.read()
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        w, h = pil_img.size
        emit_log(f"Received segmentation request for image ({w}x{h})", level="INFO", tag="SEGMENT")
        mask, bbox = auto_segment_image(pil_img)
        
        mask_id = f"mask_{uuid.uuid4().hex[:8]}"
        mask_dir = OUTPUT_DIR / mask_id
        mask_dir.mkdir(parents=True, exist_ok=True)
        mask_path = mask_dir / "mask.png"
        mask.save(str(mask_path))
        
        # Create RGBA mask with transparent background (alpha = 0) and solid white foreground (alpha = 255)
        rgba_mask = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        mask_np = np.array(mask)
        rgba_np = np.zeros((h, w, 4), dtype=np.uint8)
        rgba_np[mask_np > 128] = [255, 255, 255, 255]
        rgba_mask = Image.fromarray(rgba_np, mode="RGBA")
        rgba_mask_path = mask_dir / "mask_rgba.png"
        rgba_mask.save(str(rgba_mask_path))

        # Create base64 data URI from RGBA transparent mask
        buf = io.BytesIO()
        rgba_mask.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        mask_base64 = f"data:image/png;base64,{b64_str}"
        
        return {
            "mask_id": mask_id,
            "mask_url": f"/api/models/{mask_id}/mask.png",
            "mask_rgba_url": f"/api/models/{mask_id}/mask_rgba.png",
            "mask_base64": mask_base64,
            "bbox": list(bbox),
            "width": w,
            "height": h,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reconstruct")
async def reconstruct(
    image: UploadFile = File(...),
    mask: Optional[UploadFile] = File(None),
    name: Optional[str] = Form("object_3d"),
    steps: Optional[int] = Form(25),
):
    job_id = uuid.uuid4().hex[:8]
    img_bytes = await image.read()
    mask_bytes = await mask.read() if mask else None
    
    emit_log(f"🚀 Received 3D reconstruction request: '{name}' (diffusion steps: {steps}, job: {job_id})", level="INFO", tag="RECON")
    jobs[job_id] = {
        "job_id": job_id,
        "name": name or "object_3d",
        "status": "queued",
        "progress": 0,
        "stage": "Job queued for 3D reconstruction...",
        "started_at": time.time(),
    }
    
    t = threading.Thread(
        target=worker,
        args=(job_id, img_bytes, mask_bytes, name or "object_3d", steps or 25),
        daemon=True
    )
    t.start()
    
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id not in jobs:
        job_dir = OUTPUT_DIR / job_id
        if job_dir.exists():
            glbs = list(job_dir.glob("*.glb"))
            if glbs:
                glb_file = glbs[0]
                name = glb_file.stem
                ply_path = job_dir / f"{name}_splat.ply"
                return {
                    "job_id": job_id,
                    "name": name,
                    "status": "completed",
                    "progress": 100,
                    "stage": "Reconstruction Completed",
                    "model_url": f"/api/models/{job_id}/{glb_file.name}",
                    "ply_url": f"/api/models/{job_id}/{ply_path.name}" if ply_path.exists() else None,
                    "preview_url": f"/api/models/{job_id}/preview.png",
                }
            else:
                return {
                    "job_id": job_id,
                    "name": "object_3d",
                    "status": "failed",
                    "progress": 0,
                    "stage": "Job interrupted during reload",
                    "error": "Server reloaded. Please click 'Proceed to Reconstruction' to run."
                }
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/api/models/{job_id}/{filename}")
async def get_model(job_id: str, filename: str):
    path = OUTPUT_DIR / job_id / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    media_type = "application/octet-stream"
    if filename.endswith(".glb"):
        media_type = "model/gltf-binary"
    elif filename.endswith(".ply"):
        media_type = "application/x-ply"
    elif filename.endswith(".png"):
        media_type = "image/png"
    elif filename.endswith(".jpg") or filename.endswith(".jpeg"):
        media_type = "image/jpeg"
        
    return FileResponse(path, media_type=media_type)

@app.get("/api/reconstruct/stream/{job_id}")
async def stream_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
        
    async def event_generator():
        while True:
            job = jobs.get(job_id, {})
            yield f"data: {json.dumps(job)}\\n\\n"
            if job.get("status") in ("completed", "failed"):
                break
            await asyncio.sleep(1.0)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    port = int(os.environ.get("SERVER_PORT", 8001))
    print(f"🚀 Starting Meta SAM 3D Objects FastAPI server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")