# ADR-003: Research Isolation + Promotion Gate

## Status
Accepted

## Context
Experimental code should not affect production stability. Research modules need freedom to experiment without risking runtime integrity.

## Decision
Implement **Research Isolation**:

1. **Directory Structure**
   ```
   src/
   ├── theory/           # Proven theories, stable
   ├── control/          # Production control logic
   ├── runtime/          # Production orchestration
   ├── research/         # Experiments, NEVER imported
   │   ├── cognitive_router/
   │   └── genesis/
   └── benchmarks/       # Test cases and artifacts
   ```

2. **Import Rules (HARD)**
   - `runtime` MUST NOT import from `research`
   - `control` MUST NOT import from `research`
   - `theory` MUST NOT import from `research`
   - `research` may import anything

3. **Promotion Gate**
   To promote code from `research/` to production:
   - [ ] Run benchmark against 50-case safety suite
   - [ ] Verify improvement in target metrics
   - [ ] Verify latency budget (<500ms p95)
   - [ ] Verify cost budget (<$5/1000 sessions)
   - [ ] Verify all invariants preserved
   - [ ] CI must be green
   - [ ] Code review required

## Consequences
- Research code cannot break production
- Clear path from experiment to production
- Metrics-driven promotion decisions
- Historical experiments preserved for reference

## Current Research Modules
- `cognitive_router/` - v5.0/v6.0 gating experiments
- `genesis/` - Self-improvement experiments (NEVER for production)

## Tests
- Import graph analysis validates isolation
- CI blocks any `research/` imports in production code
