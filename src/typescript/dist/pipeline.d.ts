/**
 * ENOQ PIPELINE - S0 → S6 ORCHESTRATOR
 *
 * The thread that connects everything.
 * Input → Gate → Perceive → Select → Act → Verify → Return
 *
 * This is ENOQ.
 */
import { FieldState, ProtocolSelection, GateSignal, GateReasonCode, SupportedLanguage } from './types';
import { GovernorResult } from './domain_governor';
import { MetaKernelState, SessionTelemetry } from './meta_kernel';
import { AuditEntry } from './S5_verify';
import { GateClient, GateSignalEffect } from './gate_client';
export interface PipelineConfig {
    gate_enabled: boolean;
    gate_url?: string;
    gate_timeout_ms?: number;
}
export interface Session {
    session_id: string;
    created_at: Date;
    turns: Turn[];
    meta_kernel_state: MetaKernelState;
    telemetry: SessionTelemetry;
    audit_trail: AuditEntry[];
    memory: SessionMemory;
    gate_client?: GateClient;
}
export interface Turn {
    turn_number: number;
    timestamp: Date;
    input: string;
    output: string;
    trace: PipelineTrace;
}
export interface PipelineTrace {
    s0_gate?: {
        signal: GateSignal;
        reason_code: GateReasonCode;
        latency_ms: number;
        effect: GateSignalEffect;
    };
    s0_input: string;
    s1_field: FieldState;
    s1_governor: GovernorResult;
    s1_meta_kernel: {
        rules_applied: string[];
        power_level: number;
        depth_ceiling: string;
    };
    s2_clarify_needed: boolean;
    s3_selection: ProtocolSelection;
    s4_context: {
        runtime: string;
        forbidden: string[];
        required: string[];
    };
    s5_verification: {
        passed: boolean;
        violations: number;
        fallback_used: boolean;
    };
    s6_output: string;
    latency_ms: number;
}
export interface SessionMemory {
    themes: string[];
    domains_frequent: string[];
    delegation_attempts: number;
    decisions_made: number;
    name?: string;
    language_preference: SupportedLanguage | 'auto';
    recent_responses: string[];
    response_history_limit: number;
}
export interface PipelineResult {
    output: string;
    trace: PipelineTrace;
    session: Session;
}
export type PipelineState = 'S0_RECEIVE' | 'S1_SENSE' | 'S2_CLARIFY' | 'S3_SELECT' | 'S4_ACT' | 'S5_VERIFY' | 'S6_STOP';
export declare function createSession(): Session;
declare function createDefaultTelemetry(): SessionTelemetry;
interface ClarifyResult {
    needed: boolean;
    reason?: string;
    question?: string;
}
declare function checkClarifyNeeded(field: FieldState, input: string): ClarifyResult;
export declare function enoq(input: string, session: Session, config?: PipelineConfig): Promise<PipelineResult>;
export declare function conversationLoop(): Promise<void>;
export { createDefaultTelemetry, checkClarifyNeeded };
export default enoq;
//# sourceMappingURL=pipeline.d.ts.map