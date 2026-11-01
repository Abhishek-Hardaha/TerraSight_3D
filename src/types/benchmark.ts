export type ModelId = 'ground_truth' | 'vggt_omega' | 'dust3r' | 'depth_anything_3' | 'colmap_sfm';

export interface ModelInfo {
  id: ModelId;
  name: string;
  tagline: string;
  architecture: string;
  badgeColor: string;
  isGroundTruth?: boolean;
}

export interface QuantitativeMetrics {
  rmse_m: number;           // Root Mean Square Error in meters
  chamfer_distance_m: number; // Bidirectional Chamfer Distance in meters
  mae_m: number;            // Mean Absolute Error
  accuracy_cm: number;      // Distance at 90th percentile in cm
  completeness_pct: number; // Surface coverage percentage (< 5cm from GT)
  f_score: number;          // F1 score harmonic mean of precision and recall @ 5cm
  point_count: number;      // Number of 3D vertices / points
  inference_time_s: number; // Wall-clock reconstruction time in seconds
  scale_aligned: boolean;   // Whether Umeyama similarity alignment was applied
}

export interface DepthMapComparison {
  reference_image_url: string;
  gt_depth_url: string;
  pred_depth_url: string;
  error_heatmap_url: string;
  max_error_m: number;
  mean_error_m: number;
}

export interface SceneBenchmarkData {
  id: string;
  name: string;
  dataset: string;
  scene_type: 'indoor' | 'outdoor' | 'architectural' | 'industrial' | 'object';
  description: string;
  sensor_type: string;
  num_input_images: number;
  gt_points: number;
  gt_mesh_url: string;
  preview_image: string;
  models: Record<ModelId, {
    model_name: string;
    model_version: string;
    metrics: QuantitativeMetrics;
    point_cloud_url: string;
    depth_comparison: DepthMapComparison;
    status: 'success' | 'failed' | 'partial';
    failure_notes?: string;
  }>;
}

export type SparsityLevel = '100' | '70' | '50' | '25';

export interface SparsityEvaluationRecord {
  sparsity_level: SparsityLevel;
  percentage: number;
  image_count: number;
  colmap: {
    status: 'success' | 'degraded' | 'failed';
    registered_images: number;
    points: number;
    rmse_m: number;
    chamfer_distance_m: number;
    completeness_pct: number;
    point_cloud_url: string;
    visual_notes?: string;
  };
  vggt_omega: {
    status: 'success' | 'robust';
    registered_images: number;
    points: number;
    rmse_m: number;
    chamfer_distance_m: number;
    completeness_pct: number;
    point_cloud_url: string;
    visual_notes?: string;
  };
}
