# temporal (CHRONOS)

## Cosa fa
Gestisce pattern temporali, prediction, e pacing.

- **Pattern detection**: Escalation, cicli, diminuzione
- **Causal inference**: Relazioni causa-effetto nel tempo
- **Pacing**: Quando rallentare o accelerare

## Cosa NON fa
- Non predice il futuro dell'utente
- Non assume continuità tra sessioni
- Non usa pattern per manipolare

## Dove viene usato nel flusso
**Integrato in SENSE e PLAN** - Cross-cutting temporale.

```
SENSE → [temporal] → TemporalAnalysis
              ↓
         Pattern ricorrenti? Escalation?
```

## File principali
- `engine.ts` - Temporal engine (pattern, causal links)

## Stato implementazione
- Tipi definiti: ✅
- Integrazione pipeline: ⚠️ Parziale
- Pattern detection: ⚠️ Da completare

## Vincoli AXIS rilevanti
- Non usa pattern per engagement
- Non predice stati psicologici

## Geometria
**OPERATIVA** - Come il sistema "percepisce il tempo".
