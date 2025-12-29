# perception (SENSUS)

## Cosa fa
Legge il "campo" dell'input: dimensioni verticali (V1-V5), orizzontali (H01-H17), e stato emotivo.

- **Dimensioni verticali**: SOMATIC, FUNCTIONAL, RELATIONAL, EXISTENTIAL, TRANSCENDENT
- **Dimensioni orizzontali**: 17 domini della vita umana (H01_SURVIVAL → H17_FORM)
- **V_MODE**: Rileva quando l'input tocca questioni di significato/identità
- **EMERGENCY**: Rileva crisi acute che richiedono grounding

## Cosa NON fa
- Non decide come rispondere
- Non genera output
- Non modifica lo stato dell'utente

## Dove viene usato nel flusso
**Pipeline State: SENSE** - Secondo stato, percezione del campo.

```
PERMIT → [perception] → FieldState → CLARIFY
                ↓
         {dimensions, v_mode, emergency, domains}
```

## File principali
- `detector.ts` - Ultimate detector (calibrato, production)
- `dimensional.ts` - Sistema dimensionale V1-V5, H01-H17
- `lexicon.ts` - Pattern esistenziali nel linguaggio
- `field.ts` - Estrazione FieldState

## Vincoli AXIS rilevanti
- **INV-009**: Rubicon - V_MODE detection critica
- **INV-011**: No diagnosis - percezione senza etichettare

## Geometria
**OPERATIVA** - Come il sistema "vede" l'input.
