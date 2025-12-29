# execution (ERGON)

## Cosa fa
Genera l'output finale basandosi sul piano selezionato.

- **Generation**: Chiama LLM con prompt costruito
- **Rendering**: Applica template quando appropriato
- **Response plan**: Struttura la risposta in componenti

## Cosa NON fa
- Non decide il contenuto (viene da reasoning)
- Non bypassa verification
- Non aggiunge contenuto normativo

## Dove viene usato nel flusso
**Pipeline State: ACT** - Quinto stato, esecuzione.

```
PLAN → [execution] → Output grezzo → VERIFY
              ↓
         {text, metadata, trace}
```

## File principali
- `generation.ts` - Generazione con LLM
- `plan_renderer.ts` - Rendering template
- `response_plan.ts` - Struttura ResponsePlan
- `agent_responses.ts` - Risposte domain-specific
- `context.ts` - Contesto di esecuzione

## Vincoli AXIS rilevanti
- Output passa sempre per VERIFY
- Pattern vietati non possono apparire nell'output
- Nessuna prescrizione normativa

## Geometria
**OPERATIVA** - Come il sistema "agisce".
