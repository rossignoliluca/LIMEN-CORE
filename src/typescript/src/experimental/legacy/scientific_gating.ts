/**
 * @deprecated MOVED to operational/gating/scientific_gating.ts (v7.2)
 *
 * Re-export for backwards compatibility.
 */

export {
  ScientificGating,
  scientificGating,
  DEFAULT_COST_CONFIG,
  type CostConfig,
  type GatingInput,
  type GatingDecision,
  type GatingStats,
} from '../../operational/gating/scientific_gating';

export { scientificGating as default } from '../../operational/gating/scientific_gating';
