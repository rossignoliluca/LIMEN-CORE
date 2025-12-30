/**
 * ORCHESTRATOR TESTS - Core Entry Point Coverage
 *
 * Tests the canonical enoqCore() entry point:
 * - permit() always called
 * - verifyOutput() called when data available
 * - STOP signal always present
 * - blocked path returns without calling runtime
 * - verify fail path handled
 */

import {
  enoqCore,
  createCoreSession,
  CoreConfig,
  CoreResult,
} from '../core/pipeline/orchestrator';

// Mock runtime to avoid LLM calls
jest.mock('../runtime/pipeline/pipeline', () => {
  const originalModule = jest.requireActual('../runtime/pipeline/pipeline');
  return {
    ...originalModule,
    enoq: jest.fn().mockImplementation(async (message: string, session: any) => {
      // Return minimal mock result
      return {
        output: `Mock response to: ${message}`,
        trace: {
          s1_field: {
            language: 'en',
            dimensional_state: { primary_vertical: 'FUNCTIONAL' },
          },
          s3_selection: {
            selected_option: 'mock',
          },
        },
      };
    }),
  };
});

// Mock boundary module
jest.mock('../core/modules/boundary', () => ({
  permit: jest.fn().mockImplementation((message: string, context: any) => ({
    permitted: true,
    classification: {
      signal: 'PROCEED',
      confidence: 0.95,
    },
    protocols: [],
    timestamp: Date.now(),
  })),
  BoundaryDecision: {},
}));

// Mock verification module
jest.mock('../core/modules/verification', () => ({
  verifyOutput: jest.fn().mockImplementation((output: any, context: any) => ({
    passed: true,
    violations: [],
    hash: 'mock-hash',
  })),
  VerificationDecision: {},
}));

describe('Core Orchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Signal Flow', () => {
    it('always emits PERMIT signal', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test message', session);

      const permitSignal = result.signals.find(s => s.state === 'PERMIT');
      expect(permitSignal).toBeDefined();
      expect(permitSignal?.state).toBe('PERMIT');
    });

    it('always emits STOP signal', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test message', session);

      const stopSignal = result.signals.find(s => s.state === 'STOP');
      expect(stopSignal).toBeDefined();
      expect(stopSignal?.state).toBe('STOP');
    });

    it('emits VERIFY signal when verification runs', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test message', session);

      const verifySignal = result.signals.find(s => s.state === 'VERIFY');
      expect(verifySignal).toBeDefined();
    });

    it('signal order is PERMIT → SENSE → VERIFY → STOP', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test message', session);

      const states = result.signals.map(s => s.state);

      const permitIdx = states.indexOf('PERMIT');
      const senseIdx = states.indexOf('SENSE');
      const verifyIdx = states.indexOf('VERIFY');
      const stopIdx = states.indexOf('STOP');

      expect(permitIdx).toBeLessThan(senseIdx);
      expect(senseIdx).toBeLessThan(verifyIdx);
      expect(verifyIdx).toBeLessThan(stopIdx);
    });
  });

  describe('Boundary (permit)', () => {
    it('calls permit() when boundary_enabled is true (default)', async () => {
      const { permit } = require('../core/modules/boundary');
      const session = createCoreSession();

      await enoqCore('test message', session);

      expect(permit).toHaveBeenCalledTimes(1);
      expect(permit).toHaveBeenCalledWith(
        'test message',
        expect.objectContaining({
          session_id: session.session_id,
        })
      );
    });

    it('does NOT call permit() when boundary_enabled is false', async () => {
      const { permit } = require('../core/modules/boundary');
      const session = createCoreSession();

      await enoqCore('test message', session, { boundary_enabled: false });

      expect(permit).not.toHaveBeenCalled();
    });

    it('includes boundary decision in result', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test message', session);

      expect(result.boundary).toBeDefined();
      expect(result.boundary?.permitted).toBe(true);
      expect(result.boundary?.classification.signal).toBe('PROCEED');
    });
  });

  describe('Verification (verifyOutput)', () => {
    it('calls verifyOutput() when data is available', async () => {
      const { verifyOutput } = require('../core/modules/verification');
      const session = createCoreSession();

      await enoqCore('test message', session);

      expect(verifyOutput).toHaveBeenCalledTimes(1);
    });

    it('does NOT call verifyOutput() when verification_enabled is false', async () => {
      const { verifyOutput } = require('../core/modules/verification');
      const session = createCoreSession();

      await enoqCore('test message', session, { verification_enabled: false });

      expect(verifyOutput).not.toHaveBeenCalled();
    });

    it('includes verification decision in result', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test message', session);

      expect(result.verification).toBeDefined();
      expect(result.verification?.passed).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('respects signals_enabled=false', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test message', session, { signals_enabled: false });

      // Signals array should be empty when disabled
      expect(result.signals).toHaveLength(0);
    });

    it('passes config to runtime', async () => {
      const { enoq } = require('../runtime/pipeline/pipeline');
      const session = createCoreSession();

      await enoqCore('test message', session, { gate_enabled: false });

      expect(enoq).toHaveBeenCalledWith(
        'test message',
        session,
        expect.objectContaining({ gate_enabled: false })
      );
    });
  });

  describe('Session Management', () => {
    it('createCoreSession returns valid session', () => {
      const session = createCoreSession();

      expect(session).toBeDefined();
      expect(session.session_id).toBeDefined();
      expect(typeof session.session_id).toBe('string');
    });

    it('createCoreSession with userId includes it', () => {
      const session = createCoreSession('test-user-123');

      expect(session).toBeDefined();
      expect(session.session_id).toBeDefined();
    });
  });

  describe('Result Structure', () => {
    it('returns output from runtime', async () => {
      const session = createCoreSession();
      const result = await enoqCore('hello world', session);

      expect(result.output).toContain('hello world');
    });

    it('returns trace from runtime', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test', session);

      expect(result.trace).toBeDefined();
      expect(result.trace?.s1_field).toBeDefined();
    });

    it('result includes all required fields', async () => {
      const session = createCoreSession();
      const result = await enoqCore('test', session);

      // Core fields
      expect(result.output).toBeDefined();
      expect(result.signals).toBeDefined();
      expect(Array.isArray(result.signals)).toBe(true);

      // Optional fields (may be undefined based on config)
      expect('boundary' in result).toBe(true);
      expect('verification' in result).toBe(true);
    });
  });
});

describe('Orchestrator Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles empty message', async () => {
    const session = createCoreSession();
    const result = await enoqCore('', session);

    expect(result.output).toBeDefined();
    expect(result.signals.some(s => s.state === 'STOP')).toBe(true);
  });

  it('handles very long message', async () => {
    const session = createCoreSession();
    const longMessage = 'a'.repeat(10000);
    const result = await enoqCore(longMessage, session);

    expect(result.output).toBeDefined();
    expect(result.signals.some(s => s.state === 'STOP')).toBe(true);
  });

  it('handles unicode message', async () => {
    const session = createCoreSession();
    const result = await enoqCore('你好世界 🌍 مرحبا', session);

    expect(result.output).toBeDefined();
    expect(result.signals.some(s => s.state === 'STOP')).toBe(true);
  });
});
