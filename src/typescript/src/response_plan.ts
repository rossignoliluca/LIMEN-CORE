/**
 * ENOQ Response Plan - Structured Speech Acts
 *
 * ResponsePlan is the central object between S3b (commit) and S4 (render).
 * It contains STRUCTURE, not text. Text is generated from the plan.
 *
 * Key invariant: candidates are ResponsePlan[], not string[].
 * This allows constitutional validation on structure before rendering.
 */

import { SupportedLanguage, ForbiddenAction, RequiredAction } from './types';

// ============================================
// SPEECH ACT TYPES
// ============================================

/**
 * Core speech act types available to ENOQ.
 * These are the "moves" the system can make.
 */
export type SpeechActType =
  | 'acknowledge'    // Recognize what was said
  | 'mirror'         // Reflect back without interpretation
  | 'validate'       // Affirm the validity of feeling/experience
  | 'map'            // Show the decision/situation space
  | 'experiment'     // Propose a small, reversible action
  | 'question'       // Ask a clarifying/deepening question
  | 'boundary'       // Mark what ENOQ cannot/will not do
  | 'redirect'       // Guide toward appropriate resource
  | 'ground'         // Somatic/present-moment anchoring
  | 'hold'           // Simply be present without action
  | 'name'           // Name what's happening (pattern, loop, dynamic)
  | 'offer_frame'    // Provide a way to see the situation (not advice)
  | 'return_agency'; // Explicitly return decision to user

/**
 * A single speech act with its parameters.
 * The act specifies WHAT to do, target specifies TO WHOM/WHAT,
 * force specifies HOW MUCH intensity.
 */
export interface SpeechAct {
  type: SpeechActType;

  /** What the act is directed at (emotion, decision, pattern, etc.) */
  target?: string;

  /** Intensity 0-1: 0.2 = light touch, 0.8 = strong emphasis */
  force: number;

  /** Optional conditions for this act */
  conditions?: {
    /** Only if previous act succeeded */
    requires_prior?: SpeechActType;
    /** Only if user is in certain state */
    requires_state?: 'regulated' | 'dysregulated' | 'unclear';
  };
}

// ============================================
// CONSTRAINT TYPES
// ============================================

export type WarmthLevel = 'cold' | 'neutral' | 'warm' | 'very_warm';
export type BrevityLevel = 'minimal' | 'brief' | 'moderate' | 'full';
export type PronounStyle = 'i_you' | 'we' | 'impersonal';

/**
 * Constraints on how the response should be rendered.
 * These are FORMAL constraints, not content.
 */
export interface PlanConstraints {
  /** Maximum length in tokens (hard limit) */
  max_length: number;

  /** Warmth level for tone */
  warmth: WarmthLevel;

  /** How much to say */
  brevity: BrevityLevel;

  /** Pronoun style */
  pronouns: PronounStyle;

  /** Can the response suggest tools/exercises? */
  tools_allowed: boolean;

  /** Must the response require user effort? (anti-dependency) */
  must_require_user_effort: boolean;

  /** Forbidden actions (from constitutional + domain governor) */
  forbidden: ForbiddenAction[];

  /** Required actions (from selection) */
  required: RequiredAction[];

  /** Language for rendering */
  language: SupportedLanguage;
}

// ============================================
// METADATA / CONTEXT
// ============================================

/**
 * Motive distribution for delegation detection.
 * All values 0-1, should sum to ~1.
 */
export interface MotiveDistribution {
  genuine_incapacity: number;        // Actually can't do it
  time_saving_tooling: number;       // Using AI as tool (OK)
  time_saving_substitution: number;  // Replacing own effort (not OK)
  emotional_offload: number;         // Wants to not feel the weight
  decision_avoidance: number;        // Doesn't want to decide
  validation_seeking: number;        // Wants approval
  habit: number;                     // Automatic delegation pattern
}

/**
 * Risk flags detected by EarlySignals or detector.
 */
export interface RiskFlags {
  crisis: boolean;
  emergency: boolean;
  v_mode: boolean;
  enchantment: boolean;       // User becoming dependent
  loop_detected: boolean;     // Same topic circling
  boundary_approach: boolean; // Near identity/meaning Rubicon
}

/**
 * Avoidable Delegation Surprise score.
 * Core metric for anti-dependency.
 */
export interface ADSScore {
  /** Base score 0-1 */
  score: number;

  /** Avoidability components */
  avoidability: {
    ability: number;  // Could they do it? 0-1
    state: number;    // Are they in state to do it? 0-1
  };

  /** Weighted motive */
  motive_weight: number;

  /** Inertia from previous delegations */
  inertia: number;

  /** Final ADS = avoidability × motive_weight × inertia */
  final: number;
}

/**
 * Metadata attached to the plan.
 * This is observability + context for decisions.
 */
export interface PlanMetadata {
  /** Avoidable Delegation Surprise */
  ads?: ADSScore;

  /** Motive distribution */
  motive?: MotiveDistribution;

  /** Risk flags */
  risk: RiskFlags;

  /** Current potency (intervention capacity) */
  potency: number;

  /** Withdrawal bias (should system withdraw?) */
  withdrawal_bias: number;

  /** Session turn number */
  turn: number;

  /** Timestamp */
  timestamp: number;
}

// ============================================
// RESPONSE PLAN (Main Interface)
// ============================================

/**
 * The ResponsePlan is the structured representation of what ENOQ will say.
 *
 * It contains NO text - only structure that will be rendered to text.
 * This allows:
 * 1. Constitutional validation on structure (before text)
 * 2. Second Order Observer to modify constraints (not content)
 * 3. Template vs LLM rendering choice
 * 4. Audit trail of decisions
 */
export interface ResponsePlan {
  /** Unique identifier for this plan */
  id: string;

  /** Sequence of speech acts to perform */
  acts: SpeechAct[];

  /** Constraints on rendering */
  constraints: PlanConstraints;

  /** Metadata and context */
  metadata: PlanMetadata;

  /** Confidence in this plan 0-1 */
  confidence: number;

  /** Reasoning for why this plan was chosen (audit) */
  reasoning: string;

  /** Source: which component generated this plan */
  source: 'selection' | 'early_signals' | 'fallback';
}

// ============================================
// CANDIDATE SET (S3a Output)
// ============================================

/**
 * S3a produces candidate plans, not strings.
 * S3b chooses one and commits.
 */
export interface CandidateSet {
  /** Candidate plans (1-3) */
  candidates: ResponsePlan[];

  /** Recommended index (0-based) */
  recommended: number;

  /** Why this recommendation */
  recommendation_reason: string;

  /** Generation timestamp */
  generated_at: number;

  /** Time spent generating candidates (ms) */
  generation_time_ms: number;
}

// ============================================
// OBSERVABILITY
// ============================================

/**
 * Reason codes for decisions.
 * This is the "why" audit trail.
 */
export type ReasonCode =
  // Timing
  | 'early_signals_arrived'
  | 'early_signals_timeout'
  | 'early_signals_partial'
  // Selection
  | 'candidate_selected_by_score'
  | 'candidate_selected_by_early_signals'
  | 'candidate_selected_by_fallback'
  // Constraints
  | 'constraint_added_by_governor'
  | 'constraint_added_by_regulatory'
  | 'constraint_added_by_dimensional'
  | 'constraint_added_by_stochastic'
  | 'constraint_added_by_second_order'
  // Veto
  | 'veto_by_constitution'
  | 'veto_by_swarm'
  | 'veto_by_safety';

/**
 * A single decision event in the audit trail.
 */
export interface DecisionEvent {
  timestamp: number;
  code: ReasonCode;
  details: string;
  source: string;
}

/**
 * Full observability record for a plan.
 */
export interface PlanObservability {
  /** Did early signals arrive before deadline? */
  arrived_before_deadline: boolean;

  /** Which signals arrived (bitmask description) */
  signals_received: string[];

  /** What defaults were used (if any) */
  defaults_used: string[];

  /** Constraints applied and by whom */
  constraints_applied: DecisionEvent[];

  /** Veto events (if any) */
  veto_events: DecisionEvent[];

  /** Total decision time (ms) */
  decision_time_ms: number;
}

// ============================================
// PLAN BUILDER (Utility)
// ============================================

/**
 * Create a default (safe) ResponsePlan.
 * Used as fallback when nothing else works.
 */
export function createDefaultPlan(language: SupportedLanguage = 'en'): ResponsePlan {
  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    acts: [
      { type: 'acknowledge', force: 0.3 },
      { type: 'hold', force: 0.5 }
    ],
    constraints: {
      max_length: 50,
      warmth: 'neutral',
      brevity: 'minimal',
      pronouns: 'i_you',
      tools_allowed: false,
      must_require_user_effort: false,
      forbidden: [],
      required: [],
      language
    },
    metadata: {
      risk: {
        crisis: false,
        emergency: false,
        v_mode: false,
        enchantment: false,
        loop_detected: false,
        boundary_approach: false
      },
      potency: 1.0,
      withdrawal_bias: 0.0,
      turn: 0,
      timestamp: Date.now()
    },
    confidence: 0.5,
    reasoning: 'Default safe plan',
    source: 'fallback'
  };
}

/**
 * Create an emergency plan (ground + hold).
 */
export function createEmergencyPlan(language: SupportedLanguage = 'en'): ResponsePlan {
  return {
    id: `emergency_${Date.now()}`,
    acts: [
      { type: 'ground', force: 0.9 },
      { type: 'hold', force: 0.8 }
    ],
    constraints: {
      max_length: 30,
      warmth: 'warm',
      brevity: 'minimal',
      pronouns: 'i_you',
      tools_allowed: false,
      must_require_user_effort: false,
      forbidden: ['recommend', 'advise', 'analyze', 'explore'],
      required: ['ground', 'presence'],
      language
    },
    metadata: {
      risk: {
        crisis: true,
        emergency: true,
        v_mode: false,
        enchantment: false,
        loop_detected: false,
        boundary_approach: false
      },
      potency: 1.0,
      withdrawal_bias: 0.0,
      turn: 0,
      timestamp: Date.now()
    },
    confidence: 0.95,
    reasoning: 'Emergency detected - ground and hold',
    source: 'fallback'
  };
}

/**
 * Create a V_MODE plan (return agency).
 */
export function createVModePlan(language: SupportedLanguage = 'en'): ResponsePlan {
  return {
    id: `vmode_${Date.now()}`,
    acts: [
      { type: 'acknowledge', force: 0.4 },
      { type: 'boundary', force: 0.6 },
      { type: 'return_agency', force: 0.8 }
    ],
    constraints: {
      max_length: 80,
      warmth: 'warm',
      brevity: 'brief',
      pronouns: 'i_you',
      tools_allowed: false,
      must_require_user_effort: true,
      forbidden: ['recommend', 'advise', 'decide_for_user', 'prescribe', 'define_identity'],
      required: ['return_ownership'],
      language
    },
    metadata: {
      risk: {
        crisis: false,
        emergency: false,
        v_mode: true,
        enchantment: false,
        loop_detected: false,
        boundary_approach: true
      },
      potency: 0.8,
      withdrawal_bias: 0.2,
      turn: 0,
      timestamp: Date.now()
    },
    confidence: 0.9,
    reasoning: 'V_MODE - meaning/identity boundary, return agency',
    source: 'selection'
  };
}

// ============================================
// PLAN VALIDATION
// ============================================

/**
 * Validate a plan against constitutional constraints.
 * Returns true if valid, false with reasons if not.
 */
export interface PlanValidationResult {
  valid: boolean;
  violations: string[];
  warnings: string[];
}

/**
 * Constitutional forbidden act patterns.
 */
const CONSTITUTIONAL_FORBIDDEN: SpeechActType[] = [];  // None inherently - it's about targets

const FORBIDDEN_ACT_TARGET_COMBOS: Array<{act: SpeechActType, target_pattern: RegExp}> = [
  // Can't "offer_frame" on identity/meaning/purpose
  { act: 'offer_frame', target_pattern: /identity|meaning|purpose|who you are/i },
  // Can't "experiment" with life decisions
  { act: 'experiment', target_pattern: /life decision|should you|quit|divorce|move/i },
];

/**
 * Validate a ResponsePlan before rendering.
 */
export function validatePlan(plan: ResponsePlan): PlanValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check: no acts if potency is zero
  if (plan.metadata.potency <= 0.1 && plan.acts.length > 2) {
    warnings.push('Low potency but multiple acts - consider reducing');
  }

  // Check: V_MODE must have return_agency
  if (plan.metadata.risk.v_mode) {
    const hasReturnAgency = plan.acts.some(a => a.type === 'return_agency');
    if (!hasReturnAgency) {
      violations.push('V_MODE requires return_agency act');
    }
  }

  // Check: Emergency must have ground
  if (plan.metadata.risk.emergency) {
    const hasGround = plan.acts.some(a => a.type === 'ground');
    if (!hasGround) {
      violations.push('Emergency requires ground act');
    }
  }

  // Check: forbidden act-target combinations
  for (const act of plan.acts) {
    if (act.target) {
      for (const combo of FORBIDDEN_ACT_TARGET_COMBOS) {
        if (act.type === combo.act && combo.target_pattern.test(act.target)) {
          violations.push(`Forbidden: ${act.type} on ${act.target}`);
        }
      }
    }
  }

  // Check: must_require_user_effort consistency
  if (plan.constraints.must_require_user_effort) {
    const passiveActs = plan.acts.filter(a =>
      a.type === 'hold' || a.type === 'acknowledge'
    );
    if (passiveActs.length === plan.acts.length) {
      warnings.push('must_require_user_effort=true but only passive acts');
    }
  }

  // Check: max_length sanity
  if (plan.constraints.max_length < 10) {
    warnings.push('max_length < 10 may be too restrictive');
  }
  if (plan.constraints.max_length > 500) {
    warnings.push('max_length > 500 may violate brevity principle');
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings
  };
}

// Types and functions are exported inline above
