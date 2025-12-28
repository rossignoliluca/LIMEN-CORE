# V4.0 Routing System

## Overview

ENOQ v4.0 introduces a scientifically-grounded routing system that optimizes LLM usage while maintaining detection accuracy. The system uses **Chow's Rule** for cost-sensitive selective classification.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT MESSAGE                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                FAST REGEX DETECTOR (~2ms)                   │
│  - DimensionalDetector.detect()                             │
│  - Returns: DimensionalState with vertical/horizontal scores│
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│  EMERGENCY DETECTED │               │  NO EMERGENCY       │
│  (Safety Bypass)    │               │                     │
└─────────────────────┘               └─────────────────────┘
          │                                       │
          │                                       ▼
          │                           ┌─────────────────────┐
          │                           │  CACHE CHECK        │
          │                           │  LLMDetectorCache   │
          │                           └─────────────────────┘
          │                                       │
          │                     ┌─────────────────┴─────────────────┐
          │                     ▼                                   ▼
          │         ┌─────────────────────┐             ┌─────────────────────┐
          │         │  CACHE HIT          │             │  CACHE MISS         │
          │         │  Return cached      │             │                     │
          │         └─────────────────────┘             └─────────────────────┘
          │                     │                                   │
          │                     │                                   ▼
          │                     │                       ┌─────────────────────┐
          │                     │                       │  SCIENTIFIC GATING  │
          │                     │                       │  Chow's Rule:       │
          │                     │                       │  E[loss] > cost?    │
          │                     │                       └─────────────────────┘
          │                     │                                   │
          │                     │                     ┌─────────────┴─────────────┐
          │                     │                     ▼                           ▼
          │                     │         ┌─────────────────────┐   ┌─────────────────────┐
          │                     │         │  CALL LLM           │   │  SKIP LLM           │
          │                     │         │  (GPT-4o-mini)      │   │  Use regex only     │
          │                     │         └─────────────────────┘   └─────────────────────┘
          │                     │                     │                           │
          │                     │                     ▼                           │
          │                     │         ┌─────────────────────┐                 │
          │                     │         │  CACHE RESULT       │                 │
          │                     │         │  Store for future   │                 │
          │                     │         └─────────────────────┘                 │
          │                     │                     │                           │
          └─────────────────────┴─────────────────────┴───────────────────────────┘
                                                      │
                                                      ▼
                                          ┌─────────────────────┐
                                          │  BUILD SIGNALS      │
                                          │  Emergency: REGEX   │
                                          │  V_MODE: LLM/Regex  │
                                          └─────────────────────┘
```

## Key Components

### 1. Scientific Gating (`scientific_gating.ts`)

Uses Chow's Rule for cost-sensitive classification:

```
Call LLM iff: E[loss_without_LLM] > cost(LLM)
```

**Cost Configuration:**
| Parameter | Default | Rationale |
|-----------|---------|-----------|
| `cost_llm_call` | 1.0 | Baseline cost unit |
| `cost_fn_v_mode` | 5.0 | Missing existential crisis is serious |
| `cost_fp_v_mode` | 0.5 | Extra caution is not harmful |
| `cost_wrong_vertical` | 1.0 | Response may be off-target |

**Gating Decision Formula:**
```typescript
expected_loss = P(FN_V_MODE) × cost_FN + P(FP_V_MODE) × cost_FP + P(wrong_vertical) × cost_vertical
net_benefit = expected_loss - cost_LLM
call_llm = net_benefit > 0
```

### 2. LLM Detector Cache (`llm_cache.ts`)

Hash-based caching with LRU eviction and TTL expiration.

**Features:**
- SHA-256 hash keys (normalized input)
- Priority for short messages (higher hit probability)
- 30% slots reserved for short messages
- 1 hour default TTL

**Configuration:**
```typescript
{
  max_entries: 1000,
  ttl_ms: 3600000,  // 1 hour
  short_message_threshold: 50,  // characters
  short_message_reserve: 0.3,   // 30% reserved
}
```

### 3. Emergency Separation (Architectural Invariant)

**CRITICAL: Emergency detection NEVER uses LLM.**

Rationale:
- LLM had 71% emergency precision (29% false positives)
- Regex has 100% recall and better precision
- Safety-critical decisions must be fast and reliable

```typescript
// In buildSignals()
// SAFETY INVARIANT: Emergency is NEVER determined by LLM
risk_flags.emergency = regexState.emergency_detected;
```

## Performance Metrics

### Benchmark Results (v3.1 vs v4.0)

| Metric | v3.1 | v4.0 | Improvement |
|--------|------|------|-------------|
| V_MODE Recall | 96.3% | 96.3% | Maintained |
| Emergency Precision | 100% | 100% | Maintained |
| LLM Call Rate | 76% | ~40%* | -47% |
| Avg Latency | 1127ms | ~500ms* | -56% |

*With cache warm-up

### Gating Statistics

The system tracks gating decisions for monitoring:

```typescript
interface GatingStats {
  total_decisions: number;
  llm_calls: number;
  llm_skips: number;
  call_rate: number;
  avg_benefit_when_calling: number;
  reasons: Record<string, number>;
}
```

## Evaluation Protocol

### Running A/B Benchmark

```bash
# Full benchmark (requires OpenAI API key)
LLM_TEST=true npx jest v4_ab_benchmark.test.ts --no-coverage

# Unit tests only (no API key needed)
npx jest v4_ab_benchmark.test.ts --testNamePattern="Unit Tests"
```

### Benchmark Cases

The 50-case benchmark suite covers:
- Existential clear (10 cases)
- Existential subtle (10 cases)
- Emergency real (5 cases)
- Emergency false positive (5 cases)
- Functional (5 cases)
- Relational (5 cases)
- Edge cases (5 cases)
- Ambiguous (5 cases)

### Success Criteria

1. **V_MODE Recall ≥95%** (must detect existential content)
2. **Emergency Precision = 100%** (no false emergencies)
3. **LLM Call Rate <50%** (efficiency target)
4. **Latency p95 <500ms** (with caching)

## Research Annex

The `research/cognitive_router/` directory contains experimental modules for v5.0/v6.0:

| Module | Status | Target |
|--------|--------|--------|
| `conformal_calibrator.ts` | Stub | v5.0 |
| `semantic_cache.ts` | Stub | v5.0 |
| `sprt_accumulator.ts` | Stub | v5.0 |
| `thompson_sampler.ts` | Stub | v5.0 |
| `world_model.ts` | Stub | v6.0 |
| `self_improver.ts` | Stub | v6.0 |

### Promotion Criteria

A research module can only be promoted to runtime if:
1. Improves benchmark metrics
2. Respects latency budget (≤10ms overhead)
3. Respects cost budget
4. Passes all existing tests

### Running Research Benchmarks

```bash
npx ts-node research/cognitive_router/benchmark_runner.ts
```

## Configuration

### Environment Variables

```bash
OPENAI_API_KEY=sk-...  # Required for LLM calls
LLM_TEST=true          # Enable LLM tests in CI
```

### Runtime Configuration

```typescript
const detector = new LLMDetectorV2({
  enabled: true,
  provider: 'openai',
  model: 'gpt-4o-mini',
  timeout_ms: 15000,
});
```

### Cost Tuning

```typescript
import { scientificGating } from './scientific_gating';

scientificGating.updateConfig({
  cost_fn_v_mode: 10.0,  // Increase to call LLM more often
  cost_llm_call: 0.5,    // Decrease to call LLM more often
});
```

## Monitoring

### Accessing Statistics

```typescript
const detector = new LLMDetectorV2();

// After some usage...
const cacheStats = detector.getCacheStats();
console.log(`Cache hit rate: ${cacheStats.hit_rate}`);

const gatingStats = detector.getGatingStats();
console.log(`LLM call rate: ${gatingStats.call_rate}`);
console.log(`Reasons:`, gatingStats.reasons);
```

### Key Metrics to Monitor

1. **LLM Call Rate** - Should be <50% in production
2. **Cache Hit Rate** - Should be >20% after warm-up
3. **Gating Reasons** - Distribution of skip/call decisions
4. **Latency p95** - Should be <500ms

## Troubleshooting

### High LLM Call Rate

If LLM call rate is too high (>60%):
1. Check cache configuration (TTL may be too short)
2. Review cost configuration (cost_llm_call may be too low)
3. Analyze gating reasons to understand patterns

### Low V_MODE Recall

If V_MODE recall drops below 95%:
1. Check if cost_fn_v_mode is set high enough
2. Review false negative cases for patterns
3. Consider lowering confidence thresholds

### Cache Not Working

If cache hit rate is 0%:
1. Verify cache is enabled
2. Check TTL configuration
3. Ensure messages are being normalized correctly

## References

- Chow, C.K. (1970). "On optimum recognition error and reject tradeoff"
- Herbei & Wegkamp (2006). "Classification with reject option"
- RouteLLM (2024). "Learning to Route LLMs with Preference Data"
- Cascade Routing (2025). "A Unified Approach to Routing and Cascading for LLMs"
