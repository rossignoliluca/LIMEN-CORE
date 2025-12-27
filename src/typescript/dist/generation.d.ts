/**
 * ENOQ L1 GENERATION
 *
 * Produces bounded linguistic output from Protocol Selection.
 * Template-based for surface/medium. LLM-assisted for deep.
 */
import { ProtocolSelection, GenerationOutput, FieldState } from './types';
export declare function generate(selection: ProtocolSelection, field: FieldState, originalMessage: string): GenerationOutput;
export default generate;
//# sourceMappingURL=generation.d.ts.map