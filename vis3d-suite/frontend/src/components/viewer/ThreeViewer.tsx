"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  RotateCcw,
  Sun,
  Eye,
  Download,
  Camera,
  Maximize2,
  Box,
  Layers,
  Sparkles,
  Grid,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Focus,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Compass,
  Lightbulb,
  Palette,
  Flame,
  Check,
} from "lucide-react";

interface ThreeViewerProps {
  modelUrl?: string | null;
  plyUrl?: string | null;
  modelName?: string;
  vertices?: number;
  faces?: number;
  onReset?: () => void;
  className?: string;
}

type ShadingMode = "textured" | "clay" | "wireframe" | "pointcloud";
type LightingPreset = "bright_studio" | "soft_showcase" | "golden_sun" | "cyber_neon" | "pure_albedo";
type BgTheme = "slate" | "charcoal" | "pure_black" | "light_studio" | "warm_sunset";

interface LightSettings {
  exposure: number;
  ambientIntensity: number;
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  groundBounce: number;
  lightAngle: number;
  lightElevation: number;
  castShadows: boolean;
  bgTheme: BgTheme;
  textureBoost: number;
  textureSaturation: number;
}

const DEFAULT_LIGHT_SETTINGS: Record<LightingPreset, LightSettings> = {
  bright_studio: {
    exposure: 0.80,
    ambientIntensity: 1.30,
    keyIntensity: 0.60,
    fillIntensity: 0.50,
    rimIntensity: 0.00,
    groundBounce: 0.40,
    lightAngle: 100,
    lightElevation: 45,
    castShadows: true,
    bgTheme: "charcoal",
    textureBoost: 1.30,
    textureSaturation: 1.35,
  },
  soft_showcase: {
    exposure: 2.1,
    ambientIntensity: 2.2,
    keyIntensity: 1.2,
    fillIntensity: 1.8,
    rimIntensity: 0.9,
    groundBounce: 1.0,
    lightAngle: 90,
    lightElevation: 65,
    castShadows: true,
    bgTheme: "charcoal",
    textureBoost: 1.3,
    textureSaturation: 1.05,
  },
  golden_sun: {
    exposure: 1.85,
    ambientIntensity: 1.3,
    keyIntensity: 3.0,
    fillIntensity: 1.0,
    rimIntensity: 2.0,
    groundBounce: 0.6,
    lightAngle: 35,
    lightElevation: 35,
    castShadows: true,
    bgTheme: "warm_sunset",
    textureBoost: 1.2,
    textureSaturation: 1.25,
  },
  cyber_neon: {
    exposure: 1.75,
    ambientIntensity: 1.0,
    keyIntensity: 2.5,
    fillIntensity: 2.2,
    rimIntensity: 2.8,
    groundBounce: 0.7,
    lightAngle: 60,
    lightElevation: 40,
    castShadows: true,
    bgTheme: "pure_black",
    textureBoost: 1.35,
    textureSaturation: 1.40,
  },
  pure_albedo: {
    exposure: 1.5,
    ambientIntensity: 3.5,
    keyIntensity: 0.0,
    fillIntensity: 0.0,
    rimIntensity: 0.0,
    groundBounce: 1.2,
    lightAngle: 0,
    lightElevation: 90,
    castShadows: false,
    bgTheme: "slate",
    textureBoost: 1.1,
    textureSaturation: 1.00,
  },
};

export default function ThreeViewer({
  modelUrl,
  plyUrl,
  modelName = "Reconstructed 3D Object",
  vertices,
  faces,
  onReset,
  className,
}: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const bboxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);

  // Lighting Rig Refs
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const groundLightRef = useRef<THREE.DirectionalLight | null>(null);

  // UI States
  const [shadingMode, setShadingMode] = useState<ShadingMode>("textured");
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>("bright_studio");
  const [lightSettings, setLightSettings] = useState<LightSettings>(DEFAULT_LIGHT_SETTINGS.bright_studio);
  const [showLightPanel, setShowLightPanel] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showBbox, setShowBbox] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bboxDimensions, setBboxDimensions] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x18181b);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );
    camera.position.set(1.5, 1.2, 2.0);
    cameraRef.current = camera;

    // 3. Renderer with ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = DEFAULT_LIGHT_SETTINGS.bright_studio.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // 5. Grid Helper & Ground Shadow
    const gridHelper = new THREE.GridHelper(10, 40, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.001;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Soft Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // 6. Multi-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3.5, 4.5, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.4);
    fillLight.position.set(-3.0, 2.5, -2.0);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(0.0, 4.0, -4.0);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    const groundLight = new THREE.DirectionalLight(0x94a3b8, 0.8);
    groundLight.position.set(0.0, -3.0, 0.0);
    scene.add(groundLight);
    groundLightRef.current = groundLight;

    // 7. Model Container Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update Grid
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Apply Lighting Rig Parameters in Real Time
  const applyLightRig = (settings: LightSettings, preset: LightingPreset) => {
    if (!rendererRef.current || !sceneRef.current) return;

    // 1. Exposure
    rendererRef.current.toneMappingExposure = settings.exposure;

    // 2. Trigonometric Light Positions from Azimuth & Elevation
    const radAngle = (settings.lightAngle * Math.PI) / 180;
    const radElev = (settings.lightElevation * Math.PI) / 180;
    const dist = 5.0;

    const keyX = dist * Math.cos(radElev) * Math.sin(radAngle);
    const keyY = dist * Math.sin(radElev);
    const keyZ = dist * Math.cos(radElev) * Math.cos(radAngle);

    const fillAngle = radAngle + (130 * Math.PI) / 180;
    const fillX = dist * 0.8 * Math.cos(radElev * 0.7) * Math.sin(fillAngle);
    const fillY = dist * 0.8 * Math.sin(radElev * 0.7);
    const fillZ = dist * 0.8 * Math.cos(radElev * 0.7) * Math.cos(fillAngle);

    const rimAngle = radAngle + Math.PI;
    const rimX = dist * 0.9 * Math.sin(rimAngle);
    const rimY = dist * 0.8;
    const rimZ = dist * 0.9 * Math.cos(rimAngle);

    // Preset Colors
    let keyColor = 0xffffff;
    let fillColor = 0xe2e8f0;
    let rimColor = 0x38bdf8;
    let hemiSky = 0xffffff;
    let hemiGround = 0x334155;

    if (preset === "golden_sun") {
      keyColor = 0xf97316;
      fillColor = 0x60a5fa;
      rimColor = 0xfbbf24;
      hemiSky = 0xfed7aa;
      hemiGround = 0x1e1b4b;
    } else if (preset === "cyber_neon") {
      keyColor = 0x06b6d4;
      fillColor = 0xd946ef;
      rimColor = 0xa855f7;
      hemiSky = 0x22d3ee;
      hemiGround = 0x4c1d95;
    } else if (preset === "pure_albedo") {
      keyColor = 0xffffff;
      fillColor = 0xffffff;
      rimColor = 0xffffff;
      hemiSky = 0xffffff;
      hemiGround = 0xffffff;
    }

    if (keyLightRef.current) {
      keyLightRef.current.position.set(keyX, keyY, keyZ);
      keyLightRef.current.color.setHex(keyColor);
      keyLightRef.current.intensity = preset === "pure_albedo" ? 0.0 : settings.keyIntensity;
      keyLightRef.current.castShadow = settings.castShadows;
    }
    if (fillLightRef.current) {
      fillLightRef.current.position.set(fillX, fillY, fillZ);
      fillLightRef.current.color.setHex(fillColor);
      fillLightRef.current.intensity = preset === "pure_albedo" ? 0.0 : settings.fillIntensity;
    }
    if (rimLightRef.current) {
      rimLightRef.current.position.set(rimX, rimY, rimZ);
      rimLightRef.current.color.setHex(rimColor);
      rimLightRef.current.intensity = preset === "pure_albedo" ? 0.0 : settings.rimIntensity;
    }
    if (groundLightRef.current) {
      groundLightRef.current.position.set(0.0, -3.0, 0.0);
      groundLightRef.current.intensity = settings.groundBounce;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(hemiSky);
      hemiLightRef.current.groundColor.setHex(hemiGround);
      hemiLightRef.current.intensity = preset === "pure_albedo" ? 3.5 : settings.ambientIntensity;
    }
    if (shadowMeshRef.current) {
      shadowMeshRef.current.visible = settings.castShadows && preset !== "pure_albedo";
    }

    // 3. Background Theme & Grid styling
    const scene = sceneRef.current;
    let bgColor = 0x090d16;
    let gridPrimary = 0x38bdf8;
    let gridSecondary = 0x1e293b;

    if (settings.bgTheme === "slate") {
      bgColor = 0x090d16;
      gridPrimary = 0x38bdf8;
      gridSecondary = 0x1e293b;
    } else if (settings.bgTheme === "charcoal") {
      bgColor = 0x18181b;
      gridPrimary = 0x71717a;
      gridSecondary = 0x27272a;
    } else if (settings.bgTheme === "pure_black") {
      bgColor = 0x000000;
      gridPrimary = 0x0284c7;
      gridSecondary = 0x0f172a;
    } else if (settings.bgTheme === "light_studio") {
      bgColor = 0xf1f5f9;
      gridPrimary = 0x0284c7;
      gridSecondary = 0xcbd5e1;
    } else if (settings.bgTheme === "warm_sunset") {
      bgColor = 0x180d1e;
      gridPrimary = 0xf97316;
      gridSecondary = 0x3b0764;
    }
    scene.background = new THREE.Color(bgColor);

    if (gridHelperRef.current) {
      scene.remove(gridHelperRef.current);
      const newGrid = new THREE.GridHelper(10, 40, gridPrimary, gridSecondary);
      newGrid.position.y = -0.001;
      newGrid.visible = showGrid;
      scene.add(newGrid);
      gridHelperRef.current = newGrid;
    }

    // 4. Mesh Material Calibration, Texture Boost & Saturation
    if (modelGroupRef.current) {
      modelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as any;
          if (mat) {
            if (mat.roughness !== undefined) {
              mat.roughness = Math.min(mat.roughness, 0.55);
            }
            if (mat.metalness !== undefined) {
              mat.metalness = Math.min(mat.metalness, 0.15);
            }
            // Update WebGL shader saturation uniform in real time
            if (mat.userData && mat.userData.saturationUniform) {
              mat.userData.saturationUniform.value = settings.textureSaturation ?? 1.0;
            }
            // Also calibrate baseColor with HSL saturation & textureBoost
            if (mat.color && mesh.userData.baseColor) {
              const base = mesh.userData.baseColor.clone();
              const hsl = { h: 0, s: 0, l: 0 };
              base.getHSL(hsl);
              const sat = Math.max(0, Math.min(1, hsl.s * (settings.textureSaturation ?? 1.0)));
              mat.color.setHSL(hsl.h, sat, hsl.l).multiplyScalar(settings.textureBoost);
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    applyLightRig(lightSettings, lightingPreset);
  }, [lightSettings, lightingPreset, showGrid]);

  // Handle Preset Switching
  const selectPreset = (preset: LightingPreset) => {
    setLightingPreset(preset);
    setLightSettings(DEFAULT_LIGHT_SETTINGS[preset]);
  };

  // Load Model
  useEffect(() => {
    if (!modelUrl || !modelGroupRef.current || !sceneRef.current) return;
    setIsLoading(true);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const mg = modelGroupRef.current;
        if (!mg) return;
        while (mg.children.length > 0) {
          mg.remove(mg.children[0]);
        }

        const model = gltf.scene;

        // Auto-center and normalize model scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1.0;
        const scale = 1.0 / maxDim;

        model.position.sub(center);
        model.scale.multiplyScalar(scale);

        // Put bottom of model exactly on y=0 ground grid
        const newBox = new THREE.Box3().setFromObject(model);
        model.position.y -= newBox.min.y;

        setBboxDimensions({
          x: Math.round(size.x * 100) / 100,
          y: Math.round(size.y * 100) / 100,
          z: Math.round(size.z * 100) / 100,
        });

        // Store original materials, hook WebGL saturation shader, and base colors
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.origMaterial = mesh.material;
            const mat = mesh.material as any;
            if (mat && mat.color) {
              mesh.userData.baseColor = mat.color.clone();
            } else {
              mesh.userData.baseColor = new THREE.Color(0xffffff);
            }
            if (mat && mat.roughness !== undefined) {
              mat.roughness = 0.5;
            }

            // Hook custom WebGL shader uniform for real-time texture saturation
            if (mat) {
              mat.userData = mat.userData || {};
              if (!mat.userData.saturationUniform) {
                mat.userData.saturationUniform = { value: lightSettings.textureSaturation ?? 1.0 };
              }
              mat.onBeforeCompile = (shader: THREE.Shader) => {
                shader.uniforms.uSaturation = mat.userData.saturationUniform;
                shader.fragmentShader = "uniform float uSaturation;\n" + shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace(
                  "#include <color_fragment>",
                  `
                  #include <color_fragment>
                  // Real-time Texture Saturation adjustment
                  float luma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
                  diffuseColor.rgb = mix(vec3(luma), diffuseColor.rgb, uSaturation);
                  `
                );
              };
              mat.needsUpdate = true;
            }
          }
        });

        mg.add(model);

        // Bbox helper
        if (bboxHelperRef.current && sceneRef.current) {
          sceneRef.current.remove(bboxHelperRef.current);
        }
        const bHelper = new THREE.BoxHelper(model, 0x38bdf8);
        bHelper.visible = showBbox;
        sceneRef.current?.add(bHelper);
        bboxHelperRef.current = bHelper;

        // Apply Shading
        applyShadingMode(model, shadingMode);

        // Adjust camera target
        if (controlsRef.current && cameraRef.current) {
          controlsRef.current.target.set(0, 0.5, 0);
          cameraRef.current.position.set(1.4, 1.0, 1.8);
          controlsRef.current.update();
        }

        // Apply active lighting parameters
        applyLightRig(lightSettings, lightingPreset);

        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error("Failed to load GLTF model:", err);
        setIsLoading(false);
      }
    );
  }, [modelUrl]);

  // Apply Shading Mode
  const applyShadingMode = (group: THREE.Group, mode: ShadingMode) => {
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mode === "textured") {
          mesh.material = mesh.userData.origMaterial;
          const mat = mesh.material as any;
          if (mat) {
            if (mat.userData && mat.userData.saturationUniform) {
              mat.userData.saturationUniform.value = lightSettings.textureSaturation ?? 1.0;
            }
            if (mat.color && mesh.userData.baseColor) {
              const base = mesh.userData.baseColor.clone();
              const hsl = { h: 0, s: 0, l: 0 };
              base.getHSL(hsl);
              const sat = Math.max(0, Math.min(1, hsl.s * (lightSettings.textureSaturation ?? 1.0)));
              mat.color.setHSL(hsl.h, sat, hsl.l).multiplyScalar(lightSettings.textureBoost);
            }
          }
        } else if (mode === "clay") {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xd4d4d8,
            roughness: 0.35,
            metalness: 0.08,
          });
        } else if (mode === "wireframe") {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            wireframe: true,
          });
        } else if (mode === "pointcloud") {
          mesh.material = new THREE.PointsMaterial({
            color: 0x38bdf8,
            size: 0.015,
          });
        }
      }
    });
  };

  useEffect(() => {
    if (modelGroupRef.current) {
      applyShadingMode(modelGroupRef.current, shadingMode);
    }
  }, [shadingMode]);

  // Toggle Bounding Box Helper
  useEffect(() => {
    if (bboxHelperRef.current) {
      bboxHelperRef.current.visible = showBbox;
    }
  }, [showBbox]);

  // Camera presets
  const setCameraAngle = (view: "front" | "top" | "iso" | "side") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (view === "front") cam.position.set(0, 0.5, 2.0);
    else if (view === "top") cam.position.set(0, 2.2, 0.001);
    else if (view === "side") cam.position.set(2.0, 0.5, 0);
    else if (view === "iso") cam.position.set(1.4, 1.2, 1.8);
    ctrl.target.set(0, 0.5, 0);
    ctrl.update();
  };

  // Export Screenshot
  const takeSnapshot = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const dataUrl = renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${modelName.replace(/\s+/g, "_")}_3D_Render.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className={`relative w-full ${className || "h-[680px]"} bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
          <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-sky-400">Loading 3D Mesh Geometry...</span>
        </div>
      )}

      {/* Top Left Title & Metrics */}
      <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 z-10 flex flex-col gap-1 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-tight">{modelName}</h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          {vertices && <span>🔺 {vertices.toLocaleString()} verts</span>}
          {faces && <span>🔷 {faces.toLocaleString()} faces</span>}
          <span>📏 {bboxDimensions.x}×{bboxDimensions.y}×{bboxDimensions.z}m</span>
        </div>
      </div>

      {/* Top Right Studio & Lighting Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* Shading Mode */}
        <div className="flex bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs font-semibold shadow-lg">
          {(["textured", "clay", "wireframe"] as ShadingMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setShadingMode(mode)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                shadingMode === mode ? "bg-sky-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Lighting Presets Selector */}
        <div className="hidden sm:flex bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs font-semibold shadow-lg">
          {(
            [
              { id: "bright_studio", label: "Studio" },
              { id: "soft_showcase", label: "Showcase" },
              { id: "golden_sun", label: "Sunset" },
              { id: "cyber_neon", label: "Neon" },
            ] as { id: LightingPreset; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => selectPreset(item.id)}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                lightingPreset === item.id ? "bg-white/20 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Lighting Controls Panel Toggle Button */}
        <button
          onClick={() => setShowLightPanel(!showLightPanel)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md flex items-center gap-2 transition-all shadow-lg ${
            showLightPanel
              ? "bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20"
              : "bg-slate-900/90 hover:bg-slate-850 text-amber-300 border-amber-400/40 hover:border-amber-400"
          }`}
          title="Open Scene Lighting & Environment Controls"
        >
          <Sun className={`w-4 h-4 ${showLightPanel ? "text-slate-950" : "text-amber-400 animate-pulse"}`} />
          <span>Light Controls</span>
          <Sliders className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>

      {/* Floating Lighting Controls Studio Drawer */}
      {showLightPanel && (
        <div className="absolute top-16 right-4 w-84 sm:w-96 max-h-[580px] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/15 p-4 z-30 shadow-2xl flex flex-col gap-3.5 overflow-y-auto text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-sm">Scene Lighting Studio</h4>
            </div>
            <button
              onClick={() => setShowLightPanel(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lighting Presets</span>
            <div className="grid grid-cols-2 gap-1.5 font-medium">
              {[
                { id: "bright_studio", label: "🌟 Bright Studio", desc: "Clean & Ultra-lit" },
                { id: "soft_showcase", label: "💡 Soft Showcase", desc: "Apple diffuse 360°" },
                { id: "golden_sun", label: "☀️ Golden Sun", desc: "Warm sun & amber rim" },
                { id: "cyber_neon", label: "🟣 Cyber Neon", desc: "Cyan & magenta glow" },
                { id: "pure_albedo", label: "⚡ Pure Albedo", desc: "100% Unlit / No shadow" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPreset(p.id as LightingPreset)}
                  className={`px-2.5 py-2 rounded-xl text-left border transition-all ${
                    lightingPreset === p.id
                      ? "bg-amber-400/20 border-amber-400/60 text-amber-300 font-bold"
                      : "bg-slate-800/60 border-white/5 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs">{p.label}</div>
                  <div className="text-[10px] text-slate-400">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
            {/* Exposure / Overall Brightness */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Overall Brightness (Exposure)
                </span>
                <span className="font-mono text-amber-300 font-bold">{lightSettings.exposure.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.05"
                value={lightSettings.exposure}
                onChange={(e) => setLightSettings({ ...lightSettings, exposure: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Ambient / Wrap-around Fill */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-sky-400" /> Ambient / Wrap-around Fill
                </span>
                <span className="font-mono text-sky-300 font-bold">{lightSettings.ambientIntensity.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.5"
                step="0.05"
                value={lightSettings.ambientIntensity}
                onChange={(e) => setLightSettings({ ...lightSettings, ambientIntensity: parseFloat(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Key Spotlight Intensity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Key Direct Sun Intensity
                </span>
                <span className="font-mono text-yellow-300 font-bold">{lightSettings.keyIntensity.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.5"
                step="0.1"
                value={lightSettings.keyIntensity}
                onChange={(e) => setLightSettings({ ...lightSettings, keyIntensity: parseFloat(e.target.value) })}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* Edge / Rim Light Intensity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Rim / Edge Silhouette Light
                </span>
                <span className="font-mono text-indigo-300 font-bold">{lightSettings.rimIntensity.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={lightSettings.rimIntensity}
                onChange={(e) => setLightSettings({ ...lightSettings, rimIntensity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* Light Orbit Angle (Azimuth) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Light Orbit Direction (Azimuth)
                </span>
                <span className="font-mono text-emerald-300 font-bold">{lightSettings.lightAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={lightSettings.lightAngle}
                onChange={(e) => setLightSettings({ ...lightSettings, lightAngle: parseInt(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Sun Elevation Angle */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-teal-400" /> Sun Elevation Angle
                </span>
                <span className="font-mono text-teal-300 font-bold">{lightSettings.lightElevation}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                step="5"
                value={lightSettings.lightElevation}
                onChange={(e) => setLightSettings({ ...lightSettings, lightElevation: parseInt(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            {/* Texture Color Gain / Boost */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-rose-400" /> Texture Color Boost
                </span>
                <span className="font-mono text-rose-300 font-bold">{lightSettings.textureBoost.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.2"
                step="0.05"
                value={lightSettings.textureBoost}
                onChange={(e) => setLightSettings({ ...lightSettings, textureBoost: parseFloat(e.target.value) })}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            {/* Texture Saturation Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-fuchsia-400" /> Texture Saturation
                </span>
                <span className="font-mono text-fuchsia-300 font-bold">{lightSettings.textureSaturation.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={lightSettings.textureSaturation}
                onChange={(e) => setLightSettings({ ...lightSettings, textureSaturation: parseFloat(e.target.value) })}
                className="w-full accent-fuchsia-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono px-0.5">
                <span>0.0x (Grayscale)</span>
                <span>1.0x (Natural)</span>
                <span>2.5x (Vivid)</span>
              </div>
            </div>
          </div>

          {/* Background Theme Selector */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Backdrop Environment</span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
              {[
                { id: "slate", label: "Dark Slate" },
                { id: "charcoal", label: "Charcoal" },
                { id: "pure_black", label: "OLED Black" },
                { id: "light_studio", label: "White Studio" },
                { id: "warm_sunset", label: "Sunset Dusk" },
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setLightSettings({ ...lightSettings, bgTheme: bg.id as BgTheme })}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                    lightSettings.bgTheme === bg.id
                      ? "bg-sky-500 text-slate-950 font-bold border-sky-400"
                      : "bg-slate-800/80 border-white/5 text-slate-300 hover:border-white/20"
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow & Reset Row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={lightSettings.castShadows}
                onChange={(e) => setLightSettings({ ...lightSettings, castShadows: e.target.checked })}
                className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
              />
              <span>Cast Soft Shadows</span>
            </label>

            <button
              onClick={() => {
                selectPreset("bright_studio");
              }}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 underline"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>
        </div>
      )}

      {/* Bottom Center View Angle Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-10 flex items-center gap-1.5 text-xs font-semibold text-slate-400 shadow-lg">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg hover:text-white transition-all ${autoRotate ? "text-sky-400 bg-sky-500/20" : ""}`}
          title="Toggle Turntable"
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <span className="text-white/20">|</span>
        <button onClick={() => setCameraAngle("front")} className="px-2 py-1 rounded hover:bg-white/10">Front</button>
        <button onClick={() => setCameraAngle("iso")} className="px-2 py-1 rounded hover:bg-white/10">3D Iso</button>
        <button onClick={() => setCameraAngle("side")} className="px-2 py-1 rounded hover:bg-white/10">Side</button>
        <button onClick={() => setCameraAngle("top")} className="px-2 py-1 rounded hover:bg-white/10">Top</button>
        <span className="text-white/20">|</span>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded-lg hover:text-white ${showGrid ? "text-sky-400" : ""}`}
          title="Toggle Floor Grid"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowBbox(!showBbox)}
          className={`p-1.5 rounded-lg hover:text-white ${showBbox ? "text-sky-400" : ""}`}
          title="Toggle Bounding Box"
        >
          <Box className="w-4 h-4" />
        </button>
        <button
          onClick={takeSnapshot}
          className="p-1.5 rounded-lg hover:text-sky-400"
          title="Take High-Res Snapshot"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Right Download Action Buttons */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
        {plyUrl && (
          <a
            href={plyUrl}
            download={`${modelName}_splat.ply`}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-sky-400/30 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Splat (.ply)
          </a>
        )}

        {modelUrl && (
          <a
            href={modelUrl}
            download={`${modelName}.glb`}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 hover:opacity-95 shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download Mesh (.glb)
          </a>
        )}
      </div>
    </div>
  );
}
