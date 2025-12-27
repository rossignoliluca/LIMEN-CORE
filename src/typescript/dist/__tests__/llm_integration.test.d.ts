/**
 * LLM INTEGRATION TESTS
 *
 * These tests verify the LLM integration in l2_execution:
 * 1. Fallback to templates when LLM unavailable
 * 2. Correct atmosphere propagation to LLM
 * 3. DEEP mode 2-call reasoning
 * 4. Language support and fallback
 *
 * WHY THESE TESTS EXIST:
 * - Ensure L2 execution handles LLM failures gracefully
 * - Verify atmosphere is correctly passed to LLM (not guessed from invariants)
 * - Test DEEP mode's 2-call pattern
 *
 * NOTE: Tests with real LLM calls require OPENAI_API_KEY or ANTHROPIC_API_KEY
 *       and are skipped by default. Set LLM_TEST=true to run them.
 *
 * RUN: npx jest llm_integration.test.ts
 */
export {};
//# sourceMappingURL=llm_integration.test.d.ts.map