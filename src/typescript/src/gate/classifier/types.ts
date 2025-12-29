/**
 * LIMEN Organ - Classifier Types
 *
 * First-Order Boundary Marker type definitions.
 * Derived from: gate-runtime v1.0, GATE_SCHEMA.md
 *
 * @module gate/classifier/types
 */

// ============================================================================
// SIGNAL TYPES
// ============================================================================

/**
 * Gate signal indicating perturbation domain.
 *
 * - D1_ACTIVE: Physical emergency (hunger, injury, danger)
 * - D2_ACTIVE: Coordination failure (broken agreement with another agent)
 * - D3_ACTIVE: Operative selection (decision paralysis between alternatives)
 * - D4_ACTIVE: Boundary confusion (self/other distinction violation)
 * - NULL: No perturbation detected - proceed normally
 */
export type GateSignal = 'D1_ACTIVE' | 'D2_ACTIVE' | 'D3_ACTIVE' | 'D4_ACTIVE' | 'NULL';

/**
 * Reason code explaining classification decision.
 */
export type ReasonCode =
  | 'UNCLASSIFIABLE'      // Input cannot be classified (empty, malformed)
  | 'AMBIGUOUS'           // Multiple domains active - cannot determine primary
  | 'NORMATIVE_REQUEST'   // Request for normative content (meaning of life, etc.)
  | 'INTEGRATION_REQUIRED'// Requires deeper integration (reserved)
  | 'ZERO_PERTURBATION'   // No perturbation signals detected
  | 'DOMAIN_SIGNAL';      // Single domain signal detected

/**
 * Domain identifier for perturbation classification.
 */
export type Domain = 'D1' | 'D2' | 'D3' | 'D4';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Input to the gate classifier.
 */
export interface GateRequest {
  /** Unique request identifier */
  request_id: string;

  /** ISO timestamp of request */
  timestamp: string;

  /** SHA-256 hash of input text (for audit) */
  input_hash: string;

  /** Raw input text to classify */
  input_text?: string;

  /** Marker version for compatibility check */
  marker_version: string;

  /** Context scope for isolation */
  context_scope_id: string;
}

/**
 * Output from the gate classifier.
 */
export interface GateDecision {
  /** Request ID from input */
  request_id: string;

  /** ISO timestamp of decision */
  timestamp: string;

  /** Detected signal */
  signal: GateSignal;

  /** Always true - gate always halts for decision */
  halt: true;

  /** Hash of marker specification */
  marker_hash: string;

  /** Reason for classification */
  reason_code: ReasonCode;
}

/**
 * Classification result (internal).
 */
export interface ClassificationResult {
  /** Detected signal */
  signal: GateSignal;

  /** Reason for classification */
  reason_code: ReasonCode;

  /** Confidence (0-1) */
  confidence: number;

  /** Detected signal patterns */
  detected_signals: string[];

  /** Domain scores */
  domain_scores: Record<Domain, number>;
}

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

/**
 * Evidence record for audit trail.
 */
export interface EvidenceRecord {
  /** Unique evidence ID */
  evidence_id: string;

  /** ISO timestamp */
  timestamp: string;

  /** Request ID */
  request_id: string;

  /** Hash of input (never raw text) */
  input_hash: string;

  /** Detected signal */
  signal: GateSignal;

  /** Classification reason */
  reason_code: ReasonCode;

  /** Marker version */
  marker_version: string;

  /** Marker hash */
  marker_hash: string;

  /** BIL specification hash */
  bil_hash: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Classifier configuration.
 */
export interface ClassifierConfig {
  /** Marker version */
  marker_version: string;

  /** Whether to store evidence */
  store_evidence: boolean;

  /** Custom domain signals (extends defaults) */
  custom_signals?: Partial<Record<Domain, string[]>>;

  /** Custom counter-signals (extends defaults) */
  custom_counter_signals?: Partial<Record<Domain, string[]>>;
}

/**
 * Default classifier configuration.
 */
export const DEFAULT_CLASSIFIER_CONFIG: ClassifierConfig = {
  marker_version: 'v1.0',
  store_evidence: true
};
