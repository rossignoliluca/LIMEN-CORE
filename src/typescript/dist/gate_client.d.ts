/**
 * ENOQ GATE CLIENT
 *
 * HTTP client for gate-runtime integration.
 * Calls Gate BEFORE any LLM generation.
 *
 * Gate signals which domain is active, then halts.
 * ENOQ decides what to do with that signal.
 */
export type GateSignal = 'D1_ACTIVE' | 'D2_ACTIVE' | 'D3_ACTIVE' | 'D4_ACTIVE' | 'NULL';
export type GateReasonCode = 'UNCLASSIFIABLE' | 'AMBIGUOUS' | 'NORMATIVE_REQUEST' | 'INTEGRATION_REQUIRED' | 'ZERO_PERTURBATION' | 'DOMAIN_SIGNAL';
export interface GateRequest {
    request_id: string;
    timestamp: string;
    input_hash: string;
    input_text: string;
    marker_version: string;
    context_scope_id: string;
}
export interface GateDecision {
    request_id: string;
    timestamp: string;
    signal: GateSignal;
    halt: true;
    marker_hash: string;
    reason_code: GateReasonCode;
}
export interface GateClientConfig {
    base_url: string;
    timeout_ms: number;
    marker_version: string;
    context_scope_id: string;
    enabled: boolean;
}
export interface GateResult {
    signal: GateSignal;
    reason_code: GateReasonCode;
    request_id: string;
    latency_ms: number;
    error?: string;
}
export declare class GateClient {
    private config;
    private lastResult;
    constructor(config?: Partial<GateClientConfig>);
    /**
     * Classify input through Gate runtime.
     * Returns signal indicating which domain is active.
     *
     * IMPORTANT: This must be called BEFORE any LLM generation.
     */
    classify(input: string): Promise<GateResult>;
    /**
     * Get the last classification result.
     */
    getLastResult(): GateResult | null;
    /**
     * Check if Gate runtime is available.
     */
    healthCheck(): Promise<boolean>;
    /**
     * Update configuration.
     */
    updateConfig(config: Partial<GateClientConfig>): void;
    /**
     * Get current configuration.
     */
    getConfig(): GateClientConfig;
}
/**
 * Map Gate signal to ENOQ behavior modifications.
 *
 * Gate tells us WHAT domain is perturbed.
 * ENOQ decides HOW to respond.
 */
export interface GateSignalEffect {
    proceed: boolean;
    atmosphere_hint?: 'EMERGENCY' | 'DECISION' | 'HUMAN_FIELD' | 'V_MODE';
    depth_ceiling?: 'surface' | 'medium' | 'deep';
    forbidden_additions?: string[];
    required_additions?: string[];
    escalate?: boolean;
    professional_referral?: boolean;
}
export declare function interpretGateSignal(signal: GateSignal, reason_code: GateReasonCode): GateSignalEffect;
export declare function getGateClient(config?: Partial<GateClientConfig>): GateClient;
export declare function resetGateClient(): void;
export default GateClient;
//# sourceMappingURL=gate_client.d.ts.map