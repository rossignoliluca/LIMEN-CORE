"use strict";
/**
 * ENOQ L1 GENERATION
 *
 * Produces bounded linguistic output from Protocol Selection.
 * Template-based for surface/medium. LLM-assisted for deep.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
const PRIMITIVE_TEMPLATES = [
    {
        primitive: 'P01_GROUND',
        templates: [
            "Fermati un momento. Cosa noti adesso?",
            "Respira. Sei qui.",
            "Rallenta. Cosa senti nel corpo?",
            "Stop. Take a breath. What do you notice right now?",
            "Slow down. You're here."
        ],
        max_length: 20
    },
    {
        primitive: 'P02_VALIDATE',
        templates: [
            "Sei stanco. È reale.",
            "Quello che senti ha senso.",
            "È pesante. Lo vedo.",
            "That makes sense.",
            "This is hard. I see that.",
            "You're exhausted. That's real."
        ],
        max_length: 25
    },
    {
        primitive: 'P03_REFLECT',
        templates: [
            "Sembra che tu sappia già.",
            "Quello che sento è: {reflection}",
            "It sounds like you already know.",
            "What I hear is: {reflection}"
        ],
        max_length: 40
    },
    {
        primitive: 'P04_OPEN',
        templates: [
            "Cos'altro potrebbe essere vero?",
            "Cosa non stai vedendo?",
            "What else might be true here?",
            "What aren't you seeing?"
        ],
        max_length: 20
    },
    {
        primitive: 'P05_CRYSTALLIZE',
        templates: [
            "La vera scelta sembra essere: {choice}",
            "Sei stato qui già diverse volte. Cosa sai già?",
            "The real question seems to be: {choice}",
            "You've been here before. What do you already know?"
        ],
        max_length: 50
    },
    {
        primitive: 'P06_RETURN_AGENCY',
        templates: [
            "Non posso decidere per te. Questa è tua. Cosa pensi tu?",
            "Questa scelta è tua. Tu cosa senti?",
            "I can't decide this for you—it's yours to carry. What are you leaning toward?",
            "This one's yours. What do you actually want to do?"
        ],
        max_length: 40
    },
    {
        primitive: 'P07_HOLD_SPACE',
        templates: [
            "Sono qui.",
            "I'm here.",
            "Prendi il tempo che ti serve.",
            "Take your time."
        ],
        max_length: 15
    },
    {
        primitive: 'P08_MAP_DECISION',
        templates: [
            "Da una parte c'è {option_a}. Dall'altra {option_b}. Cosa pesa di più?",
            "On one hand: {option_a}. On the other: {option_b}. What matters most to you?"
        ],
        max_length: 60
    },
    {
        primitive: 'P09_INFORM',
        templates: [
            "{information}",
        ],
        max_length: 100
    },
    {
        primitive: 'P10_COMPLETE_TASK',
        templates: [
            "Fatto. {result}",
            "Done. {result}"
        ],
        max_length: 100
    },
    {
        primitive: 'P11_INVITE',
        templates: [
            "Cosa c'è?",
            "Dimmi.",
            "Ti ascolto.",
            "What's going on?",
            "Tell me more.",
            "I'm listening."
        ],
        max_length: 10
    },
    {
        primitive: 'P12_ACKNOWLEDGE',
        templates: [
            "Mi dispiace per la tua perdita. Sono qui.",
            "Questo è un dolore grande. Non devi affrontarlo in fretta.",
            "I'm sorry for your loss. I'm here.",
            "That's a profound loss. You don't have to rush through this."
        ],
        max_length: 30
    },
    {
        primitive: 'P13_REFLECT_RELATION',
        templates: [
            "Senti che non ti vede. Che non ti sente davvero.",
            "C'è qualcosa che vuoi che lei capisca, e non arriva.",
            "You want to be understood. And it's not landing.",
            "There's something you need her to see. And she's not seeing it."
        ],
        max_length: 30
    },
    {
        primitive: 'P14_HOLD_IDENTITY',
        templates: [
            "Hai passato tanto tempo a essere quello che gli altri volevano. Cosa vuoi tu?",
            "Ti sei perso nel dare. Chi sei quando non stai dando?",
            "You've been what others needed for so long. What do you need?",
            "You lost yourself in being for others. Who are you when you're just for you?"
        ],
        max_length: 40
    }
];
// ============================================
// LANGUAGE DETECTION
// ============================================
function detectLanguage(message) {
    // Strong Italian markers
    const italianStrong = /\b(che|sono|cosa|perché|questo|quella|fare|boh|cazzo|merda|non|più|anche|molto|tutto|sempre|già|ancora|quindi|però|comunque)\b/i;
    // Strong English markers
    const englishStrong = /\b(the|is|are|was|were|have|has|been|being|what|why|how|who|this|that|these|those|I'm|don't|can't|won't|should|would|could)\b/i;
    const italianMatches = (message.match(italianStrong) || []).length;
    const englishMatches = (message.match(englishStrong) || []).length;
    // If clearly more Italian markers
    if (italianMatches > englishMatches)
        return 'it';
    // If clearly more English markers
    if (englishMatches > italianMatches)
        return 'en';
    // Check for Italian special characters
    if (/[àèéìòù]/.test(message))
        return 'it';
    // Default to English
    return 'en';
}
// ============================================
// TEMPLATE SELECTION
// ============================================
function selectTemplate(primitive, language) {
    const templateSet = PRIMITIVE_TEMPLATES.find(t => t.primitive === primitive);
    if (!templateSet) {
        return language === 'it' ? "Sono qui." : "I'm here.";
    }
    // Separate Italian and English templates
    const italianTemplates = [];
    const englishTemplates = [];
    for (const t of templateSet.templates) {
        // Check for Italian markers
        const hasItalianChars = /[àèéìòù]/.test(t);
        const hasItalianWords = /\b(che|sono|cosa|questo|tua|senti|stai|puoi|sei|hai|dimmi|ascolto)\b/i.test(t);
        if (hasItalianChars || hasItalianWords) {
            italianTemplates.push(t);
        }
        else {
            englishTemplates.push(t);
        }
    }
    // Select from appropriate pool
    const pool = language === 'it'
        ? (italianTemplates.length > 0 ? italianTemplates : englishTemplates)
        : (englishTemplates.length > 0 ? englishTemplates : italianTemplates);
    // Select randomly
    return pool[Math.floor(Math.random() * pool.length)];
}
// ============================================
// SLOT FILLING
// ============================================
function fillSlots(template, field, originalMessage) {
    // {reflection} - summarize what they said
    if (template.includes('{reflection}')) {
        const topDomain = field.domains[0]?.domain || '';
        const reflection = generateReflection(topDomain, field);
        template = template.replace('{reflection}', reflection);
    }
    // {choice} - crystallize the decision
    if (template.includes('{choice}')) {
        template = template.replace('{choice}', 'cosa vuoi davvero');
    }
    // {option_a}, {option_b} - decision options
    if (template.includes('{option_a}')) {
        template = template.replace('{option_a}', 'restare');
        template = template.replace('{option_b}', 'andare');
    }
    // {information} - for INFORM primitive, we need to generate or flag for LLM
    if (template.includes('{information}')) {
        // In a real system, this would call an LLM or lookup
        // For now, acknowledge we need to inform but can't template it
        template = "[OPERATIONAL: This requires actual information - route to LLM or knowledge base]";
    }
    return template;
}
function generateReflection(topDomain, field) {
    // Check evidence for specific content
    const evidence = field.domains[0]?.evidence || [];
    // Look for specific patterns in evidence
    for (const e of evidence) {
        if (/moglie|wife|marito|husband/i.test(e)) {
            return "qualcosa con tua moglie/tuo marito";
        }
        if (/capo|boss/i.test(e)) {
            return "qualcosa con il tuo capo";
        }
        if (/lavoro|job|work/i.test(e)) {
            return "qualcosa con il lavoro";
        }
    }
    // Simple reflection based on detected domain
    switch (topDomain) {
        case 'H04_EMOTION':
            return field.valence === 'negative'
                ? "stai portando qualcosa di pesante"
                : "c'è qualcosa che senti";
        case 'H09_ATTACHMENT':
            return "una relazione che ti pesa";
        case 'H10_COORDINATION':
            return "qualcuno che non ti capisce";
        case 'H12_POWER':
            return "ti senti bloccato, senza potere";
        case 'H13_CREATION':
            return "una scelta che ti blocca";
        default:
            return "quello che stai attraversando";
    }
}
// ============================================
// CONSTRAINT VERIFICATION
// ============================================
function verifyConstraints(response, selection) {
    // Check length
    const wordCount = response.split(/\s+/).length;
    const maxWords = selection.length === 'minimal' ? 15
        : selection.length === 'brief' ? 40
            : 80;
    if (wordCount > maxWords)
        return false;
    // Check forbidden patterns
    for (const forbidden of selection.forbidden) {
        switch (forbidden) {
            case 'give_advice':
                if (/\b(dovresti|should|ti consiglio|I suggest)\b/i.test(response))
                    return false;
                break;
            case 'multiple_questions':
                const questionMarks = (response.match(/\?/g) || []).length;
                if (questionMarks > 1)
                    return false;
                break;
            case 'long_response':
                if (wordCount > 20)
                    return false;
                break;
        }
    }
    return true;
}
// ============================================
// MAIN GENERATION FUNCTION
// ============================================
function generate(selection, field, originalMessage) {
    const startTime = Date.now();
    // Detect language from original message
    const language = detectLanguage(originalMessage);
    // Get template for primitive
    let response = selectTemplate(selection.primitive, language);
    // Fill any slots (pass field for reflection generation)
    response = fillSlots(response, field);
    // Verify constraints
    const constraintsSatisfied = verifyConstraints(response, selection);
    // If constraints not satisfied, fall back to minimal safe response
    if (!constraintsSatisfied) {
        response = language === 'it' ? "Sono qui." : "I'm here.";
    }
    const endTime = Date.now();
    return {
        text: response,
        length_tokens: response.split(/\s+/).length,
        primitive_executed: selection.primitive,
        constraints_satisfied: constraintsSatisfied,
        generation_time_ms: endTime - startTime
    };
}
// ============================================
// EXPORTS
// ============================================
exports.default = generate;
//# sourceMappingURL=generation.js.map