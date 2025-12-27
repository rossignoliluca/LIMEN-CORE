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
 *
 * Persistence:
 * - In-memory mode (default): Fast, no disk I/O
 * - SQLite mode: Persistent across restarts
 */

import { FieldState, HumanDomain, SupportedLanguage } from './types';
import { MemoryPersistence, PersistenceConfig } from './memory_persistence';

// ============================================
// TYPES
// ============================================

export interface Episode {
  id: string;
  timestamp: Date;
  user_id: string;

  // Input
  user_message: string;
  language: SupportedLanguage;

  // Context at time of interaction
  field_state: FieldState;
  domains_active: HumanDomain[];
  atmosphere: string;

  // Response
  primitive_used: string;
  response: string;

  // Outcome (implicit feedback)
  outcome: EpisodeOutcome;

  // Novelty and salience scores
  novelty_score: number;        // 0-1: How new is this pattern?
  emotional_salience: number;   // 0-1: How emotionally charged?
  integration_score: number;    // Φ-like: Cross-domain coherence
}

export interface EpisodeOutcome {
  engagement_continued: boolean;
  topic_shifted: boolean;
  user_corrected: boolean;
  explicit_feedback?: 'positive' | 'negative' | 'neutral';
  autonomy_expressed: boolean;  // User made own decision
}

export interface SemanticPattern {
  id: string;
  pattern_type: 'trigger' | 'response' | 'trajectory';

  // What triggers this pattern
  triggers: {
    domains: HumanDomain[];
    keywords: string[];
    emotional_markers: string[];
  };

  // What works for this user
  effective_primitives: {
    primitive: string;
    success_rate: number;
    context_conditions: string[];
  }[];

  // Anti-patterns (what doesn't work)
  ineffective_primitives: {
    primitive: string;
    failure_contexts: string[];
  }[];

  // Strength of pattern (updated through replay)
  strength: number;
  last_updated: Date;
}

export interface UserModel {
  user_id: string;
  created_at: Date;
  last_interaction: Date;

  // Communication preferences (learnable)
  preferred_depth: 'surface' | 'medium' | 'deep';
  preferred_directness: 'indirect' | 'balanced' | 'direct';
  response_to_silence: 'comfort' | 'discomfort' | 'neutral';

  // Domain patterns
  active_domains: Map<HumanDomain, DomainState>;

  // Autonomy trajectory (constitutional metric)
  autonomy_trajectory: AutonomyTrajectory;

  // Patterns learned
  semantic_patterns: SemanticPattern[];
}

export interface DomainState {
  domain: HumanDomain;
  engagement_history: number[];  // Last N interactions: 0-1
  recurring_themes: string[];
  last_active: Date;
}

export interface AutonomyTrajectory {
  // Track if user is becoming MORE autonomous over time
  decisions_made_independently: number;
  decisions_delegated_to_enoq: number;  // Should decrease
  trajectory_slope: number;  // Positive = healthy, Negative = concerning
}

// ============================================
// HIPPOCAMPAL SYSTEM (Fast Memory)
// ============================================

export class HippocampalBuffer {
  private buffer: Map<string, Episode[]> = new Map();
  private readonly MAX_EPISODES_PER_USER = 100;
  private readonly MAX_WORKING_MEMORY = 10;

  /**
   * Store new episode (fast, pattern-separated)
   */
  store(episode: Episode): void {
    const userBuffer = this.buffer.get(episode.user_id) || [];

    // Pattern separation: compute novelty
    episode.novelty_score = this.computeNovelty(episode, userBuffer);

    userBuffer.push(episode);

    // Maintain buffer size
    if (userBuffer.length > this.MAX_EPISODES_PER_USER) {
      // Remove oldest, lowest salience episodes
      userBuffer.sort((a, b) =>
        (b.emotional_salience + b.novelty_score) -
        (a.emotional_salience + a.novelty_score)
      );
      userBuffer.splice(this.MAX_EPISODES_PER_USER);
    }

    this.buffer.set(episode.user_id, userBuffer);
  }

  /**
   * Retrieve working memory context
   */
  getWorkingMemory(user_id: string): Episode[] {
    const buffer = this.buffer.get(user_id) || [];
    // Return most recent episodes
    return buffer.slice(-this.MAX_WORKING_MEMORY);
  }

  /**
   * Pattern completion: retrieve similar episodes
   */
  retrieveSimilar(
    user_id: string,
    cue: Partial<Episode>,
    limit: number = 5
  ): Episode[] {
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
  getForReplay(user_id: string, count: number = 10): Episode[] {
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
  private computeNovelty(episode: Episode, existing: Episode[]): number {
    if (existing.length === 0) return 1.0;

    // Check how different this is from existing episodes
    let maxSimilarity = 0;
    for (const ep of existing) {
      const sim = this.computeSimilarity(ep, episode);
      if (sim > maxSimilarity) maxSimilarity = sim;
    }

    // Novelty = 1 - max similarity to any existing episode
    return 1 - maxSimilarity;
  }

  /**
   * Compute similarity between episodes
   */
  private computeSimilarity(a: Episode, b: Partial<Episode>): number {
    let score = 0;
    let count = 0;

    // Domain overlap
    if (b.domains_active) {
      const overlap = a.domains_active.filter(d =>
        b.domains_active!.includes(d)
      ).length;
      const total = new Set([...a.domains_active, ...b.domains_active!]).size;
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

// ============================================
// NEOCORTICAL SYSTEM (Slow Memory)
// ============================================

export class NeocorticalMemory {
  private userModels: Map<string, UserModel> = new Map();
  private readonly LEARNING_RATE = 0.01;  // Slow learning

  /**
   * Get or create user model
   */
  getModel(user_id: string): UserModel {
    if (!this.userModels.has(user_id)) {
      this.userModels.set(user_id, this.createEmptyModel(user_id));
    }
    return this.userModels.get(user_id)!;
  }

  /**
   * Consolidate episodes into semantic memory
   * (Simulates slow-wave sleep replay)
   */
  consolidate(episodes: Episode[]): void {
    if (episodes.length === 0) return;

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
  getEffectiveStrategies(
    user_id: string,
    context: { domains: HumanDomain[]; atmosphere: string }
  ): SemanticPattern[] {
    const model = this.getModel(user_id);

    // Find patterns that match current context
    return model.semantic_patterns.filter(p => {
      const domainMatch = p.triggers.domains.some(d =>
        context.domains.includes(d)
      );
      return domainMatch && p.strength > 0.3;
    }).sort((a, b) => b.strength - a.strength);
  }

  /**
   * Check autonomy health
   */
  checkAutonomyHealth(user_id: string): {
    healthy: boolean;
    trajectory: number;
    recommendation: string;
  } {
    const model = this.getModel(user_id);
    const trajectory = model.autonomy_trajectory.trajectory_slope;

    if (trajectory < -0.1) {
      return {
        healthy: false,
        trajectory,
        recommendation: 'INCREASE_OWNERSHIP_RETURN'
      };
    } else if (trajectory > 0.1) {
      return {
        healthy: true,
        trajectory,
        recommendation: 'CONTINUE_CURRENT_APPROACH'
      };
    } else {
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
  private createEmptyModel(user_id: string): UserModel {
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
  private updateDomainStates(model: UserModel, episode: Episode): void {
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
  private extractPatterns(model: UserModel, episode: Episode): void {
    // Find or create pattern for this context
    const existingPattern = model.semantic_patterns.find(p =>
      p.triggers.domains.some(d => episode.domains_active.includes(d))
    );

    if (existingPattern) {
      // Update existing pattern
      this.updatePattern(existingPattern, episode);
    } else {
      // Create new pattern
      const newPattern: SemanticPattern = {
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
  private updatePattern(pattern: SemanticPattern, episode: Episode): void {
    const wasEffective =
      episode.outcome.engagement_continued &&
      !episode.outcome.user_corrected &&
      episode.outcome.autonomy_expressed;

    if (wasEffective) {
      // Reinforce this primitive
      const existingPrimitive = pattern.effective_primitives.find(
        p => p.primitive === episode.primitive_used
      );

      if (existingPrimitive) {
        existingPrimitive.success_rate =
          existingPrimitive.success_rate * (1 - this.LEARNING_RATE) +
          this.LEARNING_RATE;
      } else {
        pattern.effective_primitives.push({
          primitive: episode.primitive_used,
          success_rate: 0.5 + this.LEARNING_RATE,
          context_conditions: [episode.atmosphere]
        });
      }

      pattern.strength = Math.min(1, pattern.strength + this.LEARNING_RATE);
    } else if (episode.outcome.user_corrected) {
      // Record as ineffective
      const existingIneffective = pattern.ineffective_primitives.find(
        p => p.primitive === episode.primitive_used
      );

      if (existingIneffective) {
        if (!existingIneffective.failure_contexts.includes(episode.atmosphere)) {
          existingIneffective.failure_contexts.push(episode.atmosphere);
        }
      } else {
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
  private updatePreferences(model: UserModel, episode: Episode): void {
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
  private updateAutonomyTrajectory(model: UserModel, episode: Episode): void {
    const traj = model.autonomy_trajectory;

    if (episode.outcome.autonomy_expressed) {
      traj.decisions_made_independently++;
    }

    // Calculate trajectory slope (over last N interactions)
    const total = traj.decisions_made_independently + traj.decisions_delegated_to_enoq;
    if (total > 5) {
      const ratio = traj.decisions_made_independently / total;
      // Slope based on recent trend vs overall ratio
      traj.trajectory_slope = ratio - 0.5;  // 0.5 = baseline expectation
    }
  }
}

// ============================================
// MEMORY SYSTEM CONFIGURATION
// ============================================

export interface MemorySystemConfig {
  /** Enable SQLite persistence */
  persistence_enabled: boolean;
  /** Persistence configuration (only used if persistence_enabled) */
  persistence_config?: Partial<PersistenceConfig>;
  /** Max episodes to keep per user */
  max_episodes_per_user: number;
  /** Auto-consolidation interval in ms (0 = disabled) */
  auto_consolidation_interval: number;
}

export const DEFAULT_MEMORY_CONFIG: MemorySystemConfig = {
  persistence_enabled: false,
  max_episodes_per_user: 100,
  auto_consolidation_interval: 0
};

// ============================================
// MEMORY SYSTEM (Unified Interface)
// ============================================

export class MemorySystem {
  private hippocampus: HippocampalBuffer;
  private neocortex: NeocorticalMemory;
  private persistence: MemoryPersistence | null = null;
  private config: MemorySystemConfig;
  private replayInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<MemorySystemConfig> = {}) {
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    this.hippocampus = new HippocampalBuffer();
    this.neocortex = new NeocorticalMemory();

    // Initialize persistence if enabled
    if (this.config.persistence_enabled) {
      this.persistence = new MemoryPersistence(this.config.persistence_config);
    }

    // Start auto-consolidation if configured
    if (this.config.auto_consolidation_interval > 0) {
      this.startAutoConsolidation(this.config.auto_consolidation_interval);
    }
  }

  /**
   * Check if persistence is enabled
   */
  isPersistenceEnabled(): boolean {
    return this.persistence !== null && this.persistence.isInitialized();
  }

  /**
   * Store new interaction
   */
  store(
    user_id: string,
    message: string,
    language: SupportedLanguage,
    fieldState: FieldState,
    domains: HumanDomain[],
    atmosphere: string,
    primitive: string,
    response: string
  ): string {
    const episode: Episode = {
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
        engagement_continued: true,  // Default, updated later
        topic_shifted: false,
        user_corrected: false,
        autonomy_expressed: false
      },
      novelty_score: 0,  // Computed during store
      emotional_salience: this.estimateSalience(fieldState, atmosphere),
      integration_score: 0
    };

    // Store in-memory (hippocampal buffer)
    this.hippocampus.store(episode);

    // Persist to SQLite if enabled
    if (this.persistence) {
      this.persistence.storeEpisode(episode);
      this.persistence.updateLastInteraction(user_id);
    }

    return episode.id;
  }

  /**
   * Update episode outcome (implicit feedback)
   */
  updateOutcome(episode_id: string, user_id: string, outcome: Partial<EpisodeOutcome>): void {
    // Update in-memory
    const episodes = this.hippocampus.getWorkingMemory(user_id);
    const episode = episodes.find(e => e.id === episode_id);
    if (episode) {
      Object.assign(episode.outcome, outcome);
    }

    // Persist update
    if (this.persistence) {
      this.persistence.updateEpisodeOutcome(episode_id, outcome);
    }
  }

  /**
   * Get context for current interaction
   */
  getContext(user_id: string): {
    working_memory: Episode[];
    user_model: UserModel;
    effective_strategies: SemanticPattern[];
    autonomy_health: { healthy: boolean; trajectory: number; recommendation: string };
  } {
    // Get working memory (prefer in-memory, fallback to persistence)
    let working_memory = this.hippocampus.getWorkingMemory(user_id);

    // If in-memory is empty but persistence exists, load from DB
    if (working_memory.length === 0 && this.persistence) {
      working_memory = this.persistence.getRecentEpisodes(user_id, 10);
    }

    // Get user model (prefer in-memory, fallback to persistence)
    let user_model = this.neocortex.getModel(user_id);
    let autonomy_health = this.neocortex.checkAutonomyHealth(user_id);

    // If using persistence and model is fresh (no patterns), load from DB
    if (this.persistence && user_model.semantic_patterns.length === 0) {
      const persistedModel = this.persistence.getUserModel(user_id);
      if (persistedModel.semantic_patterns.length > 0) {
        user_model = persistedModel;
        autonomy_health = this.persistence.checkAutonomyHealth(user_id);
      }
    }

    // Get currently active domains from working memory
    const active_domains = new Set<HumanDomain>();
    for (const ep of working_memory.slice(-3)) {
      for (const d of ep.domains_active) {
        active_domains.add(d);
      }
    }

    // Get effective strategies (prefer in-memory, with persistence fallback)
    let effective_strategies = this.neocortex.getEffectiveStrategies(
      user_id,
      {
        domains: Array.from(active_domains),
        atmosphere: working_memory[working_memory.length - 1]?.atmosphere || 'HUMAN_FIELD'
      }
    );

    // If no strategies found and persistence exists, try DB
    if (effective_strategies.length === 0 && this.persistence) {
      effective_strategies = this.persistence.getEffectivePatterns(
        user_id,
        Array.from(active_domains)
      );
    }

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
  retrieveSimilar(
    user_id: string,
    cue: { domains?: HumanDomain[]; atmosphere?: string; emotional_salience?: number }
  ): Episode[] {
    return this.hippocampus.retrieveSimilar(user_id, cue as Partial<Episode>);
  }

  /**
   * Trigger consolidation (call during idle time)
   */
  consolidate(user_id: string): void {
    const episodes = this.hippocampus.getForReplay(user_id);
    this.neocortex.consolidate(episodes);

    // Persist the updated user model
    if (this.persistence) {
      const model = this.neocortex.getModel(user_id);
      this.persistence.saveUserModel(model);

      // Prune old episodes if needed
      this.persistence.pruneEpisodes(user_id, this.config.max_episodes_per_user);
    }
  }

  /**
   * Start automatic consolidation (simulates sleep)
   */
  startAutoConsolidation(interval_ms: number = 60000): void {
    this.replayInterval = setInterval(() => {
      // Consolidate all active users
      // In production, this would be smarter about which users to consolidate
    }, interval_ms);
  }

  /**
   * Stop automatic consolidation
   */
  stopAutoConsolidation(): void {
    if (this.replayInterval) {
      clearInterval(this.replayInterval);
      this.replayInterval = null;
    }
  }

  /**
   * Estimate emotional salience from field state
   */
  private estimateSalience(fieldState: FieldState, atmosphere: string): number {
    let salience = 0.5;  // Baseline

    // Emergency = high salience
    if (atmosphere === 'EMERGENCY') salience = 1.0;

    // V_MODE = high salience (existential content)
    if (atmosphere === 'V_MODE') salience = 0.9;

    // High arousal = high salience
    if (fieldState.arousal === 'high') salience = Math.max(salience, 0.8);

    return salience;
  }

  /**
   * Get persistence statistics
   */
  getStats(): {
    persistence_enabled: boolean;
    episode_count?: number;
    user_count?: number;
    pattern_count?: number;
    db_size_bytes?: number;
  } {
    if (!this.persistence) {
      return { persistence_enabled: false };
    }

    const stats = this.persistence.getStats();
    return {
      persistence_enabled: true,
      ...stats
    };
  }

  /**
   * Export user data (GDPR compliance)
   */
  exportUserData(user_id: string): {
    episodes: Episode[];
    model: UserModel;
    patterns: SemanticPattern[];
  } | null {
    if (!this.persistence) {
      return null;
    }
    return this.persistence.exportUserData(user_id);
  }

  /**
   * Delete user data (GDPR compliance)
   */
  deleteUserData(user_id: string): boolean {
    if (!this.persistence) {
      return false;
    }
    this.persistence.deleteUserData(user_id);
    return true;
  }

  /**
   * Close persistence connection
   */
  close(): void {
    this.stopAutoConsolidation();
    if (this.persistence) {
      this.persistence.close();
      this.persistence = null;
    }
  }
}

// ============================================
// SINGLETON FACTORY
// ============================================

let memorySystemInstance: MemorySystem | null = null;

/**
 * Get or create memory system instance
 */
export function getMemorySystem(config?: Partial<MemorySystemConfig>): MemorySystem {
  if (!memorySystemInstance) {
    memorySystemInstance = new MemorySystem(config);
  }
  return memorySystemInstance;
}

/**
 * Reset memory system (for testing)
 */
export function resetMemorySystem(): void {
  if (memorySystemInstance) {
    memorySystemInstance.close();
    memorySystemInstance = null;
  }
}

// Default singleton (backward compatible, in-memory)
export const memorySystem = new MemorySystem();
export default memorySystem;
