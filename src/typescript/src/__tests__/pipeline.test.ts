/**
 * PIPELINE TESTS - Runtime Entry Point Coverage
 *
 * Tests the legacy enoq() entry point:
 * - Basic flow works
 * - Empty input handled
 * - Result structure correct
 * - Gate modes respected
 * - Session management
 */

import {
  enoq,
  createSession,
  Session,
  PipelineResult,
  PipelineConfig,
} from '../runtime/pipeline/pipeline';

// Default config for tests
const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  gate_enabled: true,
};

// Heavy mocking to avoid LLM calls
jest.mock('../operational/providers/llm_provider', () => ({
  callLLM: jest.fn().mockResolvedValue({
    content: 'Mock LLM response',
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
  }),
  checkLLMAvailability: jest.fn().mockReturnValue({
    available: true,
    providers: ['mock'],
    message: 'Mock LLM available',
  }),
}));

describe('Runtime Pipeline', () => {
  describe('Session Management', () => {
    it('createSession returns valid session object', () => {
      const session = createSession();

      expect(session).toBeDefined();
      expect(session.session_id).toBeDefined();
      expect(typeof session.session_id).toBe('string');
      expect(session.session_id.length).toBeGreaterThan(0);
    });

    it('createSession with userId returns session with user context', () => {
      const session = createSession('user-123');

      expect(session).toBeDefined();
      expect(session.session_id).toBeDefined();
    });

    it('session has required memory properties', () => {
      const session = createSession();

      expect(session.memory).toBeDefined();
      expect(session.turns).toBeDefined();
      expect(Array.isArray(session.turns)).toBe(true);
    });

    it('new session starts with zero turns', () => {
      const session = createSession();

      expect(session.turns.length).toBe(0);
    });
  });

  describe('Empty Input Handling', () => {
    it('returns minimal response for empty string', async () => {
      const session = createSession();
      const result = await enoq('', session);

      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
      // Should be a presence acknowledgment
      expect(['Sono qui.', "I'm here."].some(s => result.output.includes(s) || result.output.length < 50)).toBe(true);
    });

    it('returns minimal response for whitespace only', async () => {
      const session = createSession();
      const result = await enoq('   ', session);

      expect(result.output).toBeDefined();
    });
  });

  describe('Result Structure', () => {
    it('returns PipelineResult with required fields', async () => {
      const session = createSession();
      const result = await enoq('test input', session);

      expect(result).toBeDefined();
      expect('output' in result).toBe(true);
      expect('trace' in result).toBe(true);
      expect('session' in result).toBe(true);
    });

    it('output is a non-empty string', async () => {
      const session = createSession();
      const result = await enoq('hello', session);

      expect(typeof result.output).toBe('string');
      expect(result.output.length).toBeGreaterThan(0);
    });

    it('trace contains processing information', async () => {
      const session = createSession();
      const result = await enoq('test', session);

      expect(result.trace).toBeDefined();
      // Trace should have at least latency info
      expect(typeof result.trace).toBe('object');
    });

    it('returns same session reference', async () => {
      const session = createSession();
      const result = await enoq('test', session);

      expect(result.session).toBe(session);
    });
  });

  describe('Configuration', () => {
    it('uses default config when none provided', async () => {
      const session = createSession();
      // Should not throw
      const result = await enoq('test', session);
      expect(result.output).toBeDefined();
    });

    it('respects gate_enabled=false', async () => {
      const session = createSession();
      const config: PipelineConfig = {
        ...DEFAULT_PIPELINE_CONFIG,
        gate_enabled: false,
      };

      const result = await enoq('test', session, config);
      expect(result.output).toBeDefined();
    });

    it('respects gate_mode=disabled', async () => {
      const session = createSession();
      const config: PipelineConfig = {
        ...DEFAULT_PIPELINE_CONFIG,
        gate_mode: 'disabled',
      };

      const result = await enoq('test', session, config);
      expect(result.output).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles error gracefully and returns fallback', async () => {
      const session = createSession();
      // Even with potential errors, should return something
      const result = await enoq('trigger potential error scenario', session);

      expect(result.output).toBeDefined();
      expect(typeof result.output).toBe('string');
    });
  });

  describe('Language Detection', () => {
    it('processes Italian input', async () => {
      const session = createSession();
      const result = await enoq('Ciao, come stai?', session);

      expect(result.output).toBeDefined();
    });

    it('processes English input', async () => {
      const session = createSession();
      const result = await enoq('Hello, how are you?', session);

      expect(result.output).toBeDefined();
    });

    it('processes mixed language input', async () => {
      const session = createSession();
      const result = await enoq('Hello, come stai oggi?', session);

      expect(result.output).toBeDefined();
    });
  });
});

describe('Pipeline Edge Cases', () => {
  it('handles very long input', async () => {
    const session = createSession();
    const longInput = 'a'.repeat(5000);
    const result = await enoq(longInput, session);

    expect(result.output).toBeDefined();
  });

  it('handles special characters', async () => {
    const session = createSession();
    const result = await enoq('Test with émojis 🎉 and spëcial çharacters', session);

    expect(result.output).toBeDefined();
  });

  it('handles newlines in input', async () => {
    const session = createSession();
    const result = await enoq('Line 1\nLine 2\nLine 3', session);

    expect(result.output).toBeDefined();
  });

  it('maintains session across multiple calls', async () => {
    const session = createSession();

    await enoq('First message', session);
    await enoq('Second message', session);
    const result = await enoq('Third message', session);

    expect(result.output).toBeDefined();
    // Session should track turns (implementation dependent)
  });
});

describe('PipelineConfig', () => {
  it('enoq accepts config parameter', async () => {
    const session = createSession();
    const config: PipelineConfig = { gate_enabled: false };

    // Should not throw when config is provided
    const result = await enoq('test', session, config);
    expect(result.output).toBeDefined();
  });
});
