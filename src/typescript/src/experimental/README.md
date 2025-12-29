# experimental/

## Cosa contiene
Codice sperimentale isolato dal core. NON importare in produzione.

## Contenuti

### /legacy/
Versioni precedenti di moduli sostituiti:
- `llm_detector.ts` - Sostituito da `core/modules/perception/detector.ts`
- `llm_detector_v2.ts` - Deprecated
- `hybrid_detector.ts` - Fallback non più usato come primary
- `sota_detector.ts` - Research detector
- `selection_v2.ts` - Sostituito da selection v3.0
- `np_gating.ts` - Integrato in unified_gating
- `scientific_gating.ts` - Integrato in unified_gating

### /cognitive_router/
Research su routing avanzato:
- Thompson sampling
- SPRT accumulator
- Conformal calibration
- Self-improvement

### /genesis/
Sistema self-building (experimental):
- Autonomous builder
- Code modification
- Knowledge seeking

### /concrescence/
Engine Whiteheadiano (alternativo):
- Process philosophy integration
- Alternative pipeline flow

## Regole

1. **NON importare in core/** - Isolamento stretto
2. **NON usare in production** - Solo research
3. **Può essere eliminato** - Non è garantito
4. **Test separati** - Non nel CI principale

## Come sperimentare

```typescript
// Solo in test/research
import { something } from './experimental/genesis';

// MAI in core/
// import { something } from '../experimental/...'; // VIETATO
```
