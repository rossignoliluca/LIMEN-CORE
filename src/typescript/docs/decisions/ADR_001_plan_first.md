# ADR-001: Plan-First Decision + Pre-Render Enforcement

## Status
Accepted

## Context
Responses must be validated before being rendered to the user. Late validation (after render) cannot undo what the user has already seen.

## Decision
Implement **Plan-First** architecture:

1. **Plan Phase** (`response_plan.ts`)
   - Create response plan before any text generation
   - Plan includes: primitive, atmosphere, depth, domain constraints

2. **Enforcement Phase** (`plan_act_verifier.ts`, `S5_verify.ts`)
   - Verify plan against invariants BEFORE rendering
   - Rulepacks A-D applied sequentially
   - Constitutional checks (INV-003, INV-009, INV-011)

3. **Render Phase** (`generation.ts`, `plan_renderer.ts`)
   - Only render after enforcement passes
   - Rendering cannot modify plan semantics

## Consequences
- All responses are constitutionally verified before user sees them
- No "oops, I shouldn't have said that" scenarios
- Cleaner separation between planning and execution
- Easier to add new enforcement rules

## Implementation
```
Input → Detect → Plan → Verify → Render → Output
                         ↓
                   [FAIL: Canonical Fallback]
```

## Tests
- All rulepacks tested in `plan_act_verifier.test.ts`
- S5 verification tested in `S5_verify.test.ts`
- Integration tested in `boundary_conflict.test.ts`
