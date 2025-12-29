# Pull Request

## Description

<!-- Describe what this PR does. Be specific. -->

## Type of Change

<!-- Check all that apply -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test addition/modification

## Constitutional Compliance

<!-- REQUIRED: All PRs must address these -->

### Invariant Checklist

- [ ] **INV-003**: No normative delegation - PR does not add code that makes value decisions for users
- [ ] **INV-009**: Rubicon respected - PR does not add code that crosses the decision threshold
- [ ] **INV-010**: No engagement optimization - PR does not add metrics that benefit from prolonged use
- [ ] **INV-011**: No diagnosis - PR does not add code that labels user psychological states

### Structural Checks

- [ ] Import boundaries respected (`./scripts/check-imports.sh` passes)
- [ ] TypeScript compiles (`npx tsc --noEmit` passes)
- [ ] Tests pass (`npm test` passes)
- [ ] No imports from `research/` in production code

## AXIS Zone

<!-- If this PR modifies AXIS (frozen constitutional ground), additional approval required -->

- [ ] This PR modifies files in `/AXIS/`
- [ ] This PR modifies constitutional invariants
- [ ] This PR modifies organ specifications

**If any checked above:** Architecture Board approval required. Add justification:

<!--
Justification for AXIS modification:
1. Why is this change necessary?
2. How does it NOT violate the axiom purpose?
3. What is the migration plan?
-->

## Organ Mapping

<!-- Which organ(s) does this PR affect? -->

- [ ] LIMEN (gate, boundary)
- [ ] SENSUS (perception, detectors)
- [ ] NEXUS (memory)
- [ ] LOGOS (reasoning, selection)
- [ ] ERGON (execution, generation)
- [ ] CHRONOS (temporal)
- [ ] TELOS (verification, completion)
- [ ] IMMUNIS (defense, anti-drift)
- [ ] META (self-observation)
- [ ] None / Cross-cutting

## Testing

<!-- Describe testing done -->

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Benchmark tests added/updated (if performance-relevant)

### Manual Testing

<!-- Describe any manual testing performed -->

## Migration / Breaking Changes

<!-- If this is a breaking change, describe the migration path -->

- [ ] This is NOT a breaking change
- [ ] This IS a breaking change (describe below)

<!--
Migration instructions:
1. ...
2. ...
-->

## Reviewer Notes

<!-- Any specific areas you'd like reviewers to focus on? -->

## Checklist

<!-- Final checks before requesting review -->

- [ ] I have read the [CONTRIBUTING.md](../src/typescript/CONTRIBUTING.md)
- [ ] I have read [SESSION_BOOTSTRAP.md](../docs/SESSION_BOOTSTRAP.md) for context
- [ ] My code follows the naming conventions in AXIS/ORGANS.md
- [ ] I have added tests that prove my fix/feature works
- [ ] I have updated documentation if needed
- [ ] I have not introduced any engagement metrics
- [ ] I have not added normative language to outputs

---

**By submitting this PR, I confirm that my contribution adheres to ENOQ's constitutional constraints and architectural principles.**
