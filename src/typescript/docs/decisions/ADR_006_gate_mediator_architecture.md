# ADR-006: GATE-MEDIATOR Architecture

## Status
Accepted

## Date
2024-12-28

## Context

LIMEN is a cognitive control system. The previous structure mixed operational and normative concerns across epistemic layers. We needed a cleaner separation that reflects the system's actual cognitive architecture.

## Decision

LIMEN is now composed of three primary subsystems:

```
LIMEN (the system)
├── GATE         - Normative gating & inhibitory control (thalamic-style)
├── MEDIATOR     - Cognitive mediation engine (L0-L5)
├── RUNTIMES     - Optional execution layers (e.g., ENOQ)
└── INTERFACE    - Shared contracts and types
```

### GATE (Normative Control)
The gate provides inhibitory and regulatory control:
- `gate/invariants/` - Constitutional constraints (axis.ts)
- `gate/thresholds/` - Gating thresholds (llm_cache.ts)
- `gate/emergency/` - Crisis detection and handling
- `gate/withdrawal/` - Regulatory and lifecycle control
- `gate/verification/` - S5 verification, plan-act verifier
- `gate/geometry_normative/` - Domain governor, second-order observer, ADS detector
- `gate/geometry_operational/` - Unified gating, NP gating, scientific gating

### MEDIATOR (Cognitive Processing)
The mediator processes information through L0-L5 layers:
- `mediator/l0_intake/` - Dimensional detection, LLM providers, early signals
- `mediator/l1_clarify/` - Perception
- `mediator/l2_reflect/` - Selection, stochastic field, dissipation
- `mediator/l3_integrate/` - Meta-kernel, disciplines synthesis
- `mediator/l4_agency/` - Total system, agent swarm, memory, temporal engine
- `mediator/l5_transform/` - Generation, plan rendering, response planning
- `mediator/concrescence/` - Whiteheadian process integration

### RUNTIMES (Execution Layers)
Optional user-facing implementations:
- `runtimes/enoq/pipeline/` - ENOQ pipeline and L2 execution
- `runtimes/enoq/io/` - CLI, server, interactive session

### INTERFACE (Contracts)
- `interface/types.ts` - Shared type definitions

## Dependency Rules

**CRITICAL**: gate/ MUST NOT import from mediator/ or runtimes/

This ensures the gate can enforce constraints without being influenced by the cognitive layers it regulates.

```
interface/ <── gate/ <── mediator/ <── runtimes/
```

## Canonical Sentence

> LIMEN is a cognitive control system composed of a normative gate and a cognitive mediator, with optional runtimes such as ENOQ.

## Consequences

- Clear separation of normative vs operational concerns
- Gate can be tested independently
- Mediator layers are explicit and auditable
- Runtimes are pluggable
- Import structure enforces architectural boundaries
