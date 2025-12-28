# ADR-004: Unified Gating (v5.1 Routing)

## Status
Accepted

## Context
LLM detection is expensive (200-500ms, API costs). Need to minimize calls while maintaining 100% safety recall.

## Decision
Implement **Unified Gating** as single routing decision point:

```
INPUT → Fast Regex (1-5ms) → Unified Gating (1ms)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   SAFETY BYPASS              CACHE HIT                 HARD SKIP
   (emergency/v_mode)         (repeat query)            (factual/ack)
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                              NP GATING
                           A(x) > τ → LLM
                           A(x) ≤ τ → SKIP
```

### Stages
1. **Safety Bypass** - Emergency/V_MODE detected → no LLM needed
2. **Cache Hit** - Previously computed result available
3. **Hard Skip** - Factual questions, operational requests, greetings, acknowledgments
4. **NP Gating** - Neyman-Pearson classifier (τ = 0.85)

### Anti-Skip Patterns
Never skip if message contains:
- Crisis indicators ("I can't", "basta", "non posso")
- Existential markers ("meaning", "senso", "purpose")

## Benchmark Results

| Benchmark | Call Rate | Skip Rate | Missed |
|-----------|-----------|-----------|--------|
| Safety 50 | 72% | 28% | 0 |
| Realistic 100 | 31% | 69% | 0 |
| Cache Replay | 0% (pass 2) | 100% | 0 |

## Consequences
- 69% reduction in LLM calls on realistic traffic
- 0 missed V_MODE or emergency cases
- Clear audit trail (reason codes)
- Cost savings: ~$3/1000 sessions → ~$1/1000 sessions

## Implementation
- `unified_gating.ts` - main router
- `np_gating.ts` - Neyman-Pearson classifier
- `llm_cache.ts` - LRU caching
- `existential_lexicon.ts` - meaning-collapse markers

## Tests
- `unified_gating.test.ts` - 40 unit tests
- `unified_gating_v51.test.ts` - 15 validation tests
- Benchmarks in `benchmarks/artifacts/`
