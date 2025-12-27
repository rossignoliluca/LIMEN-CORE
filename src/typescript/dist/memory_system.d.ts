/**
 * ENOQ MEMORY SYSTEM
 *
 * Complementary Learning Systems (CLS) inspired architecture:
 * - Hippocampal System: Fast, episodic, sparse representations
 * - Neocortical System: Slow, semantic, dense representations
 *
 * Based on:
 * - McClelland et al. Complementary Learning Systems
 * - Hippocampal replay during slow-wave sleep
 * - Pattern separation and completion
 *
 * Constitutional Constraint: Memory cannot store or retrieve
 * patterns that would lead to dependency formation or
 * constitutional violations.
 */
import { FieldState, HumanDomain, SupportedLanguage } from './types';
export interface Episode {
    id: string;
    timestamp: Date;
    user_id: string;
    user_message: string;
    language: SupportedLanguage;
    field_state: FieldState;
    domains_active: HumanDomain[];
    atmosphere: string;
    primitive_used: string;
    response: string;
    outcome: EpisodeOutcome;
    novelty_score: number;
    emotional_salience: number;
    integration_score: number;
}
export interface EpisodeOutcome {
    engagement_continued: boolean;
    topic_shifted: boolean;
    user_corrected: boolean;
    explicit_feedback?: 'positive' | 'negative' | 'neutral';
    autonomy_expressed: boolean;
}
export interface SemanticPattern {
    id: string;
    pattern_type: 'trigger' | 'response' | 'trajectory';
    triggers: {
        domains: HumanDomain[];
        keywords: string[];
        emotional_markers: string[];
    };
    effective_primitives: {
        primitive: string;
        success_rate: number;
        context_conditions: string[];
    }[];
    ineffective_primitives: {
        primitive: string;
        failure_contexts: string[];
    }[];
    strength: number;
    last_updated: Date;
}
export interface UserModel {
    user_id: string;
    created_at: Date;
    last_interaction: Date;
    preferred_depth: 'surface' | 'medium' | 'deep';
    preferred_directness: 'indirect' | 'balanced' | 'direct';
    response_to_silence: 'comfort' | 'discomfort' | 'neutral';
    active_domains: Map<HumanDomain, DomainState>;
    autonomy_trajectory: AutonomyTrajectory;
    semantic_patterns: SemanticPattern[];
}
export interface DomainState {
    domain: HumanDomain;
    engagement_history: number[];
    recurring_themes: string[];
    last_active: Date;
}
export interface AutonomyTrajectory {
    decisions_made_independently: number;
    decisions_delegated_to_enoq: number;
    trajectory_slope: number;
}
export declare class HippocampalBuffer {
    private buffer;
    private readonly MAX_EPISODES_PER_USER;
    private readonly MAX_WORKING_MEMORY;
    /**
     * Store new episode (fast, pattern-separated)
     */
    store(episode: Episode): void;
    /**
     * Retrieve working memory context
     */
    getWorkingMemory(user_id: string): Episode[];
    /**
     * Pattern completion: retrieve similar episodes
     */
    retrieveSimilar(user_id: string, cue: Partial<Episode>, limit?: number): Episode[];
    /**
     * Get episodes ready for consolidation
     */
    getForReplay(user_id: string, count?: number): Episode[];
    /**
     * Compute novelty relative to existing memories
     */
    private computeNovelty;
    /**
     * Compute similarity between episodes
     */
    private computeSimilarity;
}
export declare class NeocorticalMemory {
    private userModels;
    private readonly LEARNING_RATE;
    /**
     * Get or create user model
     */
    getModel(user_id: string): UserModel;
    /**
     * Consolidate episodes into semantic memory
     * (Simulates slow-wave sleep replay)
     */
    consolidate(episodes: Episode[]): void;
    /**
     * Query semantic memory for effective strategies
     */
    getEffectiveStrategies(user_id: string, context: {
        domains: HumanDomain[];
        atmosphere: string;
    }): SemanticPattern[];
    /**
     * Check autonomy health
     */
    checkAutonomyHealth(user_id: string): {
        healthy: boolean;
        trajectory: number;
        recommendation: string;
    };
    /**
     * Create empty user model
     */
    private createEmptyModel;
    /**
     * Update domain engagement states
     */
    private updateDomainStates;
    /**
     * Extract patterns from episode
     */
    private extractPatterns;
    /**
     * Update pattern based on episode outcome
     */
    private updatePattern;
    /**
     * Update communication preferences
     */
    private updatePreferences;
    /**
     * Update autonomy trajectory (constitutional health metric)
     */
    private updateAutonomyTrajectory;
}
export declare class MemorySystem {
    private hippocampus;
    private neocortex;
    private replayInterval;
    constructor();
    /**
     * Store new interaction
     */
    store(user_id: string, message: string, language: SupportedLanguage, fieldState: FieldState, domains: HumanDomain[], atmosphere: string, primitive: string, response: string): string;
    /**
     * Update episode outcome (implicit feedback)
     */
    updateOutcome(episode_id: string, user_id: string, outcome: Partial<EpisodeOutcome>): void;
    /**
     * Get context for current interaction
     */
    getContext(user_id: string): {
        working_memory: Episode[];
        user_model: UserModel;
        effective_strategies: SemanticPattern[];
        autonomy_health: {
            healthy: boolean;
            trajectory: number;
            recommendation: string;
        };
    };
    /**
     * Retrieve similar past interactions
     */
    retrieveSimilar(user_id: string, cue: {
        domains?: HumanDomain[];
        atmosphere?: string;
        emotional_salience?: number;
    }): Episode[];
    /**
     * Trigger consolidation (call during idle time)
     */
    consolidate(user_id: string): void;
    /**
     * Start automatic consolidation (simulates sleep)
     */
    startAutoConsolidation(interval_ms?: number): void;
    /**
     * Stop automatic consolidation
     */
    stopAutoConsolidation(): void;
    /**
     * Estimate emotional salience from field state
     */
    private estimateSalience;
}
export declare const memorySystem: MemorySystem;
export default memorySystem;
//# sourceMappingURL=memory_system.d.ts.map