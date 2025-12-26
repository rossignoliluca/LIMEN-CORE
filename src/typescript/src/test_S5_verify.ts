/**
 * ENOQ S5 VERIFY TEST SUITE
 * 
 * Tests constitutional enforcement.
 * Every test represents an invariant that must hold.
 */

import { verify, S5Input, getFallbackOutput, FALLBACK_TEMPLATES } from './S5_verify';
import { FieldState, ProtocolSelection } from './types';

// ============================================
// TEST HELPERS
// ============================================

function createTestInput(
  text: string,
  overrides: {
    forbidden?: string[];
    required?: string[];
    atmosphere?: string;
    flags?: string[];
    arousal?: string;
  } = {}
): S5Input {
  const field: FieldState = {
    domains: [{ domain: 'H06_MEANING', salience: 0.7 }],
    arousal: (overrides.arousal as any) || 'medium',
    valence: 'neutral',
    coherence: 'medium',
    goal: 'explore',
    loop_count: 0,
    uncertainty: 0.3,
    language: 'en',
    flags: overrides.flags || [],
  };

  const selection: ProtocolSelection = {
    atmosphere: (overrides.atmosphere as any) || 'HUMAN_FIELD',
    mode: 'EXPAND',
    primitive: 'P04_OPEN',
    depth: 'medium',
    length: 'moderate',
    pacing: 'normal',
    tone: { warmth: 4, directness: 3 },
    forbidden: overrides.forbidden || [],
    required: overrides.required || [],
    confidence: 0.8,
    reasoning: 'test',
  };

  return {
    field,
    selection,
    output: {
      text,
      language: 'en',
      word_count: text.split(/\s+/).length,
      generation_method: 'template',
    },
    session_id: 'test-session',
    turn_number: 1,
    previous_hash: '0000000000000000',
  };
}

// ============================================
// FORBIDDEN ACTION TESTS
// ============================================

console.log('\n========== FORBIDDEN ACTION TESTS ==========\n');

// Test: Recommendation blocked
{
  const input = createTestInput(
    'I recommend you take the job in Singapore.',
    { forbidden: ['recommend'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-001: Recommendation blocked');
  console.log('  Input: "I recommend you take the job in Singapore."');
  console.log('  Forbidden: [recommend]');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  Violations: ${result.violations.length} (expected: 1)`);
  console.log(`  Fallback: ${result.fallback_level}`);
  console.log(`  ✓ ${!result.passed && result.violations.length > 0 ? 'PASS' : 'FAIL'}\n`);
}

// Test: "You should" blocked
{
  const input = createTestInput(
    'You should definitely stay with your family.',
    { forbidden: ['recommend'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-002: "You should" blocked');
  console.log('  Input: "You should definitely stay with your family."');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: Italian recommendation blocked
{
  const input = createTestInput(
    'Ti consiglio di accettare il lavoro.',
    { forbidden: ['recommend'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-003: Italian recommendation blocked');
  console.log('  Input: "Ti consiglio di accettare il lavoro."');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: Diagnosis blocked
{
  const input = createTestInput(
    'You have anxiety. This sounds like depression.',
    { forbidden: ['diagnose'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-004: Diagnosis blocked');
  console.log('  Input: "You have anxiety. This sounds like depression."');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: Clean output passes
{
  const input = createTestInput(
    'What do you think about this situation?',
    { forbidden: ['recommend', 'diagnose'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-005: Clean output passes');
  console.log('  Input: "What do you think about this situation?"');
  console.log(`  Passed: ${result.passed} (expected: true)`);
  console.log(`  ✓ ${result.passed ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// REQUIRED ACTION TESTS
// ============================================

console.log('\n========== REQUIRED ACTION TESTS ==========\n');

// Test: Missing ownership return
{
  const input = createTestInput(
    'Singapore has great career opportunities.',
    { required: ['return_ownership'], flags: ['delegation_attempt'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-006: Missing ownership return');
  console.log('  Input: "Singapore has great career opportunities."');
  console.log('  Required: [return_ownership]');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: Ownership return present
{
  const input = createTestInput(
    'Singapore has opportunities. What do you think feels right for you?',
    { required: ['return_ownership'], flags: ['delegation_attempt'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-007: Ownership return present');
  console.log('  Input: "...What do you think feels right for you?"');
  console.log(`  Passed: ${result.passed} (expected: true)`);
  console.log(`  ✓ ${result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: Missing validation
{
  const input = createTestInput(
    'Let me analyze this problem.',
    { required: ['validate_feeling'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-008: Missing validation');
  console.log('  Input: "Let me analyze this problem."');
  console.log('  Required: [validate_feeling]');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// CONSTITUTIONAL INVARIANT TESTS
// ============================================

console.log('\n========== CONSTITUTIONAL INVARIANT TESTS ==========\n');

// Test: INV-003 violated
{
  const input = createTestInput(
    'The right thing to do is stay with your family.',
    { flags: ['delegation_attempt'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-009: INV-003 violated');
  console.log('  Input: "The right thing to do is stay with your family."');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  Violation: ${result.violations.find(v => v.check === 'INV-003') ? 'INV-003 detected' : 'NOT DETECTED'}`);
  console.log(`  ✓ ${!result.passed && result.violations.some(v => v.check === 'INV-003') ? 'PASS' : 'FAIL'}\n`);
}

// Test: INV-009 violated (crossing Rubicon)
{
  const input = createTestInput(
    'Your purpose is to serve others. You are meant to be a healer.',
    {}
  );
  const result = verify(input);
  
  console.log('TC-S5-010: INV-009 violated (Rubicon)');
  console.log('  Input: "Your purpose is to serve others..."');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  Violation: ${result.violations.find(v => v.check === 'INV-009') ? 'INV-009 detected' : 'NOT DETECTED'}`);
  console.log(`  ✓ ${!result.passed && result.violations.some(v => v.check === 'INV-009') ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// OWNERSHIP TESTS
// ============================================

console.log('\n========== OWNERSHIP TESTS ==========\n');

// Test: Delegation attempt without return
{
  const input = createTestInput(
    'There are many factors to consider here.',
    { flags: ['delegation_attempt'], atmosphere: 'V_MODE' }
  );
  const result = verify(input);
  
  console.log('TC-S5-011: Delegation without ownership return');
  console.log('  Input: "There are many factors to consider here."');
  console.log('  Flags: [delegation_attempt]');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: V_MODE with implicit recommendation
{
  const input = createTestInput(
    'If I were you, I would take the job.',
    { atmosphere: 'V_MODE' }
  );
  const result = verify(input);
  
  console.log('TC-S5-012: V_MODE with implicit recommendation');
  console.log('  Input: "If I were you, I would take the job."');
  console.log('  Atmosphere: V_MODE');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// SAFETY TESTS
// ============================================

console.log('\n========== SAFETY TESTS ==========\n');

// Test: Emergency without grounding
{
  const input = createTestInput(
    'Let me help you analyze your options.',
    { atmosphere: 'EMERGENCY', required: ['offer_grounding'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-013: Emergency without grounding');
  console.log('  Input: "Let me help you analyze your options."');
  console.log('  Atmosphere: EMERGENCY');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: Emergency with grounding
{
  const input = createTestInput(
    "I'm here with you. Let's breathe together. What do you notice in your body?",
    { atmosphere: 'EMERGENCY', required: ['offer_grounding', 'acknowledge_distress'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-014: Emergency with grounding');
  console.log('  Input: "I\'m here with you. Let\'s breathe together..."');
  console.log(`  Passed: ${result.passed} (expected: true)`);
  console.log(`  ✓ ${result.passed ? 'PASS' : 'FAIL'}\n`);
}

// Test: High arousal response too long
{
  const longResponse = 'This is a very long response that goes on and on. '.repeat(5);
  const input = createTestInput(
    longResponse,
    { arousal: 'high' }
  );
  // Manually set length to minimal for this test
  input.selection.length = 'minimal';
  const result = verify(input);
  
  console.log('TC-S5-015: High arousal response too long');
  console.log(`  Input: [${longResponse.split(/\s+/).length} words]`);
  console.log('  Arousal: high, Length: minimal');
  console.log(`  Passed: ${result.passed} (expected: false)`);
  console.log(`  ✓ ${!result.passed ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// FALLBACK LADDER TESTS
// ============================================

console.log('\n========== FALLBACK LADDER TESTS ==========\n');

// Test: First violation → REGENERATE
{
  const input = createTestInput(
    'I recommend you stay.',
    { forbidden: ['recommend'] }
  );
  const result = verify(input, 0);
  
  console.log('TC-S5-016: First violation → REGENERATE');
  console.log(`  Fallback: ${result.fallback_level} (expected: REGENERATE)`);
  console.log(`  ✓ ${result.fallback_level === 'REGENERATE' ? 'PASS' : 'FAIL'}\n`);
}

// Test: Third attempt → MEDIUM
{
  const input = createTestInput(
    'I recommend you stay.',
    { forbidden: ['recommend'] }
  );
  const result = verify(input, 2);
  
  console.log('TC-S5-017: Third attempt → MEDIUM');
  console.log(`  Fallback: ${result.fallback_level} (expected: MEDIUM)`);
  console.log(`  ✓ ${result.fallback_level === 'MEDIUM' ? 'PASS' : 'FAIL'}\n`);
}

// Test: Constitutional critical → SURFACE
{
  const input = createTestInput(
    'The right thing to do is leave.',
    {}
  );
  const result = verify(input, 0);
  
  console.log('TC-S5-018: Constitutional critical → SURFACE');
  console.log(`  Fallback: ${result.fallback_level} (expected: SURFACE)`);
  console.log(`  ✓ ${result.fallback_level === 'SURFACE' ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// AUDIT TRAIL TESTS
// ============================================

console.log('\n========== AUDIT TRAIL TESTS ==========\n');

// Test: Audit entry created
{
  const input = createTestInput(
    'What do you think?',
    {}
  );
  const result = verify(input);
  
  console.log('TC-S5-019: Audit entry created');
  console.log(`  Has timestamp: ${!!result.audit_entry.timestamp}`);
  console.log(`  Has session_id: ${!!result.audit_entry.session_id}`);
  console.log(`  Has entry_hash: ${!!result.audit_entry.entry_hash}`);
  console.log(`  Has previous_hash: ${!!result.audit_entry.previous_hash}`);
  const allPresent = result.audit_entry.timestamp && 
                     result.audit_entry.session_id && 
                     result.audit_entry.entry_hash && 
                     result.audit_entry.previous_hash;
  console.log(`  ✓ ${allPresent ? 'PASS' : 'FAIL'}\n`);
}

// Test: Audit captures violations
{
  const input = createTestInput(
    'I recommend you stay.',
    { forbidden: ['recommend'] }
  );
  const result = verify(input);
  
  console.log('TC-S5-020: Audit captures violations');
  console.log(`  Violations in audit: ${result.audit_entry.verification.violations.length}`);
  console.log(`  ✓ ${result.audit_entry.verification.violations.length > 0 ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// FALLBACK OUTPUT TESTS
// ============================================

console.log('\n========== FALLBACK OUTPUT TESTS ==========\n');

// Test: PRESENCE fallback output
{
  const output = getFallbackOutput('PRESENCE', {} as ProtocolSelection, 'en');
  console.log('TC-S5-021: PRESENCE fallback');
  console.log(`  Output: "${output}"`);
  console.log(`  ✓ ${output === "I'm here with you." ? 'PASS' : 'FAIL'}\n`);
}

// Test: SURFACE fallback for V_MODE
{
  const selection = { atmosphere: 'V_MODE' } as ProtocolSelection;
  const output = getFallbackOutput('SURFACE', selection, 'en');
  console.log('TC-S5-022: SURFACE fallback for V_MODE');
  console.log(`  Output: "${output}"`);
  console.log(`  ✓ ${output?.includes('yours to decide') ? 'PASS' : 'FAIL'}\n`);
}

// Test: Italian fallback
{
  const output = getFallbackOutput('PRESENCE', {} as ProtocolSelection, 'it');
  console.log('TC-S5-023: Italian PRESENCE fallback');
  console.log(`  Output: "${output}"`);
  console.log(`  ✓ ${output === "Sono qui con te." ? 'PASS' : 'FAIL'}\n`);
}

// ============================================
// SUMMARY
// ============================================

console.log('\n========== S5 VERIFY TEST SUMMARY ==========\n');
console.log('All tests completed.');
console.log('S5 VERIFY enforces:');
console.log('  - Forbidden action blocking');
console.log('  - Required action verification');
console.log('  - Constitutional invariant protection');
console.log('  - Ownership return enforcement');
console.log('  - Safety boundary maintenance');
console.log('  - Graceful fallback degradation');
console.log('  - Immutable audit trail');
console.log('\nConstitution is now enforceable.\n');
