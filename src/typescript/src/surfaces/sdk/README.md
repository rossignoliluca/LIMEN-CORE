# ENOQ SDK

Three functions. No advice. No ranking. STOP after output.

## Install

```typescript
import { mail, relation, decision } from './surfaces/sdk';
```

## Usage

### mail() - Draft emails

```typescript
const result = await mail({
  recipient: 'Manager',
  context: 'Requesting time off',
  intent: 'Get approval for vacation'
});

console.log(result.output.drafts);   // 2-3 draft options
console.log(result.rationale);        // Neutral explanation
console.log(result.signals);          // ['PERMIT', 'ACT', 'VERIFY', 'STOP']
console.log(result.stop);             // true (always)
```

### relation() - Map relationships

```typescript
const result = await relation({
  personA: 'Me',
  personB: 'Partner',
  context: 'Family',
  tension: 'Work-life balance',
  boundary: 'No blame'
});

console.log(result.output.roleMap);        // { roleA, roleB }
console.log(result.output.boundaryLines);  // What A controls / doesn't
```

### decision() - Clarify decisions

```typescript
const result = await decision({
  statement: 'Whether to change jobs',
  context: 'Career'
});

console.log(result.output.frame);          // { deciding, notDeciding }
console.log(result.output.options);        // Neutral options
console.log(result.output.rubiconDetected); // true if threshold crossed
```

## Guarantees

- `result.stop === true` (always)
- `result.signals` ends with `'STOP'`
- No ranking, no recommendations
- Compliance flags in `result.compliance`

## Requirements

Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
