/**
 * CONCRESCENCE ENGINE
 *
 * The heart of ENOQ integration based on:
 * - Whitehead: Prehension + Concrescence (Process and Reality)
 * - Varela: Reciprocal Constraints (Neurophenomenology)
 * - James: Stream of Experience (Radical Empiricism)
 * - Buddhism: Sati (Memory + Understanding + Vigilance)
 * - Jung: Individuation (Conscious + Unconscious Integration)
 *
 * This engine unifies:
 * - pipeline.ts (Conscious): S0→S6, Protocol Selection, Verification
 * - total_system.ts (Unconscious): Dimensions, Memory, Swarm, Temporal
 *
 * Neither is primary. Both operate simultaneously and prehend each other.
 */
import { FieldState, SupportedLanguage } from './types';
import { Session } from './pipeline';
import { DimensionalState } from './dimensional_system';
import { TemporalAnalysis } from './temporal_engine';
import { ConsensusState } from './agent_swarm';
import { Episode, SemanticPattern, UserModel } from './memory_system';
/**
 * Prehension: The act of experientially grasping data from another entity
 * (Whitehead, Process and Reality)
 */
export interface Prehension {
    source: 'PIPELINE' | 'TOTAL_SYSTEM' | 'MEMORY' | 'CONSTITUTION';
    type: string;
    data: any;
    weight: number;
    relevance: number;
}
/**
 * Tension: Where prehensions conflict
 */
export interface Tension {
    between: [string, string];
    nature: 'depth' | 'atmosphere' | 'primitive' | 'urgency' | 'approach';
    severity: number;
    description: string;
}
/**
 * Coherence: Where prehensions align
 */
export interface PrehensionCoherence {
    among: string[];
    on: string;
    strength: number;
}
/**
 * Satisfaction: The determinate response that emerges from concrescence
 */
export interface Satisfaction {
    primitive: string;
    atmosphere: string;
    depth: 'surface' | 'medium' | 'deep';
    response: string;
    confidence: number;
    constitutional_verified: boolean;
}
/**
 * Concrescence: The integration process
 */
export interface Concrescence {
    prehensions: Prehension[];
    tensions: Tension[];
    coherences: PrehensionCoherence[];
    satisfaction: Satisfaction;
}
/**
 * Actual Occasion: The fundamental unit of experience (Whitehead)
 * Each conversation turn is an Actual Occasion.
 */
export interface ActualOccasion {
    id: string;
    timestamp: Date;
    past: {
        episodic: Episode[];
        semantic: SemanticPattern[];
        user_model: UserModel | null;
    };
    present: {
        user_input: string;
        language: SupportedLanguage;
        dimensional_state: DimensionalState | null;
        field_state: FieldState | null;
        swarm_consensus: ConsensusState | null;
        temporal_analysis: TemporalAnalysis | null;
    };
    future: {
        response: string;
        predicted_effect: PredictedEffect;
        memory_update: MemoryUpdate;
    };
    concrescence: Concrescence;
}
export interface PredictedEffect {
    expected_user_state: 'calmer' | 'same' | 'activated' | 'uncertain';
    autonomy_impact: 'positive' | 'neutral' | 'negative';
    relationship_impact: 'strengthened' | 'maintained' | 'strained';
}
export interface MemoryUpdate {
    episode_stored: boolean;
    patterns_detected: string[];
    model_updated: boolean;
}
export interface ConcrescenceConfig {
    parallel_processing: boolean;
    reciprocal_constraints: boolean;
    constitutional_veto: boolean;
    debug: boolean;
}
export declare class ConcrescenceEngine {
    private config;
    private currentOccasion;
    private occasionHistory;
    constructor(config?: Partial<ConcrescenceConfig>);
    /**
     * Process input through the complete concrescence
     */
    process(input: string, session: Session, language?: SupportedLanguage): Promise<{
        occasion: ActualOccasion;
        session: Session;
    }>;
    /**
     * Initialize a new Actual Occasion
     */
    private initializeOccasion;
    /**
     * Gather prehensions from all sources
     */
    private gatherPrehensions;
    /**
     * Apply reciprocal constraints between systems
     * (Varela: Neither reduces to the other)
     */
    private applyReciprocalConstraints;
    /**
     * Concrescence: Integrate prehensions into determinate response
     * (From Whitehead's "satisfaction" of an actual occasion)
     */
    private concresce;
    /**
     * Identify tensions between prehensions
     */
    private identifyTensions;
    /**
     * Identify coherences between prehensions
     */
    private identifyCoherences;
    /**
     * Resolve which primitive to use
     */
    private resolvePrimitive;
    /**
     * Resolve atmosphere
     */
    private resolveAtmosphere;
    /**
     * Resolve depth
     */
    private resolveDepth;
    /**
     * Synthesize final response from both outputs
     */
    private synthesizeResponse;
    /**
     * Calculate overall confidence
     */
    private calculateConfidence;
    /**
     * Verify constitutional compliance
     */
    private verifyConstitutional;
    /**
     * Get constitutional fallback response
     */
    private getConstitutionalFallback;
    /**
     * Predict effect of response
     */
    private predictEffect;
    /**
     * Detect patterns in concrescence
     */
    private detectPatterns;
    private calculateRelevance;
    private calculateDimensionalRelevance;
    private calculateTemporalRelevance;
    private inferTotalSystemDepth;
    private depthToNumber;
    private logDebug;
    getCurrentOccasion(): ActualOccasion | null;
    getOccasionHistory(): ActualOccasion[];
}
export declare const concrescenceEngine: ConcrescenceEngine;
/**
 * Process through unified concrescence
 */
export declare function processWithConcrescence(input: string, session?: Session, language?: SupportedLanguage): Promise<{
    response: string;
    occasion: ActualOccasion;
    session: Session;
}>;
export default concrescenceEngine;
//# sourceMappingURL=concrescence_engine.d.ts.map