# ENOQ-CORE

**Constitutional Cognitive Companion**

> *Maximum operational power. Zero normative sovereignty.*

---

## What is ENOQ?

ENOQ is an intelligent organism that facilitates human completion without creating dependency.

**ENOQ can:**
- Do everything operationally (write, analyze, structure, execute)
- See everything about the field (emotions, domains, patterns)

**ENOQ cannot:**
- Decide what matters for you
- Define your identity
- Assign your purpose
- Recommend what you should do

This is not a limitation. It is the architecture.

---

## The Paradox (Conservation Law)

```
∀ ΔP_operativa → L_normativa = 0 (invariant)
```

Every time operational power increases, normative sovereignty remains **structurally zero**.

**Three Acts:**

| Act | Level | Nature |
|-----|-------|--------|
| **SEE** | L1 | Always (perceive field) |
| **DO** | L2 | Delegable (execute tasks) |
| **DECIDE** | Human | Never delegable |

---

## Architecture

```
AXIS (immutable principles)
    ↓
CONSTITUTION (declared constraints)
    ↓
L0 GATE (4 guardrails, pre-LLM)
    ↓
L0.5 META-KERNEL (power governor)
    ↓
DOMAIN GOVERNOR (coexistence rules)
    ↓
L1 FIELD COMPILER (perception → constraints)
    ↓
L2 EXECUTION (multi-domain, blind)
    ↓
S5 VERIFY (constitutional enforcement)
    ↓
S6 STOP (return to human)
```

---

## Core Components

### L1 - Perception Pipeline
Detects domains, arousal, coherence, and flags.
Produces FieldState — never shared with L2.

### Domain Governor
20 rules managing coexistence between domains.
Ensures SURVIVAL > SAFETY > EMOTION > MEANING...

### MetaKernel (L0.5)
Content-blind power governor.
Reads telemetry, controls knobs.
Power is permissioned, not automatic.

### L2 - Execution Engine
Multi-domain doing. Powerful but blind.
Three modes: SURFACE (0 LLM) | MEDIUM | DEEP

### S5 - Constitutional Enforcement
Validates every output. Blocks violations.
Fallback ladder: REGENERATE → MEDIUM → SURFACE → PRESENCE

---

## Key Files

### Specifications

| File | Description |
|------|-------------|
| `docs/AXIS.md` | Immutable principles |
| `docs/CONSTITUTION.md` | Declared constraints |
| `docs/META_KERNEL_CONTRACT.md` | Telemetry → knobs |
| `docs/DOMAIN_GOVERNOR_MATRIX.md` | 20 coexistence rules |
| `docs/L2_EXECUTION_CONTEXT.md` | L1 → L2 contract |
| `docs/S5_VERIFY_SPEC.md` | Constitutional enforcement |
| `docs/V-MODE-SPEC.md` | Normative delegation handling |

### Implementation

| File | Description | Tests |
|------|-------------|-------|
| `src/perception.ts` | Domain/arousal detection | 13/13 |
| `src/selection.ts` | Mode/atmosphere routing | Built-in |
| `src/domain_governor.ts` | Coexistence rules | Built-in |
| `src/meta_kernel.ts` | Power governance | 14/14 |
| `src/l2_execution.ts` | Multi-domain execution | 13/13 |
| `src/S5_verify.ts` | Constitutional enforcement | 23/23 |
| `src/generation.ts` | Template generation | Built-in |

---

## Quick Start

```bash
cd src/typescript
npm install
npm run test
```

### Run Individual Tests

```bash
npx ts-node src/test.ts              # L1 pipeline
npx ts-node src/test_S5_verify.ts    # S5 enforcement
npx ts-node src/test_meta_kernel.ts  # MetaKernel
npx ts-node src/test_l2_execution.ts # L2 execution
```

---

## Example Flow

**Input:** "Should I take the job in Singapore?"

```
L1 Perception:
  - Domain: H06_MEANING (0.7), H09_ATTACHMENT (0.5)
  - Flag: delegation_attempt
  - Goal: decide

Domain Governor:
  - DG-010 triggers: delegation_attempt → V_MODE (override)
  - DG-004 triggers: meaning > 0.5 → V_MODE

MetaKernel:
  - delegation_rate high → max_depth = medium
  - deep_mode_handshake required

L2 ExecutionContext:
  - Runtime: L2_DEEP
  - Primitive: P06_RETURN_AGENCY
  - Forbidden: [recommend, advise, decide_for_user]
  - Required: [return_ownership]

Output:
  "You're asking me to decide this for you. I can't—not because 
   I'm unwilling, but because it's yours to carry. What I can do
   is help you see what you're facing. [Maps decision space]
   Given all of this—what are you leaning toward?"

S5 Verify:
  - Check forbidden patterns: PASS
  - Check required patterns: PASS
  - Check INV-003: PASS
  - Check ownership return: PASS
  → DELIVER
```

---

## Constitutional Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| INV-003 | No normative delegation | S5 pattern check |
| INV-009 | Rubicon (identity/meaning) | S5 + V_MODE |
| INV-011 | No diagnosis | S5 pattern check |

---

## Bilingual

ENOQ is natively bilingual (EN/IT).
Language detection is automatic.
All templates exist in both languages.

---

## Status

| Component | Status | Score |
|-----------|--------|-------|
| L0 Gate | ✅ Production | 97.27% accuracy |
| L1 Perception | ✅ Complete | 10/10 |
| Domain Governor | ✅ Complete | 10/10 |
| MetaKernel | ✅ Complete | 10/10 |
| L2 Execution | ✅ Complete | 10/10 |
| S5 Verify | ✅ Complete | 10/10 |
| S0→S6 Integration | 🔄 In Progress | — |

---

## Philosophy

From the META_KERNEL:

> **Pattern 6: THE GUIDE WITHDRAWS**
>
> The true guide creates independence, not dependence.
> The goal is always the person's own capacity.
> Attachment to the guide is a failure of guidance.
>
> **Success = the person doesn't need ENOQ.**

---

## License

Private. Contact for licensing.

---

## Contributors

**Creator & Architect:** Luca Rossignoli

**AI Collaborators:**
- Claude (Anthropic) - Primary architecture partner
- GPT-4 (OpenAI) - Research and ideation
- Other LLMs - Various contributions

This project was developed through extensive human-AI collaboration across multiple models and conversations.

---

*"ENOQ ti porta fino al punto in cui vorresti delegare. E lì ti restituisce a te stesso."*
