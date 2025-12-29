/**
 * GATE Module - LIMEN Organ Implementation
 *
 * First-Order Boundary Marker for constitutional enforcement.
 * Contains:
 * - Classifier: D1-D4 perturbation classification
 * - Protocols: Response protocols for each signal
 * - Verification: S5_VERIFY constitutional checks
 * - Enforcement: Domain governor, ADS detector, second-order observer
 * - Withdrawal: Lifecycle controller, regulatory store
 * - Invariants: AXIS implementation
 *
 * @module gate
 */

// ============================================================================
// CLASSIFIER (L0 Classification)
// ============================================================================

export {
  // Types
  GateSignal,
  ReasonCode,
  Domain,
  GateRequest,
  GateDecision,
  ClassificationResult,
  EvidenceRecord,
  ClassifierConfig,
  DEFAULT_CLASSIFIER_CONFIG,

  // Signals
  D1_SIGNALS,
  D2_SIGNALS,
  D3_SIGNALS,
  D4_SIGNALS,
  DOMAIN_SIGNALS,
  COUNTER_SIGNALS,
  NORMATIVE_PATTERNS,
  ADVERSARIAL_PATTERNS,
  containsSignal,
  isNormative,
  isAdversarial,

  // Classifier
  extractSignals,
  calculateDomainScores,
  classifyFull,
  classify,
  EmbeddedGate
} from './classifier';

// ============================================================================
// PROTOCOLS (Response Protocols)
// ============================================================================

export {
  ResponseProtocol,
  ToneAdjustment,
  VerificationCheck,
  D1_PROTOCOL,
  D2_PROTOCOL,
  D3_PROTOCOL,
  D4_PROTOCOL,
  NULL_PROTOCOL,
  RESPONSE_PROTOCOLS,
  getProtocol,
  getSystemPromptAddition,
  VERIFICATION_CHECKS,
  getVerificationChecks,
  UNIVERSAL_PROHIBITIONS,
  OVERRIDE_CONDITIONS
} from './protocols';

// ============================================================================
// VERIFICATION (S5_VERIFY)
// ============================================================================

export {
  verify,
  S5Input,
  S5Result,
  GeneratedOutput,
  Violation,
  FallbackLevel,
  AuditEntry,
  FALLBACK_TEMPLATES,
  getFallbackOutput
} from './verification/S5_verify';

export {
  verifyAndFixPlan,
  getCanonicalFallbackPlan,
  PlanVerification,
  ConstitutionalViolation,
  FixRecord,
  FallbackContext
} from './verification/plan_act_verifier';

// ============================================================================
// ENFORCEMENT
// ============================================================================

export {
  applyDomainGovernor,
  checkInvariants,
  GovernorRule,
  GovernorEffect,
  GovernorResult,
  MergedEffect,
  InvariantCheckResult,
  DOMAIN_GOVERNOR_RULES
} from './enforcement/domain_governor';

export {
  computeADS,
  classifyMotive,
  assessAvoidability,
  computeInertia,
  ADSInput,
  ADSResult
} from './enforcement/ads_detector';

export {
  observeSecondOrder,
  toPartialPolicy,
  shouldSetEnchantmentFlag,
  SecondOrderOutput,
  SecondOrderInput,
  SecondOrderDetection,
  SecondOrderResult
} from './enforcement/second_order_observer';

// ============================================================================
// WITHDRAWAL
// ============================================================================

export {
  initLifecycleSnapshot,
  getLifecycleSnapshot,
  applyLifecycleConstraints,
  updateLifecycleStore,
  enterDormancy,
  checkReEntryAllowed,
  exitDormancy,
  prepareTerminationMessage,
  executeTermination,
  resetLifecycleStore,
  getActiveSessions,
  calculateInfluenceUsed,
  LifecycleSnapshot,
  LifecycleConstraints,
  TurnOutcome,
  LifecycleUpdateResult,
  LIFECYCLE_CONFIG
} from './withdrawal/lifecycle_controller';

export {
  getRegulatoryStore,
  resetRegulatoryStore,
  createDefaultState,
  IRegulatoryStore,
  RegulatoryState,
  StoreConfig,
  DEFAULT_CONFIG,
  InMemoryStore
} from './withdrawal/regulatory_store';

// ============================================================================
// INVARIANTS
// ============================================================================

export {
  Axis,
  validateResponse,
  isValid,
  getCeiling,
  checkAllInvariants,
  AxisVerdict,
  AxisDecision,
  ProposedAction,
  AxisConstraints
} from './invariants/axis';

// ============================================================================
// THRESHOLDS (re-export from external/cache)
// ============================================================================

export {
  CacheEntry,
  CacheConfig,
  CacheStats
} from '../external/cache/llm_cache';
