# memory (NEXUS)

## Cosa fa
Gestisce la memoria della sessione e (in futuro) cross-sessione.

- **Episodica**: Cosa è successo in questa conversazione
- **Semantica**: Pattern ricorrenti, temi frequenti
- **Procedurale**: [DA IMPLEMENTARE] Cosa ha funzionato prima

## Cosa NON fa
- Non decide basandosi sulla memoria
- Non modifica il comportamento autonomamente
- Non persiste dati sensibili cross-sessione (per ora)

## Dove viene usato nel flusso
**Pipeline State: CLARIFY** - Terzo stato, chiarificazione con memoria.

```
SENSE → [memory] → Serve chiarimento? → PLAN
              ↓ sì
         Chiedi chiarimento
```

## File principali
- `memory_system.ts` - Sistema di memoria CLS-inspired

## Stato implementazione
- Session memory: ✅ Implementato
- Episodic replay: ⚠️ Parziale
- Semantic patterns: ⚠️ Parziale
- Procedural: ❌ Da fare

## Vincoli AXIS rilevanti
- Privacy: memoria non persiste dati identificativi
- No engagement optimization: non usa memoria per "trattenere"

## Geometria
**CROSS-CUTTING** - Serve sia normativa che operativa.
