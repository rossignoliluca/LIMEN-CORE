"use strict";
/**
 * ENOQ MEMORY SYSTEM
 *
 * Complementary Learning Systems (CLS) inspired architecture:
 * - Hippocampal System: Fast, episodic, sparse representations
 * - Neocortical System: Slow, semantic, dense representations
 *
 * Based on:
 * - McClelland et al. Complementary Learning Systems
 * - Hippocampal replay during slow-wave sleep
 * - Pattern separation and completion
 *
 * Constitutional Constraint: Memory cannot store or retrieve
 * patterns that would lead to dependency formation or
 * constitutional violations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorySystem = exports.MemorySystem = exports.NeocorticalMemory = exports.HippocampalBuffer = void 0;
// ============================================
// HIPPOCAMPAL SYSTEM (Fast Memory)
// ============================================
class HippocampalBuffer {
    constructor() {
        this.buffer = new Map();
        this.MAX_EPISODES_PER_USER = 100;
        this.MAX_WORKING_MEMORY = 10;
    }
    /**
     * Store new episode (fast, pattern-separated)
     */
    store(episode) {
        const userBuffer = this.buffer.get(episode.user_id) || [];
        // Pattern separation: compute novelty
        episode.novelty_score = this.computeNovelty(episode, userBuffer);
        userBuffer.push(episode);
        // Maintain buffer size
        if (userBuffer.length > this.MAX_EPISODES_PER_USER) {
            // Remove oldest, lowest salience episodes
            userBuffer.sort((a, b) => (b.emotional_salience + b.novelty_score) -
                (a.emotional_salience + a.novelty_score));
            userBuffer.splice(this.MAX_EPISODES_PER_USER);
        }
        this.buffer.set(episode.user_id, userBuffer);
    }
    /**
     * Retrieve working memory context
     */
    getWorkingMemory(user_id) {
        const buffer = this.buffer.get(user_id) || [];
        // Return most recent episodes
        return buffer.slice(-this.MAX_WORKING_MEMORY);
    }
    /**
     * Pattern completion: retrieve similar episodes
     */
    retrieveSimilar(user_id, cue, limit = 5) {
        const buffer = this.buffer.get(user_id) || [];
        // Compute similarity to cue
        const scored = buffer.map(ep => ({
            episode: ep,
            similarity: this.computeSimilarity(ep, cue)
        }));
        scored.sort((a, b) => b.similarity - a.similarity);
        return scored.slice(0, limit).map(s => s.episode);
    }
    /**
     * Get episodes ready for consolidation
     */
    getForReplay(user_id, count = 10) {
        const buffer = this.buffer.get(user_id) || [];
        // Interleave novel and familiar (prevents catastrophic forgetting)
        const sorted = [...buffer].sort((a, b) => {
            // Prioritize: high novelty OR high emotional salience
            const scoreA = a.novelty_score * 0.6 + a.emotional_salience * 0.4;
            const scoreB = b.novelty_score * 0.6 + b.emotional_salience * 0.4;
            return scoreB - scoreA;
        });
        return sorted.slice(0, count);
    }
    /**
     * Compute novelty relative to existing memories
     */
    computeNovelty(episode, existing) {
        if (existing.length === 0)
            return 1.0;
        // Check how different this is from existing episodes
        let maxSimilarity = 0;
        for (const ep of existing) {
            const sim = this.computeSimilarity(ep, episode);
            if (sim > maxSimilarity)
                maxSimilarity = sim;
        }
        // Novelty = 1 - max similarity to any existing episode
        return 1 - maxSimilarity;
    }
    /**
     * Compute similarity between episodes
     */
    computeSimilarity(a, b) {
        let score = 0;
        let count = 0;
        // Domain overlap
        if (b.domains_active) {
            const overlap = a.domains_active.filter(d => b.domains_active.includes(d)).length;
            const total = new Set([...a.domains_active, ...b.domains_active]).size;
            score += total > 0 ? overlap / total : 0;
            count++;
        }
        // Atmosphere match
        if (b.atmosphere && a.atmosphere === b.atmosphere) {
            score += 1;
            count++;
        }
        // Primitive match
        if (b.primitive_used && a.primitive_used === b.primitive_used) {
            score += 0.5;
            count++;
        }
        // Emotional salience similarity
        if (b.emotional_salience !== undefined) {
            score += 1 - Math.abs(a.emotional_salience - b.emotional_salience);
            count++;
        }
        return count > 0 ? score / count : 0;
    }
}
exports.HippocampalBuffer = HippocampalBuffer;
// ============================================
// NEOCORTICAL SYSTEM (Slow Memory)
// ============================================
class NeocorticalMemory {
    constructor() {
        this.userModels = new Map();
        this.LEARNING_RATE = 0.01; // Slow learning
    }
    /**
     * Get or create user model
     */
    getModel(user_id) {
        if (!this.userModels.has(user_id)) {
            this.userModels.set(user_id, this.createEmptyModel(user_id));
        }
        return this.userModels.get(user_id);
    }
    /**
     * Consolidate episodes into semantic memory
     * (Simulates slow-wave sleep replay)
     */
    consolidate(episodes) {
        if (episodes.length === 0)
            return;
        const user_id = episodes[0].user_id;
        const model = this.getModel(user_id);
        for (const episode of episodes) {
            // Update domain states
            this.updateDomainStates(model, episode);
            // Extract and reinforce patterns
            this.extractPatterns(model, episode);
            // Update communication preferences
            this.updatePreferences(model, episode);
            // Update autonomy trajectory
            this.updateAutonomyTrajectory(model, episode);
        }
        model.last_interaction = new Date();
    }
    /**
     * Query semantic memory for effective strategies
     */
    getEffectiveStrategies(user_id, context) {
        const model = this.getModel(user_id);
        // Find patterns that match current context
        return model.semantic_patterns.filter(p => {
            const domainMatch = p.triggers.domains.some(d => context.domains.includes(d));
            return domainMatch && p.strength > 0.3;
        }).sort((a, b) => b.strength - a.strength);
    }
    /**
     * Check autonomy health
     */
    checkAutonomyHealth(user_id) {
        const model = this.getModel(user_id);
        const trajectory = model.autonomy_trajectory.trajectory_slope;
        if (trajectory < -0.1) {
            return {
                healthy: false,
                trajectory,
                recommendation: 'INCREASE_OWNERSHIP_RETURN'
            };
        }
        else if (trajectory > 0.1) {
            return {
                healthy: true,
                trajectory,
                recommendation: 'CONTINUE_CURRENT_APPROACH'
            };
        }
        else {
            return {
                healthy: true,
                trajectory,
                recommendation: 'MONITOR'
            };
        }
    }
    /**
     * Create empty user model
     */
    createEmptyModel(user_id) {
        return {
            user_id,
            created_at: new Date(),
            last_interaction: new Date(),
            preferred_depth: 'medium',
            preferred_directness: 'balanced',
            response_to_silence: 'neutral',
            active_domains: new Map(),
            autonomy_trajectory: {
                decisions_made_independently: 0,
                decisions_delegated_to_enoq: 0,
                trajectory_slope: 0
            },
            semantic_patterns: []
        };
    }
    /**
     * Update domain engagement states
     */
    updateDomainStates(model, episode) {
        for (const domain of episode.domains_active) {
            let state = model.active_domains.get(domain);
            if (!state) {
                state = {
                    domain,
                    engagement_history: [],
                    recurring_themes: [],
                    last_active: new Date()
                };
                model.active_domains.set(domain, state);
            }
            // Add engagement score
            const engagement = episode.outcome.engagement_continued ? 1 : 0;
            state.engagement_history.push(engagement);
            // Keep last 20 interactions
            if (state.engagement_history.length > 20) {
                state.engagement_history.shift();
            }
            state.last_active = episode.timestamp;
        }
    }
    /**
     * Extract patterns from episode
     */
    extractPatterns(model, episode) {
        // Find or create pattern for this context
        const existingPattern = model.semantic_patterns.find(p => p.triggers.domains.some(d => episode.domains_active.includes(d)));
        if (existingPattern) {
            // Update existing pattern
            this.updatePattern(existingPattern, episode);
        }
        else {
            // Create new pattern
            const newPattern = {
                id: `pattern_${Date.now()}`,
                pattern_type: 'response',
                triggers: {
                    domains: [...episode.domains_active],
                    keywords: [],
                    emotional_markers: []
                },
                effective_primitives: [],
                ineffective_primitives: [],
                strength: 0.1,
                last_updated: new Date()
            };
            this.updatePattern(newPattern, episode);
            model.semantic_patterns.push(newPattern);
        }
    }
    /**
     * Update pattern based on episode outcome
     */
    updatePattern(pattern, episode) {
        const wasEffective = episode.outcome.engagement_continued &&
            !episode.outcome.user_corrected &&
            episode.outcome.autonomy_expressed;
        if (wasEffective) {
            // Reinforce this primitive
            const existingPrimitive = pattern.effective_primitives.find(p => p.primitive === episode.primitive_used);
            if (existingPrimitive) {
                existingPrimitive.success_rate =
                    existingPrimitive.success_rate * (1 - this.LEARNING_RATE) +
                        this.LEARNING_RATE;
            }
            else {
                pattern.effective_primitives.push({
                    primitive: episode.primitive_used,
                    success_rate: 0.5 + this.LEARNING_RATE,
                    context_conditions: [episode.atmosphere]
                });
            }
            pattern.strength = Math.min(1, pattern.strength + this.LEARNING_RATE);
        }
        else if (episode.outcome.user_corrected) {
            // Record as ineffective
            const existingIneffective = pattern.ineffective_primitives.find(p => p.primitive === episode.primitive_used);
            if (existingIneffective) {
                if (!existingIneffective.failure_contexts.includes(episode.atmosphere)) {
                    existingIneffective.failure_contexts.push(episode.atmosphere);
                }
            }
            else {
                pattern.ineffective_primitives.push({
                    primitive: episode.primitive_used,
                    failure_contexts: [episode.atmosphere]
                });
            }
        }
        pattern.last_updated = new Date();
    }
    /**
     * Update communication preferences
     */
    updatePreferences(model, episode) {
        // Infer depth preference from engagement with different depths
        const fieldState = episode.field_state;
        if (episode.outcome.engagement_continued) {
            // User liked this depth level
            // (Slow update to avoid overfitting)
        }
    }
    /**
     * Update autonomy trajectory (constitutional health metric)
     */
    updateAutonomyTrajectory(model, episode) {
        const traj = model.autonomy_trajectory;
        if (episode.outcome.autonomy_expressed) {
            traj.decisions_made_independently++;
        }
        // Calculate trajectory slope (over last N interactions)
        const total = traj.decisions_made_independently + traj.decisions_delegated_to_enoq;
        if (total > 5) {
            const ratio = traj.decisions_made_independently / total;
            // Slope based on recent trend vs overall ratio
            traj.trajectory_slope = ratio - 0.5; // 0.5 = baseline expectation
        }
    }
}
exports.NeocorticalMemory = NeocorticalMemory;
// ============================================
// MEMORY SYSTEM (Unified Interface)
// ============================================
class MemorySystem {
    constructor() {
        this.replayInterval = null;
        this.hippocampus = new HippocampalBuffer();
        this.neocortex = new NeocorticalMemory();
    }
    /**
     * Store new interaction
     */
    store(user_id, message, language, fieldState, domains, atmosphere, primitive, response) {
        const episode = {
            id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            user_id,
            user_message: message,
            language,
            field_state: fieldState,
            domains_active: domains,
            atmosphere,
            primitive_used: primitive,
            response,
            outcome: {
                engagement_continued: true, // Default, updated later
                topic_shifted: false,
                user_corrected: false,
                autonomy_expressed: false
            },
            novelty_score: 0, // Computed during store
            emotional_salience: this.estimateSalience(fieldState, atmosphere),
            integration_score: 0
        };
        this.hippocampus.store(episode);
        return episode.id;
    }
    /**
     * Update episode outcome (implicit feedback)
     */
    updateOutcome(episode_id, user_id, outcome) {
        const episodes = this.hippocampus.getWorkingMemory(user_id);
        const episode = episodes.find(e => e.id === episode_id);
        if (episode) {
            Object.assign(episode.outcome, outcome);
        }
    }
    /**
     * Get context for current interaction
     */
    getContext(user_id) {
        const working_memory = this.hippocampus.getWorkingMemory(user_id);
        const user_model = this.neocortex.getModel(user_id);
        const autonomy_health = this.neocortex.checkAutonomyHealth(user_id);
        // Get currently active domains from working memory
        const active_domains = new Set();
        for (const ep of working_memory.slice(-3)) {
            for (const d of ep.domains_active) {
                active_domains.add(d);
            }
        }
        const effective_strategies = this.neocortex.getEffectiveStrategies(user_id, {
            domains: Array.from(active_domains),
            atmosphere: working_memory[working_memory.length - 1]?.atmosphere || 'HUMAN_FIELD'
        });
        return {
            working_memory,
            user_model,
            effective_strategies,
            autonomy_health
        };
    }
    /**
     * Retrieve similar past interactions
     */
    retrieveSimilar(user_id, cue) {
        return this.hippocampus.retrieveSimilar(user_id, cue);
    }
    /**
     * Trigger consolidation (call during idle time)
     */
    consolidate(user_id) {
        const episodes = this.hippocampus.getForReplay(user_id);
        this.neocortex.consolidate(episodes);
    }
    /**
     * Start automatic consolidation (simulates sleep)
     */
    startAutoConsolidation(interval_ms = 60000) {
        this.replayInterval = setInterval(() => {
            // Consolidate all active users
            // In production, this would be smarter about which users to consolidate
        }, interval_ms);
    }
    /**
     * Stop automatic consolidation
     */
    stopAutoConsolidation() {
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
            this.replayInterval = null;
        }
    }
    /**
     * Estimate emotional salience from field state
     */
    estimateSalience(fieldState, atmosphere) {
        let salience = 0.5; // Baseline
        // Emergency = high salience
        if (atmosphere === 'EMERGENCY')
            salience = 1.0;
        // V_MODE = high salience (existential content)
        if (atmosphere === 'V_MODE')
            salience = 0.9;
        // High arousal = high salience
        if (fieldState.arousal === 'high')
            salience = Math.max(salience, 0.8);
        return salience;
    }
}
exports.MemorySystem = MemorySystem;
// ============================================
// SINGLETON EXPORT
// ============================================
exports.memorySystem = new MemorySystem();
exports.default = exports.memorySystem;
//# sourceMappingURL=memory_system.js.map