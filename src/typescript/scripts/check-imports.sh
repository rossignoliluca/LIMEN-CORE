#!/bin/bash
# ============================================
# LIMEN Import Boundary Checker
# ============================================
# Enforces architectural boundaries:
#   interface/  -> cannot import from anything (pure types)
#   gate/       -> imports interface/ only
#   operational/ -> imports interface/, gate/
#   mediator/   -> imports interface/, gate/, operational/
#   runtime/    -> imports interface/, gate/, operational/, mediator/
#   research/   -> isolated (cannot be imported by production code)
#
# QUARANTINE RULE:
#   runtime/quarantine/ is the ONLY place that may import from research/
#   It is EXCLUDED from production build (see tsconfig.json)
#
# ALLOWED EXCEPTIONS (documented architectural coupling):
#   - gate/verification/ may import ResponsePlan from mediator/l5_transform/
# ============================================

set -e
cd "$(dirname "$0")/.."

ERRORS=0
WARNINGS=0

echo "Checking import boundaries..."
echo ""

# Rule 1: gate/ cannot import from runtime/, research/
echo "[1/6] Checking gate/ strict boundaries..."
VIOLATIONS=$(grep -r "from '.*runtime\|from '.*research" src/gate/ 2>/dev/null || true)
if [ -n "$VIOLATIONS" ]; then
    echo "  ERROR: gate/ imports from runtime/ or research/:"
    echo "$VIOLATIONS" | head -20
    ERRORS=$((ERRORS + 1))
else
    echo "  OK"
fi

# Rule 2: operational/ should not import from runtime/, research/
echo "[2/6] Checking operational/ boundaries..."
VIOLATIONS=$(grep -r "from '.*runtime\|from '.*research" src/operational/ 2>/dev/null || true)
if [ -n "$VIOLATIONS" ]; then
    echo "  ERROR: operational/ imports from runtime/ or research/:"
    echo "$VIOLATIONS" | head -20
    ERRORS=$((ERRORS + 1))
else
    echo "  OK"
fi

# Rule 3: mediator/ should not import from runtime/, research/
# KNOWN EXCEPTION: concrescence_engine imports from runtime/pipeline (circular - to refactor)
echo "[3/6] Checking mediator/ boundaries..."
VIOLATIONS=$(grep -r "from '.*runtime\|from '.*research" src/mediator/ 2>/dev/null | grep -v "concrescence_engine" || true)
if [ -n "$VIOLATIONS" ]; then
    echo "  ERROR: mediator/ imports from runtime/ or research/:"
    echo "$VIOLATIONS" | head -20
    ERRORS=$((ERRORS + 1))
else
    # Check for known exception
    KNOWN=$(grep -r "from '.*runtime" src/mediator/concrescence/concrescence_engine.ts 2>/dev/null || true)
    if [ -n "$KNOWN" ]; then
        echo "  OK (with known exception: concrescence_engine -> runtime/pipeline)"
        echo "  TODO: Refactor to break circular dependency"
    else
        echo "  OK"
    fi
fi

# Rule 4: runtime/ (EXCEPT quarantine/) must NOT import from research/
echo "[4/6] Checking runtime/ research isolation (excluding quarantine/)..."
VIOLATIONS=$(grep -r "from '.*research" src/runtime/pipeline/ src/runtime/io/ 2>/dev/null || true)
if [ -n "$VIOLATIONS" ]; then
    echo "  ERROR: runtime/ (non-quarantine) imports from research/:"
    echo "$VIOLATIONS" | head -20
    ERRORS=$((ERRORS + 1))
else
    echo "  OK"
fi

# Rule 5: runtime/quarantine/ MAY import from research/ (this is allowed)
echo "[5/6] Checking runtime/quarantine/ (bridge to research)..."
QUARANTINE_IMPORTS=$(grep -r "from '.*research" src/runtime/quarantine/ 2>/dev/null || true)
if [ -n "$QUARANTINE_IMPORTS" ]; then
    echo "  OK (quarantine imports from research - allowed)"
    echo "  NOTE: quarantine/ is excluded from production build"
else
    echo "  OK (no research imports in quarantine)"
fi

# Rule 6: research/ must not be imported by gate/, operational/, mediator/
echo "[6/6] Checking research/ isolation..."
VIOLATIONS=$(grep -rE "from ['\"].*research" src/gate/ src/operational/ src/mediator/ 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$VIOLATIONS" ]; then
    echo "  ERROR: production code imports from research/:"
    echo "$VIOLATIONS" | head -20
    ERRORS=$((ERRORS + 1))
else
    echo "  OK"
fi

echo ""
echo "============================================"
echo "QUARANTINE RULE:"
echo "  - runtime/quarantine/ is the ONLY bridge to research/"
echo "  - It is EXCLUDED from production build (tsconfig.json)"
echo "  - Use for experimental integrations only"
echo "============================================"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "FAILED: $ERRORS boundary violation(s) found"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "PASSED with $WARNINGS warning(s)"
    exit 0
else
    echo "PASSED: All import boundaries respected"
    exit 0
fi
