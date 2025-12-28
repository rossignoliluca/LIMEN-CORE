# ADR-000: Two Geometries + Threshold

## Status
Accepted

## Context
The system requires separation between operational decisions (routing, caching, detection) and normative decisions (enforcement, constitutional constraints). Mixing these concerns leads to:
- Unclear responsibility boundaries
- Difficulty reasoning about safety guarantees
- Coupling between optimization and invariants

## Decision
Implement **Two Geometries** architecture:

### Geometry Operational (`control/geometry_operational/`)
- Routing decisions (`routing/unified_gating.ts`, `routing/np_gating.ts`)
- Caching (`caching/llm_cache.ts`)
- Detection (`detectors/dimensional_system.ts`, `detectors/ultimate_detector.ts`)
- LLM providers (`providers/llm_provider.ts`, `providers/gate_client.ts`)

### Geometry Normative (`control/geometry_normative/`)
- Constitutional enforcement (`enforcement/axis.ts`, `enforcement/S5_verify.ts`)
- Plan verification (`enforcement/plan_act_verifier.ts`)
- Domain governance (`enforcement/domain_governor.ts`)
- Second-order observation (`observers/second_order_observer.ts`, `observers/ads_detector.ts`)
- Regulatory rules (`regulation/lifecycle_controller.ts`, `regulation/regulatory_store.ts`)

### Import Rules (HARD)
- `geometry_normative` MUST NOT import from `geometry_operational` (except shared types)
- `runtime` MUST NOT import from `research`
- `control` MUST NOT import from `research`
- `research` may import anything

### Threshold
The threshold between geometries is the `DimensionalState` type - operational geometry computes it, normative geometry constrains responses based on it.

## Consequences
- Clear separation of concerns
- Safety invariants can be reasoned about independently
- Optimization work doesn't affect normative constraints
- Testing can focus on each geometry separately

## Tests
- Import graph analysis validates no cross-geometry imports
- All invariants (INV-003, INV-009, INV-011) verified in geometry_normative tests
