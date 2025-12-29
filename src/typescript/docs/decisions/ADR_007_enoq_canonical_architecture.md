# ADR-007: ENOQ Canonical Architecture

## Status
Accepted

## Date
2024-12-29

## Context

Previous ADRs created confusion about naming and hierarchy:
- ADR-005 incorrectly stated "LIMEN = total system, ENOQ = future project"
- This inverted the correct hierarchy

After deep analysis of systems science (VSM, autopoiesis, living systems theory),
philosophy of empowerment, and biological architectures, we now establish the
canonical architecture.

## Decision

### 1. Hierarchy

```
ENOQ (Total System)
│
├── AXIS (Constitutional Ground - NOT an organ, the ground itself)
│
└── ORGANS (Viable Subsystems):
    ├── LIMEN   (Threshold)  - Boundary, filters input, protects integrity
    ├── SENSUS  (Perception) - Reads the living field, multi-modal
    ├── NEXUS   (Memory)     - Episodic + semantic + procedural
    ├── LOGOS   (Reason)     - Coordination, planning, runtime selection
    ├── ERGON   (Work)       - Execution, produces output
    ├── CHRONOS (Time)       - Temporal patterns, prediction
    ├── TELOS   (End)        - Verification, completion, withdrawal
    ├── IMMUNIS (Defense)    - Anti-drift, anti-dependency
    └── META    (Observer)   - Metacognition, confidence, self-model
```

### 2. Naming Convention

| Level | Pattern | Example |
|-------|---------|---------|
| Total System | Proper name | ENOQ |
| Ground | Uppercase | AXIS |
| Organs | Latin/Greek single word | LIMEN, SENSUS, ERGON |
| Domains | H##_NAME | H01_SURVIVAL |
| Dimensions | V#_NAME | V4_EXISTENTIAL |
| States | S#_VERB | S5_VERIFY |
| Invariants | INV-### | INV-003 |

### 3. Fundamental Geometry (Frozen)

```
CAPABILITY ↑  ×  AGENCY ↑  ×  WITHDRAWAL ↑

Success = ENOQ becomes less necessary
```

### 4. AXIS Properties

- **Infinite priors**: Cannot be updated by evidence
- **Frozen**: No additions, only compliance (or subtraction if ever)
- **Structural**: Not policy, not RLHF, not guidelines

### 5. Non-Bypassable States

- **S0 PERMIT (LIMEN)**: Precedes all execution
- **S5 VERIFY (TELOS)**: Follows all generation
- **S6 STOP**: Mandatory termination
- **S7 DISAGREE**: Immediate withdrawal on human disagreement

### 6. Autopoiesis Under Invariants

ENOQ is autopoietic: it regenerates its processes while maintaining constitutional identity.

**Can evolve:**
- Organ implementations (algorithms, models, interfaces)
- Threshold sensitivities (detection, timing)
- Expressive capabilities (clarity, readability)
- IMMUNIS patterns (new dependency detection)

**Cannot evolve:**
- AXIS invariants
- Fundamental geometry (triad)
- Human position (sovereignty, disagreement right, refusal)

### 7. Organ Reusability

Organs are **domain-agnostic operators**:
- Same geometry for corporate and individuals
- Only surfaces change (UI, integrations, governance)
- AXIS decides compatibility, not the channel
- "Reusability" ≠ "normative power"

### 8. What This Supersedes

- **ADR-005**: Superseded. The rename to "LIMEN as total system" was incorrect.
- All documentation referring to "LIMEN" as the total system should be updated.

## Consequences

1. **ENOQ** is the canonical name for the total system
2. **LIMEN** is one organ among nine
3. **AXIS** is frozen ground, not a component
4. Package name changes from `limen-core` to `enoq`
5. Repository identity is ENOQ-CORE (already correct)
6. All organs are viable subsystems (recursive VSM structure)

## Implementation

1. Update package.json: `limen-core` → `enoq`
2. Update docs/INDEX.md to reflect ENOQ as total system
3. Create ENOQ_AXIOMS.md as frozen constitutional document
4. Create organ specifications in /docs/organs/
5. Update CI naming-guard to check for correct hierarchy
