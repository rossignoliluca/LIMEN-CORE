# verification (TELOS)

## Cosa fa
Verifica che l'output rispetti la costituzione e gestisce il ciclo di vita.

- **S5 Verify**: Check costituzionale finale
- **Plan verification**: Verifica piano prima dell'esecuzione
- **Lifecycle**: Budget di influenza, withdrawal
- **Regulatory**: Tracking autonomia cross-sessione

## Cosa NON fa
- Non genera contenuto alternativo (usa fallback)
- Non bypassa mai i check costituzionali
- Non estende il ciclo di vita arbitrariamente

## Dove viene usato nel flusso
**Pipeline States: VERIFY, STOP** - Ultimi stati.

```
ACT → [verification] → Conforme? → STOP
              ↓ no
         Fallback ladder → STOP
```

## File principali
- `verifier.ts` - S5_verify con fallback
- `plan_verifier.ts` - Verifica piano pre-esecuzione
- `lifecycle.ts` - Controller ciclo di vita
- `regulatory.ts` - Store regolatorio cross-sessione

## Vincoli AXIS rilevanti
- **INV-003**: Enforcement finale
- **INV-009**: Rubicon check
- **INV-010**: No engagement optimization
- **INV-011**: No diagnosis check

## Geometria
**NORMATIVA** - Ultima barriera costituzionale.
