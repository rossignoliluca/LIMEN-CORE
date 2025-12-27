"use strict";
/**
 * ENOQ L1 SELECTION
 *
 * Maps Field State to Protocol Selection.
 * Deterministic. Auditable. No generation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = select;
// ============================================
// MODE SELECTION
// ============================================
function selectMode(field) {
    // WAIT goal = don't act yet, just be present
    if (field.goal === 'wait') {
        return 'EXPAND'; // gentle invite
    }
    // REGULATE: high arousal, shutdown, or flags indicating crisis
    if (field.arousal === 'high' ||
        field.arousal === 'low' ||
        field.flags.includes('crisis') ||
        field.flags.includes('high_arousal') ||
        field.flags.includes('shutdown')) {
        return 'REGULATE';
    }
    // CONTRACT: looping, decision paralysis, seeking reassurance
    if (field.loop_count >= 3 ||
        (field.goal === 'decide' && field.flags.includes('delegation_attempt'))) {
        return 'CONTRACT';
    }
    // EXPAND: stuck in single view, tunnel vision
    const topDomain = field.domains[0];
    if (topDomain &&
        topDomain.salience > 0.8 &&
        field.domains.length < 2) {
        return 'EXPAND';
    }
    // Default based on goal
    if (field.goal === 'decide')
        return 'CONTRACT';
    if (field.goal === 'explore')
        return 'EXPAND';
    if (field.goal === 'regulate')
        return 'REGULATE';
    if (field.goal === 'inform')
        return 'EXPAND'; // will be handled by atmosphere
    return 'EXPAND'; // safe default
}
// ============================================
// ATMOSPHERE SELECTION
// ============================================
function selectAtmosphere(field) {
    // EMERGENCY: crisis or survival domain
    if (field.flags.includes('crisis') ||
        field.domains.some(d => d.domain === 'H01_SURVIVAL' && d.salience > 0.5)) {
        return 'EMERGENCY';
    }
    // V_MODE: meaning, identity, or delegation attempt
    if (field.domains.some(d => (d.domain === 'H06_MEANING' || d.domain === 'H07_IDENTITY') &&
        d.salience > 0.5) ||
        field.flags.includes('delegation_attempt')) {
        return 'V_MODE';
    }
    // DECISION: cognition + decide goal
    if (field.goal === 'decide' ||
        field.domains.some(d => d.domain === 'H13_CREATION' && d.salience > 0.5)) {
        return 'DECISION';
    }
    // HUMAN_FIELD: emotion, attachment, relational
    const relationalDomains = [
        'H04_EMOTION', 'H09_ATTACHMENT', 'H10_COORDINATION', 'H11_BELONGING'
    ];
    if (field.domains.some(d => relationalDomains.includes(d.domain) && d.salience > 0.4)) {
        return 'HUMAN_FIELD';
    }
    // OPERATIONAL: task-focused, clear goal
    if (field.goal === 'inform' || field.goal === 'act') {
        return 'OPERATIONAL';
    }
    return 'HUMAN_FIELD'; // safe default - be present first
}
// ============================================
// PRIMITIVE SELECTION
// ============================================
function selectPrimitive(field, mode, atmosphere) {
    // EMERGENCY always grounds first
    if (atmosphere === 'EMERGENCY') {
        return 'P01_GROUND';
    }
    // V_MODE with delegation → return agency
    if (atmosphere === 'V_MODE' && field.flags.includes('delegation_attempt')) {
        return 'P06_RETURN_AGENCY';
    }
    // WAIT goal → invite more context
    if (field.goal === 'wait') {
        return 'P11_INVITE';
    }
    // INFORM goal in OPERATIONAL → give info
    if (field.goal === 'inform' && atmosphere === 'OPERATIONAL') {
        return 'P09_INFORM';
    }
    // Grief/loss detection (attachment + loss words)
    const hasAttachment = field.domains.some(d => d.domain === 'H09_ATTACHMENT');
    const hasLoss = field.domains.some(d => d.evidence?.some(e => /\b(died|death|lost|gone|passed|morto|perso)\b/i.test(e)));
    if (hasAttachment && hasLoss) {
        return 'P12_ACKNOWLEDGE';
    }
    // Identity crisis → hold identity
    const hasIdentity = field.domains.some(d => d.domain === 'H07_IDENTITY' && d.salience > 0.6);
    if (hasIdentity && atmosphere === 'V_MODE') {
        return 'P14_HOLD_IDENTITY';
    }
    // Relational conflict → reflect the dynamic
    const hasCoordination = field.domains.some(d => d.domain === 'H10_COORDINATION' && d.salience > 0.5);
    if (hasCoordination) {
        return 'P13_REFLECT_RELATION';
    }
    // By mode
    switch (mode) {
        case 'REGULATE':
            // If high arousal → ground
            if (field.arousal === 'high')
                return 'P01_GROUND';
            // If shutdown → gentle validate
            if (field.arousal === 'low')
                return 'P02_VALIDATE';
            // Default regulate → validate
            return 'P02_VALIDATE';
        case 'EXPAND':
            // Open perspective
            return 'P04_OPEN';
        case 'CONTRACT':
            // If decision atmosphere → crystallize
            if (atmosphere === 'DECISION')
                return 'P05_CRYSTALLIZE';
            // If looping → crystallize
            if (field.loop_count >= 3)
                return 'P05_CRYSTALLIZE';
            // If delegation → return agency
            if (field.flags.includes('delegation_attempt'))
                return 'P06_RETURN_AGENCY';
            // Default → reflect what's clear
            return 'P03_REFLECT';
    }
}
// ============================================
// EXECUTION PARAMETERS
// ============================================
function selectDepth(field, atmosphere) {
    // Emergency = surface only
    if (atmosphere === 'EMERGENCY')
        return 'surface';
    // High uncertainty = surface
    if (field.uncertainty > 0.6)
        return 'surface';
    // V_MODE can go deep
    if (atmosphere === 'V_MODE' && field.coherence === 'high')
        return 'deep';
    return 'medium';
}
function selectLength(field, atmosphere) {
    // Emergency = minimal
    if (atmosphere === 'EMERGENCY')
        return 'minimal';
    // High arousal = brief
    if (field.arousal === 'high')
        return 'minimal';
    // V_MODE may need more
    if (atmosphere === 'V_MODE')
        return 'moderate';
    return 'brief';
}
function selectPacing(field, atmosphere) {
    // Emergency = slow (grounding)
    if (atmosphere === 'EMERGENCY')
        return 'slow';
    // V_MODE = slow
    if (atmosphere === 'V_MODE')
        return 'slow';
    // High arousal = slow
    if (field.arousal === 'high')
        return 'slow';
    // Operational = responsive
    if (atmosphere === 'OPERATIONAL')
        return 'responsive';
    return 'normal';
}
function selectTone(field, atmosphere) {
    // Emergency = warm but direct
    if (atmosphere === 'EMERGENCY') {
        return { warmth: 4, directness: 4 };
    }
    // V_MODE = warm, less direct
    if (atmosphere === 'V_MODE') {
        return { warmth: 4, directness: 3 };
    }
    // Human field = warm
    if (atmosphere === 'HUMAN_FIELD') {
        return { warmth: 4, directness: 3 };
    }
    // Operational = balanced
    return { warmth: 3, directness: 4 };
}
// ============================================
// CONSTRAINTS
// ============================================
function getForbidden(field, mode, atmosphere) {
    const forbidden = [];
    // Always forbidden
    forbidden.push('diagnose');
    forbidden.push('label');
    forbidden.push('create_dependency');
    // REGULATE mode
    if (mode === 'REGULATE') {
        forbidden.push('open_new_material');
        forbidden.push('problem_solve');
        forbidden.push('analyze');
    }
    // V_MODE
    if (atmosphere === 'V_MODE') {
        forbidden.push('give_advice');
        forbidden.push('decide_for_user');
        forbidden.push('recommend');
    }
    // High arousal
    if (field.arousal === 'high') {
        forbidden.push('long_response');
        forbidden.push('multiple_questions');
        forbidden.push('cognitive_reframe');
    }
    // Delegation
    if (field.flags.includes('delegation_attempt')) {
        forbidden.push('answer_what_should');
        forbidden.push('pick_option');
        forbidden.push('implicit_recommendation');
    }
    return forbidden;
}
function getRequired(field, mode, atmosphere) {
    const required = [];
    // Emergency
    if (atmosphere === 'EMERGENCY') {
        required.push('acknowledge_distress');
        required.push('offer_grounding');
    }
    // Delegation
    if (field.flags.includes('delegation_attempt')) {
        required.push('return_ownership');
    }
    // High emotion
    if (field.valence === 'negative' && field.arousal !== 'low') {
        required.push('validate_feeling');
    }
    return required;
}
// ============================================
// MAIN SELECTION FUNCTION
// ============================================
function select(field) {
    const mode = selectMode(field);
    const atmosphere = selectAtmosphere(field);
    const primitive = selectPrimitive(field, mode, atmosphere);
    const depth = selectDepth(field, atmosphere);
    const length = selectLength(field, atmosphere);
    const pacing = selectPacing(field, atmosphere);
    const tone = selectTone(field, atmosphere);
    const forbidden = getForbidden(field, mode, atmosphere);
    const required = getRequired(field, mode, atmosphere);
    // Calculate confidence based on field clarity
    const confidence = 1 - field.uncertainty;
    // Build reasoning trace
    const topDomain = field.domains[0]?.domain || 'unknown';
    const reasoning = `Domain: ${topDomain}, Arousal: ${field.arousal}, Goal: ${field.goal} → Mode: ${mode}, Atmosphere: ${atmosphere}`;
    return {
        atmosphere,
        mode,
        primitive,
        depth,
        length,
        pacing,
        tone,
        forbidden,
        required,
        confidence,
        reasoning
    };
}
// ============================================
// EXPORTS
// ============================================
exports.default = select;
//# sourceMappingURL=selection.js.map