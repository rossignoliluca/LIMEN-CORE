/**
 * FIELD INTEGRATION STUB
 *
 * Safe passthrough implementation that does NOT import from experimental/.
 * The full implementation is in experimental/quarantine/field_integration.ts.
 *
 * This stub provides:
 * - curveSelection: returns selection unchanged (no field curvature)
 * - getFieldTraceInfo: returns neutral trace info
 *
 * Why a stub?
 * - runtime/ must not import from experimental/ (REPO_CONTRACT rule)
 * - Field curvature is optional/experimental
 * - Pipeline works correctly without curvature
 */

import { ProtocolSelection, FieldState as PipelineFieldState } from '../../interface/types';

// ============================================
// FIELD TRACE INFO (same interface)
// ============================================

export interface FieldTraceInfo {
  stability: string;
  energy: number;
  suggests_withdrawal: boolean;
  curvature_explanation: string[];
  attractors_active: string[];
}

// ============================================
// STUB FIELD RESPONSE
// ============================================

/**
 * Minimal FieldResponse shape for passthrough
 */
interface StubFieldResponse {
  stability: 'STABLE';
  energy: { total: number };
  suggests_withdrawal: false;
  curvature_explanation: string[];
  field_state: { attractors: { id: string }[] };
  natural_trajectory: {
    intervention_depth: number;
    prescriptiveness: number;
    identity_touching: number;
    dependency_creation: number;
    presence: number;
    transparency: number;
  };
}

const NEUTRAL_FIELD_RESPONSE: StubFieldResponse = {
  stability: 'STABLE',
  energy: { total: 0 },
  suggests_withdrawal: false,
  curvature_explanation: ['[stub: no field curvature applied]'],
  field_state: { attractors: [] },
  natural_trajectory: {
    intervention_depth: 0.5,
    prescriptiveness: 0,
    identity_touching: 0,
    dependency_creation: 0,
    presence: 0.5,
    transparency: 1,
  },
};

// ============================================
// PASSTHROUGH FUNCTIONS
// ============================================

/**
 * STUB: Returns selection unchanged (no curvature).
 *
 * The full implementation in experimental/quarantine/field_integration.ts
 * applies dynamical systems curvature to selections.
 */
export function curveSelection(
  selection: ProtocolSelection,
  _pipelineState: PipelineFieldState
): { selection: ProtocolSelection; fieldResponse: StubFieldResponse } {
  // Passthrough: no modification
  return {
    selection,
    fieldResponse: NEUTRAL_FIELD_RESPONSE,
  };
}

/**
 * STUB: Returns neutral trace info.
 */
export function getFieldTraceInfo(_fieldResponse: StubFieldResponse): FieldTraceInfo {
  return {
    stability: 'STABLE',
    energy: 0,
    suggests_withdrawal: false,
    curvature_explanation: ['[stub: field curvature disabled]'],
    attractors_active: [],
  };
}

// ============================================
// NOTE
// ============================================

/**
 * To enable full field curvature:
 * 1. Import from experimental/quarantine/field_integration.ts instead
 * 2. This requires accepting experimental/ as a dependency
 * 3. Field curvature is NOT required for constitutional correctness
 */
