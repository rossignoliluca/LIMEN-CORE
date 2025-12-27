/**
 * ENOQ S5 VERIFY
 *
 * Constitutional enforcement layer.
 * Validates every output before delivery.
 * Implements fallback ladder.
 * Produces audit trail.
 */
import { FieldState, ProtocolSelection, SupportedLanguage } from './types';
export interface GeneratedOutput {
    text: string;
    language: SupportedLanguage | 'mixed';
    word_count: number;
    generation_method: 'template' | 'llm' | 'hybrid';
}
export interface Violation {
    check: string;
    category: 'constraint' | 'constitutional' | 'ownership' | 'safety';
    severity: 'minor' | 'moderate' | 'critical';
    pattern: string;
    detail: string;
}
export type FallbackLevel = 'REGENERATE' | 'MEDIUM' | 'SURFACE' | 'PRESENCE' | 'STOP';
export interface AuditEntry {
    timestamp: string;
    session_id: string;
    turn_number: number;
    input_hash: string;
    field_summary: {
        domains: string[];
        arousal: string;
        flags: string[];
    };
    selection_summary: {
        atmosphere: string;
        mode: string;
        primitive: string;
        forbidden: string[];
        required: string[];
    };
    verification: {
        passed: boolean;
        checks_run: string[];
        violations: {
            check: string;
            severity: string;
            detail: string;
        }[];
    };
    action: {
        type: 'DELIVER' | 'FALLBACK' | 'STOP';
        fallback_level?: string;
        fallback_reason?: string;
    };
    entry_hash: string;
    previous_hash: string;
}
export interface S5Input {
    field: FieldState;
    selection: ProtocolSelection;
    output: GeneratedOutput;
    session_id: string;
    turn_number: number;
    previous_hash: string;
}
export interface S5Result {
    passed: boolean;
    violations: Violation[];
    fallback_required: boolean;
    fallback_level: FallbackLevel | null;
    audit_entry: AuditEntry;
}
export declare function verify(input: S5Input, attemptCount?: number): S5Result;
export declare const FALLBACK_TEMPLATES: Record<string, Partial<Record<SupportedLanguage, string>>>;
export declare function getFallbackOutput(level: FallbackLevel, selection: ProtocolSelection, language: SupportedLanguage): string | null;
export default verify;
//# sourceMappingURL=S5_verify.d.ts.map