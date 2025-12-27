"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dimensional_system_1 = require("./dimensional_system");
const tests = [
    "Mi sento soffocare, ho paura",
    "Sto tremando, non riesco a calmarmi",
    "Non riesco a respirare, ho il cuore che batte fortissimo"
];
for (const msg of tests) {
    const state = dimensional_system_1.dimensionalDetector.detect(msg, 'it');
    console.log('\n---');
    console.log('Input:', msg);
    console.log('SOMATIC:', state.vertical.SOMATIC.toFixed(2));
    console.log('Emergency:', state.emergency_detected);
    console.log('V_MODE:', state.v_mode_triggered);
}
//# sourceMappingURL=debug_somatic.js.map