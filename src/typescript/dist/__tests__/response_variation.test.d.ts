/**
 * RESPONSE VARIATION TESTS
 *
 * These tests verify that:
 * 1. Responses vary across multiple calls (not always index 0)
 * 2. Recent responses are filtered out to prevent repetition
 * 3. Session memory tracks responses correctly
 *
 * WHY THESE TESTS EXIST:
 * - phi=0 caused index=0, always same response (fixed)
 * - Users heard same phrases repeated within session (fixed)
 * - No tracking of previous responses existed (fixed)
 *
 * RUN: npx jest response_variation.test.ts
 */
export {};
//# sourceMappingURL=response_variation.test.d.ts.map