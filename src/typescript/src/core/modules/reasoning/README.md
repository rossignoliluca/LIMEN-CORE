# reasoning (LOGOS)

## Cosa fa
Pianifica e seleziona la risposta appropriata basandosi sul campo percepito.

- **Selection**: Sceglie atmosfera, modo, primitiva, profondità
- **Gating**: Decide se chiamare LLM o usare template
- **Field physics**: Evolve il manifold stocastico (Langevin dynamics)
- **Curvature**: Curva la selezione verso attrattori costituzionali

## Cosa NON fa
- Non genera il testo della risposta
- Non decide per l'utente (INV-003)
- Non assegna identità (INV-009)

## Dove viene usato nel flusso
**Pipeline State: PLAN** - Quarto stato, pianificazione.

```
CLARIFY → [reasoning] → SelectionResult → ACT
                 ↓
          {atmosphere, depth, mode, primitive, forbidden, required}
```

## File principali
- `selection.ts` - Selezione v3.0 phased
- `gating.ts` - Unified gating v5.1 (riduce 50%+ chiamate LLM)
- `field.ts` - Stochastic field (Langevin dynamics)
- `curver.ts` - Curvatura verso attrattori
- `dissipation.ts` - Dissipazione energia

## Vincoli AXIS rilevanti
- **INV-003**: Selezione non prescrive valori
- **INV-009**: Protezione Rubicon nella selezione
- Forbidden patterns applicati qui

## Geometria
**OPERATIVA** - Come il sistema "decide" cosa fare.
