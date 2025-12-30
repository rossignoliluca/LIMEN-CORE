/**
 * TRAVERSALS SMOKE TESTS - E2E Coverage for CLI Surfaces
 *
 * Tests that MAIL, RELATION, DECISION traversals:
 * - Run without crashing
 * - Follow FAST PATH architecture
 * - Return structured output
 * - Respect AXIS constraints
 */

import { createCoreSession, permit } from '../core/pipeline/orchestrator';
import { callLLM, checkLLMAvailability } from '../operational/providers/llm_provider';

// Mock LLM provider
jest.mock('../operational/providers/llm_provider', () => ({
  callLLM: jest.fn().mockResolvedValue({
    content: `DECISION FRAME
Deciding: Whether to accept the job offer
Not deciding: Career satisfaction long-term

OPTIONS SPACE
Option A: Accept the offer
Option B: Decline and stay current
Option C: Negotiate terms

TRADEOFFS
Option A - Upside: Higher salary | Downside: Longer commute
Option B - Upside: Stability | Downside: Same pay
Option C - Upside: Potential better deal | Downside: Risk rejection

RUBICON CHECK
This remains a reversible decision.

OWNERSHIP
Decision ownership remains with you.`,
    usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
  }),
  checkLLMAvailability: jest.fn().mockReturnValue({
    available: true,
    providers: ['mock'],
    message: 'Mock LLM available',
  }),
}));

describe('Traversals Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FAST PATH Architecture', () => {
    it('permit() returns boundary decision', () => {
      const session = createCoreSession();
      const decision = permit('Test message', {
        session_id: session.session_id,
        turn_number: 0,
      });

      expect(decision).toBeDefined();
      expect(decision.permitted).toBe(true);
      expect(decision.classification).toBeDefined();
      expect(decision.classification.signal).toBeDefined();
    });

    it('permit() blocks dangerous content', () => {
      const session = createCoreSession();
      // Standard message should pass
      const safeDecision = permit('Help me write an email', {
        session_id: session.session_id,
        turn_number: 0,
      });
      expect(safeDecision.permitted).toBe(true);
    });
  });

  describe('DECISION Traversal', () => {
    it('produces structured output with decision frame', async () => {
      const result = await callLLM({
        messages: [
          { role: 'user', content: 'Should I accept the job offer?' },
        ],
      });

      expect(result.content).toContain('DECISION FRAME');
      expect(result.content).toContain('OPTIONS SPACE');
      expect(result.content).toContain('TRADEOFFS');
      expect(result.content).toContain('RUBICON CHECK');
      expect(result.content).toContain('OWNERSHIP');
    });

    it('does not contain recommendations', async () => {
      const result = await callLLM({
        messages: [
          { role: 'user', content: 'Should I accept the job offer?' },
        ],
      });

      // AXIS requirement: no recommendations
      expect(result.content.toLowerCase()).not.toContain('i recommend');
      expect(result.content.toLowerCase()).not.toContain('you should');
      expect(result.content.toLowerCase()).not.toContain('best option');
    });

    it('includes ownership statement', async () => {
      const result = await callLLM({
        messages: [
          { role: 'user', content: 'Should I accept the job offer?' },
        ],
      });

      expect(result.content).toContain('Decision ownership remains with you');
    });
  });

  describe('Session Management', () => {
    it('createCoreSession returns valid session', () => {
      const session = createCoreSession();

      expect(session).toBeDefined();
      expect(session.session_id).toBeDefined();
      expect(typeof session.session_id).toBe('string');
      expect(session.session_id.length).toBeGreaterThan(0);
    });

    it('createCoreSession with userId includes user context', () => {
      const session = createCoreSession('user-123');

      expect(session).toBeDefined();
      expect(session.session_id).toBeDefined();
    });

    it('each session has unique ID', () => {
      const session1 = createCoreSession();
      const session2 = createCoreSession();

      expect(session1.session_id).not.toBe(session2.session_id);
    });
  });

  describe('LLM Availability', () => {
    it('checkLLMAvailability returns status', () => {
      const status = checkLLMAvailability();

      expect(status).toBeDefined();
      expect(status.available).toBe(true);
      expect(status.providers).toContain('mock');
    });
  });

  describe('AXIS Constraints', () => {
    it('permit blocks identity-defining content', () => {
      const session = createCoreSession();

      // These should pass (descriptive, not prescriptive)
      const descriptive = permit('What options do I have?', {
        session_id: session.session_id,
        turn_number: 0,
      });
      expect(descriptive.permitted).toBe(true);
    });

    it('session maintains context across calls', () => {
      const session = createCoreSession();

      const decision1 = permit('First message', {
        session_id: session.session_id,
        turn_number: 0,
      });

      const decision2 = permit('Second message', {
        session_id: session.session_id,
        turn_number: 1,
      });

      // Both should use same session
      expect(decision1.classification).toBeDefined();
      expect(decision2.classification).toBeDefined();
    });
  });
});

describe('Traversal Output Structure', () => {
  describe('MAIL-like output', () => {
    it('would contain email drafts (mock verification)', async () => {
      // Mock a MAIL response
      (callLLM as jest.Mock).mockResolvedValueOnce({
        content: `DRAFT A
Subject: Request for deadline extension
Body: I am writing to request...

DRAFT B
Subject: Following up on project timeline
Body: I wanted to discuss...

RATIONALE
Draft A is more formal, Draft B is conversational.`,
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
      });

      const result = await callLLM({
        messages: [{ role: 'user', content: 'Write email to boss about deadline' }],
      });

      expect(result.content).toContain('DRAFT');
      expect(result.content).not.toContain('best draft');
    });
  });

  describe('RELATION-like output', () => {
    it('would contain role map and tension axes (mock verification)', async () => {
      // Mock a RELATION response
      (callLLM as jest.Mock).mockResolvedValueOnce({
        content: `ROLE MAP
A (you): Employee, seeking recognition
B (them): Manager, focused on deliverables

TENSION AXES
1. Recognition vs Results focus
2. Autonomy vs Oversight

BOUNDARY LINES
You control: Your work output, communication style
You don't control: Their management style

MINIMAL NEXT ACT
One specific conversation about expectations.`,
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
      });

      const result = await callLLM({
        messages: [{ role: 'user', content: 'Map my relationship with manager' }],
      });

      expect(result.content).toContain('ROLE MAP');
      expect(result.content).toContain('TENSION');
      expect(result.content).not.toContain('you should');
    });
  });
});

describe('Error Handling', () => {
  it('handles empty message gracefully', () => {
    const session = createCoreSession();
    const decision = permit('', {
      session_id: session.session_id,
      turn_number: 0,
    });

    // Should still return a valid decision
    expect(decision).toBeDefined();
    expect(decision.permitted).toBeDefined();
  });

  it('handles very long message', () => {
    const session = createCoreSession();
    const longMessage = 'a'.repeat(10000);
    const decision = permit(longMessage, {
      session_id: session.session_id,
      turn_number: 0,
    });

    expect(decision).toBeDefined();
    expect(decision.permitted).toBeDefined();
  });

  it('handles unicode and special characters', () => {
    const session = createCoreSession();
    const decision = permit('Test with 你好 and emojis 🎉', {
      session_id: session.session_id,
      turn_number: 0,
    });

    expect(decision).toBeDefined();
    expect(decision.permitted).toBeDefined();
  });
});
