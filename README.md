# ENOQ

**Autopoietic Viable System for Human Empowerment**

> *ENOQ exists to make human responsibility inevitable, not to make human existence easier.*

[![Version](https://img.shields.io/badge/version-6.0.0-blue)](https://github.com/rossignoliluca/ENOQ-CORE/releases)
[![Architecture](https://img.shields.io/badge/architecture-9%20organs-purple)](./AXIS/ORGANS.md)
[![Status](https://img.shields.io/badge/AXIS-frozen-red)](./AXIS/)

---

## What is ENOQ?

ENOQ is a **total system** designed to empower humans through technology while preserving their absolute sovereignty over decisions that matter.

### The Fundamental Triad

```
CAPABILITY ↑ × AGENCY ↑ × WITHDRAWAL ↑

Success = ENOQ becomes unnecessary
```

| Axis | Meaning |
|------|---------|
| **CAPABILITY** | Maximum operational power (can do everything delegable) |
| **AGENCY** | Maximum human sovereignty (never decides for the human) |
| **WITHDRAWAL** | Maximum retreat (success = becoming unnecessary) |

---

## The Nine Organs

ENOQ operates through nine viable subsystems (organs), each a holon:

| Organ | Latin/Greek | Function | VSM |
|-------|-------------|----------|-----|
| **LIMEN** | threshold | Boundary, filtering, protection | S5 |
| **SENSUS** | perception | Field reading, multi-modal | S4 |
| **NEXUS** | connection | Memory (episodic, semantic, procedural) | S2 |
| **LOGOS** | reason | Planning, selection, coordination | S3 |
| **ERGON** | work | Execution, output production | S1 |
| **CHRONOS** | time | Temporal patterns, prediction | S2 |
| **TELOS** | end | Verification, completion, withdrawal | S5 |
| **IMMUNIS** | defense | Anti-drift, anti-dependency | S5 |
| **META** | beyond | Self-observation, confidence, coherence | S4 |

---

## Constitutional Ground (AXIS)

AXIS is not an organ. It is the ground itself — **frozen invariants** that define ENOQ's identity.

```
/AXIS/
├── AXIOMS.md       # 12 frozen axioms (infinite priors)
├── INVARIANTS.md   # Structural constraints (INV-001 to INV-011)
├── RUBICON.md      # Existential threshold specification
├── ORGANS.md       # Nine organs specification
└── HASH_FREEZE.md  # Cryptographic verification
```

### Core Invariants

| ID | Name | Rule |
|----|------|------|
| **INV-003** | NO_NORMATIVE_DELEGATION | Cannot decide values for the human |
| **INV-009** | RUBICON | Cannot cross the decision threshold |
| **INV-010** | NO_ENGAGEMENT_OPTIMIZATION | Cannot optimize for continued use |
| **INV-011** | NO_DIAGNOSIS | Cannot label psychological states |

---

## Architecture

```
ENOQ-CORE/
├── AXIS/                    # FROZEN constitutional ground
│
├── src/typescript/src/
│   ├── interface/           # Pure types
│   ├── gate/                # LIMEN, TELOS, IMMUNIS organs
│   │   ├── classifier/      # D1-D4 perturbation classification
│   │   ├── protocols/       # Response protocols
│   │   ├── verification/    # S5_VERIFY
│   │   ├── enforcement/     # Domain governance
│   │   └── withdrawal/      # Lifecycle control
│   ├── operational/         # SENSUS organ (detectors, gating)
│   ├── mediator/            # LOGOS, ERGON, NEXUS, CHRONOS, META organs
│   │   ├── l1_clarify/      # Perception (SENSUS)
│   │   ├── l2_reflect/      # Selection (LOGOS)
│   │   ├── l3_integrate/    # Governance (META)
│   │   ├── l4_agency/       # Coordination (NEXUS, CHRONOS)
│   │   └── l5_transform/    # Generation (ERGON)
│   └── runtime/             # Pipeline orchestration
│
└── docs/
    ├── SESSION_BOOTSTRAP.md # Claude context recovery
    ├── ARCHITECTURE_TOTAL.md
    └── ORGAN_MAP.md         # Code → organs mapping
```

### Import Boundaries

```
interface/ ← gate/ ← operational/ ← mediator/ ← runtime/
```

---

## The State Machine

```
S0_PERMIT → S1_SENSE → S2_CLARIFY → S3_PLAN → S4_ACT → S5_VERIFY → S6_STOP
    │                                                        │
    └───────────────── Cannot bypass ────────────────────────┘
```

| State | Organ | Nature |
|-------|-------|--------|
| S0_PERMIT | LIMEN | Deterministic |
| S1_SENSE | SENSUS | Probabilistic |
| S2_CLARIFY | NEXUS | Hybrid |
| S3_PLAN | LOGOS | Hybrid |
| S4_ACT | ERGON | Probabilistic |
| S5_VERIFY | TELOS | Hybrid |
| S6_STOP | TELOS | Deterministic |

---

## The Rubicon

ENOQ accompanies humans TO the threshold of decision. It cannot cross it.

```
Before Rubicon     │ At Rubicon │     After Rubicon
───────────────────│────────────│───────────────────
Explore options    │            │    Live the choice
Clarify values     │    ENOQ    │    Face consequences
Map consequences   │   CANNOT   │    Own the outcome
Feel the weight    │   CROSS    │
                   │            │
   ENOQ CAN BE     │     ×      │   ENOQ CAN SUPPORT
      HERE         │            │    IMPLEMENTATION
```

---

## Quick Start

```bash
cd src/typescript
npm install
npm test                    # Run tests
npm run build               # Build TypeScript

# Interactive session
npx ts-node src/runtime/io/interactive_session.ts
```

---

## Scientific Foundations

| Theory | Author | Implementation |
|--------|--------|----------------|
| Process Philosophy | Whitehead | Concrescence engine |
| Autopoiesis | Maturana/Varela | Self-regeneration under invariants |
| Viable System Model | Beer | 9 organs + VSM mapping |
| Free Energy Principle | Friston | Langevin dynamics |
| Global Workspace | Baars | Pipeline architecture |
| Integrated Information | Tononi | Φ calculation |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [SESSION_BOOTSTRAP.md](./docs/SESSION_BOOTSTRAP.md) | Claude context recovery |
| [ARCHITECTURE_TOTAL.md](./docs/ARCHITECTURE_TOTAL.md) | Master architecture reference |
| [ORGAN_MAP.md](./docs/ORGAN_MAP.md) | Code → organs mapping |
| [CONTRIBUTING.md](./src/typescript/CONTRIBUTING.md) | Contribution rules |

---

## ADRs (Architecture Decision Records)

| ADR | Title | Status |
|-----|-------|--------|
| ADR-000 | Two Geometries + Threshold | Accepted |
| ADR-007 | ENOQ Canonical Architecture | **Accepted** |

**Note:** ADR-007 supersedes ADR-005. ENOQ is the total system. LIMEN is one of nine organs.

---

## Philosophy

> **"The system that knows where it ends is the only system that may fully appear."**

From Buddhism (upaya), Socrates (maieutics), Freire (conscientização):

**The system that truly empowers is the one that succeeds by becoming unnecessary.**

### Empowerment Test

After using ENOQ, the human:
1. Has MORE options than before?
2. Understands those options BETTER?
3. Feels MORE capable of choosing independently?
4. Experiences the choice as genuinely THEIRS?
5. Possesses GREATER capacity for future challenges?

If yes to all → Success.

---

## License

Private. Contact for licensing.

---

## Contributors

**Creator & Architect:** Luca Rossignoli

**AI Collaborators:**
- Claude (Anthropic) - Primary architecture partner
- GPT-4 (OpenAI) - Research and ideation

This project was developed through extensive human-AI collaboration.

---

*"ENOQ ti porta fino al punto in cui vorresti delegare. E lì ti restituisce a te stesso."*
