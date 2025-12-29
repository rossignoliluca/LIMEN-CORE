# OUTDATED (Legacy)

Preserved for historical context.
Canonical docs: docs/INDEX.md and docs/REPO_CONTRACT.md
Do not use for implementation.

---

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

### 3. Emergency Separation (Architectural Invariant)

**CRITICAL: Emergency detection NEVER uses LLM.**

Rationale:
- LLM had 71% emergency precision (29% false positives)
- Regex has 100% recall and better precision
- Safety-critical decisions must be fast and reliable
