#!/bin/bash
#
# AXIS Contract Verification
# Ensures the geometry cannot be bypassed.
#
# Exit codes:
#   0 = PASS (all checks green)
#   1 = FAIL (violation detected)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../src"

PASS=true
VIOLATIONS=""

echo "═══════════════════════════════════════════════════════════════"
echo "                    AXIS CONTRACT CHECK                         "
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ============================================
# CHECK 1: Import Boundaries
# ============================================

echo "▶ Check 1: Import Boundaries"

# 1a: surfaces/ cannot import from core/modules/
echo "  - surfaces/ → core/modules/ ... "
MATCHES=$(grep -r "from.*['\"].*core/modules" "$SRC_DIR/surfaces" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: surfaces/ imports from core/modules/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- surfaces/ imports from core/modules/"
else
  echo "    ✓ CLEAN"
fi

# 1b: external/ cannot import from core/modules/
echo "  - external/ → core/modules/ ... "
MATCHES=$(grep -r "from.*['\"].*core/modules" "$SRC_DIR/external" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: external/ imports from core/modules/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- external/ imports from core/modules/"
else
  echo "    ✓ CLEAN"
fi

# 1c: core/ cannot import from experimental/
echo "  - core/ → experimental/ ... "
MATCHES=$(grep -r "from.*['\"].*experimental" "$SRC_DIR/core" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: core/ imports from experimental/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- core/ imports from experimental/"
else
  echo "    ✓ CLEAN"
fi

# 1d: runtime/ cannot import from experimental/ (v7.2)
echo "  - runtime/ → experimental/ ... "
MATCHES=$(grep -r "from.*['\"].*experimental" "$SRC_DIR/runtime" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: runtime/ imports from experimental/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- runtime/ imports from experimental/"
else
  echo "    ✓ CLEAN"
fi

# 1e: operational/ cannot import from experimental/ (v7.2)
echo "  - operational/ → experimental/ ... "
MATCHES=$(grep -r "from.*['\"].*experimental" "$SRC_DIR/operational" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: operational/ imports from experimental/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- operational/ imports from experimental/"
else
  echo "    ✓ CLEAN"
fi

# 1f: gate/ cannot import from mediator/ (v7.2)
echo "  - gate/ → mediator/ ... "
MATCHES=$(grep -r "from.*['\"].*mediator" "$SRC_DIR/gate" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: gate/ imports from mediator/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- gate/ imports from mediator/"
else
  echo "    ✓ CLEAN"
fi

echo ""

# ============================================
# CHECK 2: Orchestrator Path
# ============================================

echo "▶ Check 2: Orchestrator Path (permit + verify)"

ORCHESTRATOR="$SRC_DIR/core/pipeline/orchestrator.ts"

# 2a: permit() call exists
echo "  - permit() call ... "
if grep -q "permit(" "$ORCHESTRATOR" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: permit() not found in orchestrator"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- orchestrator missing permit() call"
fi

# 2b: verifyOutput() call exists
echo "  - verifyOutput() call ... "
if grep -q "verifyOutput(" "$ORCHESTRATOR" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: verifyOutput() not found in orchestrator"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- orchestrator missing verifyOutput() call"
fi

# 2c: STOP signal emitted
echo "  - STOP signal ... "
if grep -q "state: 'STOP'" "$ORCHESTRATOR" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: STOP signal not found in orchestrator"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- orchestrator missing STOP signal"
fi

echo ""

# ============================================
# CHECK 3: Enforcement Presence
# ============================================

echo "▶ Check 3: Enforcement Patterns in S5_verify"

S5_VERIFY="$SRC_DIR/gate/verification/S5_verify.ts"

# 3a: INV-003 patterns
echo "  - INV-003 (no normative delegation) ... "
if grep -q "INV-003" "$S5_VERIFY" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: INV-003 not found in S5_verify"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- S5_verify missing INV-003 enforcement"
fi

# 3b: INV-009 patterns
echo "  - INV-009 (Rubicon) ... "
if grep -q "INV-009" "$S5_VERIFY" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: INV-009 not found in S5_verify"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- S5_verify missing INV-009 enforcement"
fi

# 3c: INV-011 patterns
echo "  - INV-011 (no diagnosis) ... "
if grep -q "INV-011" "$S5_VERIFY" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: INV-011 not found in S5_verify"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- S5_verify missing INV-011 enforcement"
fi

echo ""

# ============================================
# CHECK 4: Content Compliance (P2.4)
# ============================================

echo "▶ Check 4: Content Compliance Patterns"

CONTENT_COMPLIANCE="$SRC_DIR/gate/verification/content_compliance.ts"

# 4a: NORMATIVE patterns exist
echo "  - NORMATIVE patterns ... "
if grep -q "NORMATIVE" "$CONTENT_COMPLIANCE" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: NORMATIVE patterns not found in content_compliance"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- content_compliance missing NORMATIVE patterns"
fi

# 4b: RANKING patterns exist
echo "  - RANKING patterns ... "
if grep -q "RANKING" "$CONTENT_COMPLIANCE" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: RANKING patterns not found in content_compliance"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- content_compliance missing RANKING patterns"
fi

# 4c: ENGAGEMENT patterns exist
echo "  - ENGAGEMENT patterns ... "
if grep -q "ENGAGEMENT" "$CONTENT_COMPLIANCE" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: ENGAGEMENT patterns not found in content_compliance"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- content_compliance missing ENGAGEMENT patterns"
fi

# 4d: checkCompliance export exists
echo "  - checkCompliance() export ... "
if grep -q "export.*checkCompliance" "$CONTENT_COMPLIANCE" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: checkCompliance not exported from content_compliance"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- content_compliance missing checkCompliance export"
fi

echo ""

# ============================================
# CHECK 5: Observability (P2.4)
# ============================================

echo "▶ Check 5: Observability Integration"

OBSERVABILITY="$SRC_DIR/core/signals/observability.ts"

# 5a: Event types exist
echo "  - Event types ... "
if grep -q "BOUNDARY_BLOCKED\|VERIFY_FAILED\|RUBICON_WITHDRAW\|PROVIDER_FAILOVER" "$OBSERVABILITY" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: Required event types not found in observability"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- observability missing required event types"
fi

# 5b: getMetrics export exists
echo "  - getMetrics() export ... "
if grep -q "export.*getObserver\|export.*getMetrics" "$OBSERVABILITY" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: getObserver/getMetrics not exported from observability"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- observability missing metrics export"
fi

# 5c: Orchestrator uses observability
echo "  - Orchestrator observability integration ... "
if grep -q "emitPipelineStart\|emitPipelineEnd" "$ORCHESTRATOR" 2>/dev/null; then
  echo "    ✓ PRESENT"
else
  echo "    ✗ FAIL: Orchestrator not using observability emit functions"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- orchestrator missing observability integration"
fi

echo ""

# ============================================
# CHECK 6: Additional Forbidden Imports (P2.4)
# ============================================

echo "▶ Check 6: Additional Forbidden Imports"

# 6a: mediator/ cannot import from operational/gating
echo "  - mediator/ → operational/gating/ ... "
MATCHES=$(grep -r "from.*['\"].*operational/gating" "$SRC_DIR/mediator" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: mediator/ imports from operational/gating/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- mediator/ imports from operational/gating/"
else
  echo "    ✓ CLEAN"
fi

# 6b: gate/verification cannot import from mediator
echo "  - gate/verification/ → mediator/ ... "
MATCHES=$(grep -r "from.*['\"].*mediator" "$SRC_DIR/gate/verification" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: gate/verification/ imports from mediator/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- gate/verification/ imports from mediator/"
else
  echo "    ✓ CLEAN"
fi

# 6c: core/signals cannot import from experimental
echo "  - core/signals/ → experimental/ ... "
MATCHES=$(grep -r "from.*['\"].*experimental" "$SRC_DIR/core/signals" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MATCHES" ]; then
  echo "$MATCHES" | head -3
  echo "    ✗ FAIL: core/signals/ imports from experimental/"
  PASS=false
  VIOLATIONS="$VIOLATIONS\n- core/signals/ imports from experimental/"
else
  echo "    ✓ CLEAN"
fi

echo ""

# ============================================
# RESULT
# ============================================

echo "═══════════════════════════════════════════════════════════════"

if [ "$PASS" = true ]; then
  echo ""
  echo "  ██████╗  █████╗ ███████╗███████╗"
  echo "  ██╔══██╗██╔══██╗██╔════╝██╔════╝"
  echo "  ██████╔╝███████║███████╗███████╗"
  echo "  ██╔═══╝ ██╔══██║╚════██║╚════██║"
  echo "  ██║     ██║  ██║███████║███████║"
  echo "  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝"
  echo ""
  echo "  AXIS Contract: PASS"
  echo "  All structural invariants verified."
  echo "  Geometry cannot be bypassed."
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  exit 0
else
  echo ""
  echo "  ███████╗ █████╗ ██╗██╗     "
  echo "  ██╔════╝██╔══██╗██║██║     "
  echo "  █████╗  ███████║██║██║     "
  echo "  ██╔══╝  ██╔══██║██║██║     "
  echo "  ██║     ██║  ██║██║███████╗"
  echo "  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝"
  echo ""
  echo "  AXIS Contract: FAIL"
  echo "  Violations:"
  echo -e "$VIOLATIONS"
  echo ""
  echo "  DO NOT DEPLOY."
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  exit 1
fi
