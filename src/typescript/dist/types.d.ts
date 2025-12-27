/**
 * ENOQ L1 CORE - TYPE DEFINITIONS
 *
 * The fundamental data structures for the perception-action pipeline.
 */
export type ForbiddenAction = 'recommend' | 'advise' | 'decide_for_user' | 'diagnose' | 'label' | 'define_identity' | 'assign_purpose' | 'prescribe' | 'implicit_recommendation' | 'direct' | 'explore' | 'expand' | 'challenge' | 'analyze' | 'commit' | 'decide' | 'finalize' | 'open_new_material' | 'rush' | 'skip_steps' | 'take_sides' | 'advise_legal_action' | 'advise_action' | 'recommend_treatment' | 'demand' | 'push' | 'add_complexity' | 'open_dimensions' | 'challenge_attachment' | 'analyze_relationship' | 'challenge_belonging' | 'question_identity' | 'explore_meaning' | 'philosophize' | 'long_response' | 'multiple_questions' | 'cognitive_reframe';
export type RequiredAction = 'return_ownership' | 'visualize_options' | 'mirror_only' | 'validate' | 'validate_feeling' | 'acknowledge_distress' | 'acknowledge_concern' | 'acknowledge_pressure' | 'ground' | 'presence' | 'offer_grounding' | 'slow_down' | 'regulate_first' | 'safety_check' | 'suggest_professional' | 'disclaim_not_lawyer' | 'disclaim_not_doctor' | 'disclaim' | 'map_costs' | 'explore_safely' | 'gentle_inquiry' | 'name_loop' | 'focus' | 'simplify';
/**
 * Supported languages (40 languages)
 * Coverage: ~6.5B people (~80% world population)
 */
export type SupportedLanguage = 'en' | 'zh' | 'hi' | 'es' | 'fr' | 'ar' | 'bn' | 'pt' | 'ru' | 'ur' | 'id' | 'de' | 'ja' | 'pa' | 'sw' | 'mr' | 'tr' | 'vi' | 'ko' | 'te' | 'ta' | 'fa' | 'ms' | 'ha' | 'it' | 'th' | 'am' | 'gu' | 'yo' | 'pl' | 'uk' | 'fil' | 'kn' | 'ml' | 'my' | 'nl' | 'ro' | 'el' | 'hu' | 'he';
export type LanguageDetectionResult = SupportedLanguage | 'mixed' | 'unknown';
/**
 * Cultural adaptation profile
 * Affects tone, pacing, directness beyond translation
 */
export interface CultureProfile {
    language: SupportedLanguage;
    directness: 'high' | 'medium' | 'low';
    formality: 'formal' | 'neutral' | 'casual';
    emotionality: 'expressive' | 'moderate' | 'reserved';
    silence_comfort: 'high' | 'medium' | 'low';
    hierarchy_respect: 'high' | 'medium' | 'low';
    rtl: boolean;
}
/**
 * Default culture profiles for each language
 */
export declare const CULTURE_PROFILES: Record<SupportedLanguage, CultureProfile>;
export type HumanDomain = 'H01_SURVIVAL' | 'H02_SAFETY' | 'H03_BODY' | 'H04_EMOTION' | 'H05_COGNITION' | 'H06_MEANING' | 'H07_IDENTITY' | 'H08_TEMPORAL' | 'H09_ATTACHMENT' | 'H10_COORDINATION' | 'H11_BELONGING' | 'H12_HIERARCHY' | 'H13_CREATION' | 'H14_WORK' | 'H15_LEGAL' | 'H16_OPERATIONAL' | 'H17_FORM';
export type TemporalModulator = 'T01_PAST' | 'T02_FUTURE';
export type Domain = HumanDomain | TemporalModulator;
export interface DomainActivation {
    domain: Domain;
    salience: number;
    confidence?: number;
    evidence?: string[];
}
export type Arousal = 'low' | 'medium' | 'high';
export type Valence = 'positive' | 'negative' | 'mixed' | 'neutral';
export type Coherence = 'high' | 'medium' | 'low';
export type GoalType = 'explore' | 'decide' | 'process' | 'inform' | 'connect' | 'regulate' | 'act' | 'wait' | 'unclear';
export type Flag = 'crisis' | 'high_arousal' | 'shutdown' | 'loop_detected' | 'delegation_attempt' | 'dependency_signal' | string;
export interface FieldState {
    domains: DomainActivation[];
    arousal: Arousal;
    valence: Valence;
    coherence: Coherence;
    temporal?: {
        past_salience: number;
        future_salience: number;
    };
    goal: GoalType;
    loop_count: number;
    flags: Flag[];
    uncertainty: number;
    language?: LanguageDetectionResult;
}
export type Mode = 'REGULATE' | 'EXPAND' | 'CONTRACT';
export type Atmosphere = 'OPERATIONAL' | 'HUMAN_FIELD' | 'DECISION' | 'V_MODE' | 'EMERGENCY';
export type Primitive = 'P01_GROUND' | 'P02_VALIDATE' | 'P03_REFLECT' | 'P04_OPEN' | 'P05_CRYSTALLIZE' | 'P06_RETURN_AGENCY' | 'P07_HOLD_SPACE' | 'P08_MAP_DECISION' | 'P09_INFORM' | 'P10_COMPLETE_TASK' | 'P11_INVITE' | 'P12_ACKNOWLEDGE' | 'P13_REFLECT_RELATION' | 'P14_HOLD_IDENTITY';
export type Depth = 'surface' | 'medium' | 'deep';
export type Length = 'minimal' | 'brief' | 'moderate';
export type Pacing = 'slow' | 'conservative' | 'normal' | 'responsive';
export interface ToneSpec {
    warmth: 1 | 2 | 3 | 4 | 5;
    directness: 1 | 2 | 3 | 4 | 5;
}
export interface ProtocolSelection {
    atmosphere: Atmosphere;
    mode: Mode;
    primitive: Primitive;
    depth: Depth;
    length: Length;
    pacing: Pacing;
    tone: ToneSpec;
    forbidden: string[];
    required: string[];
    confidence: number;
    reasoning: string;
}
export interface GenerationOutput {
    text: string;
    length_tokens: number;
    primitive_executed: Primitive;
    constraints_satisfied: boolean;
    generation_time_ms: number;
}
export interface PipelineInput {
    message: string;
    conversation_history?: string[];
}
export interface PipelineOutput {
    response: string;
    trace: {
        field_state: FieldState;
        selection: ProtocolSelection;
        generation: GenerationOutput;
    };
}
export type GateSignal = 'D1_ACTIVE' | 'D2_ACTIVE' | 'D3_ACTIVE' | 'D4_ACTIVE' | 'NULL';
export type GateReasonCode = 'UNCLASSIFIABLE' | 'AMBIGUOUS' | 'NORMATIVE_REQUEST' | 'INTEGRATION_REQUIRED' | 'ZERO_PERTURBATION' | 'DOMAIN_SIGNAL';
export interface GateResult {
    signal: GateSignal;
    reason_code: GateReasonCode;
    request_id: string;
    latency_ms: number;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map