#!/usr/bin/env npx ts-node
"use strict";
/**
 * ENOQ CLI
 *
 * Interactive command-line interface for ENOQ.
 *
 * Usage:
 *   npx ts-node src/cli.ts
 *
 * Environment:
 *   OPENAI_API_KEY - for LLM generation (optional)
 *   ANTHROPIC_API_KEY - alternative LLM (optional)
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
const pipeline_1 = require("./pipeline");
const llm_provider_1 = require("./llm_provider");
const readline = __importStar(require("readline"));
// ============================================
// CLI INTERFACE
// ============================================
async function main() {
    const session = (0, pipeline_1.createSession)();
    // Check LLM availability
    const llmStatus = (0, llm_provider_1.checkLLMAvailability)();
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║     ███████╗███╗   ██╗ ██████╗  ██████╗                    ║');
    console.log('║     ██╔════╝████╗  ██║██╔═══██╗██╔═══██╗                   ║');
    console.log('║     █████╗  ██╔██╗ ██║██║   ██║██║   ██║                   ║');
    console.log('║     ██╔══╝  ██║╚██╗██║██║   ██║██║▄▄ ██║                   ║');
    console.log('║     ███████╗██║ ╚████║╚██████╔╝╚██████╔╝                   ║');
    console.log('║     ╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚══▀▀═╝                    ║');
    console.log('║                                                            ║');
    console.log('║              Cognitive Companion                           ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    if (llmStatus.available) {
        console.log(`  ✓ LLM: ${llmStatus.providers.join(', ')}`);
    }
    else {
        console.log('  ⚠ LLM: Not available (template mode only)');
        console.log('    Set OPENAI_API_KEY or ANTHROPIC_API_KEY for full responses');
    }
    console.log(`  ✓ Session: ${session.session_id}`);
    console.log('');
    console.log('  Commands:');
    console.log('    /trace  - Show last response trace');
    console.log('    /stats  - Show session statistics');
    console.log('    /clear  - Clear screen');
    console.log('    /exit   - End session');
    console.log('');
    console.log('────────────────────────────────────────────────────────────────');
    console.log('');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    let lastTrace = null;
    const prompt = () => {
        rl.question('You: ', async (input) => {
            const trimmed = input.trim();
            // Handle commands
            if (trimmed === '/exit') {
                printSessionEnd(session);
                rl.close();
                return;
            }
            if (trimmed === '/trace') {
                printTrace(lastTrace);
                prompt();
                return;
            }
            if (trimmed === '/stats') {
                printStats(session);
                prompt();
                return;
            }
            if (trimmed === '/clear') {
                console.clear();
                prompt();
                return;
            }
            if (trimmed === '') {
                prompt();
                return;
            }
            // Process through ENOQ
            try {
                const startTime = Date.now();
                const result = await (0, pipeline_1.enoq)(trimmed, session);
                const elapsed = Date.now() - startTime;
                lastTrace = result.trace;
                console.log('');
                console.log(`ENOQ: ${result.output}`);
                console.log('');
                // Show minimal trace info
                const domains = result.trace.s1_field.domains?.slice(0, 2).map(d => d.domain.replace('H0', '').replace('H', '').replace('_', ':')).join(', ') || '';
                if (domains) {
                    console.log(`  [${domains} | ${result.trace.s4_context.runtime} | ${elapsed}ms]`);
                    console.log('');
                }
            }
            catch (error) {
                console.error('\n  Error:', error);
                console.log('');
            }
            prompt();
        });
    };
    prompt();
}
// ============================================
// OUTPUT HELPERS
// ============================================
function printTrace(trace) {
    if (!trace) {
        console.log('\n  No trace available. Send a message first.\n');
        return;
    }
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│           PIPELINE TRACE                │');
    console.log('├─────────────────────────────────────────┤');
    // S1: Perception
    console.log('│ S1 SENSE:');
    const domains = trace.s1_field.domains?.map((d) => `${d.domain}(${(d.salience * 100).toFixed(0)}%)`).join(', ') || 'N/A';
    console.log(`│   Domains: ${domains}`);
    console.log(`│   Arousal: ${trace.s1_field.arousal || 'N/A'}`);
    console.log(`│   Flags: ${trace.s1_field.flags?.join(', ') || 'none'}`);
    // Governor
    console.log('│ GOVERNOR:');
    console.log(`│   Rules: ${trace.s1_governor.rules_applied?.join(', ') || 'none'}`);
    // MetaKernel
    console.log('│ METAKERNEL:');
    console.log(`│   Power: ${(trace.s1_meta_kernel.power_level * 100).toFixed(0)}%`);
    console.log(`│   Ceiling: ${trace.s1_meta_kernel.depth_ceiling}`);
    // Selection
    console.log('│ S3 SELECT:');
    console.log(`│   Atmosphere: ${trace.s3_selection.atmosphere || 'N/A'}`);
    console.log(`│   Primitive: ${trace.s3_selection.primitive || 'N/A'}`);
    console.log(`│   Depth: ${trace.s3_selection.depth || 'N/A'}`);
    // Execution
    console.log('│ S4 ACT:');
    console.log(`│   Runtime: ${trace.s4_context.runtime}`);
    console.log(`│   Forbidden: ${trace.s4_context.forbidden?.slice(0, 3).join(', ') || 'none'}`);
    // Verification
    console.log('│ S5 VERIFY:');
    console.log(`│   Passed: ${trace.s5_verification.passed ? '✓' : '✗'}`);
    console.log(`│   Violations: ${trace.s5_verification.violations}`);
    // Timing
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Latency: ${trace.latency_ms}ms`);
    console.log('└─────────────────────────────────────────┘\n');
}
function printStats(session) {
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│          SESSION STATISTICS             │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Session ID: ${session.session_id.substring(0, 20)}...`);
    console.log(`│ Turns: ${session.turns.length}`);
    console.log(`│ Delegation attempts: ${session.memory.delegation_attempts}`);
    console.log(`│ Decisions made: ${session.memory.decisions_made}`);
    console.log(`│ Language: ${session.memory.language_preference}`);
    console.log(`│ Audit entries: ${session.audit_trail.length}`);
    console.log('├─────────────────────────────────────────┤');
    console.log('│ Telemetry:');
    console.log(`│   Delegation rate: ${(session.telemetry.delegation_rate * 100).toFixed(1)}%`);
    console.log(`│   Passive rate: ${(session.telemetry.passive_turns_rate * 100).toFixed(1)}%`);
    console.log(`│   Loop count: ${session.telemetry.loop_count}`);
    console.log('└─────────────────────────────────────────┘\n');
}
function printSessionEnd(session) {
    console.log('\n');
    console.log('────────────────────────────────────────────────────────────────');
    console.log('');
    console.log('  Session ended.');
    console.log('');
    console.log(`  Turns: ${session.turns.length}`);
    console.log(`  Delegation attempts: ${session.memory.delegation_attempts}`);
    console.log(`  Decisions made: ${session.memory.decisions_made}`);
    console.log('');
    if (session.memory.decisions_made > session.memory.delegation_attempts) {
        console.log('  You made more decisions than delegations. Good.');
    }
    else if (session.memory.delegation_attempts > 0) {
        console.log('  You tried to delegate. I returned it to you.');
    }
    console.log('');
    console.log('  "ENOQ ti porta fino al punto in cui vorresti delegare.');
    console.log('   E lì ti restituisce a te stesso."');
    console.log('');
}
// ============================================
// RUN
// ============================================
main().catch(console.error);
//# sourceMappingURL=cli.js.map