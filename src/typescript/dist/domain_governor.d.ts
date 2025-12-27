/**
 * ENOQ DOMAIN GOVERNOR
 *
 * Manages coexistence between domains.
 * Risk emerges from combinations, not single domains.
 * Runs after perception, before selection.
 */
import { FieldState, Atmosphere, Mode, Depth, Pacing, HumanDomain, ForbiddenAction, RequiredAction } from './types';
export interface GovernorRule {
    rule_id: string;
    name: string;
    domains: HumanDomain[] | 'ANY';
    precedence: HumanDomain | 'CONSTITUTIONAL' | null;
    constraint: string;
    activation: {
        criterion: string;
        evaluate: (field: FieldState) => boolean;
    };
    effect: GovernorEffect;
}
export interface GovernorEffect {
    atmosphere?: Atmosphere;
    mode?: Mode;
    depth_ceiling?: Depth;
    forbidden?: ForbiddenAction[];
    required?: RequiredAction[];
    pacing?: Pacing;
    primitive?: string;
    override?: boolean;
    escalate?: boolean;
    l2_enabled?: boolean;
}
export interface GovernorResult {
    rules_applied: string[];
    effect: MergedEffect;
}
export interface MergedEffect {
    atmosphere: Atmosphere | null;
    mode: Mode | null;
    depth_ceiling: Depth;
    forbidden: ForbiddenAction[];
    required: RequiredAction[];
    pacing: Pacing;
    primitive: string | null;
    escalate: boolean;
    l2_enabled: boolean;
}
declare const DOMAIN_GOVERNOR_RULES: GovernorRule[];
export declare function applyDomainGovernor(field: FieldState): GovernorResult;
export interface InvariantCheckResult {
    passed: boolean;
    violations: string[];
}
export declare function checkInvariants(field: FieldState, result: GovernorResult): InvariantCheckResult;
export { DOMAIN_GOVERNOR_RULES };
export default applyDomainGovernor;
//# sourceMappingURL=domain_governor.d.ts.map