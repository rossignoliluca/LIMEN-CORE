/**
 * ENOQ L1 PIPELINE
 *
 * The complete perception-action pipeline.
 * Input → Gate → Perception → Selection → Generation → Verify → Output
 */
import { PipelineInput, PipelineOutput } from './types';
export declare function process(input: PipelineInput): PipelineOutput;
export declare function respond(message: string): string;
export declare function debug(message: string): void;
export { perceive } from './perception';
export { select } from './selection';
export { generate } from './generation';
export * from './types';
export { GateClient, GateResult, GateSignalEffect, interpretGateSignal, getGateClient, resetGateClient, GateClientConfig, } from './gate_client';
export { enoq, createSession, Session, Turn, PipelineTrace, PipelineResult, PipelineConfig, } from './pipeline';
declare const _default: {
    process: typeof process;
    respond: typeof respond;
    debug: typeof debug;
};
export default _default;
//# sourceMappingURL=index.d.ts.map