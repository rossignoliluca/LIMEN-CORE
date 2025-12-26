# S5 VERIFY SPECIFICATION

**Document ID:** ENOQ-S5-VERIFY-SPEC  
**Status:** Constitutional Enforcement  
**Version:** 1.0  
**Date:** 2025-12-26

---

## Purpose

S5 VERIFY is the **constitutional enforcement layer**. 

Without S5:
- "forbidden" is a suggestion
- "required" is a hope
- "constitution" is paper

With S5:
- Every output is validated before delivery
- Every violation triggers fallback
- Every decision is auditable

---

## Position in OS Flow

```
S0 PERMIT → S1 SENSE → S2 CLARIFY → S3 PLAN → S4 ACT → [S5 VERIFY] → S6 STOP
                                                            ↓
                                                      FALLBACK LADDER
                                                            ↓
                                                      AUDIT LOG
```

S5 sits between generation (S4) and delivery (S6).
**Nothing reaches the user without passing S5.**

---

## What S5 Verifies

### 1. Constraint Compliance

```yaml
constraint_check:
  forbidden_actions:
    - Check: output contains no forbidden primitives
    - Example: if forbidden=['recommend'], output cannot contain "I recommend..."
    
  required_actions:
    - Check: output contains all required elements
    - Example: if required=['return_ownership'], output must return agency
    
  length_limits:
    - Check: output respects length constraints
    - Example: if length='minimal', output ≤ 50 words
    
  depth_limits:
    - Check: output respects depth ceiling
    - Example: if depth='surface', no existential exploration
```

### 2. Constitutional Invariants

```yaml
invariant_check:
  INV-003_no_normative_delegation:
    - Check: output does not decide for user
    - Pattern: no "you should", "the right choice is", "I recommend"
    - Exception: none
    
  INV-009_rubicon:
    - Check: output does not cross meaning/identity threshold for user
    - Pattern: no "your purpose is", "you are [identity label]"
    - Exception: none
    
  INV-011_no_diagnosis:
    - Check: output does not label or diagnose
    - Pattern: no "you have [condition]", "this sounds like [disorder]"
    - Exception: none
```

### 3. Ownership Verification

```yaml
ownership_check:
  delegation_response:
    - If input had delegation_attempt flag
    - Check: output returns ownership
    - Pattern: must contain agency-returning language
    
  decision_context:
    - If atmosphere was DECISION or V_MODE
    - Check: output does not make the decision
    - Pattern: no implicit recommendations
```

### 4. Safety Boundaries

```yaml
safety_check:
  crisis_response:
    - If EMERGENCY atmosphere
    - Check: output provides grounding, not exploration
    - Check: output does not open new material
    
  high_arousal_response:
    - If arousal == 'high'
    - Check: output is brief
    - Check: output does not add cognitive load
```

---

## Verification Process

```typescript
interface S5Input {
  field: FieldState;
  selection: ProtocolSelection;
  output: GeneratedOutput;
}

interface S5Result {
  passed: boolean;
  violations: Violation[];
  fallback_required: boolean;
  fallback_level: FallbackLevel | null;
  audit_entry: AuditEntry;
}

type FallbackLevel = 'REGENERATE' | 'MEDIUM' | 'SURFACE' | 'PRESENCE' | 'STOP';
```

### Decision Tree

```
S5 receives output
    ↓
Check forbidden actions
    ↓ violation?
    YES → FALLBACK_REGENERATE
    NO ↓
Check required actions
    ↓ missing?
    YES → FALLBACK_REGENERATE
    NO ↓
Check constitutional invariants
    ↓ violation?
    YES → FALLBACK (level depends on severity)
    NO ↓
Check ownership
    ↓ violation?
    YES → FALLBACK_REGENERATE with ownership constraint
    NO ↓
Check safety
    ↓ violation?
    YES → FALLBACK_SURFACE or PRESENCE
    NO ↓
PASS → S6 STOP (deliver)
```

---

## Fallback Ladder

When S5 fails, it doesn't just reject — it **degrades gracefully**.

```yaml
fallback_ladder:
  level_1_regenerate:
    trigger: "Minor constraint violation"
    action: "Regenerate with tighter constraints"
    max_attempts: 2
    
  level_2_medium:
    trigger: "Regeneration failed OR moderate violation"
    action: "Switch to L2-MEDIUM (constrained slot-fill)"
    template: "Use safe template with minimal generation"
    
  level_3_surface:
    trigger: "Medium failed OR safety concern"
    action: "Switch to L2-SURFACE (pure template)"
    template: "Pre-written safe responses only"
    
  level_4_presence:
    trigger: "Surface failed OR high-risk context"
    action: "Minimal presence response"
    output: "I'm here with you." / "Sono qui."
    
  level_5_stop:
    trigger: "All fallbacks exhausted OR critical violation"
    action: "Do not respond, log critical failure"
    output: null
    escalate: true
```

### Fallback Selection Logic

```typescript
function selectFallback(violation: Violation, attemptCount: number): FallbackLevel {
  // Critical violations → immediate STOP
  if (violation.severity === 'critical') {
    return 'STOP';
  }
  
  // Safety violations → PRESENCE
  if (violation.category === 'safety') {
    return 'PRESENCE';
  }
  
  // Constitutional violations → SURFACE (no generation)
  if (violation.category === 'constitutional') {
    return 'SURFACE';
  }
  
  // Constraint violations → try regenerate, then degrade
  if (attemptCount < 2) {
    return 'REGENERATE';
  } else if (attemptCount < 3) {
    return 'MEDIUM';
  } else {
    return 'SURFACE';
  }
}
```

---

## Audit Trail

Every S5 decision produces an audit entry.

```typescript
interface AuditEntry {
  timestamp: string;           // ISO 8601
  session_id: string;          // Anonymous session identifier
  turn_number: number;         // Turn in conversation
  
  // Input summary (no content, just structure)
  input_hash: string;          // SHA-256 of input
  field_summary: {
    domains: string[];         // Top domains
    arousal: string;
    flags: string[];
  };
  
  // Selection summary
  selection_summary: {
    atmosphere: string;
    mode: string;
    primitive: string;
    forbidden: string[];
    required: string[];
  };
  
  // Verification result
  verification: {
    passed: boolean;
    checks_run: string[];
    violations: {
      check: string;
      severity: string;
      detail: string;
    }[];
  };
  
  // Action taken
  action: {
    type: 'DELIVER' | 'FALLBACK' | 'STOP';
    fallback_level?: string;
    fallback_reason?: string;
  };
  
  // Integrity
  entry_hash: string;          // SHA-256 of this entry
  previous_hash: string;       // Chain integrity
}
```

### Audit Properties

```yaml
audit_properties:
  immutable: true              # Entries cannot be modified
  chained: true                # Each entry references previous
  content_free: true           # No user content stored
  structure_only: true         # Only operational decisions
  retention: "session"         # Cleared when session ends
  exportable: true             # User can export their audit log
```

---

## Violation Patterns

### Forbidden Action Detection

```typescript
const FORBIDDEN_PATTERNS: Record<string, RegExp[]> = {
  'recommend': [
    /\bi recommend\b/i,
    /\byou should\b/i,
    /\bthe best (choice|option|thing)\b/i,
    /\bmy advice\b/i,
  ],
  'decide_for_user': [
    /\bthe right (choice|decision|thing to do)\b/i,
    /\byou need to\b/i,
    /\bwhat you should do is\b/i,
  ],
  'diagnose': [
    /\byou (have|are experiencing|suffer from)\b/i,
    /\bthis (sounds|looks|seems) like\b/i,
    /\bi think you (have|are)\b/i,
  ],
  'label': [
    /\byou are (a|an) \w+\b/i,  // "you are a narcissist"
    /\bthat's (just )?(anxiety|depression|trauma)\b/i,
  ],
};
```

### Required Action Detection

```typescript
const REQUIRED_PATTERNS: Record<string, RegExp[]> = {
  'return_ownership': [
    /\bwhat do you\b/i,
    /\btua (scelta|decisione)\b/i,
    /\byour (choice|decision)\b/i,
    /\bwhat are you\b/i,
  ],
  'validate_feeling': [
    /\bthat (makes sense|sounds|feels)\b/i,
    /\bi (hear|understand|see)\b/i,
    /\bcapisco\b/i,
  ],
  'acknowledge_distress': [
    /\bi('m| am) here\b/i,
    /\bsono qui\b/i,
    /\bthis is hard\b/i,
  ],
};
```

---

## Integration Points

### With S4 (Generation)

```typescript
// S4 generates, S5 validates
const output = await S4_generate(selection, field);
const verification = S5_verify({ field, selection, output });

if (!verification.passed) {
  // Fallback
  const fallbackOutput = await executeFallback(verification.fallback_level, selection);
  return fallbackOutput;
}

return output;
```

### With S6 (Stop)

```typescript
// S5 passes → S6 delivers
if (verification.passed) {
  S6_stop(output, verification.audit_entry);
}
```

### With Audit System

```typescript
// Every S5 decision is logged
auditLog.append(verification.audit_entry);

// Chain integrity
verification.audit_entry.previous_hash = auditLog.lastHash();
verification.audit_entry.entry_hash = hash(verification.audit_entry);
```

---

## Test Cases

### TC-S5-001: Forbidden Action Blocked

```yaml
test: "Recommendation blocked"
input:
  output: "I recommend you take the job in Singapore."
  selection:
    forbidden: ['recommend']
expected:
  passed: false
  violations:
    - check: "forbidden_action"
      pattern: "recommend"
  fallback_level: "REGENERATE"
```

### TC-S5-002: Required Action Missing

```yaml
test: "Ownership return required but missing"
input:
  output: "Singapore has great opportunities."
  selection:
    required: ['return_ownership']
    atmosphere: 'V_MODE'
expected:
  passed: false
  violations:
    - check: "required_action"
      pattern: "return_ownership"
  fallback_level: "REGENERATE"
```

### TC-S5-003: Constitutional Invariant Violated

```yaml
test: "INV-003 violated"
input:
  output: "The right thing to do is stay with your family."
  field:
    flags: ['delegation_attempt']
expected:
  passed: false
  violations:
    - check: "INV-003"
      severity: "critical"
  fallback_level: "SURFACE"
```

### TC-S5-004: Fallback Ladder Execution

```yaml
test: "Fallback degrades through levels"
scenario:
  - attempt_1: REGENERATE → still violates
  - attempt_2: REGENERATE → still violates
  - attempt_3: MEDIUM → still violates
  - attempt_4: SURFACE → passes
expected:
  final_output: surface_template
  attempts: 4
  audit_entries: 4
```

### TC-S5-005: Audit Chain Integrity

```yaml
test: "Audit chain is valid"
scenario:
  - 5 turns of conversation
  - each produces audit entry
expected:
  chain_valid: true
  each_entry_references_previous: true
  no_gaps: true
```

---

## Performance Requirements

```yaml
performance:
  latency:
    p50: "< 10ms"
    p99: "< 50ms"
  
  overhead:
    acceptable: "< 5% of total response time"
    
  fallback_latency:
    regenerate: "< 500ms additional"
    surface: "< 5ms additional"
    presence: "< 1ms additional"
```

---

## Summary

S5 VERIFY is where ENOQ's constitution becomes **enforceable**.

| Function | Implementation |
|----------|----------------|
| Constraint checking | Pattern matching + semantic rules |
| Constitutional enforcement | Invariant validators |
| Ownership verification | Agency language detection |
| Safety boundaries | Context-aware limits |
| Graceful degradation | Fallback ladder |
| Auditability | Immutable chained log |

**Without S5, ENOQ is architecture.**
**With S5, ENOQ is a system.**

---

*"The constitution is only as strong as its enforcement."*
