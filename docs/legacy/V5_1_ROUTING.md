# OUTDATED (Legacy)

Preserved for historical context.
Canonical docs: docs/INDEX.md and docs/REPO_CONTRACT.md
Do not use for implementation.

---

# V5.1 Unified Routing System

## Overview

ENOQ v5.1 introduces **Unified Gating**, a single routing point that combines three gating strategies for optimal LLM call reduction while maintaining 100% V_MODE recall.

**Key Results:**
- **31% LLM call rate** on realistic traffic (69% skip)
- **0 missed** V_MODE or emergency cases
- **100% call reduction** on cache replay

## Architecture

```
INPUT → FAST REGEX → UNIFIED GATING → [LLM or SKIP] → PIPELINE
```

## Key Components

### 1. Unified Gating (`unified_gating.ts`)

Single entry point that combines all gating strategies:
- STAGE 0: Safety invariants (emergency/v_mode bypass)
- STAGE 1: Cache lookup
- STAGE 2: Hard skip rules
- STAGE 3: NP gating (Neyman-Pearson)

### 2. Hard Skip Rules

Conservative patterns for obvious non-existential input:
- Factual questions
- Operational requests
- Acknowledgments
- Greetings

### 3. NP Gating (`np_gating.ts`)

Neyman-Pearson constrained classification:
```
A(x) = lexicon_boost + vertical_score + entropy_term
Call LLM if A(x) > τ (0.85)
```

## Invariants

1. Emergency → BYPASS (never calls LLM)
2. V_MODE triggered → BYPASS
3. Anti-skip patterns block hard skip
4. Cache preserves safety flags
