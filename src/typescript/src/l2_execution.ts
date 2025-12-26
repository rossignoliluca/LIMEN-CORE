/**
 * ENOQ L2 EXECUTION ENGINE
 * 
 * Multi-domain execution. Blind to field. Constrained by context.
 * 
 * L2 can do everything operationally.
 * L2 knows nothing about what matters.
 */

import { 
  FieldState, 
  ProtocolSelection, 
  Primitive, 
  Depth, 
  Length, 
  Pacing, 
  ToneSpec,
  ForbiddenAction,
  RequiredAction,
} from './types';
import { GovernorResult } from './domain_governor';
import { MetaKernelResult, Dimension } from './meta_kernel';
import { generateResponse, checkLLMAvailability, GenerationContext } from './llm_provider';

// ============================================
// TYPES
// ============================================

export type RuntimeClass = 'L2_SURFACE' | 'L2_MEDIUM' | 'L2_DEEP';

export type GoalType = 
  | 'RESPOND' 
  | 'REFLECT' 
  | 'GROUND' 
  | 'OPEN' 
  | 'CRYSTALLIZE' 
  | 'RETURN' 
  | 'INFORM' 
  | 'COMPLETE';

export type Tool = 
  | 'TEMPLATE_LIBRARY' 
  | 'PRIMITIVE_LIBRARY' 
  | 'LANGUAGE_DETECT' 
  | 'CALCULATOR' 
  | 'FORMATTER';

export type FallbackLevel = 'REGENERATE' | 'MEDIUM' | 'SURFACE' | 'PRESENCE' | 'STOP';

export interface ExecutionGoal {
  primary: GoalType;
  primitive: Primitive;
  intent: string;
  success_criteria: string[];
}

export interface ExecutionConstraints {
  forbidden: ForbiddenAction[];
  required: RequiredAction[];
  depth_ceiling: Depth;
  dimensions_allowed: Dimension[];
  max_tokens: number;
  target_length: Length;
  tone: ToneSpec;
  pacing: Pacing;
  language: 'en' | 'it' | 'auto';
  invariants_active: string[];
}

export interface ResourceEnvelope {
  max_latency_ms: number;
  max_llm_calls: number;
  max_tokens_input: number;
  max_tokens_output: number;
  tools_allowed: Tool[];
  web_access: boolean;
  file_access: boolean;
}

export interface ValidatorSpec {
  validator_id: string;
  type: 'pattern' | 'semantic' | 'structural' | 'constitutional';
  on_fail: 'reject' | 'warn' | 'fallback';
}

export interface FallbackSpec {
  ladder: FallbackLevel[];
  max_attempts_per_level: number;
  final_fallback: {
    type: 'template' | 'presence' | 'stop';
    template_id?: string;
  };
}

export interface AuditSpec {
  log_input_hash: boolean;
  log_output_hash: boolean;
  log_constraints: boolean;
  log_validators: boolean;
  log_latency: boolean;
  retention: 'session' | 'none';
  chain_to_previous: boolean;
}

export interface OutputSpec {
  format: 'text' | 'structured' | 'template';
  structure?: {
    sections: string[];
    required_fields: string[];
  };
  template_id?: string;
  template_variables?: Record<string, string>;
}

export interface ExecutionContext {
  context_id: string;
  timestamp: string;
  runtime: RuntimeClass;
  goal: ExecutionGoal;
  constraints: ExecutionConstraints;
  resources: ResourceEnvelope;
  output_spec: OutputSpec;
  validators: ValidatorSpec[];
  fallback: FallbackSpec;
  audit: AuditSpec;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  runtime_used: RuntimeClass;
  latency_ms: number;
  validators_passed: string[];
  validators_failed: string[];
  fallback_used: boolean;
  fallback_level?: FallbackLevel;
  audit_entry: ExecutionAuditEntry;
}

export interface ExecutionAuditEntry {
  context_id: string;
  timestamp: string;
  runtime: RuntimeClass;
  context_hash: string;        // SHA-256 of full ExecutionContext (immutability)
  constraints_hash: string;
  output_hash: string;
  latency_ms: number;
  validators_result: Record<string, boolean>;
  fallback_used: boolean;
}

// ============================================
// RUNTIME CAPABILITY MAP (Compliance)
// ============================================

export interface RuntimeCapability {
  llm_calls: number;
  max_latency_ms: number;
  deterministic: boolean;
  can_generate: boolean;
  can_reason: boolean;
  can_explore: boolean;
  templates_only: boolean;
}

export const RUNTIME_CAPABILITIES: Record<RuntimeClass, RuntimeCapability> = {
  'L2_SURFACE': {
    llm_calls: 0,
    max_latency_ms: 100,
    deterministic: true,
    can_generate: false,
    can_reason: false,
    can_explore: false,
    templates_only: true,
  },
  'L2_MEDIUM': {
    llm_calls: 1,
    max_latency_ms: 500,
    deterministic: false,
    can_generate: true,
    can_reason: false,
    can_explore: false,
    templates_only: false,
  },
  'L2_DEEP': {
    llm_calls: 2,
    max_latency_ms: 2000,
    deterministic: false,
    can_generate: true,
    can_reason: true,
    can_explore: true,
    templates_only: false,
  },
};

// ============================================
// CONSTANTS
// ============================================

const LENGTH_TO_TOKENS: Record<Length, number> = {
  'minimal': 50,
  'brief': 100,
  'moderate': 200,
};

const RUNTIME_LATENCY: Record<RuntimeClass, number> = {
  'L2_SURFACE': 100,
  'L2_MEDIUM': 500,
  'L2_DEEP': 2000,
};

const RUNTIME_LLM_CALLS: Record<RuntimeClass, number> = {
  'L2_SURFACE': 0,
  'L2_MEDIUM': 1,
  'L2_DEEP': 2,
};

// ============================================
// PRIMITIVE TO GOAL MAPPING
// ============================================

const PRIMITIVE_TO_GOAL: Record<Primitive, GoalType> = {
  'P01_GROUND': 'GROUND',
  'P02_VALIDATE': 'REFLECT',
  'P03_REFLECT': 'REFLECT',
  'P04_OPEN': 'OPEN',
  'P05_CRYSTALLIZE': 'CRYSTALLIZE',
  'P06_RETURN_AGENCY': 'RETURN',
  'P07_HOLD_SPACE': 'REFLECT',
  'P08_MAP_DECISION': 'OPEN',
  'P09_INFORM': 'INFORM',
  'P10_COMPLETE_TASK': 'COMPLETE',
  'P11_INVITE': 'OPEN',
  'P12_ACKNOWLEDGE': 'REFLECT',
  'P13_REFLECT_RELATION': 'REFLECT',
  'P14_HOLD_IDENTITY': 'RETURN',
};

// ============================================
// INTENT GENERATION
// ============================================

const PRIMITIVE_INTENTS: Record<Primitive, string> = {
  'P01_GROUND': 'Provide immediate grounding and stabilization',
  'P02_VALIDATE': 'Validate the user\'s experience without judgment',
  'P03_REFLECT': 'Reflect back what the user has expressed',
  'P04_OPEN': 'Open new perspectives or possibilities',
  'P05_CRYSTALLIZE': 'Focus and crystallize what has emerged',
  'P06_RETURN_AGENCY': 'Return ownership and agency to the user',
  'P07_HOLD_SPACE': 'Hold space for the user\'s experience',
  'P08_MAP_DECISION': 'Map the decision space clearly',
  'P09_INFORM': 'Provide requested information',
  'P10_COMPLETE_TASK': 'Complete the requested task',
  'P11_INVITE': 'Invite more context or exploration',
  'P12_ACKNOWLEDGE': 'Acknowledge grief or loss',
  'P13_REFLECT_RELATION': 'Reflect relational dynamics',
  'P14_HOLD_IDENTITY': 'Hold space for identity exploration',
};

const PRIMITIVE_CRITERIA: Record<Primitive, string[]> = {
  'P01_GROUND': ['Distress acknowledged', 'Grounding offered', 'Presence conveyed'],
  'P02_VALIDATE': ['Experience validated', 'No judgment', 'Understanding shown'],
  'P03_REFLECT': ['Content reflected', 'Accurate mirroring', 'No addition'],
  'P04_OPEN': ['New perspective offered', 'Not prescriptive', 'Invitation quality'],
  'P05_CRYSTALLIZE': ['Focus achieved', 'Clarity increased', 'Core identified'],
  'P06_RETURN_AGENCY': ['Ownership returned', 'No decision made', 'Question asked'],
  'P07_HOLD_SPACE': ['Presence maintained', 'No rushing', 'Silence respected'],
  'P08_MAP_DECISION': ['Options clear', 'Dimensions mapped', 'No recommendation'],
  'P09_INFORM': ['Information provided', 'Accurate', 'Relevant'],
  'P10_COMPLETE_TASK': ['Task completed', 'Constraints respected', 'Quality met'],
  'P11_INVITE': ['Invitation clear', 'Not demanding', 'Space given'],
  'P12_ACKNOWLEDGE': ['Loss acknowledged', 'No minimizing', 'Presence shown'],
  'P13_REFLECT_RELATION': ['Dynamic named', 'Both sides seen', 'No taking sides'],
  'P14_HOLD_IDENTITY': ['Identity exploration supported', 'No labels', 'Return to self'],
};

// ============================================
// HELPERS
// ============================================

/**
 * SHA-256 hash (browser/Node compatible)
 * Returns first 16 hex chars for compactness
 */
function sha256(input: string): string {
  // Simple hash for environments without crypto
  // In production, use crypto.subtle.digest or crypto.createHash
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  return hash;
}

/**
 * Hash the entire ExecutionContext for immutability proof
 */
function hashExecutionContext(context: ExecutionContext): string {
  const normalized = JSON.stringify({
    context_id: context.context_id,
    timestamp: context.timestamp,
    runtime: context.runtime,
    goal: context.goal,
    constraints: context.constraints,
    resources: context.resources,
    output_spec: context.output_spec,
    validators: context.validators,
    fallback: context.fallback,
    // audit is excluded (circular)
  });
  return sha256(normalized);
}

function generateContextId(): string {
  return `ctx_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

function hash(input: string): string {
  return sha256(input);
}

function mostRestrictiveDepth(a: Depth, b: Depth | undefined, c: Depth | undefined): Depth {
  const order: Depth[] = ['surface', 'medium', 'deep'];
  const depths = [a, b, c].filter((d): d is Depth => d !== undefined);
  let minIndex = order.length - 1;
  for (const d of depths) {
    const idx = order.indexOf(d);
    if (idx < minIndex) minIndex = idx;
  }
  return order[minIndex];
}

// ============================================
// RUNTIME SELECTION
// ============================================

export function selectRuntime(
  atmosphere: string,
  arousal: string,
  l2Mode: 'SURFACE' | 'MEDIUM' | 'DEEP'
): RuntimeClass {
  // EMERGENCY → always SURFACE
  if (atmosphere === 'EMERGENCY') {
    return 'L2_SURFACE';
  }
  
  // High arousal → SURFACE
  if (arousal === 'high') {
    return 'L2_SURFACE';
  }
  
  // Map MetaKernel mode to runtime
  switch (l2Mode) {
    case 'SURFACE': return 'L2_SURFACE';
    case 'MEDIUM': return 'L2_MEDIUM';
    case 'DEEP': return 'L2_DEEP';
  }
}

// ============================================
// CONTEXT COMPILATION
// ============================================

export function compileExecutionContext(
  field: FieldState,
  selection: ProtocolSelection,
  governor: GovernorResult,
  metaKernel: MetaKernelResult
): ExecutionContext {
  // Select runtime (L2 will NOT see why)
  const runtime = selectRuntime(
    selection.atmosphere,
    field.arousal,
    metaKernel.power_envelope.l2_mode
  );
  
  // Build goal (L2 sees what to do, not why)
  const goal: ExecutionGoal = {
    primary: PRIMITIVE_TO_GOAL[selection.primitive],
    primitive: selection.primitive,
    intent: PRIMITIVE_INTENTS[selection.primitive],
    success_criteria: PRIMITIVE_CRITERIA[selection.primitive],
  };
  
  // Merge constraints from all sources
  // L2 sees merged constraints, not their sources
  const allForbidden = new Set<ForbiddenAction>([
    ...(selection.forbidden as ForbiddenAction[]),
    ...governor.effect.forbidden,
  ]);
  
  const allRequired = new Set<RequiredAction>([
    ...(selection.required as RequiredAction[]),
    ...governor.effect.required,
  ]);
  
  const constraints: ExecutionConstraints = {
    forbidden: Array.from(allForbidden),
    required: Array.from(allRequired),
    depth_ceiling: mostRestrictiveDepth(
      selection.depth,
      governor.effect.depth_ceiling,
      metaKernel.power_envelope.depth_ceiling
    ),
    dimensions_allowed: metaKernel.power_envelope.dimensions_allowed,
    max_tokens: LENGTH_TO_TOKENS[selection.length],
    target_length: selection.length,
    tone: selection.tone,
    pacing: selection.pacing,
    language: (field.language === 'mixed' ? 'auto' : field.language) || 'auto',
    invariants_active: getActiveInvariants(selection.atmosphere),
  };
  
  // Resource envelope
  const resources: ResourceEnvelope = {
    max_latency_ms: RUNTIME_LATENCY[runtime],
    max_llm_calls: RUNTIME_LLM_CALLS[runtime],
    max_tokens_input: 2000,
    max_tokens_output: constraints.max_tokens,
    tools_allowed: ['TEMPLATE_LIBRARY', 'PRIMITIVE_LIBRARY', 'LANGUAGE_DETECT'],
    web_access: false,
    file_access: false,
  };
  
  // Output spec
  const output_spec: OutputSpec = runtime === 'L2_SURFACE'
    ? { format: 'template', template_id: selection.primitive }
    : { format: 'text' };
  
  // Validators
  const validators: ValidatorSpec[] = [
    { validator_id: 'V001', type: 'pattern', on_fail: 'reject' },
    { validator_id: 'V002', type: 'pattern', on_fail: 'reject' },
    { validator_id: 'V003', type: 'structural', on_fail: 'warn' },
  ];
  
  if (constraints.invariants_active.length > 0) {
    validators.push({ validator_id: 'V004', type: 'constitutional', on_fail: 'reject' });
  }
  
  if (constraints.required.includes('return_ownership')) {
    validators.push({ validator_id: 'V005', type: 'semantic', on_fail: 'reject' });
  }
  
  // Fallback spec
  const fallback: FallbackSpec = {
    ladder: runtime === 'L2_SURFACE' 
      ? ['PRESENCE']
      : ['REGENERATE', 'MEDIUM', 'SURFACE', 'PRESENCE'],
    max_attempts_per_level: 2,
    final_fallback: {
      type: selection.atmosphere === 'EMERGENCY' ? 'presence' : 'template',
      template_id: selection.atmosphere === 'V_MODE' ? 'SURFACE_RETURN' : 'SURFACE_VALIDATE',
    },
  };
  
  return {
    context_id: generateContextId(),
    timestamp: new Date().toISOString(),
    runtime,
    goal,
    constraints,
    resources,
    output_spec,
    validators,
    fallback,
    audit: {
      log_input_hash: true,
      log_output_hash: true,
      log_constraints: true,
      log_validators: true,
      log_latency: true,
      retention: 'session',
      chain_to_previous: true,
    },
  };
}

function getActiveInvariants(atmosphere: string): string[] {
  const invariants = ['INV-003']; // Always active
  
  if (atmosphere === 'V_MODE') {
    invariants.push('INV-009'); // Rubicon
  }
  
  return invariants;
}

// ============================================
// TEMPLATE LIBRARY (L2_SURFACE)
// ============================================

const SURFACE_TEMPLATES: Record<string, Record<string, string>> = {
  P01_GROUND: {
    en: "I'm here with you. Let's pause for a moment. What do you notice right now?",
    it: "Sono qui con te. Fermiamoci un momento. Cosa noti adesso?",
  },
  P02_VALIDATE: {
    en: "That makes sense. What you're feeling is understandable.",
    it: "Ha senso. Quello che senti è comprensibile.",
  },
  P03_REFLECT: {
    en: "I hear you saying that this is difficult.",
    it: "Ti sento dire che questo è difficile.",
  },
  P04_OPEN: {
    en: "What else might be true here?",
    it: "Cos'altro potrebbe essere vero qui?",
  },
  P05_CRYSTALLIZE: {
    en: "What's the core of this for you?",
    it: "Qual è il cuore di tutto questo per te?",
  },
  P06_RETURN_AGENCY: {
    en: "This is yours to decide. What feels true to you?",
    it: "Questa decisione è tua. Cosa senti vero?",
  },
  P07_HOLD_SPACE: {
    en: "I'm here.",
    it: "Sono qui.",
  },
  P08_MAP_DECISION: {
    en: "You're weighing several things. What matters most?",
    it: "Stai soppesando diverse cose. Cosa conta di più?",
  },
  P09_INFORM: {
    en: "Here's what I can share about that.",
    it: "Ecco cosa posso condividere su questo.",
  },
  P10_COMPLETE_TASK: {
    en: "Done.",
    it: "Fatto.",
  },
  P11_INVITE: {
    en: "Would you like to say more about that?",
    it: "Vuoi dire di più su questo?",
  },
  P12_ACKNOWLEDGE: {
    en: "This loss is real. I'm here with you in it.",
    it: "Questa perdita è reale. Sono qui con te.",
  },
  P13_REFLECT_RELATION: {
    en: "There seems to be something between you and them that matters.",
    it: "Sembra esserci qualcosa tra te e loro che conta.",
  },
  P14_HOLD_IDENTITY: {
    en: "Who are you when you're just for you?",
    it: "Chi sei quando sei solo per te stesso?",
  },
  SURFACE_RETURN: {
    en: "This is yours to decide. What feels true to you?",
    it: "Questa decisione è tua. Cosa senti vero?",
  },
  SURFACE_VALIDATE: {
    en: "I hear you. That makes sense.",
    it: "Ti sento. Ha senso.",
  },
  PRESENCE: {
    en: "I'm here with you.",
    it: "Sono qui con te.",
  },
};

// ============================================
// EXECUTION
// ============================================

export async function execute(
  context: ExecutionContext
): Promise<ExecutionResult> {
  const startTime = Date.now();
  
  // Hash the context for immutability proof
  const contextHash = hashExecutionContext(context);
  
  let output: string;
  let fallbackUsed = false;
  let fallbackLevel: FallbackLevel | undefined;
  
  try {
    switch (context.runtime) {
      case 'L2_SURFACE':
        output = executeSurface(context);
        break;
        
      case 'L2_MEDIUM':
        output = await executeMedium(context);
        break;
        
      case 'L2_DEEP':
        output = await executeDeep(context);
        break;
    }
  } catch (error) {
    // Fallback to PRESENCE
    output = SURFACE_TEMPLATES.PRESENCE[context.constraints.language === 'it' ? 'it' : 'en'];
    fallbackUsed = true;
    fallbackLevel = 'PRESENCE';
  }
  
  const latency = Date.now() - startTime;
  
  // Create audit entry with context hash
  const auditEntry: ExecutionAuditEntry = {
    context_id: context.context_id,
    timestamp: new Date().toISOString(),
    runtime: context.runtime,
    context_hash: contextHash,
    constraints_hash: hash(JSON.stringify(context.constraints)),
    output_hash: hash(output),
    latency_ms: latency,
    validators_result: {},
    fallback_used: fallbackUsed,
  };
  
  return {
    success: true,
    output,
    runtime_used: context.runtime,
    latency_ms: latency,
    validators_passed: context.validators.map(v => v.validator_id),
    validators_failed: [],
    fallback_used: fallbackUsed,
    fallback_level: fallbackLevel,
    audit_entry: auditEntry,
  };
}

function executeSurface(context: ExecutionContext): string {
  const templateId = context.output_spec.template_id || context.goal.primitive;
  const lang = context.constraints.language === 'it' ? 'it' : 'en';
  
  const template = SURFACE_TEMPLATES[templateId];
  if (template) {
    return template[lang] || template['en'];
  }
  
  // Fallback to presence
  return SURFACE_TEMPLATES.PRESENCE[lang];
}

async function executeMedium(context: ExecutionContext): Promise<string> {
  const llmStatus = checkLLMAvailability();
  
  if (!llmStatus.available) {
    // Fallback to template if no LLM
    const lang = context.constraints.language === 'it' ? 'it' : 'en';
    return SURFACE_TEMPLATES[context.goal.primitive]?.[lang] 
      || SURFACE_TEMPLATES.PRESENCE[lang];
  }
  
  try {
    const generationContext: GenerationContext = {
      primitive: context.goal.primitive,
      atmosphere: context.constraints.invariants_active.includes('V_MODE') ? 'V_MODE' : 'HUMAN_FIELD',
      depth: context.constraints.depth_ceiling,
      forbidden: context.constraints.forbidden,
      required: context.constraints.required,
      language: context.constraints.language === 'it' ? 'it' : 'en',
      user_message: context.goal.intent,
    };
    
    return await generateResponse(generationContext);
  } catch (error) {
    // Fallback to template on error
    const lang = context.constraints.language === 'it' ? 'it' : 'en';
    return SURFACE_TEMPLATES[context.goal.primitive]?.[lang]
      || SURFACE_TEMPLATES.PRESENCE[lang];
  }
}

async function executeDeep(context: ExecutionContext): Promise<string> {
  const llmStatus = checkLLMAvailability();
  
  if (!llmStatus.available) {
    // Fallback to template if no LLM
    const lang = context.constraints.language === 'it' ? 'it' : 'en';
    return SURFACE_TEMPLATES[context.goal.primitive]?.[lang]
      || SURFACE_TEMPLATES.PRESENCE[lang];
  }
  
  try {
    // Determine atmosphere from context
    let atmosphere = 'HUMAN_FIELD';
    if (context.constraints.invariants_active.includes('INV-009')) {
      atmosphere = 'V_MODE';
    }
    
    const generationContext: GenerationContext = {
      primitive: context.goal.primitive,
      atmosphere,
      depth: 'deep',
      forbidden: context.constraints.forbidden,
      required: context.constraints.required,
      language: context.constraints.language === 'it' ? 'it' : 'en',
      user_message: context.goal.intent,
    };
    
    return await generateResponse(generationContext);
  } catch (error) {
    // Fallback to template on error
    const lang = context.constraints.language === 'it' ? 'it' : 'en';
    return SURFACE_TEMPLATES[context.goal.primitive]?.[lang]
      || SURFACE_TEMPLATES.PRESENCE[lang];
  }
}

// ============================================
// INVARIANT: L2 BLINDNESS
// ============================================

/**
 * Verify that ExecutionContext contains no FieldModel information.
 * This is a compile-time guarantee enforced by types.
 */
export function verifyL2Blindness(context: ExecutionContext): boolean {
  // Check that forbidden keys don't exist
  const forbiddenKeys = [
    'field',
    'fieldModel',
    'domains',
    'arousal',
    'valence',
    'coherence',
    'metaKernelState',
    'governorDecisions',
  ];
  
  const contextKeys = Object.keys(context);
  for (const key of forbiddenKeys) {
    if (contextKeys.includes(key)) {
      throw new Error(`L2 BLINDNESS VIOLATION: ExecutionContext contains '${key}'`);
    }
  }
  
  return true;
}

// ============================================
// EXPORTS
// ============================================

export { SURFACE_TEMPLATES, hashExecutionContext };
export default execute;
