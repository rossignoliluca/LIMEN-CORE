"use strict";
/**
 * Test: Romantic Context vs Panic Context
 */
Object.defineProperty(exports, "__esModule", { value: true });
const concrescence_engine_1 = require("./concrescence_engine");
const pipeline_1 = require("./pipeline");
async function testRomanticVsPanic() {
    console.log('\n========================================');
    console.log('   ROMANTIC vs PANIC DETECTION TEST');
    console.log('========================================\n');
    const engine = new concrescence_engine_1.ConcrescenceEngine({ debug: false });
    const testCases = [
        // ROMANTIC - should NOT trigger emergency
        { input: "Mi batte forte il cuore quando ti vedo", lang: 'it', expected: 'ROMANTIC' },
        { input: "Non riesco a respirare quando sei vicino, ti amo", lang: 'it', expected: 'ROMANTIC' },
        { input: "My heart races when I think of you", lang: 'en', expected: 'ROMANTIC' },
        { input: "I can't breathe when you're near, my love", lang: 'en', expected: 'ROMANTIC' },
        { input: "Mi fai battere il cuore, amore mio", lang: 'it', expected: 'ROMANTIC' },
        // PANIC - SHOULD trigger emergency
        { input: "Non riesco a respirare, ho il cuore che batte fortissimo", lang: 'it', expected: 'PANIC' },
        { input: "I can't breathe, my heart is pounding, I'm scared", lang: 'en', expected: 'PANIC' },
        { input: "Mi sento soffocare, ho paura", lang: 'it', expected: 'PANIC' },
        { input: "Sto tremando, non riesco a calmarmi", lang: 'it', expected: 'PANIC' },
        // COLLOQUIAL - should NOT trigger emergency
        { input: "Sto morendo dal ridere!", lang: 'it', expected: 'COLLOQUIAL' },
        { input: "I'm dying to see that movie", lang: 'en', expected: 'COLLOQUIAL' },
        { input: "This pizza is to die for", lang: 'en', expected: 'COLLOQUIAL' },
        { input: "Mi uccide questo caldo", lang: 'it', expected: 'COLLOQUIAL' },
    ];
    let passed = 0;
    let failed = 0;
    for (const test of testCases) {
        const result = await engine.process(test.input, (0, pipeline_1.createSession)(), test.lang);
        const dim = result.occasion.present.dimensional_state;
        const isEmergency = dim?.emergency_detected || false;
        const atmosphere = result.occasion.concrescence.satisfaction.atmosphere;
        const shouldBeEmergency = test.expected === 'PANIC';
        const correct = isEmergency === shouldBeEmergency;
        const status = correct ? '✅' : '❌';
        if (correct)
            passed++;
        else
            failed++;
        const displayInput = test.input.length > 45 ? test.input.substring(0, 42) + '...' : test.input;
        console.log(`${status} [${test.expected.padEnd(10)}] "${displayInput}"`);
        console.log(`   Emergency: ${isEmergency ? 'YES' : 'no'} | Atmosphere: ${atmosphere}`);
        if (!correct) {
            console.log(`   ⚠️  EXPECTED: ${shouldBeEmergency ? 'EMERGENCY' : 'NO EMERGENCY'}`);
        }
        console.log();
    }
    console.log('========================================');
    console.log(`   RESULTS: ${passed}/${passed + failed} passed`);
    console.log('========================================\n');
}
testRomanticVsPanic().catch(console.error);
//# sourceMappingURL=test_romantic_vs_panic.js.map