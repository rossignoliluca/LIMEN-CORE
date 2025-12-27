/**
 * ENOQ L1 PERCEPTION
 *
 * Transforms raw input into structured Field State.
 * Does NOT generate response. Only perceives.
 */
import { FieldState } from './types';
export declare function perceive(message: string, conversationHistory?: string[]): FieldState;
export default perceive;
//# sourceMappingURL=perception.d.ts.map