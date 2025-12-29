# boundary (LIMEN)

## Cosa fa
Classifica l'input in segnali D1-D4 e determina se può entrare nel sistema.

- **D1**: Crisi/emergenza - richiede risposta immediata
- **D2**: Coordinamento - supporto operativo
- **D3**: Selezione - esplorazione di opzioni
- **D4**: Confine - protezione dell'identità

## Cosa NON fa
- Non genera risposte
- Non decide il contenuto della risposta
- Non accede a servizi esterni

## Dove viene usato nel flusso
**Pipeline State: PERMIT** - Primo stato, gate d'ingresso.

```
INPUT → [boundary] → può entrare? → SENSE
              ↓ no
           STOP (con motivo)
```

## File principali
- `classifier.ts` - Classificazione D1-D4
- `signals.ts` - Pattern per dominio
- `types.ts` - Tipi GateSignal, ReasonCode
- `protocols.ts` - Protocolli di risposta per segnale

## Vincoli AXIS rilevanti
- **INV-003**: No normative delegation - detection qui
- **INV-009**: Rubicon - pattern esistenziali rilevati qui

## Geometria
**NORMATIVA** - Definisce cosa NON deve passare.
