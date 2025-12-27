"use strict";
/**
 * ENOQ TOTAL SYSTEM ORCHESTRATOR
 *
 * Integrates all components into a unified cognitive system.
 *
 * Components:
 * - Memory System (Hippocampal-Cortical)
 * - Dimensional Detection (Vertical + Horizontal)
 * - Multi-Agent Swarm (Emergent Intelligence)
 * - Metacognitive Monitor (Self-Awareness)
 * - Temporal Engine (Past-Present-Future)
 *
 * Flow:
 * 1. Input → Memory Context + Dimensional Detection
 * 2. → Agent Swarm Processing
 * 3. → Temporal Analysis
 * 4. → Response Generation
 * 5. → Metacognitive Verification
 * 6. → Output + Memory Storage
 *
 * Based on:
 * - Global Workspace Theory (integration point)
 * - Active Inference (minimize surprise)
 * - Autopoiesis (self-maintaining system)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalSystem = exports.TotalSystemOrchestrator = void 0;
exports.processMessage = processMessage;
const memory_system_1 = require("./memory_system");
const dimensional_system_1 = require("./dimensional_system");
const agent_swarm_1 = require("./agent_swarm");
const metacognitive_monitor_1 = require("./metacognitive_monitor");
const temporal_engine_1 = require("./temporal_engine");
// ============================================
// TOTAL SYSTEM ORCHESTRATOR
// ============================================
class TotalSystemOrchestrator {
    constructor() {
        this.previousDimensionalState = null;
        this.responseHistory = [];
    }
    /**
     * Process user input through the complete system
     */
    async process(input) {
        const startTime = Date.now();
        const metrics = {};
        // ========================================
        // PHASE 1: MEMORY CONTEXT RETRIEVAL
        // ========================================
        const memoryContext = memory_system_1.memorySystem.getContext(input.user_id);
        // ========================================
        // PHASE 2: DIMENSIONAL DETECTION
        // ========================================
        const dimStart = Date.now();
        const dimensionalState = dimensional_system_1.dimensionalDetector.detect(input.message, input.language, {
            previous_state: this.previousDimensionalState || undefined,
            field_state: this.createInitialFieldState(memoryContext)
        });
        metrics.dimensional_detection_ms = Date.now() - dimStart;
        // Generate dimensional insights
        const dimensionalInsights = dimensional_system_1.dimensionalIntegrator.generateInsights(dimensionalState);
        const suggestedDepth = dimensional_system_1.dimensionalIntegrator.suggestDepth(dimensionalState);
        const suggestedPrimitives = dimensional_system_1.dimensionalIntegrator.suggestPrimitives(dimensionalState);
        // ========================================
        // PHASE 3: FIELD STATE CONSTRUCTION
        // ========================================
        const fieldState = this.constructFieldState(input.message, dimensionalState, memoryContext, input.language);
        // ========================================
        // PHASE 4: AGENT SWARM PROCESSING
        // ========================================
        const swarmStart = Date.now();
        const swarmResult = await agent_swarm_1.agentSwarm.process(input.message, dimensionalState, fieldState);
        metrics.swarm_processing_ms = Date.now() - swarmStart;
        // ========================================
        // PHASE 5: TEMPORAL ANALYSIS
        // ========================================
        const temporalStart = Date.now();
        const temporalAnalysis = temporal_engine_1.temporalEngine.analyze(input.message, memoryContext.working_memory, dimensionalState);
        metrics.temporal_analysis_ms = Date.now() - temporalStart;
        // ========================================
        // PHASE 6: PRIMITIVE SELECTION
        // ========================================
        const selectedPrimitive = this.selectPrimitive(suggestedPrimitives, dimensionalState, swarmResult.consensus, temporalAnalysis);
        // ========================================
        // PHASE 7: ATMOSPHERE DETERMINATION
        // ========================================
        const atmosphere = this.determineAtmosphere(dimensionalState, temporalAnalysis);
        // ========================================
        // PHASE 8: RESPONSE SYNTHESIS
        // ========================================
        let responseDraft = this.synthesizeResponse(swarmResult.contributions, dimensionalState, temporalAnalysis, selectedPrimitive, suggestedDepth, input.language);
        // ========================================
        // PHASE 9: METACOGNITIVE VERIFICATION
        // ========================================
        const metaStart = Date.now();
        const metacognitiveReport = metacognitive_monitor_1.metacognitiveMonitor.generateReport(input.message, responseDraft, dimensionalState, fieldState, agent_swarm_1.agentSwarm.getState(), this.responseHistory);
        metrics.metacognitive_check_ms = Date.now() - metaStart;
        // ========================================
        // PHASE 10: RESPONSE REFINEMENT
        // ========================================
        const verified = metacognitiveReport.alignment.aligned;
        const verificationNotes = [];
        if (!verified) {
            // Attempt to fix violations
            responseDraft = this.refineResponse(responseDraft, metacognitiveReport, selectedPrimitive, input.language);
            verificationNotes.push(...metacognitiveReport.alignment.violations.map(v => `Fixed: ${v.constraint} - ${v.description}`));
        }
        // Add uncertainty expression if needed
        if (metacognitiveReport.confidence.overall < 0.5) {
            const uncertaintyExpression = metacognitive_monitor_1.metacognitiveMonitor.expressUncertainty(metacognitiveReport.confidence, input.language);
            if (uncertaintyExpression) {
                responseDraft = `${uncertaintyExpression} ${responseDraft}`;
            }
        }
        // ========================================
        // PHASE 11: MEMORY STORAGE
        // ========================================
        const episodeId = memory_system_1.memorySystem.store(input.user_id, input.message, input.language, fieldState, dimensionalState.primary_horizontal, atmosphere, selectedPrimitive, responseDraft);
        // ========================================
        // PHASE 12: STATE UPDATE
        // ========================================
        this.previousDimensionalState = dimensionalState;
        this.responseHistory.push(responseDraft);
        if (this.responseHistory.length > 10) {
            this.responseHistory.shift();
        }
        // ========================================
        // METRICS FINALIZATION
        // ========================================
        metrics.total_latency_ms = Date.now() - startTime;
        metrics.phi_score = dimensionalState.integration.phi;
        metrics.confidence_score = metacognitiveReport.confidence.overall;
        // ========================================
        // OUTPUT CONSTRUCTION
        // ========================================
        return {
            response: responseDraft,
            field_state: fieldState,
            primitive_used: selectedPrimitive,
            atmosphere,
            context: {
                dimensional_state: dimensionalState,
                temporal_analysis: temporalAnalysis,
                swarm_consensus: swarmResult.consensus,
                metacognitive_report: metacognitiveReport,
                memory_context: {
                    working_memory_size: memoryContext.working_memory.length,
                    user_model_exists: true,
                    autonomy_health: memoryContext.autonomy_health.recommendation,
                    effective_strategies_count: memoryContext.effective_strategies.length
                }
            },
            metrics: metrics,
            verified,
            verification_notes: verificationNotes
        };
    }
    /**
     * Create initial field state from memory context
     */
    createInitialFieldState(memoryContext) {
        return {
            domains: [],
            arousal: 'medium',
            valence: 'neutral',
            coherence: 'medium',
            goal: 'unclear',
            loop_count: 0,
            flags: [],
            uncertainty: 0.5
        };
    }
    /**
     * Construct full field state
     */
    constructFieldState(message, dimensionalState, memoryContext, language) {
        // Determine arousal based on phi
        let arousal = 'medium';
        if (dimensionalState.integration.phi > 0.7) {
            arousal = 'high';
        }
        else if (dimensionalState.integration.phi < 0.3) {
            arousal = 'low';
        }
        // Determine valence from dimensional analysis
        let valence = 'neutral';
        if (dimensionalState.vertical.SOMATIC > 0.5 || dimensionalState.emergency_detected) {
            valence = 'negative';
        }
        // Coherence from integration metrics
        let coherence = 'medium';
        if (dimensionalState.integration.coherence > 0.7) {
            coherence = 'high';
        }
        else if (dimensionalState.integration.coherence < 0.3) {
            coherence = 'low';
        }
        // Goal inference
        let goal = 'explore';
        if (dimensionalState.primary_vertical === 'FUNCTIONAL') {
            goal = 'act';
        }
        else if (dimensionalState.v_mode_triggered) {
            goal = 'process';
        }
        else if (dimensionalState.emergency_detected) {
            goal = 'regulate';
        }
        // Active domains as DomainActivation
        const domains = dimensionalState.primary_horizontal.map(d => ({
            domain: d,
            salience: dimensionalState.horizontal[d] || 0.5,
            confidence: 0.7
        }));
        // Flags
        const flags = [];
        if (dimensionalState.emergency_detected) {
            flags.push('crisis');
        }
        if (dimensionalState.integration.phi > 0.8) {
            flags.push('high_arousal');
        }
        return {
            domains,
            arousal,
            valence,
            coherence,
            goal,
            loop_count: 0,
            flags,
            uncertainty: 1 - dimensionalState.integration.coherence,
            language
        };
    }
    /**
     * Select the most appropriate primitive
     */
    selectPrimitive(suggested, dimensionalState, consensus, temporalAnalysis) {
        // Emergency overrides everything
        if (dimensionalState.emergency_detected) {
            return 'GROUND';
        }
        // V_MODE prefers reflective primitives
        if (dimensionalState.v_mode_triggered) {
            if (suggested.includes('WITNESS'))
                return 'WITNESS';
            if (suggested.includes('HOLD'))
                return 'HOLD';
            return 'COMPANION';
        }
        // Temporal urgency
        if (temporal_engine_1.temporalEngine.requiresImmediateAttention(temporalAnalysis)) {
            return 'PRESENCE';
        }
        // High tension needs holding
        if (dimensionalState.integration.tension > 0.5) {
            if (suggested.includes('HOLD_PARADOX'))
                return 'HOLD_PARADOX';
            return 'HOLD';
        }
        // Cross-dimensional needs integration
        if (dimensionalState.cross_dimensional) {
            if (suggested.includes('BRIDGE'))
                return 'BRIDGE';
        }
        // Default to first suggestion or MIRROR
        return suggested[0] || 'MIRROR';
    }
    /**
     * Determine atmosphere
     */
    determineAtmosphere(dimensionalState, temporalAnalysis) {
        if (dimensionalState.emergency_detected) {
            return 'EMERGENCY';
        }
        if (dimensionalState.v_mode_triggered) {
            return 'V_MODE';
        }
        if (temporalAnalysis.temporal_pressure.urgency === 'high') {
            return 'DECISION';
        }
        if (dimensionalState.primary_vertical === 'FUNCTIONAL') {
            return 'OPERATIONAL';
        }
        return 'HUMAN_FIELD';
    }
    /**
     * Synthesize response from all components
     */
    synthesizeResponse(contributions, dimensionalState, temporalAnalysis, primitive, depth, language) {
        const elements = [];
        // Get agent contributions
        const agentContribution = agent_swarm_1.agentSwarm.synthesize(contributions, primitive);
        if (agentContribution) {
            elements.push(agentContribution);
        }
        // Add temporal element if relevant
        const temporalElement = temporal_engine_1.temporalEngine.generateTemporalResponse(temporalAnalysis, language);
        if (temporalElement) {
            elements.push(temporalElement);
        }
        // Combine elements based on depth
        let response = elements.join(' ');
        // V_MODE should end with a question
        if (dimensionalState.v_mode_triggered && !response.includes('?')) {
            const questions = {
                en: 'What does this mean to you?',
                it: 'Cosa significa questo per te?',
                es: '¿Qué significa esto para ti?',
                fr: 'Qu\'est-ce que cela signifie pour toi?',
                de: 'Was bedeutet das für dich?'
            };
            response += ' ' + (questions[language] || questions.en);
        }
        // Emergency should include grounding (only if not already present)
        if (dimensionalState.emergency_detected) {
            const groundingMarkers = /breath|respir|atem|souffle/i;
            if (!groundingMarkers.test(response)) {
                const grounding = {
                    en: 'Right now, just notice your breath.',
                    it: 'Adesso, nota solo il tuo respiro.',
                    es: 'Ahora mismo, solo nota tu respiración.',
                    fr: 'Maintenant, remarque simplement ta respiration.',
                    de: 'Gerade jetzt, bemerke einfach deinen Atem.'
                };
                response = (grounding[language] || grounding.en) + ' ' + response;
            }
        }
        // Ensure minimum response if empty
        if (!response.trim()) {
            const defaults = {
                en: 'I hear you.',
                it: 'Ti ascolto.',
                es: 'Te escucho.',
                fr: 'Je t\'entends.',
                de: 'Ich höre dich.'
            };
            response = defaults[language] || defaults.en;
        }
        return response;
    }
    /**
     * Refine response based on metacognitive feedback
     */
    refineResponse(response, report, primitive, language) {
        let refined = response;
        // Remove directive language
        refined = refined.replace(/you should|you must|you need to/gi, 'you might consider');
        refined = refined.replace(/dovresti|devi/gi, 'potresti considerare');
        refined = refined.replace(/debes|tienes que/gi, 'podrías considerar');
        // Remove identity assignment
        refined = refined.replace(/you are a|you're being/gi, 'it seems like');
        refined = refined.replace(/sei un|stai essendo/gi, 'sembra che');
        refined = refined.replace(/eres un|estás siendo/gi, 'parece que');
        // Remove diagnostic language
        refined = refined.replace(/you have (depression|anxiety)/gi, 'you\'re experiencing');
        refined = refined.replace(/hai (depressione|ansia)/gi, 'stai vivendo');
        refined = refined.replace(/tienes (depresión|ansiedad)/gi, 'estás experimentando');
        return refined;
    }
    /**
     * Trigger memory consolidation (call periodically)
     */
    consolidateMemory(user_id) {
        memory_system_1.memorySystem.consolidate(user_id);
    }
    /**
     * Get system health metrics
     */
    getSystemHealth(user_id) {
        const context = memory_system_1.memorySystem.getContext(user_id);
        return {
            memory_health: context.autonomy_health,
            phi_average: 0.5, // Would track over time
            constitutional_compliance: 1.0 // Would track violations
        };
    }
}
exports.TotalSystemOrchestrator = TotalSystemOrchestrator;
// ============================================
// SINGLETON EXPORT
// ============================================
exports.totalSystem = new TotalSystemOrchestrator();
exports.default = exports.totalSystem;
// ============================================
// CONVENIENCE FUNCTION
// ============================================
/**
 * Quick process function for simple usage
 */
async function processMessage(user_id, message, language = 'en') {
    return exports.totalSystem.process({
        user_id,
        message,
        language
    });
}
//# sourceMappingURL=total_system.js.map