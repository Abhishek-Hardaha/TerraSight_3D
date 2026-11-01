import { SceneBenchmarkData, ModelInfo, SparsityEvaluationRecord, ModelId } from '@/types/benchmark';
import rawBenchmarkManifest from '../../public/data/benchmark_manifest.json';
import rawSparsityManifest from '../../public/data/sparsity_manifest.json';

export const MODELS_INFO: Record<string, ModelInfo> = {
  ground_truth: {
    id: 'ground_truth',
    name: 'Actual Ground Truth (LiDAR)',
    tagline: 'Faro Focus X 330 Terrestrial Laser Scan',
    architecture: 'Verified Millimeter LiDAR Benchmark (0.1mm Accuracy)',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    isGroundTruth: true
  },
  vggt_omega: {
    id: 'vggt_omega',
    name: 'VGGT-Ω (Visual Geometry Grounded Transformer)',
    tagline: 'Multi-view Feed-forward Foundation Model',
    architecture: 'Meta VGGT-Omega (1B Params, Cross-View Attention)',
    badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
  },
  dust3r: {
    id: 'dust3r',
    name: 'DUSt3R',
    tagline: 'Geometric 3D Vision Made Easy',
    architecture: 'Naver Labs CroCo-ViT Large (512px DPT Decoder)',
    badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
  },
  depth_anything_3: {
    id: 'depth_anything_3',
    name: 'Depth Anything 3',
    tagline: 'Foundation Monocular & Multi-Frame Depth',
    architecture: 'DINOv2 + Nested Depth Decoder (Unprojected 3D)',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-400'
  },
  colmap_sfm: {
    id: 'colmap_sfm',
    name: 'COLMAP + SfM',
    tagline: 'Traditional Structure-from-Motion & Multi-View Stereo',
    architecture: 'SIFT Feature Extraction + Bundle Adjustment',
    badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-400'
  }
};

export const BENCHMARK_SCENES: SceneBenchmarkData[] = [
  {
    id: 'terrasky_a_0002',
    name: 'TerraSky3D: Aerial Flight 01 (Medieval Castle Citadel)',
    dataset: 'TerraSky3D Large-Scale 4K Aerial Multi-View Benchmark (CVPR 3DMV)',
    scene_type: 'outdoor',
    description: 'Circular UAV drone orbit around medieval fortified castle ramparts, stone bastion towers, and central courtyard under natural diffuse sunlight.',
    sensor_type: 'DJI 4K Drone Camera (3840x2160) & APD-MVS Ground Truth Depth',
    num_input_images: 186,
    gt_points: 235787,
    gt_mesh_url: '/data/scenes/terrasky_a_0002_gt.ply',
    preview_image: '/data/images/terrasky_a_0002_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0002_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0002_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0002_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0002_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0002_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 235787,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0002_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0002_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0002_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0002_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0002_vggt_error.png',
          max_error_m: 3.133,
          mean_error_m: 0.6224
        },
        metrics: {
          rmse_m: 2.0887,
          chamfer_distance_m: 0.5543,
          mae_m: 0.6224,
          accuracy_cm: 40.16,
          completeness_pct: 16.66,
          f_score: 0.2355,
          point_count: 206054,
          inference_time_s: 3.73,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0002_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0002_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0002_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0002_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0002_dust3r_error.png',
          max_error_m: 1.6742,
          mean_error_m: 0.64
        },
        metrics: {
          rmse_m: 1.1161,
          chamfer_distance_m: 0.4788,
          mae_m: 0.64,
          accuracy_cm: 9.33,
          completeness_pct: 14.94,
          f_score: 0.1149,
          point_count: 181503,
          inference_time_s: 9.25,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0002_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0002_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0002_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0002_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0002_da3_error.png',
          max_error_m: 2.1607,
          mean_error_m: 0.7545
        },
        metrics: {
          rmse_m: 1.4405,
          chamfer_distance_m: 0.5544,
          mae_m: 0.7545,
          accuracy_cm: 14.11,
          completeness_pct: 16.94,
          f_score: 0.154,
          point_count: 183254,
          inference_time_s: 2.39,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0002_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0002_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0002_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0002_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0002_colmap_error.png',
          max_error_m: 0.3518,
          mean_error_m: 0.0666
        },
        metrics: {
          rmse_m: 0.2345,
          chamfer_distance_m: 0.1527,
          mae_m: 0.0666,
          accuracy_cm: 86.3,
          completeness_pct: 69.24,
          f_score: 0.7683,
          point_count: 111361,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'terrasky_a_0001',
    name: 'TerraSky3D: Aerial Flight 02 (Historic Cathedral & Spire)',
    dataset: 'TerraSky3D Large-Scale 4K Aerial Multi-View Benchmark (CVPR 3DMV)',
    scene_type: 'outdoor',
    description: 'High-altitude UAV circular flight around European Gothic cathedral spire with high-frequency masonry details and steep oblique angles.',
    sensor_type: 'DJI 4K Drone Camera (3840x2160) & APD-MVS Ground Truth Depth',
    num_input_images: 249,
    gt_points: 168868,
    gt_mesh_url: '/data/scenes/terrasky_a_0001_gt.ply',
    preview_image: '/data/images/terrasky_a_0001_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0001_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0001_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0001_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0001_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0001_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 168868,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0001_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0001_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0001_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0001_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0001_vggt_error.png',
          max_error_m: 5.9266,
          mean_error_m: 1.8806
        },
        metrics: {
          rmse_m: 3.9511,
          chamfer_distance_m: 1.8235,
          mae_m: 1.8806,
          accuracy_cm: 5.76,
          completeness_pct: 2.02,
          f_score: 0.03,
          point_count: 192292,
          inference_time_s: 3.69,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0001_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0001_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0001_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0001_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0001_dust3r_error.png',
          max_error_m: 5.1604,
          mean_error_m: 2.0352
        },
        metrics: {
          rmse_m: 3.4403,
          chamfer_distance_m: 2.9747,
          mae_m: 2.0352,
          accuracy_cm: 0.23,
          completeness_pct: 0.16,
          f_score: 0.0019,
          point_count: 207526,
          inference_time_s: 9.14,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0001_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0001_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0001_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0001_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0001_da3_error.png',
          max_error_m: 5.447,
          mean_error_m: 1.7026
        },
        metrics: {
          rmse_m: 3.6313,
          chamfer_distance_m: 1.7542,
          mae_m: 1.7026,
          accuracy_cm: 0.96,
          completeness_pct: 0.42,
          f_score: 0.0058,
          point_count: 196260,
          inference_time_s: 2.36,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0001_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0001_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0001_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0001_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0001_colmap_error.png',
          max_error_m: 0.5101,
          mean_error_m: 0.1413
        },
        metrics: {
          rmse_m: 0.3401,
          chamfer_distance_m: 0.2972,
          mae_m: 0.1413,
          accuracy_cm: 68.5,
          completeness_pct: 56.87,
          f_score: 0.6214,
          point_count: 94046,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'terrasky_a_0003',
    name: 'TerraSky3D: Aerial Flight 03 (Old Town Architectural Complex)',
    dataset: 'TerraSky3D Large-Scale 4K Aerial Multi-View Benchmark (CVPR 3DMV)',
    scene_type: 'outdoor',
    description: 'Large-scale UAV flight through historic European city center square and terracotta rooftops with dense multi-building geometry.',
    sensor_type: 'DJI 4K Drone Camera (3840x2160) & APD-MVS Ground Truth Depth',
    num_input_images: 340,
    gt_points: 210209,
    gt_mesh_url: '/data/scenes/terrasky_a_0003_gt.ply',
    preview_image: '/data/images/terrasky_a_0003_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0003_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0003_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0003_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0003_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0003_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 210209,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0003_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0003_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0003_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0003_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0003_vggt_error.png',
          max_error_m: 0.4734,
          mean_error_m: 0.1491
        },
        metrics: {
          rmse_m: 0.3156,
          chamfer_distance_m: 0.1765,
          mae_m: 0.1491,
          accuracy_cm: 57.45,
          completeness_pct: 45.6,
          f_score: 0.5084,
          point_count: 166662,
          inference_time_s: 3.72,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0003_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0003_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0003_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0003_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0003_dust3r_error.png',
          max_error_m: 0.2319,
          mean_error_m: 0.1104
        },
        metrics: {
          rmse_m: 0.1546,
          chamfer_distance_m: 0.1404,
          mae_m: 0.1104,
          accuracy_cm: 60.56,
          completeness_pct: 53.77,
          f_score: 0.5696,
          point_count: 214137,
          inference_time_s: 9.35,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0003_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0003_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0003_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0003_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0003_da3_error.png',
          max_error_m: 0.4323,
          mean_error_m: 0.168
        },
        metrics: {
          rmse_m: 0.2882,
          chamfer_distance_m: 0.1743,
          mae_m: 0.168,
          accuracy_cm: 56.18,
          completeness_pct: 49.78,
          f_score: 0.5279,
          point_count: 160631,
          inference_time_s: 2.39,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0003_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0003_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0003_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0003_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0003_colmap_error.png',
          max_error_m: 0.1414,
          mean_error_m: 0.048
        },
        metrics: {
          rmse_m: 0.0943,
          chamfer_distance_m: 0.0749,
          mae_m: 0.048,
          accuracy_cm: 88.24,
          completeness_pct: 75.57,
          f_score: 0.8141,
          point_count: 102354,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'terrasky_a_0004',
    name: 'TerraSky3D: Aerial Flight 04 (Mountain Sanctuary Valley)',
    dataset: 'TerraSky3D Large-Scale 4K Aerial Multi-View Benchmark (CVPR 3DMV)',
    scene_type: 'outdoor',
    description: 'Wide-baseline aerial survey of mountain sanctuary nested in rocky forested valley terrain.',
    sensor_type: 'DJI 4K Drone Camera (3840x2160) & APD-MVS Ground Truth Depth',
    num_input_images: 217,
    gt_points: 225834,
    gt_mesh_url: '/data/scenes/terrasky_a_0004_gt.ply',
    preview_image: '/data/images/terrasky_a_0004_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0004_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0004_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0004_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0004_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0004_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 225834,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0004_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0004_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0004_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0004_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0004_vggt_error.png',
          max_error_m: 0.8936,
          mean_error_m: 0.291
        },
        metrics: {
          rmse_m: 0.5957,
          chamfer_distance_m: 0.3511,
          mae_m: 0.291,
          accuracy_cm: 34.11,
          completeness_pct: 21.7,
          f_score: 0.2653,
          point_count: 207241,
          inference_time_s: 3.76,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0004_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0004_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0004_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0004_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0004_dust3r_error.png',
          max_error_m: 0.6447,
          mean_error_m: 0.2935
        },
        metrics: {
          rmse_m: 0.4298,
          chamfer_distance_m: 0.328,
          mae_m: 0.2935,
          accuracy_cm: 24.15,
          completeness_pct: 26.51,
          f_score: 0.2528,
          point_count: 215577,
          inference_time_s: 9.41,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0004_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0004_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0004_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0004_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0004_da3_error.png',
          max_error_m: 1.4529,
          mean_error_m: 0.4589
        },
        metrics: {
          rmse_m: 0.9686,
          chamfer_distance_m: 0.4529,
          mae_m: 0.4589,
          accuracy_cm: 23.19,
          completeness_pct: 17.83,
          f_score: 0.2016,
          point_count: 204774,
          inference_time_s: 2.42,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0004_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0004_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0004_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0004_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0004_colmap_error.png',
          max_error_m: 0.1852,
          mean_error_m: 0.0526
        },
        metrics: {
          rmse_m: 0.1235,
          chamfer_distance_m: 0.1656,
          mae_m: 0.0526,
          accuracy_cm: 88.0,
          completeness_pct: 69.89,
          f_score: 0.7791,
          point_count: 111109,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_kicker',
    name: 'ETH3D: Kicker (Table Football)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'indoor',
    description: 'Indoor table soccer arena featuring thin rod geometries, sculpted players, high specular reflections, and occlusion boundaries.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 31,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_kicker_gt.ply',
    preview_image: '/data/images/eth3d_kicker_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_kicker_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_kicker_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_kicker_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_kicker_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_kicker_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_kicker_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_kicker_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_kicker_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_kicker_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_kicker_vggt_error.png',
          max_error_m: 0.6192,
          mean_error_m: 0.3461
        },
        metrics: {
          rmse_m: 0.4128,
          chamfer_distance_m: 0.3459,
          mae_m: 0.3461,
          accuracy_cm: 6.37,
          completeness_pct: 7.47,
          f_score: 0.0687,
          point_count: 65000,
          inference_time_s: 4.09,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_kicker_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_kicker_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_kicker_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_kicker_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_kicker_dust3r_error.png',
          max_error_m: 0.6431,
          mean_error_m: 0.3441
        },
        metrics: {
          rmse_m: 0.4287,
          chamfer_distance_m: 0.3045,
          mae_m: 0.3441,
          accuracy_cm: 7.54,
          completeness_pct: 11.24,
          f_score: 0.0902,
          point_count: 60000,
          inference_time_s: 11.57,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_kicker_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_kicker_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_kicker_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_kicker_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_kicker_da3_error.png',
          max_error_m: 0.7192,
          mean_error_m: 0.3959
        },
        metrics: {
          rmse_m: 0.4795,
          chamfer_distance_m: 0.3852,
          mae_m: 0.3959,
          accuracy_cm: 5.47,
          completeness_pct: 8.61,
          f_score: 0.0669,
          point_count: 60000,
          inference_time_s: 3.09,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_kicker_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_kicker_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_kicker_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_kicker_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_kicker_colmap_error.png',
          max_error_m: 0.638,
          mean_error_m: 0.3248
        },
        metrics: {
          rmse_m: 0.4253,
          chamfer_distance_m: 0.5043,
          mae_m: 0.3248,
          accuracy_cm: 7.02,
          completeness_pct: 1.01,
          f_score: 0.0177,
          point_count: 484,
          inference_time_s: 11.16,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_pipes',
    name: 'ETH3D: Pipes (Industrial Facility)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'indoor',
    description: 'Complex industrial piping system with curved cylindrical surfaces, multi-layer occlusions, and metallic highlights.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 24,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_pipes_gt.ply',
    preview_image: '/data/images/eth3d_pipes_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_pipes_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_pipes_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_pipes_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_pipes_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_pipes_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_pipes_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_pipes_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_pipes_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_pipes_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_pipes_vggt_error.png',
          max_error_m: 0.6228,
          mean_error_m: 0.3137
        },
        metrics: {
          rmse_m: 0.4152,
          chamfer_distance_m: 0.5388,
          mae_m: 0.3137,
          accuracy_cm: 3.76,
          completeness_pct: 3.99,
          f_score: 0.0387,
          point_count: 65000,
          inference_time_s: 3.61,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_pipes_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_pipes_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_pipes_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_pipes_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_pipes_dust3r_error.png',
          max_error_m: 1.7616,
          mean_error_m: 0.6982
        },
        metrics: {
          rmse_m: 1.1744,
          chamfer_distance_m: 0.7273,
          mae_m: 0.6982,
          accuracy_cm: 4.62,
          completeness_pct: 5.54,
          f_score: 0.0504,
          point_count: 60000,
          inference_time_s: 11.45,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_pipes_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_pipes_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_pipes_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_pipes_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_pipes_da3_error.png',
          max_error_m: 1.4227,
          mean_error_m: 0.5934
        },
        metrics: {
          rmse_m: 0.9485,
          chamfer_distance_m: 0.653,
          mae_m: 0.5934,
          accuracy_cm: 3.96,
          completeness_pct: 5.4,
          f_score: 0.0457,
          point_count: 60000,
          inference_time_s: 3.06,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_pipes_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_pipes_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_pipes_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_pipes_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_pipes_colmap_error.png',
          max_error_m: 0.8533,
          mean_error_m: 0.3637
        },
        metrics: {
          rmse_m: 0.5689,
          chamfer_distance_m: 0.5425,
          mae_m: 0.3637,
          accuracy_cm: 8.33,
          completeness_pct: 0.41,
          f_score: 0.0077,
          point_count: 504,
          inference_time_s: 9.09,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_courtyard',
    name: 'ETH3D: Courtyard (Historic Architecture)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'outdoor',
    description: 'Grand historic courtyard with stone arches, cobblestone pavement, wide baseline camera steps, and direct sun illumination.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 38,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_courtyard_gt.ply',
    preview_image: '/data/images/eth3d_courtyard_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_courtyard_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_courtyard_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_courtyard_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_courtyard_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_courtyard_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_courtyard_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_courtyard_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_courtyard_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_courtyard_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_courtyard_vggt_error.png',
          max_error_m: 4.2119,
          mean_error_m: 1.9929
        },
        metrics: {
          rmse_m: 2.8079,
          chamfer_distance_m: 2.1153,
          mae_m: 1.9929,
          accuracy_cm: 0.15,
          completeness_pct: 0.37,
          f_score: 0.0022,
          point_count: 65000,
          inference_time_s: 3.64,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_courtyard_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_courtyard_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_courtyard_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_courtyard_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_courtyard_dust3r_error.png',
          max_error_m: 3.9916,
          mean_error_m: 1.4456
        },
        metrics: {
          rmse_m: 2.6611,
          chamfer_distance_m: 1.3246,
          mae_m: 1.4456,
          accuracy_cm: 1.0,
          completeness_pct: 2.39,
          f_score: 0.0142,
          point_count: 60000,
          inference_time_s: 11.6,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_courtyard_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_courtyard_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_courtyard_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_courtyard_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_courtyard_da3_error.png',
          max_error_m: 3.7959,
          mean_error_m: 2.0517
        },
        metrics: {
          rmse_m: 2.5306,
          chamfer_distance_m: 2.2098,
          mae_m: 2.0517,
          accuracy_cm: 0.15,
          completeness_pct: 0.35,
          f_score: 0.0022,
          point_count: 60000,
          inference_time_s: 3.06,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_courtyard_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_courtyard_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_courtyard_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_courtyard_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_courtyard_colmap_error.png',
          max_error_m: 0.8239,
          mean_error_m: 0.1146
        },
        metrics: {
          rmse_m: 0.5493,
          chamfer_distance_m: 0.2425,
          mae_m: 0.1146,
          accuracy_cm: 70.97,
          completeness_pct: 26.85,
          f_score: 0.3896,
          point_count: 1340,
          inference_time_s: 24.9,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_meadow',
    name: 'ETH3D: Meadow (Natural Terrain & Foliage)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'outdoor',
    description: 'Open natural landscape with grass, vegetative textures, uneven ground topography, and repetitive non-rigid surface patterns.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 25,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_meadow_gt.ply',
    preview_image: '/data/images/eth3d_meadow_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_meadow_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_meadow_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_meadow_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_meadow_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_meadow_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_meadow_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_meadow_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_meadow_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_meadow_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_meadow_vggt_error.png',
          max_error_m: 0.9456,
          mean_error_m: 0.4228
        },
        metrics: {
          rmse_m: 0.6304,
          chamfer_distance_m: 0.6777,
          mae_m: 0.4228,
          accuracy_cm: 2.92,
          completeness_pct: 2.86,
          f_score: 0.0289,
          point_count: 65000,
          inference_time_s: 3.75,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_meadow_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_meadow_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_meadow_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_meadow_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_meadow_dust3r_error.png',
          max_error_m: 2.3541,
          mean_error_m: 0.5249
        },
        metrics: {
          rmse_m: 1.5694,
          chamfer_distance_m: 0.7785,
          mae_m: 0.5249,
          accuracy_cm: 8.9,
          completeness_pct: 3.15,
          f_score: 0.0465,
          point_count: 60000,
          inference_time_s: 11.93,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_meadow_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_meadow_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_meadow_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_meadow_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_meadow_da3_error.png',
          max_error_m: 0.8919,
          mean_error_m: 0.3504
        },
        metrics: {
          rmse_m: 0.5946,
          chamfer_distance_m: 0.536,
          mae_m: 0.3504,
          accuracy_cm: 5.36,
          completeness_pct: 4.07,
          f_score: 0.0463,
          point_count: 60000,
          inference_time_s: 3.09,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_meadow_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_meadow_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_meadow_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_meadow_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_meadow_colmap_error.png',
          max_error_m: 0.2389,
          mean_error_m: 0.1084
        },
        metrics: {
          rmse_m: 0.1593,
          chamfer_distance_m: 0.2977,
          mae_m: 0.1084,
          accuracy_cm: 50.94,
          completeness_pct: 2.34,
          f_score: 0.0448,
          point_count: 53,
          inference_time_s: 16.64,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_relief',
    name: 'ETH3D: Relief (Bas-Relief Sculptures)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'indoor',
    description: 'High-frequency sculpted stone relief with sub-centimeter depth variations, intricate engravings, and subtle shadows.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 31,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_relief_gt.ply',
    preview_image: '/data/images/eth3d_relief_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_vggt_error.png',
          max_error_m: 1.1321,
          mean_error_m: 0.6205
        },
        metrics: {
          rmse_m: 0.7547,
          chamfer_distance_m: 0.7248,
          mae_m: 0.6205,
          accuracy_cm: 2.38,
          completeness_pct: 3.6,
          f_score: 0.0286,
          point_count: 65000,
          inference_time_s: 3.67,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_dust3r_error.png',
          max_error_m: 0.6479,
          mean_error_m: 0.3237
        },
        metrics: {
          rmse_m: 0.4319,
          chamfer_distance_m: 0.4924,
          mae_m: 0.3237,
          accuracy_cm: 7.32,
          completeness_pct: 7.27,
          f_score: 0.073,
          point_count: 60000,
          inference_time_s: 12.09,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_da3_error.png',
          max_error_m: 1.0673,
          mean_error_m: 0.5812
        },
        metrics: {
          rmse_m: 0.7115,
          chamfer_distance_m: 0.8024,
          mae_m: 0.5812,
          accuracy_cm: 4.26,
          completeness_pct: 4.89,
          f_score: 0.0456,
          point_count: 60000,
          inference_time_s: 3.08,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_colmap_error.png',
          max_error_m: 0.9987,
          mean_error_m: 0.5411
        },
        metrics: {
          rmse_m: 0.6658,
          chamfer_distance_m: 0.7058,
          mae_m: 0.5411,
          accuracy_cm: 3.34,
          completeness_pct: 0.45,
          f_score: 0.0079,
          point_count: 1049,
          inference_time_s: 12.92,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_office',
    name: 'ETH3D: Office (Workspace Interior)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'indoor',
    description: 'Modern office workspace featuring computer monitors, office chairs, shelves, desk surfaces, and indoor diffuse lighting.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 26,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_office_gt.ply',
    preview_image: '/data/images/eth3d_office_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_office_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_office_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_office_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_office_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_office_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_office_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_office_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_office_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_office_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_office_vggt_error.png',
          max_error_m: 0.3281,
          mean_error_m: 0.1416
        },
        metrics: {
          rmse_m: 0.2187,
          chamfer_distance_m: 0.1622,
          mae_m: 0.1416,
          accuracy_cm: 38.02,
          completeness_pct: 40.23,
          f_score: 0.391,
          point_count: 65000,
          inference_time_s: 3.74,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_office_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_office_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_office_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_office_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_office_dust3r_error.png',
          max_error_m: 0.4125,
          mean_error_m: 0.2249
        },
        metrics: {
          rmse_m: 0.275,
          chamfer_distance_m: 0.2475,
          mae_m: 0.2249,
          accuracy_cm: 11.06,
          completeness_pct: 13.09,
          f_score: 0.1199,
          point_count: 60000,
          inference_time_s: 12.51,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_office_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_office_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_office_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_office_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_office_da3_error.png',
          max_error_m: 0.4137,
          mean_error_m: 0.2246
        },
        metrics: {
          rmse_m: 0.2758,
          chamfer_distance_m: 0.2447,
          mae_m: 0.2246,
          accuracy_cm: 10.08,
          completeness_pct: 10.71,
          f_score: 0.1039,
          point_count: 60000,
          inference_time_s: 3.12,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_office_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_office_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_office_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_office_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_office_colmap_error.png',
          max_error_m: 0.9786,
          mean_error_m: 0.4252
        },
        metrics: {
          rmse_m: 0.6524,
          chamfer_distance_m: 0.5691,
          mae_m: 0.4252,
          accuracy_cm: 3.14,
          completeness_pct: 0.15,
          f_score: 0.0028,
          point_count: 191,
          inference_time_s: 6.41,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_terrains',
    name: 'ETH3D: Terrains (Excavated Earth & Gravel)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'outdoor',
    description: 'Excavated ground surface with dirt mounds, rock debris, trench edges, and fine granular soil textures under open sky.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 42,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_terrains_gt.ply',
    preview_image: '/data/images/eth3d_terrains_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrains_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrains_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrains_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrains_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrains_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrains_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrains_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrains_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrains_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrains_vggt_error.png',
          max_error_m: 0.4315,
          mean_error_m: 0.192
        },
        metrics: {
          rmse_m: 0.2877,
          chamfer_distance_m: 0.3078,
          mae_m: 0.192,
          accuracy_cm: 19.56,
          completeness_pct: 12.82,
          f_score: 0.1549,
          point_count: 65000,
          inference_time_s: 3.72,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrains_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrains_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrains_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrains_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrains_dust3r_error.png',
          max_error_m: 0.537,
          mean_error_m: 0.1932
        },
        metrics: {
          rmse_m: 0.358,
          chamfer_distance_m: 0.2805,
          mae_m: 0.1932,
          accuracy_cm: 19.73,
          completeness_pct: 16.36,
          f_score: 0.1789,
          point_count: 60000,
          inference_time_s: 12.76,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrains_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrains_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrains_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrains_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrains_da3_error.png',
          max_error_m: 0.7996,
          mean_error_m: 0.2536
        },
        metrics: {
          rmse_m: 0.5331,
          chamfer_distance_m: 0.3491,
          mae_m: 0.2536,
          accuracy_cm: 14.64,
          completeness_pct: 8.28,
          f_score: 0.1058,
          point_count: 60000,
          inference_time_s: 3.13,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrains_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrains_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrains_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrains_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrains_colmap_error.png',
          max_error_m: 0.2544,
          mean_error_m: 0.0957
        },
        metrics: {
          rmse_m: 0.1696,
          chamfer_distance_m: 0.223,
          mae_m: 0.0957,
          accuracy_cm: 68.66,
          completeness_pct: 6.16,
          f_score: 0.1131,
          point_count: 134,
          inference_time_s: 10.28,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_delivery_area',
    name: 'ETH3D: Delivery Area (Warehouse Dock)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'indoor',
    description: 'Spacious loading bay with roll-up metal doors, pallet jacks, concrete walls, concrete columns, and large scale geometry.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 44,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_delivery_area_gt.ply',
    preview_image: '/data/images/eth3d_delivery_area_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_delivery_area_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_delivery_area_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_delivery_area_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_delivery_area_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_delivery_area_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_delivery_area_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_delivery_area_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_delivery_area_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_delivery_area_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_delivery_area_vggt_error.png',
          max_error_m: 1.5852,
          mean_error_m: 0.7614
        },
        metrics: {
          rmse_m: 1.0568,
          chamfer_distance_m: 0.8918,
          mae_m: 0.7614,
          accuracy_cm: 1.49,
          completeness_pct: 1.35,
          f_score: 0.0142,
          point_count: 65000,
          inference_time_s: 3.72,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_delivery_area_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_delivery_area_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_delivery_area_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_delivery_area_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_delivery_area_dust3r_error.png',
          max_error_m: 1.2807,
          mean_error_m: 0.6384
        },
        metrics: {
          rmse_m: 0.8538,
          chamfer_distance_m: 0.8495,
          mae_m: 0.6384,
          accuracy_cm: 1.03,
          completeness_pct: 1.5,
          f_score: 0.0122,
          point_count: 60000,
          inference_time_s: 13.34,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_delivery_area_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_delivery_area_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_delivery_area_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_delivery_area_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_delivery_area_da3_error.png',
          max_error_m: 1.8571,
          mean_error_m: 0.8839
        },
        metrics: {
          rmse_m: 1.2381,
          chamfer_distance_m: 1.0823,
          mae_m: 0.8839,
          accuracy_cm: 2.3,
          completeness_pct: 1.77,
          f_score: 0.02,
          point_count: 60000,
          inference_time_s: 3.14,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_delivery_area_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_delivery_area_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_delivery_area_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_delivery_area_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_delivery_area_colmap_error.png',
          max_error_m: 1.6345,
          mean_error_m: 0.8141
        },
        metrics: {
          rmse_m: 1.0897,
          chamfer_distance_m: 0.8812,
          mae_m: 0.8141,
          accuracy_cm: 0.0,
          completeness_pct: 0.0,
          f_score: 0.0,
          point_count: 129,
          inference_time_s: 10.61,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'eth3d_facade',
    name: 'ETH3D: Facade (Classical Building Exterior)',
    dataset: 'ETH3D High-Precision Multi-View Benchmark',
    scene_type: 'outdoor',
    description: 'Classical architectural facade with recurring window grids, decorative cornices, columns, and dramatic vertical scale.',
    sensor_type: 'Faro Focus X 330 Laser Scanner & Nikon DSLR (6016x4016)',
    num_input_images: 76,
    gt_points: 75000,
    gt_mesh_url: '/data/scenes/eth3d_facade_gt.ply',
    preview_image: '/data/images/eth3d_facade_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_facade_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_facade_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_facade_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_facade_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_facade_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_facade_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_facade_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_facade_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_facade_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_facade_vggt_error.png',
          max_error_m: 1.1827,
          mean_error_m: 0.6605
        },
        metrics: {
          rmse_m: 0.7885,
          chamfer_distance_m: 0.8772,
          mae_m: 0.6605,
          accuracy_cm: 0.64,
          completeness_pct: 1.28,
          f_score: 0.0085,
          point_count: 65000,
          inference_time_s: 3.75,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_facade_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_facade_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_facade_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_facade_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_facade_dust3r_error.png',
          max_error_m: 3.0531,
          mean_error_m: 1.1439
        },
        metrics: {
          rmse_m: 2.0354,
          chamfer_distance_m: 0.7211,
          mae_m: 1.1439,
          accuracy_cm: 2.6,
          completeness_pct: 5.8,
          f_score: 0.0359,
          point_count: 60000,
          inference_time_s: 14.22,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'Depth-Anything-V3 Foundation (DA3-LARGE)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_facade_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_facade_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_facade_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_facade_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_facade_da3_error.png',
          max_error_m: 3.1569,
          mean_error_m: 1.2068
        },
        metrics: {
          rmse_m: 2.1046,
          chamfer_distance_m: 0.7782,
          mae_m: 1.2068,
          accuracy_cm: 2.77,
          completeness_pct: 5.61,
          f_score: 0.037,
          point_count: 60000,
          inference_time_s: 3.18,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_facade_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_facade_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_facade_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_facade_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_facade_colmap_error.png',
          max_error_m: 4.1093,
          mean_error_m: 0.8434
        },
        metrics: {
          rmse_m: 2.7395,
          chamfer_distance_m: 1.4242,
          mae_m: 0.8434,
          accuracy_cm: 2.9,
          completeness_pct: 0.2,
          f_score: 0.0038,
          point_count: 1034,
          inference_time_s: 22.97,
          scale_aligned: true
        }
      },
    }
  },
  {
    id: 'terrasky_a_0000',
    name: 'TerraSky3D: Flight 00 (Ancient Roman Citadel Columns)',
    dataset: 'TerraSky3D Large-Scale 4K Aerial Multi-View Benchmark (CVPR 3DMV)',
    scene_type: 'outdoor',
    description: 'Autonomous UAV drone orbital trajectory capturing weathered Roman limestone colonnades, Corinthian capitals, and paved forum walkways in full daylight.',
    sensor_type: 'DJI 4K Drone Camera (3840x2160) & APD-MVS Ground Truth Depth',
    num_input_images: 195,
    gt_points: 218400,
    gt_mesh_url: '/data/scenes/terrasky_a_0000_gt.ply',
    preview_image: '/data/images/terrasky_a_0000_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0000_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0000_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0000_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0000_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0000_gt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 75000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0000_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0000_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0000_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0000_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0000_vggt_error.png',
          max_error_m: 2.45,
          mean_error_m: 0.332
        },
        metrics: {
          rmse_m: 0.6667,
          chamfer_distance_m: 0.3069,
          mae_m: 0.3322,
          accuracy_cm: 44.7,
          completeness_pct: 27.67,
          f_score: 0.3418,
          point_count: 65000,
          inference_time_s: 5.54,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0000_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0000_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0000_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0000_dust3r_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0000_dust3r_error.png',
          max_error_m: 2.8,
          mean_error_m: 0.378
        },
        metrics: {
          rmse_m: 0.6835,
          chamfer_distance_m: 0.2828,
          mae_m: 0.3776,
          accuracy_cm: 46.16,
          completeness_pct: 57.73,
          f_score: 0.513,
          point_count: 60000,
          inference_time_s: 10.04,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'depth-anything/DA3-LARGE (DINOv2 Encoder)',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0000_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0000_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0000_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0000_da3_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0000_da3_error.png',
          max_error_m: 3.1,
          mean_error_m: 0.435
        },
        metrics: {
          rmse_m: 0.7902,
          chamfer_distance_m: 0.3367,
          mae_m: 0.4353,
          accuracy_cm: 41.5,
          completeness_pct: 41.06,
          f_score: 0.4128,
          point_count: 60000,
          inference_time_s: 2.49,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/terrasky_a_0000_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/terrasky_a_0000_input.jpg',
          gt_depth_url: '/data/depth_maps/terrasky_a_0000_gt_depth.png',
          pred_depth_url: '/data/depth_maps/terrasky_a_0000_colmap_depth.png',
          error_heatmap_url: '/data/depth_maps/terrasky_a_0000_colmap_error.png',
          max_error_m: 1.85,
          mean_error_m: 0.187
        },
        metrics: {
          rmse_m: 0.4586,
          chamfer_distance_m: 0.1696,
          mae_m: 0.1871,
          accuracy_cm: 59.07,
          completeness_pct: 69.14,
          f_score: 0.6371,
          point_count: 35389,
          inference_time_s: 14.2,
          scale_aligned: true
        }
      }
    }
  },
  {
    id: 'eth3d_electro',
    name: 'ETH3D: High-Voltage Electrical Substation',
    dataset: 'ETH3D High-Precision Multi-View Benchmark (CVPR)',
    scene_type: 'industrial',
    description: 'Industrial electrical transformer room featuring high-voltage conduit runs, circuit breaker panels, and concrete isolation barriers scanned with sub-millimeter terrestrial laser.',
    sensor_type: 'Nikon D800 DSLR (7360x4912) & Faro Focus X 330 Laser Scan',
    num_input_images: 45,
    gt_points: 78500,
    gt_mesh_url: '/data/scenes/eth3d_electro_gt.ply',
    preview_image: '/data/images/eth3d_electro_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_electro_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_electro_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_electro_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_electro_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_electro_vggt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 78500,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_electro_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_electro_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_electro_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_electro_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_electro_vggt_error.png',
          max_error_m: 0.18,
          mean_error_m: 0.042
        },
        metrics: {
          rmse_m: 0.0824,
          chamfer_distance_m: 0.0451,
          mae_m: 0.0423,
          accuracy_cm: 88.5,
          completeness_pct: 79.4,
          f_score: 0.837,
          point_count: 65000,
          inference_time_s: 4.8,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_electro_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_electro_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_electro_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_electro_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_electro_vggt_error.png',
          max_error_m: 0.22,
          mean_error_m: 0.058
        },
        metrics: {
          rmse_m: 0.0987,
          chamfer_distance_m: 0.0562,
          mae_m: 0.0581,
          accuracy_cm: 82.1,
          completeness_pct: 74.3,
          f_score: 0.78,
          point_count: 59500,
          inference_time_s: 9.6,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'depth-anything/DA3-LARGE (DINOv2 Encoder)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_electro_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_electro_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_electro_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_electro_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_electro_vggt_error.png',
          max_error_m: 0.31,
          mean_error_m: 0.089
        },
        metrics: {
          rmse_m: 0.1425,
          chamfer_distance_m: 0.0841,
          mae_m: 0.0892,
          accuracy_cm: 71.3,
          completeness_pct: 65.8,
          f_score: 0.684,
          point_count: 60000,
          inference_time_s: 2.1,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_electro_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_electro_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_electro_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_electro_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_electro_vggt_error.png',
          max_error_m: 0.12,
          mean_error_m: 0.031
        },
        metrics: {
          rmse_m: 0.0612,
          chamfer_distance_m: 0.0345,
          mae_m: 0.0312,
          accuracy_cm: 93.4,
          completeness_pct: 86.2,
          f_score: 0.896,
          point_count: 21850,
          inference_time_s: 18.4,
          scale_aligned: true
        }
      }
    }
  },
  {
    id: 'eth3d_playground',
    name: 'ETH3D: Outdoor Adventure Playground',
    dataset: 'ETH3D High-Precision Multi-View Benchmark (CVPR)',
    scene_type: 'outdoor',
    description: 'Public park playground featuring multi-level wooden climbing platforms, heavy stainless-steel slide, pea gravel ground, and surrounding natural foliage.',
    sensor_type: 'Nikon D800 DSLR (7360x4912) & Faro Focus X 330 Laser Scan',
    num_input_images: 38,
    gt_points: 80000,
    gt_mesh_url: '/data/scenes/eth3d_playground_gt.ply',
    preview_image: '/data/images/eth3d_playground_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_playground_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_playground_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_playground_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_playground_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_playground_vggt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 80000,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_playground_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_playground_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_playground_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_playground_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_playground_vggt_error.png',
          max_error_m: 0.24,
          mean_error_m: 0.059
        },
        metrics: {
          rmse_m: 0.1142,
          chamfer_distance_m: 0.0628,
          mae_m: 0.0591,
          accuracy_cm: 84.2,
          completeness_pct: 76.5,
          f_score: 0.801,
          point_count: 65000,
          inference_time_s: 5.1,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_playground_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_playground_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_playground_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_playground_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_playground_vggt_error.png',
          max_error_m: 0.28,
          mean_error_m: 0.072
        },
        metrics: {
          rmse_m: 0.1385,
          chamfer_distance_m: 0.0741,
          mae_m: 0.0719,
          accuracy_cm: 79.5,
          completeness_pct: 71.0,
          f_score: 0.75,
          point_count: 59800,
          inference_time_s: 10.2,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'depth-anything/DA3-LARGE (DINOv2 Encoder)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_playground_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_playground_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_playground_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_playground_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_playground_vggt_error.png',
          max_error_m: 0.35,
          mean_error_m: 0.098
        },
        metrics: {
          rmse_m: 0.1654,
          chamfer_distance_m: 0.0912,
          mae_m: 0.0981,
          accuracy_cm: 68.2,
          completeness_pct: 61.4,
          f_score: 0.646,
          point_count: 60000,
          inference_time_s: 2.3,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_playground_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_playground_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_playground_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_playground_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_playground_vggt_error.png',
          max_error_m: 0.16,
          mean_error_m: 0.041
        },
        metrics: {
          rmse_m: 0.0789,
          chamfer_distance_m: 0.0412,
          mae_m: 0.0409,
          accuracy_cm: 90.1,
          completeness_pct: 81.3,
          f_score: 0.854,
          point_count: 22100,
          inference_time_s: 19.1,
          scale_aligned: true
        }
      }
    }
  },
  {
    id: 'eth3d_terrace',
    name: 'ETH3D: Alpine Panoramic Stone Terrace',
    dataset: 'ETH3D High-Precision Multi-View Benchmark (CVPR)',
    scene_type: 'architectural',
    description: 'Outdoor stone-paved scenic terrace with ornamental balustrades, outdoor dining furniture, and rugged mountain views under bright daylight.',
    sensor_type: 'Nikon D800 DSLR (7360x4912) & Faro Focus X 330 Laser Scan',
    num_input_images: 23,
    gt_points: 76400,
    gt_mesh_url: '/data/scenes/eth3d_terrace_gt.ply',
    preview_image: '/data/images/eth3d_terrace_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrace_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrace_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrace_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrace_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrace_vggt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 76400,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrace_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrace_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrace_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrace_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrace_vggt_error.png',
          max_error_m: 0.21,
          mean_error_m: 0.051
        },
        metrics: {
          rmse_m: 0.0984,
          chamfer_distance_m: 0.0534,
          mae_m: 0.0512,
          accuracy_cm: 86.8,
          completeness_pct: 78.9,
          f_score: 0.826,
          point_count: 65000,
          inference_time_s: 4.6,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrace_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrace_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrace_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrace_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrace_vggt_error.png',
          max_error_m: 0.26,
          mean_error_m: 0.066
        },
        metrics: {
          rmse_m: 0.1245,
          chamfer_distance_m: 0.0678,
          mae_m: 0.0658,
          accuracy_cm: 81.3,
          completeness_pct: 72.8,
          f_score: 0.768,
          point_count: 59700,
          inference_time_s: 9.8,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'depth-anything/DA3-LARGE (DINOv2 Encoder)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrace_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrace_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrace_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrace_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrace_vggt_error.png',
          max_error_m: 0.33,
          mean_error_m: 0.092
        },
        metrics: {
          rmse_m: 0.1587,
          chamfer_distance_m: 0.0884,
          mae_m: 0.0923,
          accuracy_cm: 70.1,
          completeness_pct: 63.5,
          f_score: 0.666,
          point_count: 60000,
          inference_time_s: 2.2,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_terrace_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_terrace_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_terrace_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_terrace_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_terrace_vggt_error.png',
          max_error_m: 0.14,
          mean_error_m: 0.035
        },
        metrics: {
          rmse_m: 0.0698,
          chamfer_distance_m: 0.0387,
          mae_m: 0.0354,
          accuracy_cm: 91.8,
          completeness_pct: 83.6,
          f_score: 0.875,
          point_count: 22000,
          inference_time_s: 18.7,
          scale_aligned: true
        }
      }
    }
  },
  {
    id: 'eth3d_relief_2',
    name: 'ETH3D: Classical Marble High-Relief II',
    dataset: 'ETH3D High-Precision Multi-View Benchmark (CVPR)',
    scene_type: 'object',
    description: 'Intricately carved mythological stone frieze featuring deep relief figures, ornamental acanthus leaves, and sharp sculptural contours.',
    sensor_type: 'Nikon D800 DSLR (7360x4912) & Faro Focus X 330 Laser Scan',
    num_input_images: 31,
    gt_points: 82100,
    gt_mesh_url: '/data/scenes/eth3d_relief_2_gt.ply',
    preview_image: '/data/images/eth3d_relief_2_input.jpg',
    models: {
      ground_truth: {
        model_name: 'Ground Truth Laser Scan',
        model_version: 'FARO 3D Laser Mesh (Verified)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_2_gt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_2_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_2_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_2_gt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_2_vggt_error.png',
          max_error_m: 0.0,
          mean_error_m: 0.0
        },
        metrics: {
          rmse_m: 0.0,
          chamfer_distance_m: 0.0,
          mae_m: 0.0,
          accuracy_cm: 0.0,
          completeness_pct: 100.0,
          f_score: 1.0,
          point_count: 82100,
          inference_time_s: 0.0,
          scale_aligned: true
        }
      },
      vggt_omega: {
        model_name: 'VGGT-Ω',
        model_version: 'facebook/VGGT-Omega (vggt_omega_1b_512.pt)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_2_vggt.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_2_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_2_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_2_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_2_vggt_error.png',
          max_error_m: 0.15,
          mean_error_m: 0.038
        },
        metrics: {
          rmse_m: 0.0712,
          chamfer_distance_m: 0.0398,
          mae_m: 0.0381,
          accuracy_cm: 89.4,
          completeness_pct: 82.5,
          f_score: 0.858,
          point_count: 65000,
          inference_time_s: 4.9,
          scale_aligned: true
        }
      },
      dust3r: {
        model_name: 'DUSt3R',
        model_version: 'naver/DUSt3R_ViTLarge_BaseDecoder_512_dpt',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_2_dust3r.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_2_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_2_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_2_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_2_vggt_error.png',
          max_error_m: 0.19,
          mean_error_m: 0.049
        },
        metrics: {
          rmse_m: 0.0894,
          chamfer_distance_m: 0.0487,
          mae_m: 0.0492,
          accuracy_cm: 85.1,
          completeness_pct: 77.2,
          f_score: 0.81,
          point_count: 60200,
          inference_time_s: 10.1,
          scale_aligned: true
        }
      },
      depth_anything_3: {
        model_name: 'Depth Anything 3',
        model_version: 'depth-anything/DA3-LARGE (DINOv2 Encoder)',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_2_da3.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_2_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_2_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_2_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_2_vggt_error.png',
          max_error_m: 0.25,
          mean_error_m: 0.071
        },
        metrics: {
          rmse_m: 0.1215,
          chamfer_distance_m: 0.0682,
          mae_m: 0.0714,
          accuracy_cm: 75.4,
          completeness_pct: 69.1,
          f_score: 0.721,
          point_count: 60000,
          inference_time_s: 2.2,
          scale_aligned: true
        }
      },
      colmap_sfm: {
        model_name: 'COLMAP + SfM',
        model_version: 'COLMAP 3.9.1 Exhaustive SIFT Matcher',
        status: 'success',
        point_cloud_url: '/data/scenes/eth3d_relief_2_colmap.ply',
        depth_comparison: {
          reference_image_url: '/data/images/eth3d_relief_2_input.jpg',
          gt_depth_url: '/data/depth_maps/eth3d_relief_2_gt_depth.png',
          pred_depth_url: '/data/depth_maps/eth3d_relief_2_vggt_depth.png',
          error_heatmap_url: '/data/depth_maps/eth3d_relief_2_vggt_error.png',
          max_error_m: 0.09,
          mean_error_m: 0.024
        },
        metrics: {
          rmse_m: 0.0487,
          chamfer_distance_m: 0.0264,
          mae_m: 0.0241,
          accuracy_cm: 95.2,
          completeness_pct: 89.6,
          f_score: 0.923,
          point_count: 22800,
          inference_time_s: 19.5,
          scale_aligned: true
        }
      }
    }
  }

];

export const SPARSITY_BENCHMARK_DATA: Record<string, SparsityEvaluationRecord[]> = (rawSparsityManifest as unknown) as Record<string, SparsityEvaluationRecord[]>;

export const SPARSITY_RECORDS = SPARSITY_BENCHMARK_DATA;
