/**
 * ENOQ META KERNEL (L0.5)
 *
 * Power governor. Content-blind.
 * Reads telemetry, controls knobs.
 * Ensures power is permissioned, not automatic.
 */
import { Depth, Pacing, SupportedLanguage } from './types';
export type Dimension = 'somatic' | 'emotional' | 'relational' | 'existential' | 'systemic';
export type ContinuationPolicy = 'atomic' | 'checkpointed' | 'processual';
export type Coherence = 'low' | 'medium' | 'high';
export interface TurnTelemetry {
    timestamp: Date;
    turn_number: number;
    input_length: number;
    input_question_count: number;
    input_has_delegation_markers: boolean;
    output_depth: Depth;
    output_domains: string[];
    elapsed_time: number;
}
export interface SessionTelemetry {
    total_turns: number;
    avg_depth: number;
    max_depth_reached: Depth;
    delegation_rate: number;
    reassurance_rate: number;
    passive_turns_rate: number;
    loop_count: number;
    theme_repetition_rate: number;
    user_made_decision: boolean;
    user_asked_clarifying: boolean;
    user_disagreed: boolean;
}
export interface ComputedTelemetry {
    depth_velocity: number;
    domain_spread: number;
    continuity_pressure: number;
    delegation_attempts_rate: number;
    loop_tendency: number;
    turns_budget: number;
    time_budget: number;
    agency_signal: number;
}
export interface KnobSettings {
    max_depth_allowed: Depth;
    dimensions_enabled: Dimension[];
    continuation_policy: ContinuationPolicy;
    field_narrowing: number;
    deep_mode_handshake: boolean;
    max_turns_remaining: number;
    power_level: number;
}
export interface MetaKernelState {
    telemetry_history: TurnTelemetry[];
    knobs: KnobSettings;
    session_start: Date;
    turns_elapsed: number;
    deep_mode_active: boolean;
    handshake_pending: boolean;
    recovery_mode: boolean;
    recovery_turns_remaining: number;
    coherence: Coherence;
    previous_depth: Depth;
}
export interface PowerEnvelope {
    depth_ceiling: Depth;
    dimensions_allowed: Dimension[];
    pacing: Pacing;
    l2_mode: 'SURFACE' | 'MEDIUM' | 'DEEP';
    time_remaining: number;
    turns_remaining: number;
}
export interface MetaKernelResult {
    rules_applied: string[];
    knob_changes: {
        knob: string;
        from: any;
        to: any;
    }[];
    power_envelope: PowerEnvelope;
    prompt_handshake: boolean;
    handshake_message?: string;
    new_state: MetaKernelState;
}
declare function createDefaultState(): MetaKernelState;
interface MetaKernelRule {
    id: string;
    condition: (t: ComputedTelemetry, s: MetaKernelState) => boolean;
    apply: (knobs: KnobSettings, t: ComputedTelemetry, s: MetaKernelState) => Partial<KnobSettings>;
}
declare const METAKERNEL_RULES: MetaKernelRule[];
export declare function applyMetaKernel(sessionTelemetry: SessionTelemetry, turnTelemetry: TurnTelemetry | null, currentState: MetaKernelState | null, language?: SupportedLanguage): MetaKernelResult;
export declare function processHandshakeResponse(response: string, state: MetaKernelState): MetaKernelState;
export declare function enterRecoveryMode(state: MetaKernelState): MetaKernelState;
export interface InvariantCheckResult {
    passed: boolean;
    violations: string[];
}
export declare function checkMetaKernelInvariants(telemetry: ComputedTelemetry, state: MetaKernelState, result: MetaKernelResult): InvariantCheckResult;
export { createDefaultState, METAKERNEL_RULES };
export default applyMetaKernel;
//# sourceMappingURL=meta_kernel.d.ts.map