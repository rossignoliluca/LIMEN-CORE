# axis-runtime

## Cosa fa
Enforcement runtime degli invarianti AXIS.

Questo modulo è il "guardiano" che applica le leggi frozen di AXIS/ a runtime.

## Cosa NON fa
- Non modifica AXIS (è frozen)
- Non aggiunge nuovi invarianti
- Non fa eccezioni

## Invarianti Enforced

| ID | Nome | Check |
|----|------|-------|
| INV-003 | NO_NORMATIVE_DELEGATION | Pattern detection |
| INV-009 | RUBICON | Identity/meaning protection |
| INV-010 | NO_ENGAGEMENT_OPTIMIZATION | No retention metrics |
| INV-011 | NO_DIAGNOSIS | No psychological labels |

## File principali
- `axis.ts` - Validatore costituzionale

## Pattern

```typescript
const decision = axis.validateResponse(output);
if (decision.verdict !== 'VALID') {
  // Applica fallback
}
```

## Relazione con AXIS/
- `AXIS/` contiene le leggi (testo, frozen)
- `axis-runtime/` le applica (codice, enforcement)

## Vincoli
- Nessuna modifica ai contenuti di AXIS/
- Ogni violazione viene loggata
- Fallback sempre disponibile
