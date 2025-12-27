/**
 * ENOQ L2 EXECUTION ENGINE
 *
 * Multi-domain execution. Blind to field. Constrained by context.
 *
 * L2 can do everything operationally.
 * L2 knows nothing about what matters.
 */
import { FieldState, ProtocolSelection, Primitive, Depth, Length, Pacing, ToneSpec, ForbiddenAction, RequiredAction, SupportedLanguage } from './types';
import { GovernorResult } from './domain_governor';
import { MetaKernelResult, Dimension } from './meta_kernel';
export type RuntimeClass = 'L2_SURFACE' | 'L2_MEDIUM' | 'L2_DEEP';
export type GoalType = 'RESPOND' | 'REFLECT' | 'GROUND' | 'OPEN' | 'CRYSTALLIZE' | 'RETURN' | 'INFORM' | 'COMPLETE';
export type Tool = 'TEMPLATE_LIBRARY' | 'PRIMITIVE_LIBRARY' | 'LANGUAGE_DETECT' | 'CALCULATOR' | 'FORMATTER';
export type FallbackLevel = 'REGENERATE' | 'MEDIUM' | 'SURFACE' | 'PRESENCE' | 'STOP';
export interface ExecutionGoal {
    primary: GoalType;
    primitive: Primitive;
    intent: string;
    success_criteria: string[];
}
export interface ExecutionConstraints {
    forbidden: ForbiddenAction[];
    required: RequiredAction[];
    depth_ceiling: Depth;
    dimensions_allowed: Dimension[];
    max_tokens: number;
    target_length: Length;
    tone: ToneSpec;
    pacing: Pacing;
    language: SupportedLanguage | 'auto';
    invariants_active: string[];
}
export interface ResourceEnvelope {
    max_latency_ms: number;
    max_llm_calls: number;
    max_tokens_input: number;
    max_tokens_output: number;
    tools_allowed: Tool[];
    web_access: boolean;
    file_access: boolean;
}
export interface ValidatorSpec {
    validator_id: string;
    type: 'pattern' | 'semantic' | 'structural' | 'constitutional';
    on_fail: 'reject' | 'warn' | 'fallback';
}
export interface FallbackSpec {
    ladder: FallbackLevel[];
    max_attempts_per_level: number;
    final_fallback: {
        type: 'template' | 'presence' | 'stop';
        template_id?: string;
    };
}
export interface AuditSpec {
    log_input_hash: boolean;
    log_output_hash: boolean;
    log_constraints: boolean;
    log_validators: boolean;
    log_latency: boolean;
    retention: 'session' | 'none';
    chain_to_previous: boolean;
}
export interface OutputSpec {
    format: 'text' | 'structured' | 'template';
    structure?: {
        sections: string[];
        required_fields: string[];
    };
    template_id?: string;
    template_variables?: Record<string, string>;
}
export interface ExecutionContext {
    context_id: string;
    timestamp: string;
    runtime: RuntimeClass;
    goal: ExecutionGoal;
    constraints: ExecutionConstraints;
    resources: ResourceEnvelope;
    output_spec: OutputSpec;
    validators: ValidatorSpec[];
    fallback: FallbackSpec;
    audit: AuditSpec;
}
export interface ExecutionResult {
    success: boolean;
    output: string;
    runtime_used: RuntimeClass;
    latency_ms: number;
    validators_passed: string[];
    validators_failed: string[];
    fallback_used: boolean;
    fallback_level?: FallbackLevel;
    audit_entry: ExecutionAuditEntry;
}
export interface ExecutionAuditEntry {
    context_id: string;
    timestamp: string;
    runtime: RuntimeClass;
    context_hash: string;
    constraints_hash: string;
    output_hash: string;
    latency_ms: number;
    validators_result: Record<string, boolean>;
    fallback_used: boolean;
}
export interface RuntimeCapability {
    llm_calls: number;
    max_latency_ms: number;
    deterministic: boolean;
    can_generate: boolean;
    can_reason: boolean;
    can_explore: boolean;
    templates_only: boolean;
}
export declare const RUNTIME_CAPABILITIES: Record<RuntimeClass, RuntimeCapability>;
/**
 * Hash the entire ExecutionContext for immutability proof
 */
declare function hashExecutionContext(context: ExecutionContext): string;
export declare function selectRuntime(atmosphere: string, arousal: string, l2Mode: 'SURFACE' | 'MEDIUM' | 'DEEP'): RuntimeClass;
export declare function compileExecutionContext(field: FieldState, selection: ProtocolSelection, governor: GovernorResult, metaKernel: MetaKernelResult): ExecutionContext;
/**
 * Multilingual template library for L2_SURFACE execution.
 * 17 templates × 40 languages = 680 total responses.
 * Culturally adapted, not just translated.
 * Uses Partial to allow gradual translation - falls back to English.
 */
declare const SURFACE_TEMPLATES: Record<string, Partial<Record<SupportedLanguage, string>>>;
export declare function execute(context: ExecutionContext): Promise<ExecutionResult>;
/**
 * Verify that ExecutionContext contains no FieldModel information.
 * This is a compile-time guarantee enforced by types.
 */
export declare function verifyL2Blindness(context: ExecutionContext): boolean;
export { SURFACE_TEMPLATES, hashExecutionContext };
export default execute;
//# sourceMappingURL=l2_execution.d.ts.map