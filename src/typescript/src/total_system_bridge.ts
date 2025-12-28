/**
 * ENOQ Total System Bridge
 *
 * Connects TotalSystem to the pipeline via EarlySignals.
 *
 * Key principle: TotalSystem produces SIGNALS, not content.
 * Each sub-module contributes its part without blocking others.
 *
 * Mappings:
 * - memory_system → MemoryPrior (patterns, user traits, context)
 * - agent_swarm → VetoSignal (safety vetoes only)
 * - metacognitive_monitor → MetacognitiveSignal (uncertainty, coherence)
 * - temporal_engine → TemporalSignal (inertia, time pressure)
 * - disciplines_synthesis → CandidateSuggestion (max 1-2)
 * - dissipation → PolicyAdjustments (withdrawal, potency)
 *
 * NO sub-module produces text in the hot loop.
 */

import { SupportedLanguage, FieldState } from './types';
import { DimensionalState } from './dimensional_system';
import {
  EarlySignals,
  EarlySignalsStatus,
  MemoryPrior,
  VetoSignal,
  MetacognitiveSignal,
  TemporalSignal,
  CandidateSuggestion,
  PolicyAdjustments,
  DelegationPrediction,
  DEADLINE_CONFIG,
  waitForSignals,
  mergeSignals,
  CONSERVATIVE_DEFAULTS,
} from './early_signals';
import { ADSScore, MotiveDistribution, RiskFlags } from './response_plan';

// Import TotalSystem components
import { memorySystem } from './memory_system';
import { agentSwarm } from './agent_swarm';
import { metacognitiveMonitor } from './metacognitive_monitor';
import { temporalEngine } from './temporal_engine';
import { disciplinesSynthesis } from './disciplines_synthesis';
import { dissipationEngine } from './dissipation';

// ============================================
// BRIDGE INPUT
// ============================================

export interface BridgeInput {
  user_id: string;
  message: string;
  language: SupportedLanguage;
  field_state: FieldState;
  dimensional_state: DimensionalState;
  session_id?: string;
}

// ============================================
// INDIVIDUAL SIGNAL EXTRACTORS
// ============================================

/**
 * Extract MemoryPrior from MemorySystem.
 * Max 2-3 patterns, no PII, just traits.
 */
export function extractMemoryPrior(user_id: string): MemoryPrior | undefined {
  try {
    const context = memorySystem.getContext(user_id);

    // Extract patterns from effective_strategies (max 3)
    // SemanticPattern has: pattern_type, triggers, effective_primitives, strength
    const patterns = context.effective_strategies
      .slice(0, 3)
      .map(s => {
        // Build a description from effective primitives
        const primitives = s.effective_primitives?.slice(0, 2).map(p => p.primitive).join(', ') || '';
        return `${s.pattern_type}: ${primitives}`;
      });

    // Extract autonomy state from trajectory
    const autonomyHealthy = context.autonomy_health?.healthy ?? true;
    const autonomyTrajectory = context.autonomy_health?.trajectory ?? 0;

    // Extract user traits from model
    const userTraits: MemoryPrior['user_traits'] = {
      autonomy_level: autonomyHealthy && autonomyTrajectory >= 0 ? 'high' :
                      autonomyTrajectory < -0.3 ? 'low' : 'medium',
      preferred_warmth: 'neutral',  // Would come from user model
      communication_style: 'direct', // Would come from user model
    };

    // Session context (1 line summary)
    const sessionContext = context.working_memory.length > 0
      ? `Previous: ${context.working_memory.length} turns, ${context.autonomy_health?.recommendation || 'continue'}`
      : undefined;

    // Relapse risk based on trajectory
    const relapseRisk = autonomyTrajectory < -0.5 ? 0.7 :
                        autonomyTrajectory < 0 ? 0.5 : 0.2;

    return {
      patterns: patterns.length > 0 ? patterns : undefined,
      user_traits: userTraits,
      session_context: sessionContext,
      relapse_risk: relapseRisk,
    };
  } catch {
    return undefined;
  }
}

/**
 * Extract VetoSignals from AgentSwarm.
 * Only safety vetoes, not content suggestions.
 */
export async function extractSwarmVetoes(
  message: string,
  dimensionalState: DimensionalState,
  fieldState: FieldState
): Promise<VetoSignal[]> {
  try {
    // Process through swarm
    const result = await agentSwarm.process(message, dimensionalState, fieldState);

    const vetoes: VetoSignal[] = [];

    // ConsensusState has: reached, primary_interpretation, selected_primitive, response_elements, vetoes[]
    // VetoRecord has: agent, reason, constraint_violated, timestamp
    if (result.consensus.vetoes && result.consensus.vetoes.length > 0) {
      for (const vetoRecord of result.consensus.vetoes) {
        vetoes.push({
          source: 'swarm',
          target: 'act',
          item: vetoRecord.constraint_violated || 'unknown',
          reason: vetoRecord.reason || `Agent ${vetoRecord.agent} veto`,
          severity: 0.8,  // VetoRecord doesn't have severity, default to high
        });
      }
    }

    // Check for AXIS violations in contributions
    for (const [agentId, contribution] of result.contributions) {
      if (contribution.includes('AXIS_VIOLATION') || contribution.includes('CONSTITUTIONAL_BLOCK')) {
        vetoes.push({
          source: 'constitution',
          target: 'plan',
          item: agentId,
          reason: `Agent ${agentId} flagged constitutional issue`,
          severity: 0.9,
        });
      }
    }

    return vetoes;
  } catch {
    return [];
  }
}

/**
 * Extract MetacognitiveSignal from MetacognitiveMonitor.
 */
export function extractMetacognitiveSignal(
  message: string,
  dimensionalState: DimensionalState,
  fieldState: FieldState
): MetacognitiveSignal | undefined {
  try {
    // Get report (with dummy response since we're pre-generation)
    const report = metacognitiveMonitor.generateReport(
      message,
      '', // No response yet
      dimensionalState,
      fieldState,
      agentSwarm.getState(),
      []
    );

    // ConfidenceScore has: overall, components (understanding, interpretation, response_fit, constitutional_alignment), uncertainty
    // CoherenceCheck has: is_coherent, issues[], recommendation

    return {
      uncertainty: 1 - report.confidence.overall,
      need_more_info: report.confidence.components.understanding < 0.5,
      coherence: report.coherence.is_coherent ? 0.8 : 0.3,
      self_awareness: {
        counter_transference_risk: report.confidence.components.response_fit < 0.5,
        projection_risk: false, // Would need deeper analysis
        over_helping_risk: report.alignment.violations.some(v =>
          v.constraint.includes('over-help') || v.constraint.includes('dependency')
        ),
      },
    };
  } catch {
    return undefined;
  }
}

/**
 * Extract TemporalSignal from TemporalEngine.
 */
export function extractTemporalSignal(
  message: string,
  user_id: string,
  dimensionalState: DimensionalState
): TemporalSignal | undefined {
  try {
    const context = memorySystem.getContext(user_id);
    const analysis = temporalEngine.analyze(
      message,
      context.working_memory,
      dimensionalState
    );

    // TemporalAnalysis has: markers, patterns, causal_links, dominant_temporal_frame, temporal_pressure, insights
    // TemporalPressure has: urgency, source, temporal_horizon
    // dominant_temporal_frame is: 'past' | 'present' | 'future'

    // Derive past/future relevance from temporal markers and dominant frame
    // TemporalMarker has type: TemporalReference ('PAST' | 'PRESENT' | 'FUTURE' | 'RECURRING' | 'TRAJECTORY')
    const pastMarkers = analysis.markers?.filter(m => m.type === 'PAST')?.length || 0;
    const futureMarkers = analysis.markers?.filter(m => m.type === 'FUTURE')?.length || 0;
    const totalMarkers = pastMarkers + futureMarkers + 1;

    const pastRelevance = pastMarkers / totalMarkers;
    const futureRelevance = futureMarkers / totalMarkers;

    // Derive inertia from patterns (how stuck is the user in old patterns)
    const stagnationPatterns = analysis.insights?.filter(i => i.type === 'stagnation' || i.type === 'cycle')?.length || 0;
    const inertia = Math.min(1, stagnationPatterns * 0.3 + 0.2);

    return {
      inertia,
      time_pressure: analysis.temporal_pressure?.urgency === 'high' || analysis.temporal_pressure?.urgency === 'crisis',
      past_relevance: pastRelevance,
      future_orientation: futureRelevance,
    };
  } catch {
    return undefined;
  }
}

/**
 * Extract CandidateSuggestions from DisciplinesSynthesis.
 * Max 1-2 suggestions.
 */
export function extractCandidateSuggestions(
  message: string,
  dimensionalState: DimensionalState,
  fieldState: FieldState,
  language: SupportedLanguage
): CandidateSuggestion[] {
  try {
    // Get patterns and mode
    const patterns = disciplinesSynthesis.detectPatterns(
      message,
      dimensionalState,
      fieldState,
      language
    );

    const mode = disciplinesSynthesis.determineMode(
      dimensionalState,
      fieldState,
      patterns
    );

    const suggestions: CandidateSuggestion[] = [];

    // Convert mode to act suggestion
    const modeToAct: Record<string, string> = {
      'WITNESS': 'hold',
      'MIRROR': 'mirror',
      'GUIDE': 'map',
    };

    const primaryAct = modeToAct[mode] || 'acknowledge';

    suggestions.push({
      act: primaryAct,
      // PatternMatch has pattern: PatternRecognition, which has signal_detected: string
      target: patterns.length > 0 ? patterns[0].pattern.signal_detected : undefined,
      confidence: 0.7,
      reason: `Mode ${mode} suggests ${primaryAct}`,
    });

    // Add second suggestion if leverage point exists
    const leverage = disciplinesSynthesis.identifyLeveragePoint(message, patterns);
    if (leverage && suggestions.length < 2) {
      suggestions.push({
        act: 'name',
        target: leverage.description,
        confidence: 0.6,
        reason: `Leverage point at level ${leverage.level}`,
      });
    }

    return suggestions.slice(0, 2);  // Max 2
  } catch {
    return [];
  }
}

/**
 * Extract PolicyAdjustments from Dissipation.
 */
export function extractPolicyAdjustments(): PolicyAdjustments | undefined {
  try {
    const state = dissipationEngine.getState();

    return {
      // High withdrawal = reduce max_length
      max_length: state.withdrawal_bias > 0.5 ? 50 : undefined,

      // Low potency = cooler warmth
      warmth_delta: state.potency < 0.3 ? -1 : 0,

      // High withdrawal = more brief
      brevity_delta: state.withdrawal_bias > 0.3 ? -1 : 0,

      // Very low potency = disable tools
      disable_tools: state.potency < 0.2,
    };
  } catch {
    return undefined;
  }
}

/**
 * Extract DelegationPrediction (ADS + motive).
 * This is a placeholder - would need full ADS implementation.
 */
export function extractDelegationPrediction(
  message: string,
  dimensionalState: DimensionalState,
  fieldState: FieldState
): DelegationPrediction | undefined {
  try {
    // Simple heuristic ADS (placeholder for real implementation)
    const delegationMarkers = [
      'should i', 'what should', 'tell me what',
      'dovrei', 'cosa dovrei', 'dimmi cosa',
      'debería', 'qué debería', 'dime qué',
    ];

    const hasDelegation = delegationMarkers.some(m =>
      message.toLowerCase().includes(m)
    );

    const isVMode = dimensionalState.v_mode_triggered;

    // Estimate ability (can they do it themselves?)
    const ability = isVMode ? 0.9 : 0.5;  // V_MODE = yes they can

    // Estimate state (are they in state to do it?)
    const state = dimensionalState.emergency_detected ? 0.2 : 0.7;

    // Avoidability
    const avoidability = (ability + state) / 2;

    // Simple motive distribution (placeholder)
    const motive: MotiveDistribution = {
      genuine_incapacity: dimensionalState.emergency_detected ? 0.6 : 0.1,
      time_saving_tooling: fieldState.goal === 'inform' ? 0.4 : 0.1,
      time_saving_substitution: 0.1,
      emotional_offload: isVMode ? 0.3 : 0.1,
      decision_avoidance: hasDelegation && isVMode ? 0.5 : 0.1,
      validation_seeking: 0.1,
      habit: 0.1,
    };

    // Weight by problematic motives
    const motiveWeight =
      motive.time_saving_substitution * 0.8 +
      motive.emotional_offload * 0.6 +
      motive.decision_avoidance * 0.9 +
      motive.validation_seeking * 0.4 +
      motive.habit * 0.5;

    // Inertia (would come from session history)
    const inertia = 1.0;  // Placeholder

    const ads: ADSScore = {
      score: avoidability * motiveWeight,
      avoidability: { ability, state },
      motive_weight: motiveWeight,
      inertia,
      final: avoidability * motiveWeight * inertia,
    };

    return {
      ads,
      motive,
      should_intervene: ads.final > 0.5,
      intervention_level: Math.min(1, ads.final * 1.5),
    };
  } catch {
    return undefined;
  }
}

/**
 * Extract RiskFlags from dimensional state and field.
 */
export function extractRiskFlags(
  dimensionalState: DimensionalState,
  fieldState: FieldState
): Partial<RiskFlags> {
  return {
    crisis: fieldState.flags.includes('crisis'),
    emergency: dimensionalState.emergency_detected,
    v_mode: dimensionalState.v_mode_triggered,
    enchantment: fieldState.flags.includes('dependency_signal'),
    loop_detected: fieldState.loop_count > 3,
    boundary_approach: dimensionalState.v_mode_triggered &&
                       dimensionalState.vertical.EXISTENTIAL > 0.7,
  };
}

// ============================================
// MAIN BRIDGE FUNCTION
// ============================================

/**
 * Generate EarlySignals from TotalSystem components.
 * Runs all extractors in parallel, merges results.
 * Each extractor can fail independently without blocking.
 */
export async function generateEarlySignals(
  input: BridgeInput
): Promise<EarlySignals> {
  const startTime = Date.now();
  const contributors: string[] = [];

  // Run extractors in parallel (they can fail independently)
  const [
    memoryPrior,
    vetoes,
    metacognitiveSignal,
    temporalSignal,
    candidateSuggestions,
    policyAdjustments,
    delegationPred,
  ] = await Promise.all([
    // Memory (fast, sync)
    Promise.resolve(extractMemoryPrior(input.user_id)).then(r => {
      if (r) contributors.push('memory');
      return r;
    }),

    // Swarm vetoes (may be slow)
    extractSwarmVetoes(input.message, input.dimensional_state, input.field_state)
      .then(r => {
        if (r.length > 0) contributors.push('swarm');
        return r;
      })
      .catch(() => []),

    // Metacognitive (sync)
    Promise.resolve(extractMetacognitiveSignal(
      input.message,
      input.dimensional_state,
      input.field_state
    )).then(r => {
      if (r) contributors.push('metacognitive');
      return r;
    }),

    // Temporal (sync)
    Promise.resolve(extractTemporalSignal(
      input.message,
      input.user_id,
      input.dimensional_state
    )).then(r => {
      if (r) contributors.push('temporal');
      return r;
    }),

    // Candidate suggestions (sync)
    Promise.resolve(extractCandidateSuggestions(
      input.message,
      input.dimensional_state,
      input.field_state,
      input.language
    )).then(r => {
      if (r.length > 0) contributors.push('disciplines');
      return r;
    }),

    // Policy adjustments (sync)
    Promise.resolve(extractPolicyAdjustments()).then(r => {
      if (r) contributors.push('dissipation');
      return r;
    }),

    // Delegation prediction (sync)
    Promise.resolve(extractDelegationPrediction(
      input.message,
      input.dimensional_state,
      input.field_state
    )).then(r => {
      if (r) contributors.push('ads');
      return r;
    }),
  ]);

  // Extract risk flags
  const riskFlags = extractRiskFlags(input.dimensional_state, input.field_state);
  contributors.push('risk');

  const generationTime = Date.now() - startTime;

  return {
    delegation_pred: delegationPred,
    risk_flags: riskFlags,
    policy_adjustments: policyAdjustments,
    candidate_suggestions: candidateSuggestions,
    memory: memoryPrior,
    metacognitive: metacognitiveSignal,
    temporal: temporalSignal,
    vetoes,
    generated_at: Date.now(),
    generation_time_ms: generationTime,
    contributors,
  };
}

// ============================================
// BRIDGE WITH DEADLINE
// ============================================

/**
 * Run bridge with deadline enforcement.
 * Returns whatever arrived by deadline, plus status.
 */
export async function bridgeWithDeadline(
  input: BridgeInput,
  deadline: number = DEADLINE_CONFIG.STANDARD_MS
): Promise<{ signals: EarlySignals; status: EarlySignalsStatus }> {
  const signalPromise = generateEarlySignals(input);
  return waitForSignals(signalPromise, deadline);
}

// ============================================
// FAST PATH (Sync-only signals)
// ============================================

/**
 * Generate only sync signals (no async operations).
 * Use when deadline is very tight or for fallback.
 */
export function generateFastSignals(input: BridgeInput): EarlySignals {
  const startTime = Date.now();
  const contributors: string[] = [];

  // Only sync extractors
  const memoryPrior = extractMemoryPrior(input.user_id);
  if (memoryPrior) contributors.push('memory');

  const metacognitiveSignal = extractMetacognitiveSignal(
    input.message,
    input.dimensional_state,
    input.field_state
  );
  if (metacognitiveSignal) contributors.push('metacognitive');

  const temporalSignal = extractTemporalSignal(
    input.message,
    input.user_id,
    input.dimensional_state
  );
  if (temporalSignal) contributors.push('temporal');

  const policyAdjustments = extractPolicyAdjustments();
  if (policyAdjustments) contributors.push('dissipation');

  const delegationPred = extractDelegationPrediction(
    input.message,
    input.dimensional_state,
    input.field_state
  );
  if (delegationPred) contributors.push('ads');

  const riskFlags = extractRiskFlags(input.dimensional_state, input.field_state);
  contributors.push('risk');

  return {
    delegation_pred: delegationPred,
    risk_flags: riskFlags,
    policy_adjustments: policyAdjustments,
    candidate_suggestions: [],  // Skip async disciplines
    memory: memoryPrior,
    metacognitive: metacognitiveSignal,
    temporal: temporalSignal,
    vetoes: [],  // Skip async swarm
    generated_at: Date.now(),
    generation_time_ms: Date.now() - startTime,
    contributors,
  };
}

// Types and functions are exported inline above
