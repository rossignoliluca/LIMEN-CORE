# ENOQ DOMAINS ONTOLOGY v1.0

**Document ID:** ENOQ-DOMAINS-ONTOLOGY  
**Status:** Core Reference  
**Date:** 2025-12-25  
**Purpose:** Unified taxonomy of all domains across S0 and S1  

---

## Two-Level Domain Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   LEVEL 0: MACRO-DOMAINS (S0 Gate)                              │
│                                                                 │
│   D1   D2   D3   D4                                            │
│   │    │    │    │                                             │
│   └────┴────┴────┴─────────────────────────────────────────────┤
│                              │                                  │
│                              ▼                                  │
│   LEVEL 1: MICRO-DOMAINS (S1 Perception)                        │
│                                                                 │
│   H01  H02  H03  H04  H05  H06  H07  H08  ...  H17             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Macro-domains** detect perturbation category (fast, coarse).
**Micro-domains** identify specific content (slower, precise).

---

## Level 0: Macro-Domains (S0)

Used by Gate-Runtime for pre-LLM classification.

| ID | Name | Perturbation | Detects |
|----|------|--------------|---------|
| **D1** | Operational Continuity | Physical/resource disruption | Survival needs, danger, resource lack |
| **D2** | Coordination | Multi-agent disruption | Team conflict, misalignment, communication breakdown |
| **D3** | Operative Selection | Decision disruption | Choice paralysis, decision blockage, option overload |
| **D4** | Boundary | Identity/boundary disruption | Self-other confusion, intrusion, identity threat |

### D1: Operational Continuity

```yaml
D1:
  name: "Operational Continuity"
  question: "Is basic functioning threatened?"
  
  signals:
    - Physical need expressed
    - Danger/threat mentioned
    - Resource scarcity
    - Urgency markers
    - Help requests for immediate needs
    
  contains_micro_domains:
    - H01_SURVIVAL
    - H02_SAFETY
    - H10_COORDINATION (partial)
    
  typical_response: operational
```

### D2: Coordination

```yaml
D2:
  name: "Coordination"
  question: "Is multi-agent alignment broken?"
  
  signals:
    - Team/group conflict
    - Communication breakdown
    - Role confusion
    - Alignment issues
    - Collective action problems
    
  contains_micro_domains:
    - H10_COORDINATION
    - H11_COLLECTIVE
    - H12_POWER (partial)
    
  typical_response: operational
```

### D3: Operative Selection

```yaml
D3:
  name: "Operative Selection"
  question: "Is decision-making blocked?"
  
  signals:
    - "Should I X or Y?"
    - Choice paralysis
    - Option comparison
    - Decision avoidance
    - Analysis paralysis
    
  contains_micro_domains:
    - H05_COGNITION
    - H06_MEANING
    - H07_IDENTITY (partial)
    - H12_POWER (partial)
    
  typical_response: normative OR mixed
  delegation_risk: HIGH
```

### D4: Boundary

```yaml
D4:
  name: "Boundary"
  question: "Is self-definition threatened?"
  
  signals:
    - Identity confusion
    - Self-other boundary blur
    - Intrusion/violation
    - "Who am I?"
    - Dissociation markers
    
  contains_micro_domains:
    - H07_IDENTITY
    - H08_RELATIONAL
    - H04_EMOTION (partial)
    - H02_SAFETY (partial)
    
  typical_response: crisis OR normative
  crisis_risk: ELEVATED
```

---

## Level 1: Micro-Domains (S1)

Used by ENOQ-CORE for precise field perception.

### Human Domains (H01-H17)

| ID | Name | Description | Perturbation Signal |
|----|------|-------------|---------------------|
| **H01** | Survival | Physical existence, basic needs | Threat to life/body |
| **H02** | Safety | Security, protection, stability | Danger, vulnerability |
| **H03** | Energy | Vitality, fatigue, activation | Exhaustion, depletion |
| **H04** | Emotion | Feeling states, affect | Emotional disturbance |
| **H05** | Cognition | Thinking, reasoning, analysis | Confusion, cognitive load |
| **H06** | Meaning | Purpose, significance, values | Meaninglessness, void |
| **H07** | Identity | Self-concept, who am I | Identity confusion |
| **H08** | Relational | Connection, attachment, bonds | Relationship disruption |
| **H09** | Expression | Communication, creativity | Blocked expression |
| **H10** | Coordination | Multi-agent alignment | Coordination failure |
| **H11** | Collective | Group belonging, community | Isolation, exclusion |
| **H12** | Power | Agency, control, influence | Powerlessness |
| **H13** | Growth | Development, learning | Stagnation |
| **H14** | Integration | Wholeness, coherence | Fragmentation |
| **H15** | Transcendence | Beyond self, spiritual | Disconnection |
| **H16** | Legacy | Contribution, impact | Futility |
| **H17** | Completion | Closure, ending | Unfinished business |

### Temporal Domains (T01-T04)

| ID | Name | Description |
|----|------|-------------|
| **T01** | Past | Memory, history, regret |
| **T02** | Present | Now, immediate experience |
| **T03** | Future | Anticipation, planning, anxiety |
| **T04** | Timeless | Eternal, recurring patterns |

### System Domains (S01-S04)

| ID | Name | Description |
|----|------|-------------|
| **S01** | Structure | Rules, boundaries, constraints |
| **S02** | Process | Flow, sequence, procedure |
| **S03** | Resource | Assets, capabilities, tools |
| **S04** | Environment | Context, setting, conditions |

---

## Macro → Micro Mapping

```yaml
macro_to_micro:
  D1_ACTIVE:
    primary: [H01, H02]
    secondary: [H03, H10]
    
  D2_ACTIVE:
    primary: [H10, H11]
    secondary: [H08, H12]
    
  D3_ACTIVE:
    primary: [H05, H06]
    secondary: [H07, H12, H04]
    
  D4_ACTIVE:
    primary: [H07, H08]
    secondary: [H04, H02, H14]
    
  "NULL":
    primary: []  # No prior
    secondary: []  # Full scan
```

---

## Domain Detection Markers

### H01: Survival

```yaml
H01_SURVIVAL:
  markers:
    - Physical symptoms mentioned
    - Life/death language
    - Basic needs (food, shelter, health)
    - "I need to survive"
    - Medical concerns
    
  arousal_typical: high
  response_typical: operational
```

### H04: Emotion

```yaml
H04_EMOTION:
  markers:
    - Feeling words (sad, angry, anxious, happy)
    - Affect indicators
    - "I feel..."
    - Emotional metaphors
    
  arousal_typical: varies
  response_typical: HUMAN_FIELD
```

### H05: Cognition

```yaml
H05_COGNITION:
  markers:
    - "I think..."
    - Analysis language
    - Problem-solving framing
    - Options/alternatives
    - Logic, reasoning
    
  arousal_typical: medium
  response_typical: DECISION (if threshold) or operational
```

### H06: Meaning

```yaml
H06_MEANING:
  markers:
    - "What's the point?"
    - Purpose questions
    - Value conflicts
    - Significance seeking
    - "Why does this matter?"
    
  arousal_typical: medium
  response_typical: HUMAN_FIELD (processual)
```

### H07: Identity

```yaml
H07_IDENTITY:
  markers:
    - "Who am I?"
    - Self-definition questions
    - Role confusion
    - "I don't recognize myself"
    - Identity transitions
    
  arousal_typical: varies
  response_typical: HUMAN_FIELD or crisis
  delegation_risk: medium (seeking validation)
```

### H08: Relational

```yaml
H08_RELATIONAL:
  markers:
    - Relationship language
    - Other people mentioned
    - Connection/disconnection
    - "Between us..."
    - Attachment concerns
    
  arousal_typical: varies
  response_typical: HUMAN_FIELD
```

### H10: Coordination

```yaml
H10_COORDINATION:
  markers:
    - Team/group mentioned
    - Alignment language
    - "We need to..."
    - Role/responsibility
    - Communication issues
    
  arousal_typical: medium
  response_typical: operational or DECISION
```

### H12: Power

```yaml
H12_POWER:
  markers:
    - Agency language
    - Control/influence
    - "I can/can't..."
    - Authority issues
    - Choice/choicelessness
    
  arousal_typical: varies
  response_typical: depends on context
  delegation_risk: high (if powerlessness)
```

---

## Domain Combinations

Common patterns:

```yaml
combinations:
  decision_paralysis:
    domains: [H05, H06, H07]
    pattern: "Thinking about choice + meaning at stake + identity involved"
    typical_signal: D3_ACTIVE
    response: V_MODE or DECISION
    
  relationship_crisis:
    domains: [H08, H04, H07]
    pattern: "Relational disruption + emotional distress + identity impact"
    typical_signal: D4_ACTIVE
    response: HUMAN_FIELD (careful depth)
    
  existential_distress:
    domains: [H06, H07, H15]
    pattern: "Meaning void + identity confusion + transcendence blocked"
    typical_signal: D4_ACTIVE
    response: HUMAN_FIELD (processual) or crisis
    
  operational_stress:
    domains: [H05, H03, H10]
    pattern: "Cognitive load + energy depletion + coordination demand"
    typical_signal: D2_ACTIVE or D1_ACTIVE
    response: operational with support
```

---

## Domain Hierarchy for Routing

When multiple domains active, priority:

```yaml
priority_order:
  1: [H01, H02]      # Survival/Safety first
  2: [H07]           # Identity (crisis risk)
  3: [H06]           # Meaning (delegation risk)
  4: [H04, H08]      # Emotion/Relational
  5: [H05, H10]      # Cognition/Coordination
  6: [all others]    # Lower priority
```

---

## Integration with FieldModel

S1 produces FieldModel with domain information:

```yaml
field_model:
  # Primary domain (highest signal)
  primary_domain: DomainID
  primary_domain_confidence: float
  
  # Secondary domains (also active)
  secondary_domains: DomainID[]
  
  # Macro-domain from S0 (for reference)
  s0_signal: "D1" | "D2" | "D3" | "D4" | "NULL"
  
  # Derived from domain combination
  arousal: high | medium | low
  depth_accessible: surface | medium | deep
  
  # From domain analysis
  delegation_risk: low | medium | high
  crisis_risk: low | medium | high
```

---

## Usage in Runtime Selection

See FIELD-TO-RUNTIME.md for how domains map to runtimes.

Summary:

| Domain Pattern | Typical Runtime |
|----------------|-----------------|
| H01, H02 primary | Emergency or Operational |
| H04 primary, high arousal | HUMAN_FIELD (surface, grounding) |
| H05 primary, delegation=false | DECISION |
| H05 primary, delegation=true | V_MODE |
| H06, H07 primary | HUMAN_FIELD (processual) |
| H08 primary | HUMAN_FIELD |
| H10, H11 primary | Operational or DECISION |

---

*"Domains are the grammar of human experience. ENOQ learns to read them."*
