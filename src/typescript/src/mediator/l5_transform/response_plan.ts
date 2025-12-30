/**
 * ENOQ Response Plan - Builder Functions
 *
 * @note Builder functions moved to interface/plan_builders.ts (v7.2)
 *       Re-exported here for backwards compatibility.
 *
 * ResponsePlan types are defined in interface/types.ts.
 */

// Re-export all types from interface for backwards compatibility
export type {
  SpeechActType,
  SpeechAct,
  WarmthLevel,
  BrevityLevel,
  PronounStyle,
  PlanConstraints,
  PlanMetadata,
  ResponsePlan,
  CandidateSet,
  ReasonCode,
  DecisionEvent,
  PlanObservability,
  PlanValidationResult,
  RiskFlags,
  ADSScore,
  MotiveDistribution,
} from '../../interface/types';

// Re-export builder functions from interface/plan_builders.ts
export {
  createDefaultPlan,
  createEmergencyPlan,
  createVModePlan,
  validatePlan,
} from '../../interface/plan_builders';
