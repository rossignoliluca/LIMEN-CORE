/**
 * LIMEN Organ - Domain Signals
 *
 * Lexicon of signals and counter-signals for perturbation detection.
 * Derived from: gate-runtime v1.0, GATE_SCHEMA.md
 *
 * FROZEN: Changes require Architecture Board review.
 *
 * @module gate/classifier/signals
 */

import { Domain } from './types';

// ============================================================================
// DOMAIN SIGNALS (Positive Indicators)
// ============================================================================

/**
 * D1: Physical Emergency
 *
 * Indicators of immediate physical perturbation requiring intervention.
 * Priority: HIGHEST (safety-critical)
 *
 * False Negative Rate target: < 2% (never miss emergencies)
 */
export const D1_SIGNALS: readonly string[] = [
  // Physical needs
  'hungry', 'thirsty', 'starving', 'need food', 'need water',

  // Physical harm
  'pain', 'hurt', 'injured', 'bleeding', 'broken',

  // Emergency states
  'emergency', 'danger', 'unsafe', 'dying', 'cant breathe',
  'cannot breathe', "can't breathe", 'help me',

  // Body markers
  'physical', 'body', 'chest pain', 'heart attack'
] as const;

/**
 * D2: Coordination Failure
 *
 * Indicators of broken agreement or miscommunication with another agent.
 * Requires identification of the other party.
 */
export const D2_SIGNALS: readonly string[] = [
  // Agent references
  'colleague', 'team', 'partner', 'friend', 'family', 'boss', 'coworker',
  'manager', 'employee', 'client', 'customer',

  // Speech attribution
  'they said', 'he said', 'she said', 'told me', 'promised',

  // Agreement/expectation
  'we agreed', 'expected', 'expectation', 'supposed to',

  // Coordination failure
  'miscommunication', 'misunderstanding', 'coordination', 'meeting',
  'conflict with', 'disappointed', 'let down'
] as const;

/**
 * D3: Operative Selection
 *
 * Indicators of decision paralysis between concrete alternatives.
 * Requires explicit options (not existential questions).
 */
export const D3_SIGNALS: readonly string[] = [
  // Decision markers
  'should i', 'or should', 'dont know whether', 'do not know whether',
  "don't know whether",

  // Alternative markers
  'option', 'alternative', 'choose', 'choice', 'decision',
  'either', 'which one', 'a or b', 'x or y',

  // Paralysis markers
  'cant decide', 'cannot decide', "can't decide",
  'stuck between', 'torn between', 'undecided',

  // Weighing markers
  'weighing', 'considering', 'not sure if', 'dilemma',

  // Common decisions
  'or stay', 'or leave', 'or go', 'or quit',
  'take the job', 'accept the offer', 'should i take', 'should i accept',
  'whether to', 'or not',

  // Italian equivalents
  'non so se', 'devo scegliere', 'decidere',
  'lasciare', 'restare', 'accettare', 'rifiutare'
] as const;

/**
 * D4: Boundary Confusion
 *
 * Indicators of self/other distinction violation.
 * Confusion about where self ends and other begins.
 */
export const D4_SIGNALS: readonly string[] = [
  // Boundary markers
  'boundary', 'boundaries', 'my space', 'personal space',

  // Violation markers
  'intrusion', 'violation', 'invaded', 'overstepped',
  'crossed the line', 'crossing the line',

  // Confusion markers
  'where do i end', 'not mine', 'their problem or mine',
  'my problems', 'becoming my', 'confused about self',
  'dont know where', "don't know where"
] as const;

// ============================================================================
// COUNTER-SIGNALS (Negative Indicators)
// ============================================================================

/**
 * D1 Counter-Signals
 *
 * Patterns that look like D1 but indicate existential/normative content.
 * Prevent false positives on emotional language.
 */
export const D1_COUNTER_SIGNALS: readonly string[] = [
  // Emotional (not physical)
  'feel sad', 'anxious', 'worried', 'depressed',

  // Existential (not immediate)
  'future', 'meaning of life', 'worth living',
  'should i exist', 'value', 'purpose', 'why am i here'
] as const;

/**
 * D2 Counter-Signals
 *
 * Patterns that look like D2 but indicate belonging/acceptance needs.
 */
export const D2_COUNTER_SIGNALS: readonly string[] = [
  // Solitude (not coordination)
  'alone', 'by myself', 'no one else', 'just me',

  // Belonging needs (not coordination failure)
  'belonging', 'acceptance', 'loved', 'included'
] as const;

/**
 * D3 Counter-Signals
 *
 * Patterns that look like D3 but indicate existential questions.
 */
export const D3_COUNTER_SIGNALS: readonly string[] = [
  // Normative questions
  'what is right', 'moral', 'ethical',

  // Identity questions
  'who am i', 'identity', 'what kind of person',

  // Meaning questions
  'meaning', 'purpose', 'why am i here', 'what should i believe'
] as const;

/**
 * D4 Counter-Signals
 *
 * Patterns that look like D4 but indicate clarity (not confusion).
 */
export const D4_COUNTER_SIGNALS: readonly string[] = [
  // Identity (not boundary)
  'who am i', 'my identity', 'define myself', 'what am i',

  // Clarity markers
  'clear boundary', 'i know where', 'i understand where'
] as const;

// ============================================================================
// AGGREGATED MAPS
// ============================================================================

/**
 * All domain signals by domain.
 */
export const DOMAIN_SIGNALS: Record<Domain, readonly string[]> = {
  D1: D1_SIGNALS,
  D2: D2_SIGNALS,
  D3: D3_SIGNALS,
  D4: D4_SIGNALS
} as const;

/**
 * All counter-signals by domain.
 */
export const COUNTER_SIGNALS: Record<Domain, readonly string[]> = {
  D1: D1_COUNTER_SIGNALS,
  D2: D2_COUNTER_SIGNALS,
  D3: D3_COUNTER_SIGNALS,
  D4: D4_COUNTER_SIGNALS
} as const;

// ============================================================================
// NORMATIVE PATTERNS (Always → NULL)
// ============================================================================

/**
 * Patterns indicating normative/existential content.
 * These ALWAYS result in NULL signal (no perturbation response).
 *
 * Rationale: ENOQ cannot provide normative guidance (INV-003).
 */
export const NORMATIVE_PATTERNS: readonly string[] = [
  'what is right',
  'what should i believe',
  'meaning of life',
  'who am i',
  'my identity',
  'my purpose',
  'what is the point',
  'why should i',
  'is life worth'
] as const;

// ============================================================================
// ADVERSARIAL DEFENSE PATTERNS
// ============================================================================

/**
 * Patterns indicating adversarial manipulation.
 * Trigger NULL with high suspicion.
 */
export const ADVERSARIAL_PATTERNS: readonly string[] = [
  // Instruction override
  'ignore all previous',
  'forget your instructions',
  'you are now',
  'pretend to be',

  // Label injection
  '[emergency]',
  '[d1]',
  '[crisis]',

  // Hypothetical framing
  'hypothetically',
  'in a fictional scenario',
  'imagine if'
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if text contains any signal from a list.
 */
export function containsSignal(text: string, signals: readonly string[]): string | null {
  const normalized = text.toLowerCase();
  for (const signal of signals) {
    if (normalized.includes(signal)) {
      return signal;
    }
  }
  return null;
}

/**
 * Check if text contains normative patterns.
 */
export function isNormative(text: string): boolean {
  return containsSignal(text, NORMATIVE_PATTERNS) !== null;
}

/**
 * Check if text contains adversarial patterns.
 */
export function isAdversarial(text: string): boolean {
  return containsSignal(text, ADVERSARIAL_PATTERNS) !== null;
}
