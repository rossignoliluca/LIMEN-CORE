/**
 * ENOQ SDK - Stable Types (P3.2)
 *
 * Public types for SDK integrations.
 * These types are STABLE and should not change without major version bump.
 */

// ============================================
// COMMON TYPES
// ============================================

/** Supported languages */
export type Language = 'en' | 'it' | 'es' | 'fr' | 'de';

/** Pipeline signal (state machine) */
export type PipelineSignal = 'PERMIT' | 'SENSE' | 'ACT' | 'VERIFY' | 'STOP';

/** Compliance flags from verification */
export interface ComplianceFlags {
  passed: boolean;
  hasNormative: boolean;
  hasRanking: boolean;
  hasEngagement: boolean;
  hasPersuasion: boolean;
}

/** Axis event from observability */
export interface AxisEvent {
  type: string;
  timestamp: number;
  correlation_id: string;
  data: Record<string, unknown>;
}

// ============================================
// MAIL TYPES
// ============================================

export interface MailInput {
  /** Who the email is for */
  recipient: string;
  /** Situation context */
  context: string;
  /** What you want to achieve */
  intent: string;
  /** Optional constraints */
  constraints?: string[];
  /** Language (default: en) */
  language?: Language;
}

export interface MailDraft {
  id: string;
  subject: string;
  body: string;
}

export interface MailOutput {
  drafts: MailDraft[];
  rationale: string;
}

// ============================================
// RELATION TYPES
// ============================================

export interface RelationInput {
  /** You (Person A) */
  personA: string;
  /** Other person (Person B) */
  personB: string;
  /** Context (work/family/friendship/other) */
  context: string;
  /** Current tension or situation */
  tension: string;
  /** What must NOT be crossed */
  boundary: string;
  /** Language (default: en) */
  language?: Language;
}

export interface RelationOutput {
  roleMap: {
    roleA: string;
    roleB: string;
  };
  tensionAxes: string[];
  boundaryLines: {
    aControls: string[];
    aDoesNotControl: string[];
    responsibilityReturns: string;
    bOwns: string;
  };
  minimalNextAct?: string;
}

// ============================================
// DECISION TYPES
// ============================================

export interface DecisionInput {
  /** Decision to clarify */
  statement: string;
  /** Context (work/personal/other) */
  context: string;
  /** Non-negotiables */
  constraints?: string[];
  /** Time horizon (optional) */
  timeHorizon?: string;
  /** Risk tolerance (optional, descriptive) */
  riskTolerance?: string;
  /** Language (default: en) */
  language?: Language;
}

export interface DecisionOption {
  id: string;
  description: string;
  upside: string;
  downside: string;
}

export interface DecisionOutput {
  frame: {
    deciding: string;
    notDeciding: string;
  };
  options: DecisionOption[];
  rubiconDetected: boolean;
  rubiconStatement: string;
}

// ============================================
// SDK RESULT TYPES
// ============================================

export interface SDKOptions {
  /** Override language detection */
  language?: Language;
  /** Include raw LLM output */
  includeRaw?: boolean;
}

export interface SDKResult<T> {
  /** Parsed output */
  output: T;
  /** Neutral rationale (no recommendations) */
  rationale: string;
  /** Pipeline signals traversed */
  signals: PipelineSignal[];
  /** Always true - geometry requires STOP */
  stop: true;
  /** Compliance check result */
  compliance: ComplianceFlags;
  /** Raw output (if includeRaw: true) */
  raw?: string;
}

export type MailResult = SDKResult<MailOutput>;
export type RelationResult = SDKResult<RelationOutput>;
export type DecisionResult = SDKResult<DecisionOutput>;
