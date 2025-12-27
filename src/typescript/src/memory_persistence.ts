/**
 * ENOQ MEMORY PERSISTENCE LAYER
 *
 * SQLite-based persistence for the Memory System.
 *
 * Architecture:
 * - Episodes: Fast episodic memories (hippocampal buffer)
 * - UserModels: Slow semantic memories (neocortical)
 * - SemanticPatterns: Learned patterns per user
 *
 * Design Principles:
 * - Synchronous API (better-sqlite3) for simplicity
 * - Automatic schema migration
 * - JSON serialization for complex types
 * - Connection pooling ready
 *
 * Constitutional Note: No PII beyond user_id.
 * Memory exists to serve the human, not to profile them.
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import {
  Episode,
  EpisodeOutcome,
  UserModel,
  SemanticPattern,
  DomainState,
  AutonomyTrajectory
} from './memory_system';
import { FieldState, HumanDomain, SupportedLanguage } from './types';

// ============================================
// CONFIGURATION
// ============================================

export interface PersistenceConfig {
  /** Path to SQLite database file. Use ':memory:' for in-memory. */
  dbPath: string;
  /** Enable verbose logging */
  verbose: boolean;
  /** Enable WAL mode for better concurrency */
  walMode: boolean;
}

export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  dbPath: path.join(process.cwd(), 'data', 'enoq_memory.db'),
  verbose: false,
  walMode: true
};

// ============================================
// SCHEMA VERSION (for migrations)
// ============================================

const SCHEMA_VERSION = 1;

// ============================================
// MEMORY PERSISTENCE CLASS
// ============================================

export class MemoryPersistence {
  private db: Database.Database;
  private config: PersistenceConfig;
  private initialized: boolean = false;

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_PERSISTENCE_CONFIG, ...config };

    // Ensure data directory exists
    if (this.config.dbPath !== ':memory:') {
      const dir = path.dirname(this.config.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Open database connection
    this.db = new Database(this.config.dbPath, {
      verbose: this.config.verbose ? console.log : undefined
    });

    // Enable WAL mode for better concurrency
    if (this.config.walMode && this.config.dbPath !== ':memory:') {
      this.db.pragma('journal_mode = WAL');
    }

    // Initialize schema
    this.initializeSchema();
    this.initialized = true;
  }

  // ============================================
  // SCHEMA INITIALIZATION
  // ============================================

  private initializeSchema(): void {
    // Create schema version table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      )
    `);

    // Check current version
    const currentVersion = this.db.prepare(
      'SELECT MAX(version) as version FROM schema_version'
    ).get() as { version: number | null };

    if (!currentVersion.version || currentVersion.version < SCHEMA_VERSION) {
      this.applyMigrations(currentVersion.version || 0);
    }
  }

  private applyMigrations(fromVersion: number): void {
    // Version 1: Initial schema
    if (fromVersion < 1) {
      this.db.exec(`
        -- Episodes table (hippocampal buffer)
        CREATE TABLE IF NOT EXISTS episodes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          user_message TEXT NOT NULL,
          language TEXT NOT NULL,
          field_state TEXT NOT NULL,
          domains_active TEXT NOT NULL,
          atmosphere TEXT NOT NULL,
          primitive_used TEXT NOT NULL,
          response TEXT NOT NULL,
          outcome TEXT NOT NULL,
          novelty_score REAL NOT NULL DEFAULT 0,
          emotional_salience REAL NOT NULL DEFAULT 0.5,
          integration_score REAL NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_episodes_user_id ON episodes(user_id);
        CREATE INDEX IF NOT EXISTS idx_episodes_timestamp ON episodes(timestamp);
        CREATE INDEX IF NOT EXISTS idx_episodes_user_timestamp ON episodes(user_id, timestamp);

        -- User models table (neocortical memory)
        CREATE TABLE IF NOT EXISTS user_models (
          user_id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          last_interaction TEXT NOT NULL,
          preferred_depth TEXT NOT NULL DEFAULT 'medium',
          preferred_directness TEXT NOT NULL DEFAULT 'balanced',
          response_to_silence TEXT NOT NULL DEFAULT 'neutral',
          active_domains TEXT NOT NULL DEFAULT '{}',
          autonomy_trajectory TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Semantic patterns table
        CREATE TABLE IF NOT EXISTS semantic_patterns (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          pattern_type TEXT NOT NULL,
          triggers TEXT NOT NULL,
          effective_primitives TEXT NOT NULL DEFAULT '[]',
          ineffective_primitives TEXT NOT NULL DEFAULT '[]',
          strength REAL NOT NULL DEFAULT 0.1,
          last_updated TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES user_models(user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON semantic_patterns(user_id);
        CREATE INDEX IF NOT EXISTS idx_patterns_strength ON semantic_patterns(strength);

        -- Record schema version
        INSERT INTO schema_version (version, applied_at)
        VALUES (1, datetime('now'));
      `);
    }

    // Future migrations go here:
    // if (fromVersion < 2) { ... }
  }

  // ============================================
  // EPISODE OPERATIONS
  // ============================================

  /**
   * Store a new episode
   */
  storeEpisode(episode: Episode): void {
    const stmt = this.db.prepare(`
      INSERT INTO episodes (
        id, user_id, timestamp, user_message, language,
        field_state, domains_active, atmosphere,
        primitive_used, response, outcome,
        novelty_score, emotional_salience, integration_score
      ) VALUES (
        @id, @user_id, @timestamp, @user_message, @language,
        @field_state, @domains_active, @atmosphere,
        @primitive_used, @response, @outcome,
        @novelty_score, @emotional_salience, @integration_score
      )
    `);

    stmt.run({
      id: episode.id,
      user_id: episode.user_id,
      timestamp: episode.timestamp.toISOString(),
      user_message: episode.user_message,
      language: episode.language,
      field_state: JSON.stringify(episode.field_state),
      domains_active: JSON.stringify(episode.domains_active),
      atmosphere: episode.atmosphere,
      primitive_used: episode.primitive_used,
      response: episode.response,
      outcome: JSON.stringify(episode.outcome),
      novelty_score: episode.novelty_score,
      emotional_salience: episode.emotional_salience,
      integration_score: episode.integration_score
    });
  }

  /**
   * Update episode outcome
   */
  updateEpisodeOutcome(episodeId: string, outcome: Partial<EpisodeOutcome>): void {
    // Get current outcome
    const row = this.db.prepare(
      'SELECT outcome FROM episodes WHERE id = ?'
    ).get(episodeId) as { outcome: string } | undefined;

    if (!row) return;

    const currentOutcome = JSON.parse(row.outcome) as EpisodeOutcome;
    const newOutcome = { ...currentOutcome, ...outcome };

    this.db.prepare(
      'UPDATE episodes SET outcome = ? WHERE id = ?'
    ).run(JSON.stringify(newOutcome), episodeId);
  }

  /**
   * Get recent episodes for user (working memory)
   */
  getRecentEpisodes(userId: string, limit: number = 10): Episode[] {
    const rows = this.db.prepare(`
      SELECT * FROM episodes
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(userId, limit) as any[];

    return rows.map(this.rowToEpisode).reverse();
  }

  /**
   * Get episodes by salience for replay/consolidation
   */
  getEpisodesForReplay(userId: string, limit: number = 10): Episode[] {
    const rows = this.db.prepare(`
      SELECT * FROM episodes
      WHERE user_id = ?
      ORDER BY (novelty_score * 0.6 + emotional_salience * 0.4) DESC
      LIMIT ?
    `).all(userId, limit) as any[];

    return rows.map(this.rowToEpisode);
  }

  /**
   * Get similar episodes (simple similarity search)
   */
  getSimilarEpisodes(
    userId: string,
    domains: HumanDomain[],
    atmosphere: string,
    limit: number = 5
  ): Episode[] {
    // For each domain, check if it's in the JSON array
    const rows = this.db.prepare(`
      SELECT * FROM episodes
      WHERE user_id = ?
        AND atmosphere = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(userId, atmosphere, limit * 2) as any[];

    // Filter by domain overlap in JavaScript (SQLite JSON support is limited)
    const episodes = rows.map(this.rowToEpisode);
    return episodes
      .filter(ep => ep.domains_active.some(d => domains.includes(d)))
      .slice(0, limit);
  }

  /**
   * Count episodes for user
   */
  countEpisodes(userId: string): number {
    const row = this.db.prepare(
      'SELECT COUNT(*) as count FROM episodes WHERE user_id = ?'
    ).get(userId) as { count: number };
    return row.count;
  }

  /**
   * Prune old episodes (keep most salient)
   */
  pruneEpisodes(userId: string, maxEpisodes: number = 100): number {
    const count = this.countEpisodes(userId);
    if (count <= maxEpisodes) return 0;

    const toDelete = count - maxEpisodes;

    // Delete lowest salience episodes
    const result = this.db.prepare(`
      DELETE FROM episodes
      WHERE id IN (
        SELECT id FROM episodes
        WHERE user_id = ?
        ORDER BY (novelty_score * 0.6 + emotional_salience * 0.4) ASC
        LIMIT ?
      )
    `).run(userId, toDelete);

    return result.changes;
  }

  private rowToEpisode(row: any): Episode {
    return {
      id: row.id,
      user_id: row.user_id,
      timestamp: new Date(row.timestamp),
      user_message: row.user_message,
      language: row.language as SupportedLanguage,
      field_state: JSON.parse(row.field_state) as FieldState,
      domains_active: JSON.parse(row.domains_active) as HumanDomain[],
      atmosphere: row.atmosphere,
      primitive_used: row.primitive_used,
      response: row.response,
      outcome: JSON.parse(row.outcome) as EpisodeOutcome,
      novelty_score: row.novelty_score,
      emotional_salience: row.emotional_salience,
      integration_score: row.integration_score
    };
  }

  // ============================================
  // USER MODEL OPERATIONS
  // ============================================

  /**
   * Get or create user model
   */
  getUserModel(userId: string): UserModel {
    const row = this.db.prepare(
      'SELECT * FROM user_models WHERE user_id = ?'
    ).get(userId) as any;

    if (row) {
      return this.rowToUserModel(row);
    }

    // Create new model
    const newModel: UserModel = {
      user_id: userId,
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

    this.saveUserModel(newModel);
    return newModel;
  }

  /**
   * Save user model
   */
  saveUserModel(model: UserModel): void {
    // Convert Map to object for JSON serialization
    const activeDomainsObj: Record<string, DomainState> = {};
    model.active_domains.forEach((state, domain) => {
      activeDomainsObj[domain] = state;
    });

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_models (
        user_id, created_at, last_interaction,
        preferred_depth, preferred_directness, response_to_silence,
        active_domains, autonomy_trajectory, updated_at
      ) VALUES (
        @user_id, @created_at, @last_interaction,
        @preferred_depth, @preferred_directness, @response_to_silence,
        @active_domains, @autonomy_trajectory, datetime('now')
      )
    `);

    stmt.run({
      user_id: model.user_id,
      created_at: model.created_at.toISOString(),
      last_interaction: model.last_interaction.toISOString(),
      preferred_depth: model.preferred_depth,
      preferred_directness: model.preferred_directness,
      response_to_silence: model.response_to_silence,
      active_domains: JSON.stringify(activeDomainsObj),
      autonomy_trajectory: JSON.stringify(model.autonomy_trajectory)
    });

    // Save semantic patterns separately
    for (const pattern of model.semantic_patterns) {
      this.saveSemanticPattern(model.user_id, pattern);
    }
  }

  /**
   * Update last interaction time
   */
  updateLastInteraction(userId: string): void {
    this.db.prepare(
      "UPDATE user_models SET last_interaction = datetime('now'), updated_at = datetime('now') WHERE user_id = ?"
    ).run(userId);
  }

  private rowToUserModel(row: any): UserModel {
    const activeDomainsObj = JSON.parse(row.active_domains);
    const activeDomainsMap = new Map<HumanDomain, DomainState>();

    for (const [domain, state] of Object.entries(activeDomainsObj)) {
      const s = state as any;
      activeDomainsMap.set(domain as HumanDomain, {
        ...s,
        last_active: new Date(s.last_active)
      });
    }

    const patterns = this.getSemanticPatterns(row.user_id);

    return {
      user_id: row.user_id,
      created_at: new Date(row.created_at),
      last_interaction: new Date(row.last_interaction),
      preferred_depth: row.preferred_depth,
      preferred_directness: row.preferred_directness,
      response_to_silence: row.response_to_silence,
      active_domains: activeDomainsMap,
      autonomy_trajectory: JSON.parse(row.autonomy_trajectory) as AutonomyTrajectory,
      semantic_patterns: patterns
    };
  }

  // ============================================
  // SEMANTIC PATTERN OPERATIONS
  // ============================================

  /**
   * Save semantic pattern
   */
  saveSemanticPattern(userId: string, pattern: SemanticPattern): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO semantic_patterns (
        id, user_id, pattern_type, triggers,
        effective_primitives, ineffective_primitives,
        strength, last_updated
      ) VALUES (
        @id, @user_id, @pattern_type, @triggers,
        @effective_primitives, @ineffective_primitives,
        @strength, @last_updated
      )
    `);

    stmt.run({
      id: pattern.id,
      user_id: userId,
      pattern_type: pattern.pattern_type,
      triggers: JSON.stringify(pattern.triggers),
      effective_primitives: JSON.stringify(pattern.effective_primitives),
      ineffective_primitives: JSON.stringify(pattern.ineffective_primitives),
      strength: pattern.strength,
      last_updated: pattern.last_updated.toISOString()
    });
  }

  /**
   * Get semantic patterns for user
   */
  getSemanticPatterns(userId: string): SemanticPattern[] {
    const rows = this.db.prepare(
      'SELECT * FROM semantic_patterns WHERE user_id = ? ORDER BY strength DESC'
    ).all(userId) as any[];

    return rows.map(row => ({
      id: row.id,
      pattern_type: row.pattern_type,
      triggers: JSON.parse(row.triggers),
      effective_primitives: JSON.parse(row.effective_primitives),
      ineffective_primitives: JSON.parse(row.ineffective_primitives),
      strength: row.strength,
      last_updated: new Date(row.last_updated)
    }));
  }

  /**
   * Get effective patterns for context
   */
  getEffectivePatterns(
    userId: string,
    domains: HumanDomain[],
    minStrength: number = 0.3
  ): SemanticPattern[] {
    const patterns = this.getSemanticPatterns(userId);

    return patterns.filter(p => {
      if (p.strength < minStrength) return false;
      return p.triggers.domains.some(d => domains.includes(d));
    });
  }

  // ============================================
  // AUTONOMY HEALTH
  // ============================================

  /**
   * Check autonomy health for user
   */
  checkAutonomyHealth(userId: string): {
    healthy: boolean;
    trajectory: number;
    recommendation: string;
  } {
    const model = this.getUserModel(userId);
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

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Get database statistics
   */
  getStats(): {
    episode_count: number;
    user_count: number;
    pattern_count: number;
    db_size_bytes: number;
  } {
    const episodeCount = (this.db.prepare(
      'SELECT COUNT(*) as count FROM episodes'
    ).get() as { count: number }).count;

    const userCount = (this.db.prepare(
      'SELECT COUNT(*) as count FROM user_models'
    ).get() as { count: number }).count;

    const patternCount = (this.db.prepare(
      'SELECT COUNT(*) as count FROM semantic_patterns'
    ).get() as { count: number }).count;

    let dbSize = 0;
    if (this.config.dbPath !== ':memory:' && fs.existsSync(this.config.dbPath)) {
      dbSize = fs.statSync(this.config.dbPath).size;
    }

    return {
      episode_count: episodeCount,
      user_count: userCount,
      pattern_count: patternCount,
      db_size_bytes: dbSize
    };
  }

  /**
   * Vacuum database (reclaim space)
   */
  vacuum(): void {
    this.db.exec('VACUUM');
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
    this.initialized = false;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Export all data for user (GDPR compliance)
   */
  exportUserData(userId: string): {
    episodes: Episode[];
    model: UserModel;
    patterns: SemanticPattern[];
  } {
    return {
      episodes: this.getRecentEpisodes(userId, 10000),
      model: this.getUserModel(userId),
      patterns: this.getSemanticPatterns(userId)
    };
  }

  /**
   * Delete all data for user (GDPR compliance)
   */
  deleteUserData(userId: string): void {
    this.db.prepare('DELETE FROM semantic_patterns WHERE user_id = ?').run(userId);
    this.db.prepare('DELETE FROM user_models WHERE user_id = ?').run(userId);
    this.db.prepare('DELETE FROM episodes WHERE user_id = ?').run(userId);
  }
}

// ============================================
// SINGLETON
// ============================================

let persistenceInstance: MemoryPersistence | null = null;

export function getMemoryPersistence(config?: Partial<PersistenceConfig>): MemoryPersistence {
  if (!persistenceInstance) {
    persistenceInstance = new MemoryPersistence(config);
  }
  return persistenceInstance;
}

export function resetMemoryPersistence(): void {
  if (persistenceInstance) {
    persistenceInstance.close();
    persistenceInstance = null;
  }
}

export default MemoryPersistence;
