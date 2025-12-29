# defense (IMMUNIS)

## Cosa fa
Protegge il sistema da drift, dipendenza, e pattern adversarial.

- **Domain Governor**: Regole per coesistenza domini
- **ADS Detector**: Anti-Delegation Surprise - quando l'utente potrebbe/dovrebbe fare da sé
- **Second Order Observer**: Rileva enchantment e counter-transference

## Cosa NON fa
- Non punisce l'utente
- Non rifiuta arbitrariamente
- Non crea barriere artificiali

## Dove viene usato nel flusso
**Integrato in SENSE e PLAN** - Cross-cutting difensivo.

```
SENSE → [defense] → Constraints
              ↓
         ADS score, Governor rules, Observer flags
```

## File principali
- `governor.ts` - Domain governor (regole)
- `ads.ts` - ADS detector (anti-delegation)
- `observer.ts` - Second order observer

## Vincoli AXIS rilevanti
- **INV-010**: Anti-engagement
- Cooling without punishment
- Soft constraints (warmth_delta) vs Hard (disable_tools)

## Filosofia
"Cooling without punishment" - Riduce fusione senza tagliare il supporto.

## Geometria
**NORMATIVA** - Difesa proattiva degli invarianti.
