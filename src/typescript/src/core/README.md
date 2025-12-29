# core/

## Struttura

```
core/
├── axis-runtime/      # Enforcement runtime degli invarianti AXIS
├── signals/           # Eventi e segnali interni
├── pipeline/          # Orchestrazione stati
├── modules/           # 9 moduli funzionali
│   ├── boundary/      # LIMEN - Soglia, classificazione
│   ├── perception/    # SENSUS - Lettura campo
│   ├── memory/        # NEXUS - Memoria
│   ├── reasoning/     # LOGOS - Pianificazione
│   ├── execution/     # ERGON - Esecuzione
│   ├── temporal/      # CHRONOS - Pattern temporali
│   ├── verification/  # TELOS - Verifica costituzionale
│   ├── defense/       # IMMUNIS - Difesa anti-drift
│   └── metacognition/ # META - Auto-osservazione
└── interface/         # Types puri
```

## Pipeline Flow

```
PERMIT → SENSE → CLARIFY → PLAN → ACT → VERIFY → STOP
  │        │        │        │      │       │       │
boundary perception memory reasoning execution verification
```

## Due Geometrie

| Geometria | Moduli | Funzione |
|-----------|--------|----------|
| **NORMATIVA** | boundary, verification, defense | Cosa NON deve accadere |
| **OPERATIVA** | perception, reasoning, execution, temporal | Come agire |
| **CROSS-CUTTING** | memory, metacognition | Serve entrambe |

## Dipendenze

```
interface/ ← modules/ ← signals/ ← pipeline/
              ↑
         axis-runtime/
```

- `interface/` non importa nulla
- `modules/` importa solo da `interface/`
- `signals/` importa da `modules/` e `interface/`
- `pipeline/` importa da tutto (orchestratore)
- `axis-runtime/` può essere importato ovunque serva validation
