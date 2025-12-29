# pipeline

## Cosa fa
Orchestrazione del flusso principale attraverso gli stati.

## Stati del Pipeline

```
PERMIT → SENSE → CLARIFY → PLAN → ACT → VERIFY → STOP
```

| Stato | Modulo | Descrizione |
|-------|--------|-------------|
| **PERMIT** | boundary | Input può entrare? |
| **SENSE** | perception | Cosa percepisco? |
| **CLARIFY** | memory | Serve chiarimento? |
| **PLAN** | reasoning | Che piano faccio? |
| **ACT** | execution | Eseguo il piano |
| **VERIFY** | verification | Conforme alla costituzione? |
| **STOP** | verification | Chiudo il ciclo |

## Cosa NON fa
- Non contiene logica di business (delegata ai moduli)
- Non bypassa stati
- Non salta VERIFY

## File principali
- `orchestrator.ts` - Funzione enoq() principale
- `states/` - [DA CREARE] Stati espliciti

## Entry Point

```typescript
import { enoq, createSession } from '@enoq/core';

const session = createSession();
const result = await enoq("messaggio", session);
```

## Vincoli AXIS rilevanti
- Ogni flusso deve passare per VERIFY
- STOP è sempre raggiunto (anche su errore)
- Nessun bypass degli stati normative

## Flusso con DISAGREE (opzionale)

```
... → VERIFY → conforme? → STOP
         ↓ no
      DISAGREE → fallback → STOP
```
