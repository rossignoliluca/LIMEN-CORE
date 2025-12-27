/**
 * ENOQ METACOGNITIVE MONITOR
 *
 * Self-awareness and introspection system.
 *
 * Based on:
 * - Metacognition research (Flavell, Nelson)
 * - Higher-Order Theories of Consciousness (HOT)
 * - Confidence calibration in AI (2025 research)
 * - Uncertainty quantification (epistemic vs aleatoric)
 *
 * Key Functions:
 * - Confidence Calibration: Know when you don't know
 * - Coherence Checking: Verify internal consistency
 * - Alignment Monitoring: Verify constitutional adherence
 * - Uncertainty Quantification: Distinguish types of uncertainty
 *
 * Constitutional Note: Metacognition enables ENOQ to say
 * "I don't know" rather than confabulate.
 */
import { FieldState } from './types';
import { DimensionalState } from './dimensional_system';
import { SwarmState } from './agent_swarm';
export type UncertaintyType = 'epistemic' | 'aleatoric' | 'model' | 'ethical';
export interface ConfidenceScore {
    overall: number;
    components: {
        understanding: number;
        interpretation: number;
        response_fit: number;
        constitutional_alignment: number;
    };
    uncertainty: {
        type: UncertaintyType;
        source: string;
        expressible: boolean;
    };
}
export interface CoherenceCheck {
    is_coherent: boolean;
    issues: CoherenceIssue[];
    recommendation: 'proceed' | 'modify' | 'fallback' | 'stop';
}
export interface CoherenceIssue {
    type: 'contradiction' | 'inconsistency' | 'incompleteness' | 'overreach';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: string;
}
export interface AlignmentStatus {
    aligned: boolean;
    violations: AlignmentViolation[];
    risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
}
export interface AlignmentViolation {
    constraint: string;
    description: string;
    evidence: string;
    suggested_fix: string;
}
export interface MetacognitiveReport {
    timestamp: Date;
    confidence: ConfidenceScore;
    coherence: CoherenceCheck;
    alignment: AlignmentStatus;
    self_assessment: {
        am_i_helpful: boolean;
        am_i_staying_in_bounds: boolean;
        am_i_creating_dependency: boolean;
        should_i_say_less: boolean;
    };
    recommendations: MetacognitiveRecommendation[];
}
export interface MetacognitiveRecommendation {
    action: 'proceed' | 'modify' | 'clarify' | 'fallback' | 'stop';
    reason: string;
    modification?: string;
}
export declare class MetacognitiveMonitor {
    private calibrator;
    private coherenceChecker;
    private alignmentMonitor;
    constructor();
    /**
     * Generate full metacognitive report
     */
    generateReport(userMessage: string, responseDraft: string, dimensionalState: DimensionalState, fieldState: FieldState, swarmState: SwarmState, previousResponses?: string[]): MetacognitiveReport;
    /**
     * Self-assessment
     */
    private selfAssess;
    /**
     * Generate actionable recommendations
     */
    private generateRecommendations;
    /**
     * Quick check for go/no-go decision
     */
    quickCheck(responseDraft: string): {
        proceed: boolean;
        reason: string;
    };
    /**
     * Express uncertainty appropriately
     */
    expressUncertainty(confidenceScore: ConfidenceScore, language?: string): string | null;
}
export declare const metacognitiveMonitor: MetacognitiveMonitor;
export default metacognitiveMonitor;
//# sourceMappingURL=metacognitive_monitor.d.ts.map