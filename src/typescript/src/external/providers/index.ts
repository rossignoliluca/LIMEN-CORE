/**
 * external/providers - Integrazioni LLM e gate
 *
 * Re-exports from operational/providers/
 */

export * from '../../operational/providers/llm_provider';

// Types exported once (shared between gate_client and gate_embedded)
export type {
  GateSignal,
  GateReasonCode,
  GateSignalEffect,
  GateRequest,
  GateDecision,
  GateClientConfig,
  GateResult
} from '../../operational/providers/gate_client';

// Classes and functions from gate_client
export {
  GateClient,
  getGateClient,
  resetGateClient,
  interpretGateSignal
} from '../../operational/providers/gate_client';

// gate_embedded (EmbeddedGate uses same type names - access via module)
export {
  EmbeddedGate,
  getEmbeddedGate,
  resetEmbeddedGate,
  classifyEmbedded,
  interpretEmbeddedGateSignal
} from '../../operational/providers/gate_embedded';
export type { EmbeddedGateResult } from '../../operational/providers/gate_embedded';

export * from '../../gate/thresholds/llm_cache';
