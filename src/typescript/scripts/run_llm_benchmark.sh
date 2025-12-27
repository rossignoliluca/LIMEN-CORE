#!/bin/bash
# Secure LLM Benchmark Runner
# Loads API keys from ~/.env.local without exposing them

# Load keys securely (no echo)
if [ -f ~/.env.local ]; then
  # Extract and export OPENAI key (mapped from LLM_API_KEY)
  export OPENAI_API_KEY=$(grep "^LLM_API_KEY=" ~/.env.local | cut -d'=' -f2)
fi

# Verify key is loaded (without showing it)
if [ -z "$OPENAI_API_KEY" ]; then
  echo "ERROR: OPENAI_API_KEY not found in ~/.env.local"
  exit 1
fi

echo "API key loaded securely (length: ${#OPENAI_API_KEY} chars)"
echo "Running LLM benchmark..."

# Run benchmark
cd "$(dirname "$0")/.." || exit 1
LLM_TEST=true npx jest llm_detector_benchmark --testTimeout=300000
