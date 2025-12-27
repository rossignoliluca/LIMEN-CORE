/**
 * ENOQ TEMPORAL REASONING ENGINE
 *
 * Temporal reasoning and causal inference system.
 *
 * Based on:
 * - Causal Inference (Pearl's do-calculus)
 * - Temporal Logic (Allen's interval algebra)
 * - Pattern Recognition over time
 * - Counterfactual reasoning
 *
 * Key Functions:
 * - Past Pattern Detection: "This has happened before"
 * - Future Projection: "Where might this lead"
 * - Causal Mapping: "X seems connected to Y"
 * - Temporal Context: "Right now vs. in general"
 *
 * Constitutional Note: ENOQ can ILLUMINATE temporal patterns
 * but NEVER prescribe future actions. The future belongs to the human.
 */
import { Episode } from './memory_system';
import { HumanDomain } from './types';
import { DimensionalState } from './dimensional_system';
export type TemporalReference = 'PAST' | 'PRESENT' | 'FUTURE' | 'RECURRING' | 'TRAJECTORY' | 'COUNTERFACTUAL';
export interface TemporalMarker {
    type: TemporalReference;
    content: string;
    tense: 'past' | 'present' | 'future' | 'conditional';
    specificity: 'vague' | 'specific' | 'dated';
    emotional_weight: number;
}
export interface TemporalPattern {
    id: string;
    type: 'recurring' | 'escalating' | 'diminishing' | 'cyclical' | 'trigger-response';
    description: string;
    instances: PatternInstance[];
    confidence: number;
    domains_affected: HumanDomain[];
}
export interface PatternInstance {
    episode_id: string;
    timestamp: Date;
    context: string;
    outcome: string;
}
export interface CausalLink {
    cause: CausalNode;
    effect: CausalNode;
    strength: number;
    type: 'direct' | 'contributing' | 'correlational' | 'hypothetical';
    evidence: string[];
    counterfactual: string;
}
export interface CausalNode {
    id: string;
    description: string;
    domain: HumanDomain | null;
    temporal_location: TemporalReference;
    controllability: 'controllable' | 'influenceable' | 'uncontrollable';
}
export interface TemporalAnalysis {
    markers: TemporalMarker[];
    patterns: TemporalPattern[];
    causal_links: CausalLink[];
    dominant_temporal_frame: TemporalReference;
    temporal_pressure: TemporalPressure;
    insights: TemporalInsight[];
}
export interface TemporalPressure {
    urgency: 'none' | 'low' | 'medium' | 'high' | 'crisis';
    source: string;
    temporal_horizon: 'immediate' | 'short_term' | 'medium_term' | 'long_term' | 'undefined';
}
export interface TemporalInsight {
    type: 'pattern' | 'trajectory' | 'turning_point' | 'cycle' | 'stagnation';
    description: string;
    evidence: string;
    constitutional_note: string;
}
export declare class TemporalEngine {
    private detector;
    private patternRecognizer;
    private causalMapper;
    constructor();
    /**
     * Perform full temporal analysis
     */
    analyze(message: string, episodes: Episode[], dimensionalState: DimensionalState): TemporalAnalysis;
    /**
     * Generate temporal insights
     */
    private generateInsights;
    /**
     * Generate temporal response element
     */
    generateTemporalResponse(analysis: TemporalAnalysis, language?: string): string | null;
    /**
     * Check if temporal urgency requires immediate attention
     */
    requiresImmediateAttention(analysis: TemporalAnalysis): boolean;
}
export declare const temporalEngine: TemporalEngine;
export default temporalEngine;
//# sourceMappingURL=temporal_engine.d.ts.map