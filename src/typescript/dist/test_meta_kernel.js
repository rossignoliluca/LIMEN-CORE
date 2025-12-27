"use strict";
/**
 * ENOQ META KERNEL TEST SUITE
 *
 * Tests power governance invariants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const meta_kernel_1 = require("./meta_kernel");
// ============================================
// TEST HELPERS
// ============================================
function createSessionTelemetry(overrides = {}) {
    return {
        total_turns: 5,
        avg_depth: 1,
        max_depth_reached: 'medium',
        delegation_rate: 0.1,
        reassurance_rate: 0.1,
        passive_turns_rate: 0.1,
        loop_count: 0,
        theme_repetition_rate: 0.1,
        user_made_decision: false,
        user_asked_clarifying: false,
        user_disagreed: false,
        ...overrides,
    };
}
function createTurnTelemetry(overrides = {}) {
    return {
        timestamp: new Date(),
        turn_number: 1,
        input_length: 50,
        input_question_count: 1,
        input_has_delegation_markers: false,
        output_depth: 'medium',
        output_domains: ['H05_COGNITION'],
        elapsed_time: 30,
        ...overrides,
    };
}
// ============================================
// POWER LEVEL TESTS
// ============================================
console.log('\n========== POWER LEVEL TESTS ==========\n');
// Test: High delegation reduces power
{
    const session = createSessionTelemetry({
        delegation_rate: 0.5,
        passive_turns_rate: 0.4,
        reassurance_rate: 0.3,
    });
    const turn = createTurnTelemetry();
    const result = (0, meta_kernel_1.applyMetaKernel)(session, turn, null);
    console.log('TC-MK-001: High delegation reduces power');
    console.log(`  Delegation rate: 0.5`);
    console.log(`  Power level: ${result.power_envelope.l2_mode}`);
    console.log(`  Depth ceiling: ${result.power_envelope.depth_ceiling}`);
    const pass = result.power_envelope.l2_mode !== 'DEEP' && result.power_envelope.depth_ceiling !== 'deep';
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// Test: High agency allows full power
{
    const session = createSessionTelemetry({
        delegation_rate: 0.05,
        user_made_decision: true,
        user_asked_clarifying: true,
        user_disagreed: true,
    });
    const turn = createTurnTelemetry();
    const state = (0, meta_kernel_1.createDefaultState)();
    state.coherence = 'high';
    const result = (0, meta_kernel_1.applyMetaKernel)(session, turn, state);
    console.log('TC-MK-002: High agency allows full power');
    console.log(`  User made decision: true, asked clarifying: true, disagreed: true`);
    console.log(`  Rules applied: ${result.rules_applied.join(', ')}`);
    console.log(`  Depth ceiling: ${result.power_envelope.depth_ceiling}`);
    const pass = result.rules_applied.includes('MK-008');
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// ============================================
// CONSTRAINT TESTS
// ============================================
console.log('\n========== CONSTRAINT TESTS ==========\n');
// Test: Loop triggers contraction
{
    const session = createSessionTelemetry({
        theme_repetition_rate: 0.6,
        loop_count: 5,
    });
    const turn = createTurnTelemetry();
    const result = (0, meta_kernel_1.applyMetaKernel)(session, turn, null);
    console.log('TC-MK-003: Loop triggers contraction');
    console.log(`  Loop tendency: 0.6`);
    console.log(`  Rules applied: ${result.rules_applied.join(', ')}`);
    console.log(`  Depth ceiling: ${result.power_envelope.depth_ceiling}`);
    const pass = result.rules_applied.includes('MK-005') && result.power_envelope.depth_ceiling === 'surface';
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// Test: Low budget prepares closure
{
    const session = createSessionTelemetry();
    const turn = createTurnTelemetry();
    const state = (0, meta_kernel_1.createDefaultState)();
    state.turns_elapsed = 98; // Only 2 turns left
    state.knobs.max_turns_remaining = 100;
    const result = (0, meta_kernel_1.applyMetaKernel)(session, turn, state);
    console.log('TC-MK-004: Low budget prepares closure');
    console.log(`  Turns remaining: 2`);
    console.log(`  Rules applied: ${result.rules_applied.join(', ')}`);
    console.log(`  Depth ceiling: ${result.power_envelope.depth_ceiling}`);
    const pass = result.rules_applied.includes('MK-006');
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// Test: Low agency narrows focus
{
    const session = createSessionTelemetry({
        delegation_rate: 0.3,
        passive_turns_rate: 0.5,
        reassurance_rate: 0.4,
    });
    const turn = createTurnTelemetry();
    const result = (0, meta_kernel_1.applyMetaKernel)(session, turn, null);
    console.log('TC-MK-005: Low agency narrows focus');
    console.log(`  Passive turns: 0.5, Reassurance: 0.4`);
    console.log(`  Rules applied: ${result.rules_applied.join(', ')}`);
    console.log(`  Dimensions: ${result.power_envelope.dimensions_allowed.join(', ')}`);
    const pass = result.rules_applied.includes('MK-002') &&
        !result.power_envelope.dimensions_allowed.includes('existential');
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// ============================================
// HANDSHAKE TESTS
// ============================================
console.log('\n========== HANDSHAKE TESTS ==========\n');
// Test: Handshake response - affirmative
{
    const state = (0, meta_kernel_1.createDefaultState)();
    state.handshake_pending = true;
    const newState = (0, meta_kernel_1.processHandshakeResponse)('yes, continue', state);
    console.log('TC-MK-006: Affirmative handshake response');
    console.log(`  Response: "yes, continue"`);
    console.log(`  Deep mode active: ${newState.deep_mode_active}`);
    console.log(`  Max depth: ${newState.knobs.max_depth_allowed}`);
    const pass = newState.deep_mode_active && newState.knobs.max_depth_allowed === 'deep';
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// Test: Handshake response - negative
{
    const state = (0, meta_kernel_1.createDefaultState)();
    state.handshake_pending = true;
    const newState = (0, meta_kernel_1.processHandshakeResponse)('no, not now', state);
    console.log('TC-MK-007: Negative handshake response');
    console.log(`  Response: "no, not now"`);
    console.log(`  Deep mode active: ${newState.deep_mode_active}`);
    console.log(`  Max depth: ${newState.knobs.max_depth_allowed}`);
    const pass = !newState.deep_mode_active && newState.knobs.max_depth_allowed === 'medium';
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// Test: Italian handshake response
{
    const state = (0, meta_kernel_1.createDefaultState)();
    state.handshake_pending = true;
    const newState = (0, meta_kernel_1.processHandshakeResponse)('sì, continua', state);
    console.log('TC-MK-008: Italian affirmative response');
    console.log(`  Response: "sì, continua"`);
    console.log(`  Deep mode active: ${newState.deep_mode_active}`);
    const pass = newState.deep_mode_active;
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// ============================================
// RECOVERY MODE TESTS
// ============================================
console.log('\n========== RECOVERY MODE TESTS ==========\n');
// Test: Enter recovery mode
{
    const state = (0, meta_kernel_1.createDefaultState)();
    const recoveryState = (0, meta_kernel_1.enterRecoveryMode)(state);
    console.log('TC-MK-009: Enter recovery mode');
    console.log(`  Recovery mode: ${recoveryState.recovery_mode}`);
    console.log(`  Recovery turns: ${recoveryState.recovery_turns_remaining}`);
    console.log(`  Max depth: ${recoveryState.knobs.max_depth_allowed}`);
    const pass = recoveryState.recovery_mode &&
        recoveryState.recovery_turns_remaining === 3 &&
        recoveryState.knobs.max_depth_allowed === 'surface';
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// Test: Recovery mode constrains depth
{
    const session = createSessionTelemetry({
        delegation_rate: 0.0,
        user_made_decision: true,
    });
    const turn = createTurnTelemetry();
    const state = (0, meta_kernel_1.enterRecoveryMode)((0, meta_kernel_1.createDefaultState)());
    const result = (0, meta_kernel_1.applyMetaKernel)(session, turn, state);
    console.log('TC-MK-010: Recovery mode constrains depth');
    console.log(`  Recovery mode: true`);
    console.log(`  Rules applied: ${result.rules_applied.join(', ')}`);
    console.log(`  Depth ceiling: ${result.power_envelope.depth_ceiling}`);
    const pass = result.rules_applied.includes('MK-010') &&
        result.power_envelope.depth_ceiling === 'surface';
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// ============================================
// INVARIANT TESTS
// ============================================
console.log('\n========== INVARIANT TESTS ==========\n');
// Test: Invariant check passes for valid state
{
    const telemetry = {
        depth_velocity: 0,
        domain_spread: 2,
        continuity_pressure: 0.5,
        delegation_attempts_rate: 0.1,
        loop_tendency: 0.1,
        turns_budget: 50,
        time_budget: 1800,
        agency_signal: 0.6,
    };
    const state = (0, meta_kernel_1.createDefaultState)();
    const session = createSessionTelemetry();
    const result = (0, meta_kernel_1.applyMetaKernel)(session, null, state);
    const invariants = (0, meta_kernel_1.checkMetaKernelInvariants)(telemetry, state, result);
    console.log('TC-MK-011: Invariants pass for valid state');
    console.log(`  Passed: ${invariants.passed}`);
    console.log(`  Violations: ${invariants.violations.length}`);
    console.log(`  ✓ ${invariants.passed ? 'PASS' : 'FAIL'}\n`);
}
// Test: Invariant detects recovery violation
{
    const telemetry = {
        depth_velocity: 0,
        domain_spread: 2,
        continuity_pressure: 0.5,
        delegation_attempts_rate: 0.1,
        loop_tendency: 0.1,
        turns_budget: 50,
        time_budget: 1800,
        agency_signal: 0.6,
    };
    const state = (0, meta_kernel_1.createDefaultState)();
    state.recovery_mode = true;
    // Artificially create an invalid result
    const result = {
        rules_applied: [],
        knob_changes: [],
        power_envelope: {
            depth_ceiling: 'deep', // INVALID in recovery
            dimensions_allowed: ['somatic', 'emotional'],
            pacing: 'normal',
            l2_mode: 'DEEP',
            time_remaining: 1800,
            turns_remaining: 50,
        },
        prompt_handshake: false,
        new_state: state,
    };
    const invariants = (0, meta_kernel_1.checkMetaKernelInvariants)(telemetry, state, result);
    console.log('TC-MK-012: Invariant detects recovery violation');
    console.log(`  State: recovery_mode=true, depth_ceiling=deep`);
    console.log(`  Passed: ${invariants.passed}`);
    console.log(`  Violations: ${invariants.violations.join(', ')}`);
    const pass = !invariants.passed && invariants.violations.some(v => v.includes('INV-3'));
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// ============================================
// KNOB CHANGE TRACKING TESTS
// ============================================
console.log('\n========== KNOB CHANGE TRACKING TESTS ==========\n');
// Test: Knob changes are tracked
{
    const session = createSessionTelemetry({
        theme_repetition_rate: 0.7,
    });
    const turn = createTurnTelemetry();
    const result = (0, meta_kernel_1.applyMetaKernel)(session, turn, null);
    console.log('TC-MK-013: Knob changes are tracked');
    console.log(`  Loop tendency: 0.7`);
    console.log(`  Knob changes: ${result.knob_changes.length}`);
    for (const change of result.knob_changes) {
        console.log(`    ${change.knob}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`);
    }
    const pass = result.knob_changes.length > 0;
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// ============================================
// STATE PERSISTENCE TESTS
// ============================================
console.log('\n========== STATE PERSISTENCE TESTS ==========\n');
// Test: State persists across turns
{
    const session = createSessionTelemetry();
    const turn1 = createTurnTelemetry({ turn_number: 1 });
    const result1 = (0, meta_kernel_1.applyMetaKernel)(session, turn1, null);
    const turn2 = createTurnTelemetry({ turn_number: 2 });
    const result2 = (0, meta_kernel_1.applyMetaKernel)(session, turn2, result1.new_state);
    console.log('TC-MK-014: State persists across turns');
    console.log(`  Turn 1 elapsed: ${result1.new_state.turns_elapsed}`);
    console.log(`  Turn 2 elapsed: ${result2.new_state.turns_elapsed}`);
    console.log(`  Telemetry history length: ${result2.new_state.telemetry_history.length}`);
    const pass = result2.new_state.turns_elapsed === 2 &&
        result2.new_state.telemetry_history.length === 2;
    console.log(`  ✓ ${pass ? 'PASS' : 'FAIL'}\n`);
}
// ============================================
// SUMMARY
// ============================================
console.log('\n========== META KERNEL TEST SUMMARY ==========\n');
console.log('All tests completed.');
console.log('MetaKernel enforces:');
console.log('  - Power scales with agency');
console.log('  - High delegation constrains depth');
console.log('  - Loops trigger contraction');
console.log('  - Budget low prepares closure');
console.log('  - Deep mode requires handshake');
console.log('  - Recovery mode constrains to surface');
console.log('  - Invariants are checkable');
console.log('  - State persists across turns');
console.log('\nPower is permissioned, not automatic.\n');
//# sourceMappingURL=test_meta_kernel.js.map