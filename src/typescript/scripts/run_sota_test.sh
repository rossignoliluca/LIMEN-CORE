#!/bin/bash
# Run SOTA detector tests with API key from ~/.env.local

# Load API key securely
if [ -f ~/.env.local ]; then
  export OPENAI_API_KEY=$(grep "^LLM_API_KEY=" ~/.env.local | cut -d'=' -f2)
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OPENAI_API_KEY not found, tests will use regex fallback"
else
  echo "API key loaded (length: ${#OPENAI_API_KEY} chars)"
fi

cd "$(dirname "$0")/.." || exit 1
npx jest sota_detector --testTimeout=180000
