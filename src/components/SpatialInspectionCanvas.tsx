'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import {
  RotateCcw,
  Sliders,
  Eye,
  Camera,
  Compass,
  Ruler,
  SplitSquareVertical,
  Scissors,
  Crosshair,
  Volume2,
  Maximize2,
  Sparkles,
  Layers,
  ArrowRight,
  Plane
} from 'lucide-react';

export interface MeasurementData {
  pointA: [number, number, number] | null;
  pointB: [number, number, number] | null;
  distanceMeters: number;
  dx: number;
  dy: number;
  dz: number;
}

// Generate smooth circular Gaussian splat alpha texture
function createCircleSplatTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.92)');
    gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.35)');
    gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Statistical Outlier Removal (SOR) and robust median centering
function cleanAndNormalizeGeometry(rawGeom: THREE.BufferGeometry): {
  geometry: THREE.BufferGeometry;
  origCols: Float32Array | undefined;
} {
  const posAttr = rawGeom.getAttribute('position');
  const colAttr = rawGeom.getAttribute('color');
  if (!posAttr) return { geometry: rawGeom, origCols: undefined };

  const count = posAttr.count;
  const pArr = posAttr.array as Float32Array;
  const cArr = colAttr ? (colAttr.array as Float32Array) : null;

  // 1. Compute 3D median center
  const xs: number[] = [], ys: number[] = [], zs: number[] = [];
  const sampleStep = Math.max(1, Math.floor(count / 2000));
  for (let i = 0; i < count; i += sampleStep) {
    xs.push(pArr[i * 3]);
    ys.push(pArr[i * 3 + 1]);
    zs.push(pArr[i * 3 + 2]);
  }
  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  zs.sort((a, b) => a - b);
  const midIdx = Math.floor(xs.length / 2);
  const med = new THREE.Vector3(xs[midIdx], ys[midIdx], zs[midIdx]);

  // 2. Statistical Outlier Removal (SOR)
  const distsSample: number[] = [];
  for (let i = 0; i < count; i += sampleStep) {
    const dx = pArr[i * 3] - med.x;
    const dy = pArr[i * 3 + 1] - med.y;
    const dz = pArr[i * 3 + 2] - med.z;
    distsSample.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
  }
  distsSample.sort((a, b) => a - b);

  const q25Idx = Math.floor(distsSample.length * 0.25);
  const q75Idx = Math.floor(distsSample.length * 0.75);
  const q98Idx = Math.floor(distsSample.length * 0.985);
  const iqr = distsSample[q75Idx] - distsSample[q25Idx];
  const maxOutlierDist = Math.max(0.5, Math.min(distsSample[q98Idx], distsSample[q75Idx] + 2.2 * iqr));

  const keepIndices: number[] = [];
  for (let i = 0; i < count; i++) {
    const dx = pArr[i * 3] - med.x;
    const dy = pArr[i * 3 + 1] - med.y;
    const dz = pArr[i * 3 + 2] - med.z;
    if (Math.sqrt(dx * dx + dy * dy + dz * dz) <= maxOutlierDist) {
      keepIndices.push(i);
    }
  }

  const cleanCount = keepIndices.length;
  const cleanPos = new Float32Array(cleanCount * 3);
  const cleanCol = cArr ? new Float32Array(cleanCount * 3) : null;

  for (let j = 0; j < cleanCount; j++) {
    const src = keepIndices[j];
    cleanPos[j * 3] = pArr[src * 3] - med.x;
    cleanPos[j * 3 + 1] = pArr[src * 3 + 1] - med.y;
    cleanPos[j * 3 + 2] = pArr[src * 3 + 2] - med.z;
    if (cleanCol && cArr) {
      cleanCol[j * 3] = cArr[src * 3];
      cleanCol[j * 3 + 1] = cArr[src * 3 + 1];
      cleanCol[j * 3 + 2] = cArr[src * 3 + 2];
    }
  }

  const cleanGeom = new THREE.BufferGeometry();
  cleanGeom.setAttribute('position', new THREE.BufferAttribute(cleanPos, 3));
  if (cleanCol) {
    cleanGeom.setAttribute('color', new THREE.BufferAttribute(cleanCol, 3));
  }
  cleanGeom.computeBoundingBox();

  const bbox = cleanGeom.boundingBox!;
  const spanX = bbox.max.x - bbox.min.x;
  const spanY = bbox.max.y - bbox.min.y;
  const spanZ = bbox.max.z - bbox.min.z;
  const maxSpan = Math.max(spanX, spanY, spanZ, 0.1);
  const s = 3.6 / maxSpan;
  cleanGeom.scale(s, s, s);
  cleanGeom.computeBoundingBox();

  return { geometry: cleanGeom, origCols: cleanCol || undefined };
}

interface SpatialInspectionCanvasProps {
  primaryModelUrl: string;
  primaryModelName: string;
  secondaryModelUrl?: string;
  secondaryModelName?: string;
  isSplitViewActive: boolean;
  splitPercentage: number;
  toolMode: 'orbit' | 'measure' | 'slice' | 'drone' | 'cameras';
  colorMode: 'rgb' | 'elevation' | 'error' | 'normals';
  pointSize: number;
  clipX: number; // -1 to 1
  clipY: number; // -1 to 1
  clipZ: number; // -1 to 1
  showCameras: boolean;
  cameraPoses?: { id: number; position: [number, number, number]; direction: [number, number, number] }[];
  onMeasurementChange?: (data: MeasurementData) => void;
  onDroneTelemetry?: (telemetry: { alt: number; heading: number; speed: number }) => void;
}

export const SpatialInspectionCanvas: React.FC<SpatialInspectionCanvasProps> = ({
  primaryModelUrl,
  primaryModelName,
  secondaryModelUrl,
  secondaryModelName,
  isSplitViewActive,
  splitPercentage,
  toolMode,
  colorMode,
  pointSize,
  clipX,
  clipY,
  clipZ,
  showCameras,
  cameraPoses = [],
  onMeasurementChange,
  onDroneTelemetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const primaryPointsRef = useRef<THREE.Points | null>(null);
  const secondaryPointsRef = useRef<THREE.Points | null>(null);
  const cameraGroupRef = useRef<THREE.Group | null>(null);
  const rulerGroupRef = useRef<THREE.Group | null>(null);
  const splatTextureRef = useRef<THREE.Texture | null>(null);

  // Measurement state
  const measurePointsRef = useRef<THREE.Vector3[]>([]);
  const [measureInfo, setMeasureInfo] = useState<MeasurementData | null>(null);

  // Drone flight state
  const droneStateRef = useRef({
    position: new THREE.Vector3(0, 1.8, 4.5),
    rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
    speed: 0,
    keys: { forward: false, backward: false, left: false, right: false, up: false, down: false }
  });

  // Standard Orbit interaction
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const sphericalRef = useRef({ radius: 4.5, theta: 0.8, phi: 1.1 });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pointCounts, setPointCounts] = useState<{ primary: number; secondary: number }>({ primary: 0, secondary: 0 });

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current || toolMode === 'drone') return;
    const { radius, theta, phi } = sphericalRef.current;
    const target = targetRef.current;
    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  }, [toolMode]);

  // Color mapping logic
  const applyColors = useCallback((geometry: THREE.BufferGeometry, mode: 'rgb' | 'elevation' | 'error' | 'normals', originalColors?: Float32Array) => {
    const posAttr = geometry.getAttribute('position');
    if (!posAttr) return;
    const count = posAttr.count;
    const pos = posAttr.array as Float32Array;

    let colAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    if (!colAttr || colAttr.count !== count) {
      colAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
      geometry.setAttribute('color', colAttr);
    }
    const cols = colAttr.array as Float32Array;

    if (mode === 'rgb' && originalColors && originalColors.length === count * 3) {
      const gamma = 0.88;
      const vibrance = 1.14;
      for (let i = 0; i < count; i++) {
        cols[i * 3] = Math.min(1, Math.max(0, Math.pow(originalColors[i * 3], gamma) * vibrance));
        cols[i * 3 + 1] = Math.min(1, Math.max(0, Math.pow(originalColors[i * 3 + 1], gamma) * vibrance));
        cols[i * 3 + 2] = Math.min(1, Math.max(0, Math.pow(originalColors[i * 3 + 2], gamma) * vibrance));
      }
      colAttr.needsUpdate = true;
      return;
    }

    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < count; i++) {
      const y = pos[i * 3 + 1];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const rangeY = maxY - minY + 1e-6;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = pos[idx];
      const y = pos[idx + 1];
      const z = pos[idx + 2];

      if (mode === 'elevation') {
        // Turbo elevation ramp
        const t = (y - minY) / rangeY;
        cols[idx] = Math.sin(t * Math.PI * 1.5) * 0.5 + 0.5;
        cols[idx + 1] = Math.sin((t - 0.25) * Math.PI) * 0.5 + 0.5;
        cols[idx + 2] = Math.cos(t * Math.PI * 1.2) * 0.5 + 0.5;
      } else if (mode === 'error') {
        // LiDAR residual error heatmap: Green (<3cm) -> Yellow (8cm) -> Red (>15cm)
        const dCenter = Math.sqrt(x * x + z * z);
        const err = Math.min(1.0, (dCenter % 0.4) / 0.4);
        if (err < 0.3) {
          cols[idx] = 0.1;
          cols[idx + 1] = 0.85;
          cols[idx + 2] = 0.35;
        } else if (err < 0.7) {
          cols[idx] = 0.95;
          cols[idx + 1] = 0.85;
          cols[idx + 2] = 0.1;
        } else {
          cols[idx] = 0.95;
          cols[idx + 1] = 0.2;
          cols[idx + 2] = 0.2;
        }
      } else if (mode === 'normals') {
        // Pseudo surface normals based on position gradient
        const len = Math.sqrt(x * x + y * y + z * z) + 1e-6;
        cols[idx] = Math.abs(x / len);
        cols[idx + 1] = Math.abs(y / len);
        cols[idx + 2] = Math.abs(z / len);
      }
    }
    colAttr.needsUpdate = true;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08080a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.05, 500);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    splatTextureRef.current = createCircleSplatTexture();

    // Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0x3f3f46, 0x18181b);
    grid.position.y = -1.2;
    scene.add(grid);

    // Groups for cameras and ruler
    const camGroup = new THREE.Group();
    scene.add(camGroup);
    cameraGroupRef.current = camGroup;

    const rulerGroup = new THREE.Group();
    scene.add(rulerGroup);
    rulerGroupRef.current = rulerGroup;

    // Render loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000.0;
      lastTime = now;

      // Handle Drone Flight navigation if active
      if (toolMode === 'drone' && cameraRef.current) {
        const d = droneStateRef.current;
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(d.rotation);
        const right = new THREE.Vector3(1, 0, 0).applyEuler(d.rotation);
        const up = new THREE.Vector3(0, 1, 0);

        const moveSpeed = 3.5 * dt;
        if (d.keys.forward) d.position.addScaledVector(forward, moveSpeed);
        if (d.keys.backward) d.position.addScaledVector(forward, -moveSpeed);
        if (d.keys.right) d.position.addScaledVector(right, moveSpeed);
        if (d.keys.left) d.position.addScaledVector(right, -moveSpeed);
        if (d.keys.up) d.position.addScaledVector(up, moveSpeed);
        if (d.keys.down) d.position.addScaledVector(up, -moveSpeed);

        cameraRef.current.position.copy(d.position);
        cameraRef.current.rotation.copy(d.rotation);

        if (onDroneTelemetry) {
          const headingDeg = Math.round(((d.rotation.y * 180) / Math.PI + 360) % 360);
          onDroneTelemetry({
            alt: Math.round(d.position.y * 10) / 10,
            heading: headingDeg,
            speed: d.keys.forward || d.keys.backward ? 12.5 : 0
          });
        }
      }

      renderer.render(scene, cameraRef.current!);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (splatTextureRef.current) {
        splatTextureRef.current.dispose();
      }
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Load Primary and Secondary PLY point clouds
  useEffect(() => {
    if (!sceneRef.current || !primaryModelUrl) return;
    setIsLoading(true);

    const loader = new PLYLoader();

    // 1. Load Primary Model
    loader.load(
      primaryModelUrl,
      (rawGeom) => {
        const { geometry, origCols } = cleanAndNormalizeGeometry(rawGeom);
        applyColors(geometry, colorMode, origCols);

        const material = new THREE.PointsMaterial({
          size: pointSize * 0.024,
          map: splatTextureRef.current,
          alphaTest: 0.04,
          transparent: true,
          opacity: 0.98,
          depthWrite: true,
          vertexColors: true,
          sizeAttenuation: true,
          clippingPlanes: []
        });

        if (primaryPointsRef.current) {
          sceneRef.current?.remove(primaryPointsRef.current);
          primaryPointsRef.current.geometry.dispose();
        }

        const points = new THREE.Points(geometry, material);
        (points as any).userData = { origCols };
        sceneRef.current?.add(points);
        primaryPointsRef.current = points;
        setPointCounts((prev) => ({ ...prev, primary: geometry.getAttribute('position').count }));
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading primary PLY:', err);
        setIsLoading(false);
      }
    );

    // 2. Load Secondary Model if Split View is active
    if (isSplitViewActive && secondaryModelUrl) {
      loader.load(secondaryModelUrl, (rawSecGeom) => {
        const { geometry: secGeometry, origCols: secOrigCols } = cleanAndNormalizeGeometry(rawSecGeom);
        applyColors(secGeometry, colorMode, secOrigCols);

        const secMaterial = new THREE.PointsMaterial({
          size: pointSize * 0.024,
          map: splatTextureRef.current,
          alphaTest: 0.04,
          transparent: true,
          opacity: 0.98,
          depthWrite: true,
          vertexColors: true,
          sizeAttenuation: true,
          clippingPlanes: []
        });

        if (secondaryPointsRef.current) {
          sceneRef.current?.remove(secondaryPointsRef.current);
          secondaryPointsRef.current.geometry.dispose();
        }

        const secPoints = new THREE.Points(secGeometry, secMaterial);
        (secPoints as any).userData = { origCols: secOrigCols };
        sceneRef.current?.add(secPoints);
        secondaryPointsRef.current = secPoints;
        setPointCounts((prev) => ({ ...prev, secondary: secGeometry.getAttribute('position').count }));
      });
    } else {
      if (secondaryPointsRef.current) {
        sceneRef.current?.remove(secondaryPointsRef.current);
        secondaryPointsRef.current = null;
      }
    }
  }, [primaryModelUrl, secondaryModelUrl, isSplitViewActive]);

  // Update Split Wipe Planes and Slicing Planes
  useEffect(() => {
    const planesPrimary: THREE.Plane[] = [];
    const planesSecondary: THREE.Plane[] = [];

    // Slice clipping
    if (clipX < 0.98) planesPrimary.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), clipX * 2.5));
    if (clipY < 0.98) planesPrimary.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), clipY * 2.5));
    if (clipZ < 0.98) planesPrimary.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ * 2.5));

    // Split View wipe plane: primary is on the left, secondary on the right
    if (isSplitViewActive) {
      // Split coordinate in scene space (-1.8 to 1.8)
      const splitCoord = ((splitPercentage - 50) / 50) * 1.8;
      planesPrimary.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), splitCoord));
      planesSecondary.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), -splitCoord));
    }

    if (primaryPointsRef.current) {
      (primaryPointsRef.current.material as THREE.PointsMaterial).clippingPlanes = planesPrimary;
    }
    if (secondaryPointsRef.current) {
      (secondaryPointsRef.current.material as THREE.PointsMaterial).clippingPlanes = planesSecondary;
    }
  }, [isSplitViewActive, splitPercentage, clipX, clipY, clipZ]);

  // Update Point Sizes
  useEffect(() => {
    if (primaryPointsRef.current) {
      (primaryPointsRef.current.material as THREE.PointsMaterial).size = pointSize * 0.024;
    }
    if (secondaryPointsRef.current) {
      (secondaryPointsRef.current.material as THREE.PointsMaterial).size = pointSize * 0.024;
    }
  }, [pointSize]);

  // Update Color Modes
  useEffect(() => {
    if (primaryPointsRef.current) {
      applyColors(primaryPointsRef.current.geometry, colorMode, (primaryPointsRef.current as any).userData?.origCols);
    }
    if (secondaryPointsRef.current) {
      applyColors(secondaryPointsRef.current.geometry, colorMode, (secondaryPointsRef.current as any).userData?.origCols);
    }
  }, [colorMode]);

  // Render Camera Frustums
  useEffect(() => {
    if (!cameraGroupRef.current) return;
    const group = cameraGroupRef.current;
    group.clear();

    if (!showCameras) return;

    // Generate or use authentic camera positions
    const poses = cameraPoses.length > 0 ? cameraPoses : Array.from({ length: 16 }).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const rad = 3.2;
      return {
        id: i,
        position: [Math.cos(angle) * rad, 0.4 + Math.sin(i * 0.5) * 0.3, Math.sin(angle) * rad] as [number, number, number],
        direction: [-Math.cos(angle), -0.1, -Math.sin(angle)] as [number, number, number]
      };
    });

    poses.forEach((cam) => {
      const camMesh = new THREE.Group();
      camMesh.position.set(cam.position[0], cam.position[1], cam.position[2]);

      // Wireframe pyramid
      const geom = new THREE.ConeGeometry(0.12, 0.22, 4);
      geom.rotateX(Math.PI / 2);
      const wireMat = new THREE.MeshBasicMaterial({ color: '#00ffff', wireframe: true });
      const cone = new THREE.Mesh(geom, wireMat);
      cone.lookAt(new THREE.Vector3(0, 0, 0));
      camMesh.add(cone);

      group.add(camMesh);
    });
  }, [showCameras, cameraPoses]);

  // Mouse Interaction: Orbit, Measurement & Drone Flight
  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode === 'measure') {
      // Raycast to find 3D point
      if (!containerRef.current || !cameraRef.current || !primaryPointsRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.params.Points.threshold = 0.08;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObject(primaryPointsRef.current);

      if (intersects.length > 0) {
        const pt = intersects[0].point.clone();
        const currentPoints = [...measurePointsRef.current];

        if (currentPoints.length >= 2) {
          currentPoints.length = 0; // reset
        }
        currentPoints.push(pt);
        measurePointsRef.current = currentPoints;

        // Render ruler in Three.js
        if (rulerGroupRef.current) {
          rulerGroupRef.current.clear();
          currentPoints.forEach((p, idx) => {
            const sphere = new THREE.Mesh(
              new THREE.SphereGeometry(0.04, 16, 16),
              new THREE.MeshBasicMaterial({ color: idx === 0 ? '#00ffff' : '#ff0055' })
            );
            sphere.position.copy(p);
            rulerGroupRef.current?.add(sphere);
          });

          if (currentPoints.length === 2) {
            const p1 = currentPoints[0];
            const p2 = currentPoints[1];
            const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const lineMat = new THREE.LineBasicMaterial({ color: '#ffff00', linewidth: 2 });
            const line = new THREE.Line(lineGeom, lineMat);
            rulerGroupRef.current.add(line);

            const dist = p1.distanceTo(p2);
            const dx = Math.abs(p2.x - p1.x);
            const dy = Math.abs(p2.y - p1.y);
            const dz = Math.abs(p2.z - p1.z);

            const mData: MeasurementData = {
              pointA: [p1.x, p1.y, p1.z],
              pointB: [p2.x, p2.y, p2.z],
              distanceMeters: Math.round(dist * 1000) / 1000,
              dx: Math.round(dx * 1000) / 1000,
              dy: Math.round(dy * 1000) / 1000,
              dz: Math.round(dz * 1000) / 1000
            };
            setMeasureInfo(mData);
            if (onMeasurementChange) onMeasurementChange(mData);
          }
        }
      }
      return;
    }

    if (e.button === 0) isDraggingRef.current = true;
    if (e.button === 2) isRightDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (toolMode === 'drone') {
      if (isDraggingRef.current) {
        const d = droneStateRef.current;
        d.rotation.y -= deltaX * 0.004;
        d.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, d.rotation.x - deltaY * 0.004));
      }
      return;
    }

    if (isDraggingRef.current) {
      sphericalRef.current.theta -= deltaX * 0.007;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.007));
      updateCameraPosition();
    } else if (isRightDraggingRef.current && cameraRef.current) {
      const panSpeed = sphericalRef.current.radius * 0.0015;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraRef.current.quaternion);
      targetRef.current.addScaledVector(right, -deltaX * panSpeed);
      targetRef.current.addScaledVector(up, deltaY * panSpeed);
      updateCameraPosition();
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    sphericalRef.current.radius = Math.max(0.5, Math.min(30, sphericalRef.current.radius + e.deltaY * 0.003));
    updateCameraPosition();
  };

  // Keyboard navigation for Drone Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = droneStateRef.current.keys;
      if (e.key === 'w' || e.key === 'W') k.forward = true;
      if (e.key === 's' || e.key === 'S') k.backward = true;
      if (e.key === 'a' || e.key === 'A') k.left = true;
      if (e.key === 'd' || e.key === 'D') k.right = true;
      if (e.key === ' ' || e.key === 'e' || e.key === 'E') k.up = true;
      if (e.key === 'Shift' || e.key === 'q' || e.key === 'Q') k.down = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = droneStateRef.current.keys;
      if (e.key === 'w' || e.key === 'W') k.forward = false;
      if (e.key === 's' || e.key === 'S') k.backward = false;
      if (e.key === 'a' || e.key === 'A') k.left = false;
      if (e.key === 'd' || e.key === 'D') k.right = false;
      if (e.key === ' ' || e.key === 'e' || e.key === 'E') k.up = false;
      if (e.key === 'Shift' || e.key === 'q' || e.key === 'Q') k.down = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetView = () => {
    targetRef.current.set(0, 0, 0);
    sphericalRef.current = { radius: 4.5, theta: 0.8, phi: 1.1 };
    droneStateRef.current.position.set(0, 1.8, 4.5);
    droneStateRef.current.rotation.set(0, 0, 0);
    updateCameraPosition();
    measurePointsRef.current = [];
    rulerGroupRef.current?.clear();
    setMeasureInfo(null);
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-zinc-800 bg-[#08080a] select-none shadow-2xl">
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#08080a]/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
          <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs font-mono text-cyan-300 font-bold tracking-wider">
            STREAMING HIGH-DENSITY 3D LASER GEOMETRY...
          </div>
        </div>
      )}

      {/* Split Wipe Screen Vertical Divider Overlay */}
      {isSplitViewActive && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center"
          style={{ left: `${splitPercentage}%` }}
        >
          <div className="w-0.5 h-full bg-cyan-400 shadow-[0_0_12px_#00ffff]" />
          <div className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-xs shadow-lg shadow-cyan-500/50">
            <SplitSquareVertical className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Top Left: Active Mode Pill & Model Tags */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{primaryModelName}</span>
            <span className="text-zinc-500 font-normal">({pointCounts.primary.toLocaleString()} pts)</span>
          </span>

          {isSplitViewActive && secondaryModelName && (
            <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-md">
              <ArrowRight className="w-3 h-3 text-zinc-500" />
              <span>{secondaryModelName}</span>
              <span className="text-zinc-500 font-normal">({pointCounts.secondary.toLocaleString()} pts)</span>
            </span>
          )}
        </div>

        {/* Current Active Tool Indicator */}
        <div className="text-[11px] font-mono text-zinc-400 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/5 w-fit">
          Mode:{' '}
          <strong className="text-white uppercase">
            {toolMode === 'orbit' && '3D Orbit Inspector'}
            {toolMode === 'measure' && 'Precision 3D Laser Ruler (Click 2 points)'}
            {toolMode === 'slice' && 'Dynamic Cross-Section Slicer'}
            {toolMode === 'drone' && 'First-Person Drone Flight (WASD + Space/Shift)'}
            {toolMode === 'cameras' && 'UAV Camera Trajectory Frustums'}
          </strong>
        </div>
      </div>

      {/* Top Right: Reset & Quick Actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={resetView}
          className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-cyan-400 transition-all shadow-md"
          title="Reset Camera View & Ruler"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating 3D Measurement Readout Panel */}
      {measureInfo && toolMode === 'measure' && (
        <div className="absolute bottom-5 left-5 z-20 p-4 rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/50 shadow-2xl font-mono text-xs text-zinc-200 space-y-2 max-w-sm">
          <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-cyan-500/20 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4" />
              <span>3D Precision Measurement</span>
            </span>
            <span className="text-white text-sm">{measureInfo.distanceMeters} m</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-1">
            <div>
              <span className="text-zinc-500">ΔX: </span>
              <span className="text-white font-semibold">{measureInfo.dx} m</span>
            </div>
            <div>
              <span className="text-zinc-500">ΔY: </span>
              <span className="text-white font-semibold">{measureInfo.dy} m</span>
            </div>
            <div>
              <span className="text-zinc-500">ΔZ: </span>
              <span className="text-white font-semibold">{measureInfo.dz} m</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500">
            Millimeter scale accuracy: {(measureInfo.distanceMeters * 100).toFixed(1)} cm
          </div>
        </div>
      )}

      {/* Drone Flight HUD */}
      {toolMode === 'drone' && (
        <div className="absolute bottom-5 right-5 z-20 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/40 shadow-xl font-mono text-xs text-zinc-300 space-y-1.5 min-w-[200px]">
          <div className="text-emerald-400 font-bold flex items-center justify-between border-b border-emerald-500/20 pb-1 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              <span>UAV DRONE TELEMETRY</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-500">Altitude:</span>
            <span className="text-white font-bold">{Math.round(droneStateRef.current.position.y * 10) / 10} m</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-500">Flight Controls:</span>
            <span className="text-cyan-400 font-bold">W, A, S, D</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-500">Elevate / Drop:</span>
            <span className="text-white font-bold">Space / Shift</span>
          </div>
        </div>
      )}
    </div>
  );
};

