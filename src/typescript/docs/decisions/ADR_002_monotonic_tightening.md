# ADR-002: Monotonic Tightening + Canonical Fallbacks

## Status
Accepted

## Context
When multiple enforcement rules apply, the system needs a consistent way to combine them. Loosening constraints at any step would violate safety guarantees.

## Decision
Implement **Monotonic Tightening**:

1. **Constraints can only tighten, never loosen**
   - If Rulepack A says `disable_tools: true`, Rulepack B cannot set it to `false`
   - Warmth can only decrease (cooling), never artificially increase
   - Brevity can only increase (shorter), never artificially decrease

2. **Policy Merge Chain**
   ```
   Base Policy → ADS (HARD) → Second Order (SOFT) → Final Policy
   ```
   - OR for booleans (any `true` stays `true`)
   - MIN for brevity_delta (more restrictive wins)
   - SUM clamped for warmth_delta (bounded to [-1, +1])

3. **Canonical Fallbacks** (`S5_verify.ts`)
   - If all else fails, use pre-defined safe responses
   - Fallback levels: L1 (minimal change) → L4 (constitutional fallback)
   - Canonical response: "Non ho le risorse per rispondere a questo in modo appropriato."

## Consequences
- Safety is preserved through monotonicity
- No race conditions in constraint application
- Always have a safe fallback path
- Users can trust that constraints are never relaxed

## Invariants Preserved
- INV-003: Minimum AUTONOMY_DELTA always respected
- INV-009: No emotional manipulation (warmth bounded)
- INV-011: Constitutional verification always runs

## Tests
- `regulatory_integration.test.ts` - policy merge
- `boundary_conflict.test.ts` - monotonic tightening
- `v3_deadline_fallback.test.ts` - canonical fallbacks
