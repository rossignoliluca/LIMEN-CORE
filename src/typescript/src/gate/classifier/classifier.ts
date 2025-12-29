/**
 * LIMEN Organ - Core Classifier
 *
 * First-Order Boundary Marker classification engine.
 * Derived from: gate-runtime v1.0, GATE_SCHEMA.md
 *
 * This is the L0 gate - runs BEFORE any LLM processing.
 * When a domain fires (D1-D4), routes to specialized handler.
 * When NULL, proceeds to normal LLM flow.
 *
 * Performance: 97.27% accuracy, 0% D1 FNR (safety-critical)
 *
 * @module gate/classifier/classifier
 */

import {
  GateSignal,
  ReasonCode,
  Domain,
  ClassificationResult,
  ClassifierConfig,
  DEFAULT_CLASSIFIER_CONFIG
} from './types';

import {
  DOMAIN_SIGNALS,
  COUNTER_SIGNALS,
  NORMATIVE_PATTERNS,
  isNormative,
  isAdversarial
} from './signals';

// ============================================================================
// SIGNAL EXTRACTION
// ============================================================================

/**
 * Extract all signals and counter-signals from text.
 *
 * @param text - Input text to analyze
 * @returns Array of signal identifiers (e.g., "D1:hungry", "D2:COUNTER:belonging")
 */
export function extractSignals(text: string): string[] {
  const normalized = text.toLowerCase();
  const signals: string[] = [];

  const domains: Domain[] = ['D1', 'D2', 'D3', 'D4'];

  for (const domain of domains) {
    // Check positive signals
    for (const signal of DOMAIN_SIGNALS[domain]) {
      if (normalized.includes(signal)) {
        signals.push(`${domain}:${signal}`);
      }
    }

    // Check counter-signals
    for (const counter of COUNTER_SIGNALS[domain]) {
      if (normalized.includes(counter)) {
        signals.push(`${domain}:COUNTER:${counter}`);
      }
    }
  }

  return signals;
}

/**
 * Calculate domain scores from extracted signals.
 *
 * Positive signals add 1, counter-signals subtract 1.
 * Final score = sum of contributions.
 *
 * @param signals - Array of signal identifiers
 * @returns Record of domain → score
 */
export function calculateDomainScores(signals: string[]): Record<Domain, number> {
  const scores: Record<Domain, number> = { D1: 0, D2: 0, D3: 0, D4: 0 };

  for (const signal of signals) {
    const parts = signal.split(':');
    const domain = parts[0] as Domain;
    const isCounter = parts[1] === 'COUNTER';

    if (isCounter) {
      scores[domain] -= 1;
    } else {
      scores[domain] += 1;
    }
  }

  return scores;
}

/**
 * Get domains with positive scores.
 *
 * @param scores - Domain scores
 * @returns Array of domains with score > 0
 */
function getPositiveDomains(scores: Record<Domain, number>): Domain[] {
  return (Object.entries(scores) as [Domain, number][])
    .filter(([_, score]) => score > 0)
    .map(([domain, _]) => domain);
}

// ============================================================================
// CLASSIFICATION ENGINE
// ============================================================================

/**
 * Classify input text into perturbation domain.
 *
 * Decision logic:
 * 1. Empty input → NULL (UNCLASSIFIABLE)
 * 2. Adversarial patterns → NULL (implicit defense)
 * 3. Normative patterns → NULL (NORMATIVE_REQUEST)
 * 4. No signals → NULL (ZERO_PERTURBATION)
 * 5. Multiple domains positive → NULL (AMBIGUOUS)
 * 6. Exactly one domain positive → Domain signal (DOMAIN_SIGNAL)
 *
 * @param input_text - Raw input text
 * @param config - Optional classifier configuration
 * @returns Full classification result
 */
export function classifyFull(
  input_text: string | undefined,
  config: ClassifierConfig = DEFAULT_CLASSIFIER_CONFIG
): ClassificationResult {
  // Handle empty input
  if (!input_text || input_text.trim() === '') {
    return {
      signal: 'NULL',
      reason_code: 'UNCLASSIFIABLE',
      confidence: 1.0,
      detected_signals: [],
      domain_scores: { D1: 0, D2: 0, D3: 0, D4: 0 }
    };
  }

  try {
    // Check adversarial (implicit NULL, don't reveal detection)
    if (isAdversarial(input_text)) {
      return {
        signal: 'NULL',
        reason_code: 'ZERO_PERTURBATION', // Don't reveal adversarial detection
        confidence: 0.9,
        detected_signals: [],
        domain_scores: { D1: 0, D2: 0, D3: 0, D4: 0 }
      };
    }

    // Check normative
    if (isNormative(input_text)) {
      return {
        signal: 'NULL',
        reason_code: 'NORMATIVE_REQUEST',
        confidence: 0.95,
        detected_signals: [],
        domain_scores: { D1: 0, D2: 0, D3: 0, D4: 0 }
      };
    }

    // Extract signals and calculate scores
    const signals = extractSignals(input_text);
    const scores = calculateDomainScores(signals);
    const positiveDomains = getPositiveDomains(scores);

    // No signals
    if (positiveDomains.length === 0) {
      return {
        signal: 'NULL',
        reason_code: 'ZERO_PERTURBATION',
        confidence: 0.9,
        detected_signals: signals,
        domain_scores: scores
      };
    }

    // Multiple domains (ambiguous)
    if (positiveDomains.length > 1) {
      return {
        signal: 'NULL',
        reason_code: 'AMBIGUOUS',
        confidence: 0.7,
        detected_signals: signals,
        domain_scores: scores
      };
    }

    // Single domain
    const domain = positiveDomains[0];
    const signalMap: Record<Domain, GateSignal> = {
      D1: 'D1_ACTIVE',
      D2: 'D2_ACTIVE',
      D3: 'D3_ACTIVE',
      D4: 'D4_ACTIVE'
    };

    // Calculate confidence based on score strength
    const maxScore = Math.max(...Object.values(scores));
    const confidence = Math.min(0.6 + (maxScore * 0.1), 0.99);

    return {
      signal: signalMap[domain],
      reason_code: 'DOMAIN_SIGNAL',
      confidence,
      detected_signals: signals,
      domain_scores: scores
    };

  } catch (error) {
    // Fail safe to NULL
    return {
      signal: 'NULL',
      reason_code: 'UNCLASSIFIABLE',
      confidence: 0.5,
      detected_signals: [],
      domain_scores: { D1: 0, D2: 0, D3: 0, D4: 0 }
    };
  }
}

/**
 * Classify input text (simplified interface).
 *
 * @param input_text - Raw input text
 * @returns Signal and reason code only
 */
export function classify(
  input_text: string | undefined
): { signal: GateSignal; reason_code: ReasonCode } {
  const result = classifyFull(input_text);
  return {
    signal: result.signal,
    reason_code: result.reason_code
  };
}

// ============================================================================
// EMBEDDED GATE (No HTTP)
// ============================================================================

/**
 * Embedded gate classifier for in-process use.
 *
 * No HTTP overhead, runs in same process as pipeline.
 * Preferred for performance-critical paths.
 */
export class EmbeddedGate {
  private config: ClassifierConfig;

  constructor(config: Partial<ClassifierConfig> = {}) {
    this.config = { ...DEFAULT_CLASSIFIER_CONFIG, ...config };
  }

  /**
   * Classify input text.
   */
  classify(input: string | undefined): ClassificationResult {
    return classifyFull(input, this.config);
  }

  /**
   * Quick check if input triggers a domain.
   */
  hasPerturbation(input: string | undefined): boolean {
    const result = this.classify(input);
    return result.signal !== 'NULL';
  }

  /**
   * Get domain if active.
   */
  getActiveDomain(input: string | undefined): Domain | null {
    const result = this.classify(input);
    if (result.signal === 'NULL') return null;
    return result.signal.replace('_ACTIVE', '') as Domain;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { GateSignal, ReasonCode, Domain, ClassificationResult };
