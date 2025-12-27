/**
 * MEMORY PERSISTENCE TESTS
 *
 * Tests for SQLite-based memory persistence.
 *
 * RUN: npx jest memory_persistence.test.ts
 */

import { MemoryPersistence, resetMemoryPersistence } from '../memory_persistence';
import { MemorySystem, getMemorySystem, resetMemorySystem, Episode, EpisodeOutcome } from '../memory_system';
import { FieldState, HumanDomain } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Test database path (in-memory for speed, or temp file for persistence tests)
const TEST_DB_PATH = ':memory:';
const TEST_FILE_DB_PATH = path.join(__dirname, 'test_memory.db');

describe('MemoryPersistence', () => {
  let persistence: MemoryPersistence;

  beforeEach(() => {
    // Clean up any existing test DB
    if (fs.existsSync(TEST_FILE_DB_PATH)) {
      fs.unlinkSync(TEST_FILE_DB_PATH);
    }
    persistence = new MemoryPersistence({ dbPath: TEST_DB_PATH });
  });

  afterEach(() => {
    persistence.close();
    if (fs.existsSync(TEST_FILE_DB_PATH)) {
      fs.unlinkSync(TEST_FILE_DB_PATH);
    }
  });

  describe('Episode Operations', () => {
    const createTestEpisode = (userId: string, id?: string): Episode => ({
      id: id || `ep_${Date.now()}_test`,
      user_id: userId,
      timestamp: new Date(),
      user_message: 'Test message',
      language: 'en',
      field_state: {
        domains: [{ domain: 'H06_MEANING' as HumanDomain, salience: 0.7 }],
        arousal: 'medium',
        valence: 'neutral',
        coherence: 'high',
        goal: 'explore',
        flags: [],
        loop_count: 0,
        uncertainty: 0.3
      } as FieldState,
      domains_active: ['H06_MEANING' as HumanDomain],
      atmosphere: 'HUMAN_FIELD',
      primitive_used: 'P03_WITNESS',
      response: 'Test response',
      outcome: {
        engagement_continued: true,
        topic_shifted: false,
        user_corrected: false,
        autonomy_expressed: true
      },
      novelty_score: 0.5,
      emotional_salience: 0.6,
      integration_score: 0.4
    });

    it('stores and retrieves episode', () => {
      const episode = createTestEpisode('user1');
      persistence.storeEpisode(episode);

      const retrieved = persistence.getRecentEpisodes('user1', 10);
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].id).toBe(episode.id);
      expect(retrieved[0].user_message).toBe('Test message');
    });

    it('retrieves episodes in chronological order', () => {
      const ep1 = createTestEpisode('user1', 'ep_1');
      const ep2 = createTestEpisode('user1', 'ep_2');
      ep2.timestamp = new Date(Date.now() + 1000);

      persistence.storeEpisode(ep1);
      persistence.storeEpisode(ep2);

      const retrieved = persistence.getRecentEpisodes('user1', 10);
      expect(retrieved.length).toBe(2);
      expect(retrieved[0].id).toBe('ep_1');
      expect(retrieved[1].id).toBe('ep_2');
    });

    it('updates episode outcome', () => {
      const episode = createTestEpisode('user1');
      persistence.storeEpisode(episode);

      persistence.updateEpisodeOutcome(episode.id, {
        user_corrected: true,
        explicit_feedback: 'negative'
      });

      const retrieved = persistence.getRecentEpisodes('user1', 10);
      expect(retrieved[0].outcome.user_corrected).toBe(true);
      expect(retrieved[0].outcome.explicit_feedback).toBe('negative');
    });

    it('counts episodes per user', () => {
      persistence.storeEpisode(createTestEpisode('user1', 'ep_1'));
      persistence.storeEpisode(createTestEpisode('user1', 'ep_2'));
      persistence.storeEpisode(createTestEpisode('user2', 'ep_3'));

      expect(persistence.countEpisodes('user1')).toBe(2);
      expect(persistence.countEpisodes('user2')).toBe(1);
      expect(persistence.countEpisodes('user3')).toBe(0);
    });

    it('prunes old episodes', () => {
      for (let i = 0; i < 15; i++) {
        const ep = createTestEpisode('user1', `ep_${i}`);
        ep.novelty_score = i / 15; // Increasing novelty
        persistence.storeEpisode(ep);
      }

      expect(persistence.countEpisodes('user1')).toBe(15);

      const pruned = persistence.pruneEpisodes('user1', 10);
      expect(pruned).toBe(5);
      expect(persistence.countEpisodes('user1')).toBe(10);
    });

    it('retrieves episodes for replay by salience', () => {
      const ep1 = createTestEpisode('user1', 'ep_low');
      ep1.novelty_score = 0.1;
      ep1.emotional_salience = 0.1;

      const ep2 = createTestEpisode('user1', 'ep_high');
      ep2.novelty_score = 0.9;
      ep2.emotional_salience = 0.9;

      persistence.storeEpisode(ep1);
      persistence.storeEpisode(ep2);

      const forReplay = persistence.getEpisodesForReplay('user1', 1);
      expect(forReplay[0].id).toBe('ep_high');
    });
  });

  describe('User Model Operations', () => {
    it('creates new user model on first access', () => {
      const model = persistence.getUserModel('new_user');

      expect(model.user_id).toBe('new_user');
      expect(model.preferred_depth).toBe('medium');
      expect(model.autonomy_trajectory.decisions_made_independently).toBe(0);
    });

    it('saves and retrieves user model', () => {
      const model = persistence.getUserModel('user1');
      model.preferred_depth = 'deep';
      model.preferred_directness = 'direct';
      model.autonomy_trajectory.decisions_made_independently = 10;

      persistence.saveUserModel(model);

      // Get fresh instance
      const retrieved = persistence.getUserModel('user1');
      expect(retrieved.preferred_depth).toBe('deep');
      expect(retrieved.preferred_directness).toBe('direct');
      expect(retrieved.autonomy_trajectory.decisions_made_independently).toBe(10);
    });

    it('preserves active_domains Map', () => {
      const model = persistence.getUserModel('user1');
      model.active_domains.set('H06_MEANING' as HumanDomain, {
        domain: 'H06_MEANING' as HumanDomain,
        engagement_history: [1, 0.8, 0.9],
        recurring_themes: ['purpose', 'direction'],
        last_active: new Date()
      });

      persistence.saveUserModel(model);

      const retrieved = persistence.getUserModel('user1');
      expect(retrieved.active_domains.size).toBe(1);
      const domainState = retrieved.active_domains.get('H06_MEANING' as HumanDomain);
      expect(domainState).toBeDefined();
      expect(domainState!.recurring_themes).toContain('purpose');
    });
  });

  describe('Semantic Pattern Operations', () => {
    it('saves and retrieves semantic patterns', () => {
      const model = persistence.getUserModel('user1');
      model.semantic_patterns.push({
        id: 'pattern_1',
        pattern_type: 'response',
        triggers: {
          domains: ['H06_MEANING' as HumanDomain],
          keywords: ['meaning', 'purpose'],
          emotional_markers: ['confusion']
        },
        effective_primitives: [
          { primitive: 'P03_WITNESS', success_rate: 0.8, context_conditions: ['V_MODE'] }
        ],
        ineffective_primitives: [],
        strength: 0.7,
        last_updated: new Date()
      });

      persistence.saveUserModel(model);

      const patterns = persistence.getSemanticPatterns('user1');
      expect(patterns.length).toBe(1);
      expect(patterns[0].triggers.keywords).toContain('meaning');
      expect(patterns[0].effective_primitives[0].success_rate).toBe(0.8);
    });

    it('retrieves effective patterns by domain', () => {
      const model = persistence.getUserModel('user1');
      model.semantic_patterns.push({
        id: 'pattern_meaning',
        pattern_type: 'response',
        triggers: {
          domains: ['H06_MEANING' as HumanDomain],
          keywords: [],
          emotional_markers: []
        },
        effective_primitives: [],
        ineffective_primitives: [],
        strength: 0.8,
        last_updated: new Date()
      });
      model.semantic_patterns.push({
        id: 'pattern_work',
        pattern_type: 'response',
        triggers: {
          domains: ['H14_WORK' as HumanDomain],
          keywords: [],
          emotional_markers: []
        },
        effective_primitives: [],
        ineffective_primitives: [],
        strength: 0.6,
        last_updated: new Date()
      });

      persistence.saveUserModel(model);

      const meaningPatterns = persistence.getEffectivePatterns('user1', ['H06_MEANING' as HumanDomain]);
      expect(meaningPatterns.length).toBe(1);
      expect(meaningPatterns[0].id).toBe('pattern_meaning');
    });
  });

  describe('Autonomy Health', () => {
    it('reports healthy trajectory for positive slope', () => {
      const model = persistence.getUserModel('user1');
      model.autonomy_trajectory = {
        decisions_made_independently: 15,
        decisions_delegated_to_enoq: 5,
        trajectory_slope: 0.25
      };
      persistence.saveUserModel(model);

      const health = persistence.checkAutonomyHealth('user1');
      expect(health.healthy).toBe(true);
      expect(health.recommendation).toBe('CONTINUE_CURRENT_APPROACH');
    });

    it('reports unhealthy trajectory for negative slope', () => {
      const model = persistence.getUserModel('user1');
      model.autonomy_trajectory = {
        decisions_made_independently: 5,
        decisions_delegated_to_enoq: 15,
        trajectory_slope: -0.25
      };
      persistence.saveUserModel(model);

      const health = persistence.checkAutonomyHealth('user1');
      expect(health.healthy).toBe(false);
      expect(health.recommendation).toBe('INCREASE_OWNERSHIP_RETURN');
    });
  });

  describe('Statistics', () => {
    it('returns correct counts', () => {
      persistence.storeEpisode({
        id: 'ep_1',
        user_id: 'user1',
        timestamp: new Date(),
        user_message: 'Test',
        language: 'en',
        field_state: {} as FieldState,
        domains_active: [],
        atmosphere: 'HUMAN_FIELD',
        primitive_used: 'P01',
        response: 'Response',
        outcome: { engagement_continued: true, topic_shifted: false, user_corrected: false, autonomy_expressed: true },
        novelty_score: 0.5,
        emotional_salience: 0.5,
        integration_score: 0.5
      });

      persistence.getUserModel('user1');
      persistence.getUserModel('user2');

      const stats = persistence.getStats();
      expect(stats.episode_count).toBe(1);
      expect(stats.user_count).toBe(2);
    });
  });

  describe('GDPR Compliance', () => {
    it('exports all user data', () => {
      persistence.storeEpisode({
        id: 'ep_1',
        user_id: 'user1',
        timestamp: new Date(),
        user_message: 'Test message',
        language: 'en',
        field_state: {} as FieldState,
        domains_active: ['H06_MEANING' as HumanDomain],
        atmosphere: 'HUMAN_FIELD',
        primitive_used: 'P01',
        response: 'Response',
        outcome: { engagement_continued: true, topic_shifted: false, user_corrected: false, autonomy_expressed: true },
        novelty_score: 0.5,
        emotional_salience: 0.5,
        integration_score: 0.5
      });

      const model = persistence.getUserModel('user1');
      model.semantic_patterns.push({
        id: 'pattern_1',
        pattern_type: 'response',
        triggers: { domains: [], keywords: [], emotional_markers: [] },
        effective_primitives: [],
        ineffective_primitives: [],
        strength: 0.5,
        last_updated: new Date()
      });
      persistence.saveUserModel(model);

      const exported = persistence.exportUserData('user1');
      expect(exported.episodes.length).toBe(1);
      expect(exported.model.user_id).toBe('user1');
      expect(exported.patterns.length).toBe(1);
    });

    it('deletes all user data', () => {
      persistence.storeEpisode({
        id: 'ep_1',
        user_id: 'user1',
        timestamp: new Date(),
        user_message: 'Test',
        language: 'en',
        field_state: {} as FieldState,
        domains_active: [],
        atmosphere: 'HUMAN_FIELD',
        primitive_used: 'P01',
        response: 'Response',
        outcome: { engagement_continued: true, topic_shifted: false, user_corrected: false, autonomy_expressed: true },
        novelty_score: 0.5,
        emotional_salience: 0.5,
        integration_score: 0.5
      });

      persistence.getUserModel('user1');

      persistence.deleteUserData('user1');

      expect(persistence.countEpisodes('user1')).toBe(0);
      // User model is recreated on access, so we check patterns instead
      expect(persistence.getSemanticPatterns('user1').length).toBe(0);
    });
  });
});

describe('MemorySystem with Persistence', () => {
  let memorySystem: MemorySystem;

  beforeEach(() => {
    resetMemorySystem();
    memorySystem = getMemorySystem({
      persistence_enabled: true,
      persistence_config: { dbPath: ':memory:' }
    });
  });

  afterEach(() => {
    resetMemorySystem();
  });

  it('reports persistence as enabled', () => {
    expect(memorySystem.isPersistenceEnabled()).toBe(true);
  });

  it('stores and retrieves through persistence', () => {
    const fieldState: FieldState = {
      domains: [{ domain: 'H06_MEANING' as HumanDomain, salience: 0.7 }],
      arousal: 'medium',
      valence: 'neutral',
      coherence: 'high',
      goal: 'explore',
      flags: [],
      loop_count: 0,
      uncertainty: 0.3
    };

    const episodeId = memorySystem.store(
      'user1',
      'What is the meaning of life?',
      'en',
      fieldState,
      ['H06_MEANING' as HumanDomain],
      'V_MODE',
      'P03_WITNESS',
      'That is a profound question...'
    );

    expect(episodeId).toBeDefined();

    const context = memorySystem.getContext('user1');
    expect(context.working_memory.length).toBe(1);
    expect(context.working_memory[0].user_message).toBe('What is the meaning of life?');
  });

  it('returns stats when persistence enabled', () => {
    const stats = memorySystem.getStats();
    expect(stats.persistence_enabled).toBe(true);
    expect(stats.episode_count).toBeDefined();
    expect(stats.user_count).toBeDefined();
  });

  it('supports GDPR export', () => {
    const fieldState: FieldState = {
      domains: [],
      arousal: 'medium',
      valence: 'neutral',
      coherence: 'high',
      goal: 'explore',
      flags: [],
      loop_count: 0,
      uncertainty: 0.3
    };

    memorySystem.store('user1', 'Test', 'en', fieldState, [], 'HUMAN_FIELD', 'P01', 'Response');

    const exported = memorySystem.exportUserData('user1');
    expect(exported).not.toBeNull();
    expect(exported!.episodes.length).toBe(1);
  });

  it('supports GDPR deletion', () => {
    const fieldState: FieldState = {
      domains: [],
      arousal: 'medium',
      valence: 'neutral',
      coherence: 'high',
      goal: 'explore',
      flags: [],
      loop_count: 0,
      uncertainty: 0.3
    };

    memorySystem.store('user1', 'Test', 'en', fieldState, [], 'HUMAN_FIELD', 'P01', 'Response');

    const deleted = memorySystem.deleteUserData('user1');
    expect(deleted).toBe(true);
  });
});

describe('MemorySystem without Persistence', () => {
  let memorySystem: MemorySystem;

  beforeEach(() => {
    resetMemorySystem();
    memorySystem = new MemorySystem({ persistence_enabled: false });
  });

  afterEach(() => {
    memorySystem.close();
  });

  it('reports persistence as disabled', () => {
    expect(memorySystem.isPersistenceEnabled()).toBe(false);
  });

  it('still works in-memory', () => {
    const fieldState: FieldState = {
      domains: [],
      arousal: 'medium',
      valence: 'neutral',
      coherence: 'high',
      goal: 'explore',
      flags: [],
      loop_count: 0,
      uncertainty: 0.3
    };

    memorySystem.store('user1', 'Test', 'en', fieldState, [], 'HUMAN_FIELD', 'P01', 'Response');

    const context = memorySystem.getContext('user1');
    expect(context.working_memory.length).toBe(1);
  });

  it('returns null for GDPR export', () => {
    const exported = memorySystem.exportUserData('user1');
    expect(exported).toBeNull();
  });
});
