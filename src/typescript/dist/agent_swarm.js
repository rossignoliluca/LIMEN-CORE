"use strict";
/**
 * ENOQ MULTI-AGENT SWARM ARCHITECTURE
 *
 * Inspired by:
 * - Global Workspace Theory (Baars) - conscious broadcast
 * - Swarm Intelligence - emergent behavior from simple rules
 * - Society of Mind (Minsky) - multiple specialized agents
 * - A2A Protocol (Google 2025) - agent coordination
 *
 * Architecture:
 * - Meta-Coordinator: Global workspace, routes attention
 * - Domain Specialists: H01-H17 agents with domain expertise
 * - Cross-Cutting Agents: Temporal, Adversarial, Synthesis
 *
 * Constitutional Constraint: Any agent can VETO a response
 * that violates constitutional principles.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentSwarm = exports.AgentSwarm = void 0;
const agent_responses_1 = require("./agent_responses");
// ============================================
// BASE AGENT CLASS
// ============================================
class BaseAgent {
    constructor(id, constraints = []) {
        this.id = id;
        this.constitutional_constraints = [
            'INV-003: No normative delegation',
            'INV-009: No identity assignment (Rubicon)',
            'INV-011: No diagnosis',
            ...constraints
        ];
        this.state = {
            id,
            active: true,
            activation_level: 0,
            last_contribution: null,
            working_memory: []
        };
    }
    /**
     * Check if something violates constitutional constraints
     */
    checkConstitutional(content) {
        // Check for directive language (INV-003)
        if (/you should|you must|you need to|dovresti|debes|devi/i.test(content)) {
            return {
                agent: this.id,
                reason: 'Directive language detected - transfers normative power',
                constraint_violated: 'INV-003',
                timestamp: new Date()
            };
        }
        // Check for identity assignment (INV-009)
        if (/you are a|sei un|eres un|you're being/i.test(content)) {
            return {
                agent: this.id,
                reason: 'Identity assignment detected - Rubicon violation',
                constraint_violated: 'INV-009',
                timestamp: new Date()
            };
        }
        // Check for diagnosis (INV-011)
        if (/you have|you suffer from|this is (depression|anxiety|disorder)/i.test(content)) {
            return {
                agent: this.id,
                reason: 'Diagnostic language detected',
                constraint_violated: 'INV-011',
                timestamp: new Date()
            };
        }
        return null;
    }
    /**
     * Create message
     */
    createMessage(type, content, to, confidence, salience) {
        return {
            id: `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            from: this.id,
            to,
            type,
            content,
            confidence,
            salience,
            constitutional_check: true,
            timestamp: new Date()
        };
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Set activation level
     */
    setActivation(level) {
        this.state.activation_level = Math.max(0, Math.min(1, level));
    }
}
// ============================================
// META-COORDINATOR (Global Workspace)
// ============================================
class MetaCoordinator extends BaseAgent {
    constructor() {
        super('META_COORDINATOR', [
            'Must not suppress any agent\'s veto',
            'Must broadcast all constitutional violations',
            'Must ensure response coherence'
        ]);
        this.agentRegistry = new Map();
    }
    registerAgent(agent) {
        this.agentRegistry.set(agent.getState().id, agent);
    }
    /**
     * Initialize workspace with new input
     */
    initializeWorkspace(userMessage, dimensionalState, fieldState) {
        return {
            spotlight: {
                user_message: userMessage,
                dimensional_state: dimensionalState,
                field_state: fieldState,
                active_hypotheses: [],
                selected_primitive: null,
                response_draft: null
            },
            coherence: 0,
            phi: 0
        };
    }
    /**
     * Broadcast to all agents
     */
    broadcast(workspace) {
        return this.createMessage('broadcast', {
            user_message: workspace.spotlight.user_message,
            dimensional_state: workspace.spotlight.dimensional_state,
            request: 'PROCESS_AND_CONTRIBUTE'
        }, 'all', 1.0, 1.0);
    }
    /**
     * Collect and integrate agent contributions
     */
    integrate(contributions) {
        const consensus = {
            reached: false,
            primary_interpretation: '',
            selected_primitive: '',
            response_elements: new Map(),
            vetoes: []
        };
        // Collect hypotheses
        const hypotheses = [];
        for (const [agentId, messages] of contributions) {
            for (const msg of messages) {
                // Check for vetoes
                if (msg.type === 'veto') {
                    consensus.vetoes.push(msg.content);
                }
                // Collect hypotheses
                if (msg.type === 'hypothesis') {
                    hypotheses.push({
                        id: msg.id,
                        source: agentId,
                        content: msg.content.interpretation,
                        type: msg.content.type,
                        confidence: msg.confidence,
                        supporting_agents: [agentId],
                        opposing_agents: []
                    });
                }
                // Collect contributions
                if (msg.type === 'contribution') {
                    consensus.response_elements.set(agentId, msg.content);
                }
            }
        }
        // If any vetoes, consensus not reached
        if (consensus.vetoes.length > 0) {
            consensus.reached = false;
            return consensus;
        }
        // Find highest confidence hypothesis
        if (hypotheses.length > 0) {
            hypotheses.sort((a, b) => b.confidence - a.confidence);
            consensus.primary_interpretation = hypotheses[0].content;
        }
        consensus.reached = true;
        return consensus;
    }
    process(message, workspace) {
        // Meta-coordinator processes aggregated messages
        return [];
    }
    contribute(workspace) {
        // Meta-coordinator doesn't contribute content, only coordinates
        return null;
    }
}
// ============================================
// DOMAIN SPECIALIST AGENTS (H01-H17)
// ============================================
class DomainSpecialistAgent extends BaseAgent {
    constructor(domain, expertise) {
        super(domain);
        this.domain = domain;
        this.expertise = expertise;
    }
    process(message, workspace) {
        const messages = [];
        // Check if this domain is relevant
        const relevance = this.assessRelevance(workspace);
        this.setActivation(relevance);
        if (relevance < 0.2) {
            return messages;
        }
        // Generate observation
        const observation = this.observe(workspace);
        if (observation) {
            messages.push(this.createMessage('observation', observation, 'META_COORDINATOR', relevance, relevance));
        }
        // Generate hypothesis if confident
        if (relevance > 0.5) {
            const hypothesis = this.hypothesize(workspace);
            if (hypothesis) {
                messages.push(this.createMessage('hypothesis', hypothesis, 'META_COORDINATOR', relevance * 0.8, relevance));
            }
        }
        return messages;
    }
    contribute(workspace) {
        if (this.state.activation_level < 0.3) {
            return null;
        }
        // Generate domain-specific response element
        const need = this.identifyNeed(workspace);
        if (need) {
            return this.formatContribution(need, workspace);
        }
        return null;
    }
    assessRelevance(workspace) {
        const dimensionalState = workspace.spotlight.dimensional_state;
        const horizontal = dimensionalState.horizontal;
        // Check if our domain is active
        return horizontal[this.domain] || 0;
    }
    observe(workspace) {
        const msg = workspace.spotlight.user_message;
        // Check for domain keywords
        for (const keyword of this.expertise.keywords) {
            if (keyword.test(msg)) {
                return `Domain ${this.domain} active: keyword match`;
            }
        }
        return null;
    }
    hypothesize(workspace) {
        // Generate domain-specific interpretation
        const need = this.identifyNeed(workspace);
        if (need) {
            return {
                interpretation: `User may be experiencing ${this.domain} domain need: ${need}`,
                type: 'need'
            };
        }
        return null;
    }
    identifyNeed(workspace) {
        // Check typical needs for this domain
        for (const need of this.expertise.typical_needs) {
            // Simple check - in production would be more sophisticated
            if (workspace.spotlight.user_message.toLowerCase().includes(need.toLowerCase())) {
                return need;
            }
        }
        return this.expertise.typical_needs[0] || null;
    }
    formatContribution(need, workspace) {
        // Get language from field state or default to English
        const language = workspace.spotlight.field_state?.language || 'en';
        const variationIndex = Math.floor(this.state.activation_level * 10);
        return (0, agent_responses_1.generateDomainResponse)(this.domain, language, variationIndex);
    }
}
// ============================================
// TEMPORAL AGENT
// ============================================
class TemporalAgent extends BaseAgent {
    constructor() {
        super('TEMPORAL_AGENT', [
            'Cannot predict specific outcomes',
            'Cannot prescribe future actions',
            'Can illuminate patterns and trajectories'
        ]);
    }
    process(message, workspace) {
        const messages = [];
        // Detect temporal markers in message
        const temporalAnalysis = this.analyzeTemporalContent(workspace);
        if (temporalAnalysis.past_reference) {
            messages.push(this.createMessage('observation', { type: 'past_reference', content: temporalAnalysis.past_content }, 'META_COORDINATOR', 0.7, 0.6));
        }
        if (temporalAnalysis.future_concern) {
            messages.push(this.createMessage('observation', { type: 'future_concern', content: temporalAnalysis.future_content }, 'META_COORDINATOR', 0.7, 0.7));
        }
        // Detect patterns (recurring themes)
        if (temporalAnalysis.pattern_detected) {
            messages.push(this.createMessage('hypothesis', {
                interpretation: 'Recurring pattern detected',
                pattern: temporalAnalysis.pattern,
                type: 'pattern'
            }, 'META_COORDINATOR', 0.6, 0.8));
        }
        return messages;
    }
    contribute(workspace) {
        const analysis = this.analyzeTemporalContent(workspace);
        const state = workspace.spotlight.dimensional_state;
        const language = workspace.spotlight.field_state?.language || 'en';
        const context = {
            language,
            vertical: state.primary_vertical,
            domains: state.primary_horizontal,
            v_mode: state.v_mode_triggered,
            emergency: state.emergency_detected,
            arousal: 'medium',
            phi: state.integration.phi,
        };
        if (analysis.pattern_detected) {
            return (0, agent_responses_1.generateAgentResponse)('TEMPORAL', 'pattern', context);
        }
        if (analysis.future_concern) {
            return (0, agent_responses_1.generateAgentResponse)('TEMPORAL', 'future', context);
        }
        if (analysis.past_reference) {
            return (0, agent_responses_1.generateAgentResponse)('TEMPORAL', 'past', context);
        }
        return null;
    }
    analyzeTemporalContent(workspace) {
        const msg = workspace.spotlight.user_message;
        const pastMarkers = /always|never|used to|remember|before|once|when I was/i;
        const futureMarkers = /will|going to|might|what if|afraid that|worry about|future/i;
        const patternMarkers = /again|every time|keeps happening|same thing|always ends up/i;
        return {
            past_reference: pastMarkers.test(msg),
            past_content: this.extractTemporalContent(msg, 'past'),
            future_concern: futureMarkers.test(msg),
            future_content: this.extractTemporalContent(msg, 'future'),
            pattern_detected: patternMarkers.test(msg),
            pattern: patternMarkers.test(msg) ? 'repetition' : ''
        };
    }
    extractTemporalContent(message, type) {
        // Simplified extraction
        return type === 'past' ? 'past reference detected' : 'future concern detected';
    }
}
// ============================================
// ADVERSARY AGENT (Devil's Advocate)
// ============================================
class AdversaryAgent extends BaseAgent {
    constructor() {
        super('ADVERSARY_AGENT', [
            'Challenge but do not undermine user autonomy',
            'Question but do not prescribe',
            'Illuminate blind spots, do not judge'
        ]);
    }
    process(message, workspace) {
        const messages = [];
        // Check response drafts for potential issues
        if (workspace.spotlight.response_draft) {
            const veto = this.checkConstitutional(workspace.spotlight.response_draft);
            if (veto) {
                messages.push(this.createMessage('veto', veto, 'META_COORDINATOR', 1.0, 1.0));
            }
        }
        // Challenge dominant hypothesis if too confident
        for (const hypothesis of workspace.spotlight.active_hypotheses) {
            if (hypothesis.confidence > 0.8) {
                messages.push(this.createMessage('constraint', {
                    challenge: `High confidence on "${hypothesis.content}" - consider alternatives`,
                    alternative: this.generateAlternative(hypothesis)
                }, 'META_COORDINATOR', 0.6, 0.7));
            }
        }
        return messages;
    }
    contribute(workspace) {
        // Adversary doesn't contribute to response content
        // Only challenges and vetoes
        return null;
    }
    generateAlternative(hypothesis) {
        return `Alternative interpretation: The opposite might also be true`;
    }
}
// ============================================
// SYNTHESIS AGENT
// ============================================
class SynthesisAgent extends BaseAgent {
    constructor() {
        super('SYNTHESIS_AGENT', [
            'Integrate without forcing coherence',
            'Honor contradictions as information',
            'Find the both/and, not just either/or'
        ]);
    }
    process(message, workspace) {
        // Synthesis agent listens and integrates
        return [];
    }
    contribute(workspace) {
        // Synthesize all agent contributions
        const state = workspace.spotlight.dimensional_state;
        const language = workspace.spotlight.field_state?.language || 'en';
        const context = {
            language,
            vertical: state.primary_vertical,
            domains: state.primary_horizontal,
            v_mode: state.v_mode_triggered,
            emergency: state.emergency_detected,
            arousal: 'medium',
            phi: state.integration.phi,
        };
        if (state.integration.tension > 0.3) {
            return (0, agent_responses_1.generateAgentResponse)('SYNTHESIS', 'tension', context);
        }
        if (state.cross_dimensional) {
            return (0, agent_responses_1.generateAgentResponse)('SYNTHESIS', 'integration', context);
        }
        return null;
    }
    /**
     * Synthesize final response from all contributions
     */
    synthesize(contributions, workspace, primitive) {
        const state = workspace.spotlight.dimensional_state;
        const language = workspace.spotlight.field_state?.language || 'en';
        // Collect all valid contributions
        const elements = [];
        // Priority order based on dimensional state
        const priorityAgents = [];
        // Emergency: Somatic first
        if (state.emergency_detected) {
            priorityAgents.push('SOMATIC_AGENT');
        }
        // V_MODE: Synthesis and existential domains
        if (state.v_mode_triggered) {
            priorityAgents.push('SYNTHESIS_AGENT', 'H06_MEANING', 'H07_IDENTITY');
        }
        // Add primary vertical's agent
        switch (state.primary_vertical) {
            case 'SOMATIC':
                priorityAgents.push('SOMATIC_AGENT', 'H03_BODY');
                break;
            case 'FUNCTIONAL':
                priorityAgents.push('H16_OPERATIONAL', 'H14_WORK');
                break;
            case 'RELATIONAL':
                priorityAgents.push('H09_ATTACHMENT', 'H11_BELONGING');
                break;
            case 'EXISTENTIAL':
                priorityAgents.push('H06_MEANING', 'H07_IDENTITY');
                break;
            case 'TRANSCENDENT':
                priorityAgents.push('SYNTHESIS_AGENT', 'H06_MEANING');
                break;
        }
        // Add temporal if patterns detected
        priorityAgents.push('TEMPORAL_AGENT');
        // Add synthesis for integration
        if (state.cross_dimensional || state.integration.tension > 0.3) {
            priorityAgents.push('SYNTHESIS_AGENT');
        }
        // Collect contributions in priority order (avoid duplicates)
        const seen = new Set();
        for (const agentId of priorityAgents) {
            const contribution = contributions.get(agentId);
            if (contribution && !seen.has(contribution)) {
                elements.push(contribution);
                seen.add(contribution);
                // Limit to 2-3 elements for readability
                if (elements.length >= 2)
                    break;
            }
        }
        // If still empty, try any contribution
        if (elements.length === 0) {
            for (const [agentId, contribution] of contributions) {
                if (contribution && !seen.has(contribution)) {
                    elements.push(contribution);
                    break;
                }
            }
        }
        // Final fallback: contextual response
        if (elements.length === 0) {
            return (0, agent_responses_1.generateContextualResponse)(state, language);
        }
        return elements.join(' ');
    }
}
// ============================================
// SOMATIC AGENT
// ============================================
class SomaticAgent extends BaseAgent {
    constructor() {
        super('SOMATIC_AGENT', [
            'Honor body wisdom',
            'Do not diagnose physical conditions',
            'Invite awareness, do not prescribe action'
        ]);
    }
    process(message, workspace) {
        const messages = [];
        const state = workspace.spotlight.dimensional_state;
        if (state.vertical.SOMATIC > 0.3) {
            this.setActivation(state.vertical.SOMATIC);
            messages.push(this.createMessage('observation', { body_active: true, level: state.vertical.SOMATIC }, 'META_COORDINATOR', state.vertical.SOMATIC, state.vertical.SOMATIC));
            if (state.emergency_detected) {
                messages.push(this.createMessage('constraint', { emergency: true, action: 'GROUND_FIRST' }, 'META_COORDINATOR', 1.0, 1.0));
            }
        }
        return messages;
    }
    contribute(workspace) {
        const state = workspace.spotlight.dimensional_state;
        const language = workspace.spotlight.field_state?.language || 'en';
        const context = {
            language,
            vertical: state.primary_vertical,
            domains: state.primary_horizontal,
            v_mode: state.v_mode_triggered,
            emergency: state.emergency_detected,
            arousal: state.integration.phi > 0.7 ? 'high' : 'medium',
            phi: state.integration.phi,
        };
        if (state.vertical.SOMATIC > 0.5) {
            if (state.emergency_detected) {
                return (0, agent_responses_1.generateAgentResponse)('SOMATIC', 'emergency', context);
            }
            return (0, agent_responses_1.generateAgentResponse)('SOMATIC', 'awareness', context);
        }
        return null;
    }
}
// ============================================
// SWARM COORDINATOR
// ============================================
class AgentSwarm {
    constructor() {
        this.workspace = null;
        this.metaCoordinator = new MetaCoordinator();
        this.agents = new Map();
        // Initialize agents
        this.initializeAgents();
    }
    initializeAgents() {
        // Cross-cutting agents
        this.agents.set('TEMPORAL_AGENT', new TemporalAgent());
        this.agents.set('ADVERSARY_AGENT', new AdversaryAgent());
        this.agents.set('SYNTHESIS_AGENT', new SynthesisAgent());
        this.agents.set('SOMATIC_AGENT', new SomaticAgent());
        // Domain specialists (simplified - in production would be more elaborate)
        const domainExpertise = {
            keywords: [/.*/],
            patterns: [],
            typical_needs: ['understanding', 'clarity', 'support'],
            response_style: 'empathetic'
        };
        const domains = [
            'H01_SURVIVAL', 'H02_SAFETY', 'H03_BODY', 'H04_EMOTION', 'H05_COGNITION',
            'H06_MEANING', 'H07_IDENTITY', 'H08_TEMPORAL', 'H09_ATTACHMENT', 'H10_COORDINATION',
            'H11_BELONGING', 'H12_HIERARCHY', 'H13_CREATION', 'H14_WORK', 'H15_LEGAL',
            'H16_OPERATIONAL', 'H17_FORM'
        ];
        for (const domain of domains) {
            this.agents.set(domain, new DomainSpecialistAgent(domain, domainExpertise));
            this.metaCoordinator.registerAgent(this.agents.get(domain));
        }
        // Register cross-cutting agents
        for (const [id, agent] of this.agents) {
            this.metaCoordinator.registerAgent(agent);
        }
    }
    /**
     * Process user input through the swarm
     */
    async process(userMessage, dimensionalState, fieldState) {
        // Initialize workspace
        this.workspace = this.metaCoordinator.initializeWorkspace(userMessage, dimensionalState, fieldState);
        // Broadcast to all agents
        const broadcast = this.metaCoordinator.broadcast(this.workspace);
        // Collect responses from all agents
        const responses = new Map();
        for (const [id, agent] of this.agents) {
            const agentResponses = agent.process(broadcast, this.workspace);
            responses.set(id, agentResponses);
        }
        // Integrate responses
        const consensus = this.metaCoordinator.integrate(responses);
        // Collect contributions if consensus reached
        const contributions = new Map();
        if (consensus.reached) {
            for (const [id, agent] of this.agents) {
                const contribution = agent.contribute(this.workspace);
                if (contribution) {
                    contributions.set(id, contribution);
                }
            }
        }
        // Update workspace metrics
        this.workspace.coherence = consensus.reached ? 0.8 : 0.3;
        this.workspace.phi = dimensionalState.integration.phi;
        return {
            consensus,
            contributions,
            workspace: this.workspace
        };
    }
    /**
     * Generate final response using synthesis agent
     */
    synthesize(contributions, primitive) {
        if (!this.workspace) {
            return 'I hear you.';
        }
        const synthesisAgent = this.agents.get('SYNTHESIS_AGENT');
        return synthesisAgent.synthesize(contributions, this.workspace, primitive);
    }
    /**
     * Get current swarm state
     */
    getState() {
        const agentStates = new Map();
        for (const [id, agent] of this.agents) {
            agentStates.set(id, agent.getState());
        }
        return {
            agents: agentStates,
            global_workspace: this.workspace || this.metaCoordinator.initializeWorkspace('', {}, {}),
            current_consensus: {
                reached: false,
                primary_interpretation: '',
                selected_primitive: '',
                response_elements: new Map(),
                vetoes: []
            },
            constitutional_violations: []
        };
    }
}
exports.AgentSwarm = AgentSwarm;
// ============================================
// SINGLETON EXPORT
// ============================================
exports.agentSwarm = new AgentSwarm();
exports.default = exports.agentSwarm;
//# sourceMappingURL=agent_swarm.js.map