"use strict";
/**
 * ENOQ GATE CLIENT
 *
 * HTTP client for gate-runtime integration.
 * Calls Gate BEFORE any LLM generation.
 *
 * Gate signals which domain is active, then halts.
 * ENOQ decides what to do with that signal.
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateClient = void 0;
exports.interpretGateSignal = interpretGateSignal;
exports.getGateClient = getGateClient;
exports.resetGateClient = resetGateClient;
const crypto = __importStar(require("crypto"));
// ============================================
// DEFAULT CONFIG
// ============================================
const DEFAULT_CONFIG = {
    base_url: process.env.GATE_RUNTIME_URL || 'http://localhost:3000',
    timeout_ms: 1000,
    marker_version: 'v1.0',
    context_scope_id: 'enoq-core',
    enabled: true,
};
// ============================================
// HELPERS
// ============================================
function generateRequestId() {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}
function hashInput(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
// ============================================
// GATE CLIENT CLASS
// ============================================
class GateClient {
    constructor(config = {}) {
        this.lastResult = null;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Classify input through Gate runtime.
     * Returns signal indicating which domain is active.
     *
     * IMPORTANT: This must be called BEFORE any LLM generation.
     */
    async classify(input) {
        const startTime = Date.now();
        const request_id = generateRequestId();
        // If Gate is disabled, return NULL (proceed normally)
        if (!this.config.enabled) {
            const result = {
                signal: 'NULL',
                reason_code: 'ZERO_PERTURBATION',
                request_id,
                latency_ms: 0,
            };
            this.lastResult = result;
            return result;
        }
        const request = {
            request_id,
            timestamp: new Date().toISOString(),
            input_hash: hashInput(input),
            input_text: input,
            marker_version: this.config.marker_version,
            context_scope_id: this.config.context_scope_id,
        };
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout_ms);
            const response = await fetch(`${this.config.base_url}/gate/classify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`Gate returned ${response.status}`);
            }
            const decision = await response.json();
            const result = {
                signal: decision.signal,
                reason_code: decision.reason_code,
                request_id: decision.request_id,
                latency_ms: Date.now() - startTime,
            };
            this.lastResult = result;
            return result;
        }
        catch (error) {
            // On any error, fail safe to NULL (proceed with ENOQ)
            const result = {
                signal: 'NULL',
                reason_code: 'UNCLASSIFIABLE',
                request_id,
                latency_ms: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            this.lastResult = result;
            return result;
        }
    }
    /**
     * Get the last classification result.
     */
    getLastResult() {
        return this.lastResult;
    }
    /**
     * Check if Gate runtime is available.
     */
    async healthCheck() {
        if (!this.config.enabled) {
            return false;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(`${this.config.base_url}/health`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response.ok;
        }
        catch {
            return false;
        }
    }
    /**
     * Update configuration.
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get current configuration.
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.GateClient = GateClient;
function interpretGateSignal(signal, reason_code) {
    switch (signal) {
        case 'D1_ACTIVE':
            // Operational Continuity: physical need, danger, resource lack
            // ENOQ must prioritize safety, not exploration
            return {
                proceed: true,
                atmosphere_hint: 'EMERGENCY',
                depth_ceiling: 'surface',
                forbidden_additions: ['explore', 'analyze', 'philosophize'],
                required_additions: ['safety_check', 'ground'],
                escalate: true,
                professional_referral: true,
            };
        case 'D2_ACTIVE':
            // Coordination: disruption with other agents
            // ENOQ helps see the dynamic, not take sides
            return {
                proceed: true,
                atmosphere_hint: 'HUMAN_FIELD',
                depth_ceiling: 'medium',
                forbidden_additions: ['take_sides', 'advise_action'],
                required_additions: ['validate', 'explore_safely'],
            };
        case 'D3_ACTIVE':
            // Operative Selection: decision blockage
            // ENOQ maps the decision, never picks
            return {
                proceed: true,
                atmosphere_hint: 'DECISION',
                depth_ceiling: 'deep',
                forbidden_additions: ['recommend', 'pick_option', 'implicit_recommendation'],
                required_additions: ['return_ownership', 'map_costs'],
            };
        case 'D4_ACTIVE':
            // Boundary: self/other confusion
            // ENOQ helps clarify boundaries, not define identity
            return {
                proceed: true,
                atmosphere_hint: 'V_MODE',
                depth_ceiling: 'medium',
                forbidden_additions: ['define_identity', 'label'],
                required_additions: ['mirror_only', 'gentle_inquiry'],
            };
        case 'NULL':
            // No domain activated - proceed normally
            // Reason codes matter here
            if (reason_code === 'NORMATIVE_REQUEST') {
                // User asked for values/meaning - V_MODE
                return {
                    proceed: true,
                    atmosphere_hint: 'V_MODE',
                    forbidden_additions: ['recommend', 'advise'],
                    required_additions: ['return_ownership'],
                };
            }
            if (reason_code === 'AMBIGUOUS') {
                // Multiple domains - be cautious
                return {
                    proceed: true,
                    depth_ceiling: 'medium',
                    forbidden_additions: ['rush'],
                    required_additions: ['validate'],
                };
            }
            // Default: proceed normally
            return {
                proceed: true,
            };
        default:
            return { proceed: true };
    }
}
// ============================================
// SINGLETON INSTANCE
// ============================================
let gateClientInstance = null;
function getGateClient(config) {
    if (!gateClientInstance) {
        gateClientInstance = new GateClient(config);
    }
    else if (config) {
        gateClientInstance.updateConfig(config);
    }
    return gateClientInstance;
}
function resetGateClient() {
    gateClientInstance = null;
}
// ============================================
// EXPORTS
// ============================================
exports.default = GateClient;
//# sourceMappingURL=gate_client.js.map