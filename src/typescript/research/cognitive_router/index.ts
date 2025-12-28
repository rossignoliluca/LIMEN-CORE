/**
 * COGNITIVE ROUTER - Research Annex
 *
 * This module contains experimental implementations for v5.0/v6.0 candidates.
 *
 * IMPORTANT: These modules are NOT imported by the runtime pipeline.
 * They exist purely for research and benchmarking purposes.
 *
 * To promote a module to runtime:
 * 1. Run research benchmark against 50-case suite
 * 2. Verify improvement in target metrics
 * 3. Verify latency/cost budgets are met
 * 4. Move to src/ and integrate with pipeline
 *
 * Modules:
 * - ConformalCalibrator: Post-hoc uncertainty calibration (v5.0)
 * - SemanticCache: Embedding-based similarity caching (v5.0)
 * - SPRTAccumulator: Multi-turn evidence accumulation (v5.0)
 * - ThompsonSampler: Online threshold optimization (v5.0)
 * - WorldModel: Predictive regime dynamics (v6.0)
 * - SelfImprover: LADDER-style recursive learning (v6.0)
 */

export { ConformalCalibrator } from './conformal_calibrator';
export type { ConformalConfig, CalibrationResult, CalibrationStats } from './conformal_calibrator';

export { SemanticCache } from './semantic_cache';
export type { SemanticCacheConfig, SemanticCacheStats } from './semantic_cache';

export { SPRTAccumulator } from './sprt_accumulator';
export type { SPRTConfig, SPRTState, TurnEvidence } from './sprt_accumulator';

export { ThompsonSampler } from './thompson_sampler';
export type { ThompsonConfig, SamplingDecision } from './thompson_sampler';

export { WorldModel } from './world_model';
export type { WorldModelConfig, WorldState, Prediction, Regime } from './world_model';

export { SelfImprover } from './self_improver';
export type { ImprovementConfig, CorrectionRecord, ImprovementStats } from './self_improver';

// v5.0 Definitive Gating (NP-calibrated)
export {
  calibrateThreshold,
  computeNonconformityScore,
  saveCalibration,
  loadCalibration,
  runCalibration,
} from './np_calibration';
export type { CalibrationConfig, CalibrationResult, NonconformityScore } from './np_calibration';

export { DefinitiveGating, createDefinitiveGating } from './definitive_gating';
export type { DefinitiveGatingConfig, GatingDecision, GatingStats } from './definitive_gating';

export { runDefinitiveBenchmark } from './definitive_benchmark';
export type { BenchmarkResult, ComparisonReport } from './definitive_benchmark';
