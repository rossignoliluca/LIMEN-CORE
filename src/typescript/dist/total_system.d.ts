/**
 * ENOQ TOTAL SYSTEM ORCHESTRATOR
 *
 * Integrates all components into a unified cognitive system.
 *
 * Components:
 * - Memory System (Hippocampal-Cortical)
 * - Dimensional Detection (Vertical + Horizontal)
 * - Multi-Agent Swarm (Emergent Intelligence)
 * - Metacognitive Monitor (Self-Awareness)
 * - Temporal Engine (Past-Present-Future)
 *
 * Flow:
 * 1. Input → Memory Context + Dimensional Detection
 * 2. → Agent Swarm Processing
 * 3. → Temporal Analysis
 * 4. → Response Generation
 * 5. → Metacognitive Verification
 * 6. → Output + Memory Storage
 *
 * Based on:
 * - Global Workspace Theory (integration point)
 * - Active Inference (minimize surprise)
 * - Autopoiesis (self-maintaining system)
 */
import { FieldState, SupportedLanguage } from './types';
import { memorySystem } from './memory_system';
import { DimensionalState } from './dimensional_system';
import { ConsensusState } from './agent_swarm';
import { MetacognitiveReport } from './metacognitive_monitor';
import { TemporalAnalysis } from './temporal_engine';
export interface TotalSystemInput {
    user_id: string;
    message: string;
    language: SupportedLanguage;
    session_id?: string;
    timestamp?: Date;
}
export interface TotalSystemOutput {
    response: string;
    field_state: FieldState;
    primitive_used: string;
    atmosphere: string;
    context: ProcessingContext;
    metrics: ProcessingMetrics;
    verified: boolean;
    verification_notes: string[];
}
export interface ProcessingContext {
    dimensional_state: DimensionalState;
    temporal_analysis: TemporalAnalysis;
    swarm_consensus: ConsensusState;
    metacognitive_report: MetacognitiveReport;
    memory_context: {
        working_memory_size: number;
        user_model_exists: boolean;
        autonomy_health: string;
        effective_strategies_count: number;
    };
}
export interface ProcessingMetrics {
    total_latency_ms: number;
    dimensional_detection_ms: number;
    swarm_processing_ms: number;
    temporal_analysis_ms: number;
    metacognitive_check_ms: number;
    phi_score: number;
    confidence_score: number;
}
export declare class TotalSystemOrchestrator {
    private previousDimensionalState;
    private responseHistory;
    /**
     * Process user input through the complete system
     */
    process(input: TotalSystemInput): Promise<TotalSystemOutput>;
    /**
     * Create initial field state from memory context
     */
    private createInitialFieldState;
    /**
     * Construct full field state
     */
    private constructFieldState;
    /**
     * Select the most appropriate primitive
     */
    private selectPrimitive;
    /**
     * Determine atmosphere
     */
    private determineAtmosphere;
    /**
     * Synthesize response from all components
     */
    private synthesizeResponse;
    /**
     * Refine response based on metacognitive feedback
     */
    private refineResponse;
    /**
     * Trigger memory consolidation (call periodically)
     */
    consolidateMemory(user_id: string): void;
    /**
     * Get system health metrics
     */
    getSystemHealth(user_id: string): {
        memory_health: ReturnType<typeof memorySystem.getContext>['autonomy_health'];
        phi_average: number;
        constitutional_compliance: number;
    };
}
export declare const totalSystem: TotalSystemOrchestrator;
export default totalSystem;
/**
 * Quick process function for simple usage
 */
export declare function processMessage(user_id: string, message: string, language?: SupportedLanguage): Promise<TotalSystemOutput>;
//# sourceMappingURL=total_system.d.ts.map