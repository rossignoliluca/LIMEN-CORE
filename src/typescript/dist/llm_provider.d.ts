/**
 * ENOQ LLM PROVIDER
 *
 * Multi-LLM abstraction layer.
 * Reads API keys from environment variables.
 * Routes to appropriate model based on task.
 *
 * Environment variables:
 * - OPENAI_API_KEY: OpenAI API key
 * - ANTHROPIC_API_KEY: Anthropic API key (optional)
 */
import { SupportedLanguage } from './types';
export type LLMProvider = 'openai' | 'anthropic';
export type LLMModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'claude-sonnet' | 'claude-haiku';
export interface LLMRequest {
    messages: LLMMessage[];
    model?: LLMModel;
    max_tokens?: number;
    temperature?: number;
    system?: string;
}
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface LLMResponse {
    content: string;
    model: string;
    tokens_used: number;
    latency_ms: number;
}
export interface LLMConfig {
    provider: LLMProvider;
    model: LLMModel;
    api_key: string;
    base_url?: string;
}
export declare function callLLM(request: LLMRequest, preferredProvider?: LLMProvider): Promise<LLMResponse>;
export interface GenerationContext {
    primitive: string;
    atmosphere: string;
    depth: string;
    forbidden: string[];
    required: string[];
    language: SupportedLanguage;
    user_message: string;
}
/**
 * Generate ENOQ response using LLM
 */
export declare function generateResponse(context: GenerationContext): Promise<string>;
export declare function checkLLMAvailability(): {
    available: boolean;
    providers: LLMProvider[];
    message: string;
};
export default callLLM;
//# sourceMappingURL=llm_provider.d.ts.map