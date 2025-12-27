/**
 * AGENT RESPONSE TEMPLATES
 *
 * Multilingual response generation for ENOQ agents.
 * Each agent type has contextual response templates that:
 * - Honor constitutional constraints (no directives, no diagnosis, no identity assignment)
 * - Support the user's autonomy
 * - Match the emotional/dimensional context
 */
import { SupportedLanguage, HumanDomain } from './types';
import { VerticalDimension, DimensionalState } from './dimensional_system';
export interface ResponseContext {
    language: SupportedLanguage;
    vertical: VerticalDimension;
    domains: HumanDomain[];
    v_mode: boolean;
    emergency: boolean;
    arousal: 'low' | 'medium' | 'high';
    phi: number;
    recentResponses?: string[];
}
/**
 * Generate a contextual response element based on agent type and context
 */
export declare function generateAgentResponse(agentType: 'SOMATIC' | 'EXISTENTIAL' | 'RELATIONAL' | 'FUNCTIONAL' | 'TEMPORAL' | 'V_MODE' | 'SYNTHESIS' | 'ACKNOWLEDGMENT', subtype: string, context: ResponseContext): string;
/**
 * Generate a complete response from dimensional state
 */
export declare function generateContextualResponse(dimensionalState: DimensionalState, language: SupportedLanguage): string;
/**
 * Generate domain-specific response
 */
export declare function generateDomainResponse(domain: HumanDomain, language: SupportedLanguage, variationIndex?: number): string;
declare const _default: {
    generateAgentResponse: typeof generateAgentResponse;
    generateContextualResponse: typeof generateContextualResponse;
    generateDomainResponse: typeof generateDomainResponse;
};
export default _default;
//# sourceMappingURL=agent_responses.d.ts.map