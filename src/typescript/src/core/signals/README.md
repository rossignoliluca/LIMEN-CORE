# signals

## Cosa fa
Gestisce eventi e segnali interni del sistema.

- **Early Signals**: Segnali paralleli con deadline (v3.0 architecture)
- **Bridge**: Ponte tra total_system e pipeline

## Cosa NON fa
- Non contiene logica decisionale
- Non modifica lo stato direttamente
- Non comunica con l'esterno

## Dove viene usato nel flusso
**Integrato nel pipeline** - Comunicazione interna.

```
PLAN → [signals] → EarlySignals con deadline
              ↓
         Candidate selection
```

## File principali
- `early_signals.ts` - Sistema segnali v3.0
- `bridge.ts` - Bridge verso total_system

## Pattern

```typescript
// Early signals con deadline
const signals = await generateEarlySignals(input, {
  deadline_ms: 200,
  fallback: defaultSignal
});
```

## Vincoli AXIS rilevanti
- Signals non influenzano direttamente l'output
- Deadline garantisce risposta in tempo

## Note architetturali
Parte della v3.0 architecture per selection phased.
