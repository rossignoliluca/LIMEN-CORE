/**
 * LIMEN Organ - Protocols Module
 *
 * Response protocols for downstream LLM behavior.
 *
 * @module gate/protocols
 */

export {
  ResponseProtocol,
  ToneAdjustment,
  VerificationCheck,
  D1_PROTOCOL,
  D2_PROTOCOL,
  D3_PROTOCOL,
  D4_PROTOCOL,
  NULL_PROTOCOL,
  RESPONSE_PROTOCOLS,
  getProtocol,
  getSystemPromptAddition,
  VERIFICATION_CHECKS,
  getVerificationChecks,
  UNIVERSAL_PROHIBITIONS,
  OVERRIDE_CONDITIONS
} from './response_protocol';
