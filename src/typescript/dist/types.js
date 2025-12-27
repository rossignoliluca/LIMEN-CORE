"use strict";
/**
 * ENOQ L1 CORE - TYPE DEFINITIONS
 *
 * The fundamental data structures for the perception-action pipeline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CULTURE_PROFILES = void 0;
/**
 * Default culture profiles for each language
 */
exports.CULTURE_PROFILES = {
    // Tier 1
    en: { language: 'en', directness: 'high', formality: 'casual', emotionality: 'moderate', silence_comfort: 'low', hierarchy_respect: 'low', rtl: false },
    zh: { language: 'zh', directness: 'medium', formality: 'formal', emotionality: 'reserved', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    hi: { language: 'hi', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    es: { language: 'es', directness: 'medium', formality: 'neutral', emotionality: 'expressive', silence_comfort: 'low', hierarchy_respect: 'medium', rtl: false },
    // Tier 2
    fr: { language: 'fr', directness: 'medium', formality: 'formal', emotionality: 'moderate', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    ar: { language: 'ar', directness: 'low', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: true },
    bn: { language: 'bn', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    pt: { language: 'pt', directness: 'medium', formality: 'neutral', emotionality: 'expressive', silence_comfort: 'low', hierarchy_respect: 'medium', rtl: false },
    ru: { language: 'ru', directness: 'high', formality: 'neutral', emotionality: 'reserved', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    ur: { language: 'ur', directness: 'low', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: true },
    id: { language: 'id', directness: 'low', formality: 'formal', emotionality: 'moderate', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    // Tier 3
    de: { language: 'de', directness: 'high', formality: 'formal', emotionality: 'reserved', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    ja: { language: 'ja', directness: 'low', formality: 'formal', emotionality: 'reserved', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    pa: { language: 'pa', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    sw: { language: 'sw', directness: 'medium', formality: 'neutral', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    mr: { language: 'mr', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    tr: { language: 'tr', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    vi: { language: 'vi', directness: 'low', formality: 'formal', emotionality: 'reserved', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    ko: { language: 'ko', directness: 'low', formality: 'formal', emotionality: 'reserved', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    te: { language: 'te', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    ta: { language: 'ta', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    fa: { language: 'fa', directness: 'low', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: true },
    ms: { language: 'ms', directness: 'low', formality: 'formal', emotionality: 'moderate', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    ha: { language: 'ha', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    // Tier 4
    it: { language: 'it', directness: 'medium', formality: 'neutral', emotionality: 'expressive', silence_comfort: 'low', hierarchy_respect: 'medium', rtl: false },
    th: { language: 'th', directness: 'low', formality: 'formal', emotionality: 'reserved', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    am: { language: 'am', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    gu: { language: 'gu', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    yo: { language: 'yo', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    pl: { language: 'pl', directness: 'high', formality: 'neutral', emotionality: 'moderate', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    uk: { language: 'uk', directness: 'high', formality: 'neutral', emotionality: 'moderate', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    fil: { language: 'fil', directness: 'low', formality: 'neutral', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    kn: { language: 'kn', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    ml: { language: 'ml', directness: 'medium', formality: 'formal', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'high', rtl: false },
    my: { language: 'my', directness: 'low', formality: 'formal', emotionality: 'reserved', silence_comfort: 'high', hierarchy_respect: 'high', rtl: false },
    // Tier 5
    nl: { language: 'nl', directness: 'high', formality: 'casual', emotionality: 'moderate', silence_comfort: 'low', hierarchy_respect: 'low', rtl: false },
    ro: { language: 'ro', directness: 'medium', formality: 'neutral', emotionality: 'expressive', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    el: { language: 'el', directness: 'medium', formality: 'neutral', emotionality: 'expressive', silence_comfort: 'low', hierarchy_respect: 'medium', rtl: false },
    hu: { language: 'hu', directness: 'high', formality: 'neutral', emotionality: 'reserved', silence_comfort: 'medium', hierarchy_respect: 'medium', rtl: false },
    he: { language: 'he', directness: 'high', formality: 'casual', emotionality: 'expressive', silence_comfort: 'low', hierarchy_respect: 'low', rtl: true },
};
//# sourceMappingURL=types.js.map