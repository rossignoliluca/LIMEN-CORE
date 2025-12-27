/**
 * ENOQ DIMENSIONAL SYSTEM
 *
 * Multidimensional detection and integration:
 * - Vertical Dimensions: Somatic → Functional → Relational → Existential → Transcendent
 * - Horizontal Dimensions: H01-H17 Human Domains
 *
 * Based on:
 * - Integrated Information Theory (Φ for integration measure)
 * - Existential psychology (Yalom's four givens)
 * - Humanistic psychology (Maslow's hierarchy, updated)
 * - Enactivism (embodied, embedded, enacted, extended)
 *
 * Constitutional Note: Higher dimensions (Existential, Transcendent)
 * trigger V_MODE automatically - enhanced constitutional protection.
 */
import { HumanDomain, FieldState, SupportedLanguage } from './types';
export type VerticalDimension = 'SOMATIC' | 'FUNCTIONAL' | 'RELATIONAL' | 'EXISTENTIAL' | 'TRANSCENDENT';
export interface DimensionalState {
    vertical: Record<VerticalDimension, number>;
    horizontal: Record<HumanDomain, number>;
    integration: IntegrationMetrics;
    primary_vertical: VerticalDimension;
    primary_horizontal: HumanDomain[];
    v_mode_triggered: boolean;
    emergency_detected: boolean;
    cross_dimensional: boolean;
}
export interface IntegrationMetrics {
    phi: number;
    complexity: number;
    coherence: number;
    tension: number;
}
export declare class DimensionalDetector {
    /**
     * Detect dimensional state from message and context
     */
    detect(message: string, language: SupportedLanguage, context?: {
        previous_state?: DimensionalState;
        field_state?: FieldState;
    }): DimensionalState;
    /**
     * Detect vertical dimension activations
     */
    private detectVertical;
    /**
     * Detect horizontal domain activations
     */
    private detectHorizontal;
    /**
     * Compute integration metrics (Φ-inspired)
     */
    private computeIntegration;
    /**
     * Compute Φ (integrated information)
     * Higher when dimensions are both differentiated AND integrated
     */
    private computePhi;
    /**
     * Compute coherence between dimensions
     */
    private computeCoherence;
    /**
     * Compute tension between dimensions
     */
    private computeTension;
    /**
     * Find primary vertical dimension
     */
    private findPrimaryVertical;
    /**
     * Find primary horizontal dimensions (can be multiple)
     */
    private findPrimaryHorizontal;
    /**
     * Detect emergency markers
     */
    private detectEmergencyMarkers;
    /**
     * Apply temporal smoothing to prevent abrupt changes
     */
    private applyTemporalSmoothing;
}
export declare class DimensionalIntegrator {
    /**
     * Generate insights from dimensional state
     */
    generateInsights(state: DimensionalState): DimensionalInsight[];
    /**
     * Suggest appropriate response depth
     */
    suggestDepth(state: DimensionalState): 'surface' | 'medium' | 'deep';
    /**
     * Suggest primitives based on dimensional state
     */
    suggestPrimitives(state: DimensionalState): string[];
}
export interface DimensionalInsight {
    type: 'cross_dimensional' | 'tension' | 'depth' | 'embodied' | 'relational' | 'functional';
    description: string;
    dimensions: string[];
    implication: string;
}
export declare const dimensionalDetector: DimensionalDetector;
export declare const dimensionalIntegrator: DimensionalIntegrator;
declare const _default: {
    detector: DimensionalDetector;
    integrator: DimensionalIntegrator;
};
export default _default;
//# sourceMappingURL=dimensional_system.d.ts.map