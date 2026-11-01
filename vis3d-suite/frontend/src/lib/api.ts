/**
 * Vis-Sam-3D Suite API Client
 * Manages communication with the remote Kaggle / GPU server via Cloudflare Tunnel.
 */

let customApiBaseUrl: string | null = null;
const DEFAULT_FALLBACK_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface GPUInfo {
  index: number;
  name: string;
  total_vram_gb: number;
  allocated_vram_gb: number;
  free_vram_gb: number;
}

export interface HealthResponse {
  status: string;
  device: string;
  cuda_available: boolean;
  gpu_count: number;
  gpus: GPUInfo[];
  tunnel_url?: string;
  pipeline_ready: boolean;
  active_jobs: number;
  completed_jobs: number;
  total_jobs: number;
}

export interface SegmentResponse {
  mask_id: string;
  mask_url: string;
  mask_base64: string;
  bbox: [number, number, number, number];
  width: number;
  height: number;
}

export interface ReconstructionJob {
  job_id: string;
  name: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  stage: string;
  started_at?: number;
  completed_at?: number;
  elapsed_sec?: number;
  vertices?: number;
  faces?: number;
  glb_size_kb?: number;
  ply_size_mb?: number;
  model_url?: string;
  ply_url?: string;
  preview_url?: string;
  error?: string;
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (!customApiBaseUrl) {
      const stored = localStorage.getItem("sam3d_kaggle_api_url");
      if (stored && stored.trim() !== "") {
        customApiBaseUrl = stored.trim().replace(/\/$/, "");
      } else {
        customApiBaseUrl = DEFAULT_FALLBACK_URL;
        localStorage.setItem("sam3d_kaggle_api_url", DEFAULT_FALLBACK_URL);
      }
    }
    return customApiBaseUrl || DEFAULT_FALLBACK_URL;
  }
  return DEFAULT_FALLBACK_URL;
}

export function setApiBaseUrl(url: string): void {
  const trimmed = url.trim().replace(/\/$/, "");
  customApiBaseUrl = trimmed;
  if (typeof window !== "undefined") {
    if (trimmed) {
      localStorage.setItem("sam3d_kaggle_api_url", trimmed);
    } else {
      localStorage.removeItem("sam3d_kaggle_api_url");
    }
  }
}

export function resolveUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function checkServerHealth(): Promise<HealthResponse> {
  let base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/health`, { method: "GET" });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    if (base !== DEFAULT_FALLBACK_URL) {
      console.warn(`Stored API base ${base} failed, falling back to ${DEFAULT_FALLBACK_URL}`);
      setApiBaseUrl(DEFAULT_FALLBACK_URL);
      base = DEFAULT_FALLBACK_URL;
      const res = await fetch(`${base}/api/health`, { method: "GET" });
      if (res.ok) {
        return await res.json();
      }
    }
    throw err;
  }
  throw new Error("Server returned non-200 status");
}

export async function segmentImage(
  imageBlob: Blob,
  points?: Array<[number, number, number]>,
  bbox?: [number, number, number, number]
): Promise<SegmentResponse> {
  const base = getApiBaseUrl();
  const formData = new FormData();
  formData.append("image", imageBlob, "input.png");
  if (points && points.length > 0) {
    formData.append("points_json", JSON.stringify(points));
  }
  if (bbox) {
    formData.append("bbox_json", JSON.stringify(bbox));
  }

  const res = await fetch(`${base}/api/segment`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Segmentation failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

export async function startReconstruction(
  imageBlob: Blob,
  maskBlob?: Blob | null,
  name: string = "object_3d",
  steps: number = 25
): Promise<{ job_id: string; status: string }> {
  const base = getApiBaseUrl();
  const formData = new FormData();
  formData.append("image", imageBlob, "image.png");
  if (maskBlob) {
    formData.append("mask", maskBlob, "mask.png");
  }
  formData.append("name", name);
  formData.append("steps", steps.toString());

  const res = await fetch(`${base}/api/reconstruct`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Reconstruction failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

export async function getJobStatus(jobId: string): Promise<ReconstructionJob> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/jobs/${jobId}`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to query job ${jobId}`);
  }
  return await res.json();
}
