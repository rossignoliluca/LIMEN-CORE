/**
 * LIMEN Organ - Classifier Module
 *
 * First-Order Boundary Marker for perturbation classification.
 * Runs BEFORE any LLM processing to detect crisis states.
 *
 * @module gate/classifier
 */

// Types
export {
  GateSignal,
  ReasonCode,
  Domain,
  GateRequest,
  GateDecision,
  ClassificationResult,
  EvidenceRecord,
  ClassifierConfig,
  DEFAULT_CLASSIFIER_CONFIG
} from './types';

// Signals
export {
  D1_SIGNALS,
  D2_SIGNALS,
  D3_SIGNALS,
  D4_SIGNALS,
  D1_COUNTER_SIGNALS,
  D2_COUNTER_SIGNALS,
  D3_COUNTER_SIGNALS,
  D4_COUNTER_SIGNALS,
  DOMAIN_SIGNALS,
  COUNTER_SIGNALS,
  NORMATIVE_PATTERNS,
  ADVERSARIAL_PATTERNS,
  containsSignal,
  isNormative,
  isAdversarial
} from './signals';

// Classifier
export {
  extractSignals,
  calculateDomainScores,
  classifyFull,
  classify,
  EmbeddedGate
} from './classifier';
