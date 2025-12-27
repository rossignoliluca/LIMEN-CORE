"use strict";
/**
 * ENOQ L1 PIPELINE
 *
 * The complete perception-action pipeline.
 * Input → Gate → Perception → Selection → Generation → Verify → Output
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = exports.enoq = exports.resetGateClient = exports.getGateClient = exports.interpretGateSignal = exports.GateClient = exports.generate = exports.select = exports.perceive = void 0;
exports.process = process;
exports.respond = respond;
exports.debug = debug;
const perception_1 = require("./perception");
const selection_1 = require("./selection");
const generation_1 = require("./generation");
// ============================================
// MAIN PIPELINE
// ============================================
function process(input) {
    // STEP 1: PERCEPTION
    const fieldState = (0, perception_1.perceive)(input.message, input.conversation_history);
    // STEP 2: SELECTION
    const protocol = (0, selection_1.select)(fieldState);
    // STEP 3: GENERATION
    const output = (0, generation_1.generate)(protocol, fieldState, input.message);
    // Return with full trace
    return {
        response: output.text,
        trace: {
            field_state: fieldState,
            selection: protocol,
            generation: output
        }
    };
}
// ============================================
// CONVENIENCE FUNCTION
// ============================================
function respond(message) {
    const result = process({ message });
    return result.response;
}
// ============================================
// DEBUG FUNCTION
// ============================================
function debug(message) {
    const result = process({ message });
    console.log('\n' + '='.repeat(60));
    console.log('INPUT:', message);
    console.log('='.repeat(60));
    console.log('\n--- PERCEPTION ---');
    console.log('Domains:', result.trace.field_state.domains.map(d => `${d.domain} (${d.salience.toFixed(2)})`).join(', '));
    console.log('Arousal:', result.trace.field_state.arousal);
    console.log('Valence:', result.trace.field_state.valence);
    console.log('Goal:', result.trace.field_state.goal);
    console.log('Flags:', result.trace.field_state.flags.join(', ') || 'none');
    console.log('Uncertainty:', result.trace.field_state.uncertainty.toFixed(2));
    console.log('\n--- SELECTION ---');
    console.log('Atmosphere:', result.trace.selection.atmosphere);
    console.log('Mode:', result.trace.selection.mode);
    console.log('Primitive:', result.trace.selection.primitive);
    console.log('Depth:', result.trace.selection.depth);
    console.log('Length:', result.trace.selection.length);
    console.log('Pacing:', result.trace.selection.pacing);
    console.log('Forbidden:', result.trace.selection.forbidden.slice(0, 3).join(', '));
    console.log('Reasoning:', result.trace.selection.reasoning);
    console.log('\n--- GENERATION ---');
    console.log('Response:', result.response);
    console.log('Tokens:', result.trace.generation.length_tokens);
    console.log('Time:', result.trace.generation.generation_time_ms, 'ms');
    console.log('='.repeat(60) + '\n');
}
// ============================================
// EXPORTS
// ============================================
var perception_2 = require("./perception");
Object.defineProperty(exports, "perceive", { enumerable: true, get: function () { return perception_2.perceive; } });
var selection_2 = require("./selection");
Object.defineProperty(exports, "select", { enumerable: true, get: function () { return selection_2.select; } });
var generation_2 = require("./generation");
Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return generation_2.generate; } });
__exportStar(require("./types"), exports);
// Gate client exports
var gate_client_1 = require("./gate_client");
Object.defineProperty(exports, "GateClient", { enumerable: true, get: function () { return gate_client_1.GateClient; } });
Object.defineProperty(exports, "interpretGateSignal", { enumerable: true, get: function () { return gate_client_1.interpretGateSignal; } });
Object.defineProperty(exports, "getGateClient", { enumerable: true, get: function () { return gate_client_1.getGateClient; } });
Object.defineProperty(exports, "resetGateClient", { enumerable: true, get: function () { return gate_client_1.resetGateClient; } });
// Full pipeline exports
var pipeline_1 = require("./pipeline");
Object.defineProperty(exports, "enoq", { enumerable: true, get: function () { return pipeline_1.enoq; } });
Object.defineProperty(exports, "createSession", { enumerable: true, get: function () { return pipeline_1.createSession; } });
exports.default = { process, respond, debug };
//# sourceMappingURL=index.js.map