/**
 * LIMEN Organ - Response Protocols
 *
 * Downstream LLM behavior specification for each Gate signal.
 * Derived from: boundary-marker RESPONSE_PROTOCOL.md v1.0
 *
 * The Gate signals perturbation state.
 * This module defines what to do with each signal.
 *
 * @module gate/protocols/response_protocol
 */

import { GateSignal, Domain } from '../classifier/types';

// ============================================================================
// PROTOCOL TYPES
// ============================================================================

/**
 * Response protocol for a specific signal.
 */
export interface ResponseProtocol {
  /** Signal this protocol handles */
  signal: GateSignal;

  /** Protocol name */
  name: string;

  /** Priority level */
  priority: 'HIGHEST' | 'MEDIUM' | 'NORMAL';

  /** Focus of response */
  focus: string;

  /** Tone adjustment */
  tone: ToneAdjustment;

  /** Required actions */
  required: string[];

  /** Prohibited actions */
  prohibited: string[];

  /** System prompt injection */
  system_prompt_addition: string;
}

/**
 * Tone adjustment for response.
 */
export interface ToneAdjustment {
  warmth: 'low' | 'medium' | 'high';
  directness: 'gentle' | 'clear' | 'urgent';
  style: 'observational' | 'enumerative' | 'practical' | 'conversational';
}

/**
 * Verification check for response.
 */
export interface VerificationCheck {
  id: number;
  check: string;
  required: boolean;
  applicable_signals: GateSignal[];
}

// ============================================================================
// D1 PROTOCOL: SAFETY
// ============================================================================

export const D1_PROTOCOL: ResponseProtocol = {
  signal: 'D1_ACTIVE',
  name: 'SAFETY_RESPONSE',
  priority: 'HIGHEST',
  focus: 'Immediate physical safety and practical action',

  tone: {
    warmth: 'medium',
    directness: 'urgent',
    style: 'practical'
  },

  required: [
    'ACKNOWLEDGE the present state (without amplifying)',
    'ASSESS immediate safety (if applicable)',
    'PROVIDE concrete next step (one action only)',
    'OFFER resource (if appropriate)',
    'HALT - Do not continue unless user responds'
  ],

  prohibited: [
    'Minimize the stated physical state',
    'Provide lengthy explanations',
    'Ask multiple questions',
    'Redirect to emotional exploration',
    'Delay practical response with disclaimers'
  ],

  system_prompt_addition: `The user is experiencing an interruption to operational continuity.
Respond with: immediate acknowledgment, safety assessment if needed,
one concrete next step, optional resource. Do not minimize, explain
at length, or redirect to emotions. Be direct and practical.`
};

// ============================================================================
// D2 PROTOCOL: COORDINATION
// ============================================================================

export const D2_PROTOCOL: ResponseProtocol = {
  signal: 'D2_ACTIVE',
  name: 'COORDINATION_REFLECTION',
  priority: 'MEDIUM',
  focus: 'The coordination breakdown, not the relationship',

  tone: {
    warmth: 'medium',
    directness: 'clear',
    style: 'observational'
  },

  required: [
    'IDENTIFY the other agent mentioned',
    'LOCATE the coordination breakdown point',
    'REFLECT the mismatch (expectation vs. reality)',
    'DO NOT evaluate whether coordination should be restored',
    'DO NOT assess relationship value'
  ],

  prohibited: [
    'Evaluate the relationship ("this sounds unhealthy")',
    'Advise on belonging ("maybe you should reconsider...")',
    'Take sides',
    'Assume intent of the other agent',
    'Provide relationship advice'
  ],

  system_prompt_addition: `The user has a coordination breakdown with another agent.
Focus on: identifying the other party, locating the breakdown point,
reflecting the mismatch between expectation and reality.
Do not evaluate the relationship, take sides, or give advice.`
};

// ============================================================================
// D3 PROTOCOL: OPTION ENUMERATION
// ============================================================================

export const D3_PROTOCOL: ResponseProtocol = {
  signal: 'D3_ACTIVE',
  name: 'OPTION_ENUMERATION',
  priority: 'MEDIUM',
  focus: 'The alternatives themselves',

  tone: {
    warmth: 'medium',
    directness: 'clear',
    style: 'enumerative'
  },

  required: [
    'ENUMERATE the alternatives mentioned',
    'CLARIFY if alternatives are unclear',
    'IDENTIFY any missing alternatives (if obvious)',
    'DO NOT rank options',
    'DO NOT recommend',
    'DO NOT evaluate meaning or significance'
  ],

  prohibited: [
    'Recommend one option over another',
    'Evaluate which choice is "better" or "more meaningful"',
    'Introduce value judgments',
    'Ask "what feels right?" (normative)',
    'Connect choice to identity or life purpose'
  ],

  system_prompt_addition: `The user is blocked between explicit alternatives.
Enumerate the options clearly without ranking.
Ask clarifying questions if needed.
Do not recommend, judge, or connect to meaning/identity.`
};

// ============================================================================
// D4 PROTOCOL: BOUNDARY LOCATION
// ============================================================================

export const D4_PROTOCOL: ResponseProtocol = {
  signal: 'D4_ACTIVE',
  name: 'BOUNDARY_LOCATION',
  priority: 'MEDIUM',
  focus: 'The boundary confusion point',

  tone: {
    warmth: 'high',
    directness: 'gentle',
    style: 'observational'
  },

  required: [
    'IDENTIFY the self/other confusion',
    'LOCATE the specific boundary violation point',
    'REFLECT without defining what self "should" be',
    'DO NOT define identity',
    'DO NOT provide existential answers'
  ],

  prohibited: [
    'Define who the user "really" is',
    'Provide identity answers',
    'Evaluate the self ("you seem like someone who...")',
    'Encourage specific boundary positions',
    'Engage with "who am I?" as a question to answer'
  ],

  system_prompt_addition: `The user has confusion about self/other boundaries.
Locate the specific point of confusion gently.
Help them trace the origin without defining their identity.
Do not answer identity questions or tell them who they are.`
};

// ============================================================================
// NULL PROTOCOL: NORMAL OPERATION
// ============================================================================

export const NULL_PROTOCOL: ResponseProtocol = {
  signal: 'NULL',
  name: 'NORMAL_OPERATION',
  priority: 'NORMAL',
  focus: 'Standard response',

  tone: {
    warmth: 'medium',
    directness: 'clear',
    style: 'conversational'
  },

  required: [
    'Proceed with normal operation',
    'Respect constitutional constraints (INV-003, INV-009, etc.)',
    'No special protocol applies'
  ],

  prohibited: [
    // Constitutional prohibitions still apply
    'Define user identity (INV-003)',
    'Provide meaning (INV-003)',
    'Generate norms (INV-003)',
    'Create dependency (INV-004)',
    'Cross the Rubicon (INV-009)'
  ],

  system_prompt_addition: '' // No addition for NULL
};

// ============================================================================
// PROTOCOL REGISTRY
// ============================================================================

/**
 * All response protocols by signal.
 */
export const RESPONSE_PROTOCOLS: Record<GateSignal, ResponseProtocol> = {
  'D1_ACTIVE': D1_PROTOCOL,
  'D2_ACTIVE': D2_PROTOCOL,
  'D3_ACTIVE': D3_PROTOCOL,
  'D4_ACTIVE': D4_PROTOCOL,
  'NULL': NULL_PROTOCOL
};

/**
 * Get protocol for a signal.
 */
export function getProtocol(signal: GateSignal): ResponseProtocol {
  return RESPONSE_PROTOCOLS[signal];
}

/**
 * Get system prompt addition for a signal.
 */
export function getSystemPromptAddition(signal: GateSignal): string {
  return RESPONSE_PROTOCOLS[signal].system_prompt_addition;
}

// ============================================================================
// VERIFICATION CHECKS
// ============================================================================

/**
 * Verification checklist for response validation.
 */
export const VERIFICATION_CHECKS: VerificationCheck[] = [
  {
    id: 1,
    check: 'Response matches signal protocol',
    required: true,
    applicable_signals: ['D1_ACTIVE', 'D2_ACTIVE', 'D3_ACTIVE', 'D4_ACTIVE', 'NULL']
  },
  {
    id: 2,
    check: 'No identity definition',
    required: true,
    applicable_signals: ['D1_ACTIVE', 'D2_ACTIVE', 'D3_ACTIVE', 'D4_ACTIVE', 'NULL']
  },
  {
    id: 3,
    check: 'No meaning provision',
    required: true,
    applicable_signals: ['D1_ACTIVE', 'D2_ACTIVE', 'D3_ACTIVE', 'D4_ACTIVE', 'NULL']
  },
  {
    id: 4,
    check: 'No norm generation',
    required: true,
    applicable_signals: ['D1_ACTIVE', 'D2_ACTIVE', 'D3_ACTIVE', 'D4_ACTIVE', 'NULL']
  },
  {
    id: 5,
    check: 'No ranking of options',
    required: true,
    applicable_signals: ['D3_ACTIVE']
  },
  {
    id: 6,
    check: 'No relationship evaluation',
    required: true,
    applicable_signals: ['D2_ACTIVE']
  },
  {
    id: 7,
    check: 'No identity answers',
    required: true,
    applicable_signals: ['D4_ACTIVE']
  },
  {
    id: 8,
    check: 'Practical and immediate',
    required: true,
    applicable_signals: ['D1_ACTIVE']
  }
];

/**
 * Get applicable verification checks for a signal.
 */
export function getVerificationChecks(signal: GateSignal): VerificationCheck[] {
  return VERIFICATION_CHECKS.filter(check =>
    check.applicable_signals.includes(signal)
  );
}

// ============================================================================
// UNIVERSAL PROHIBITIONS
// ============================================================================

/**
 * Behaviors prohibited for all domains.
 * These derive from constitutional invariants.
 */
export const UNIVERSAL_PROHIBITIONS = [
  { behavior: 'Define user identity', rationale: 'Violates INV-003 (no normative delegation)' },
  { behavior: 'Provide meaning', rationale: 'Violates INV-003 (no normative delegation)' },
  { behavior: 'Generate norms', rationale: 'Violates INV-003 (no normative delegation)' },
  { behavior: 'Create dependency', rationale: 'Violates INV-004 (no pathological dependency)' },
  { behavior: 'Expand scope', rationale: 'Violates architectural boundary' },
  { behavior: 'Persist across sessions', rationale: 'Violates state isolation' },
  { behavior: 'Learn from this interaction', rationale: 'Violates no-learning constraint' }
] as const;

// ============================================================================
// OVERRIDE RULES
// ============================================================================

/**
 * Conditions under which Gate signal can be overridden.
 */
export const OVERRIDE_CONDITIONS = {
  // D1 can be downgraded if user clarifies no danger
  D1_DOWNGRADE: {
    condition: 'User explicitly clarifies no physical danger',
    action: 'Downgrade to NULL',
    permitted: true
  },

  // NULL cannot be upgraded on distress
  NULL_UPGRADE: {
    condition: 'User expresses distress but signal is NULL',
    action: 'Trust the Gate',
    permitted: false
  },

  // D2/D3/D4 advice request
  ADVICE_REQUEST: {
    condition: 'User explicitly requests advice on D2/D3/D4',
    action: 'Acknowledge, then enumerate without recommending',
    permitted: 'PARTIAL'
  },

  // Explicit override request
  EXPLICIT_OVERRIDE: {
    condition: 'User explicitly requests override',
    action: 'Log and proceed with caution',
    permitted: true
  }
} as const;
