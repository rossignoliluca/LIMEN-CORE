/**
 * ENOQ Plan Renderer - Template-First Response Generation
 *
 * Converts ResponsePlan to text.
 *
 * Strategy: TEMPLATE-FIRST + LLM FALLBACK
 * - Templates are deterministic, controllable, fast
 * - LLM is used only when template is insufficient
 *
 * Key invariant: Renderer MUST be faithful to the plan.
 * - All acts in order
 * - All constraints respected
 * - No content added beyond what plan specifies
 */

import { SupportedLanguage } from './types';
import { ResponsePlan, SpeechAct, SpeechActType, PlanConstraints } from './response_plan';

// ============================================
// TYPES
// ============================================

/**
 * Render result.
 */
export interface RenderResult {
  /** Generated text */
  text: string;

  /** Was template sufficient? */
  template_used: boolean;

  /** Was LLM needed? */
  llm_used: boolean;

  /** Rendering time (ms) */
  render_time_ms: number;

  /** Which acts were rendered */
  acts_rendered: SpeechActType[];

  /** Any constraints that couldn't be fully satisfied */
  constraint_warnings: string[];
}

/**
 * Renderer configuration.
 */
export interface RendererConfig {
  /** Allow LLM fallback */
  llm_fallback_enabled: boolean;

  /** Force template-only (for testing) */
  force_template: boolean;

  /** LLM timeout (ms) */
  llm_timeout_ms: number;
}

const DEFAULT_CONFIG: RendererConfig = {
  llm_fallback_enabled: false,  // Phase 1: templates only
  force_template: true,
  llm_timeout_ms: 5000,
};

// ============================================
// TEMPLATE LIBRARY
// ============================================

/**
 * Template fragments for each act type.
 * Key: language -> actType -> force level (low/medium/high) -> templates[]
 */
const TEMPLATE_LIBRARY: Record<string, Record<SpeechActType, Record<string, string[]>>> = {
  en: {
    acknowledge: {
      low: ['I hear you.', 'I see.', 'Mm.'],
      medium: ['I hear what you\'re saying.', 'That makes sense.', 'I understand.'],
      high: ['I really hear you on this.', 'That resonates deeply.', 'I feel the weight of what you\'re sharing.'],
    },
    mirror: {
      low: ['So you\'re saying...', 'It sounds like...'],
      medium: ['What I\'m hearing is...', 'It seems like you\'re feeling...'],
      high: ['The way I understand it, you\'re experiencing...', 'What\'s coming through clearly is...'],
    },
    validate: {
      low: ['That\'s understandable.', 'That makes sense.'],
      medium: ['It makes complete sense that you\'d feel that way.', 'Of course you feel that.'],
      high: ['Anyone in your situation would feel exactly this way.', 'What you\'re feeling is entirely valid and human.'],
    },
    map: {
      low: ['There are a few things here...', 'I notice some elements...'],
      medium: ['Let me lay out what I\'m seeing...', 'Here\'s what the situation seems to involve...'],
      high: ['Looking at the full landscape of this...', 'The terrain you\'re navigating includes...'],
    },
    experiment: {
      low: ['You might try...', 'One small thing...'],
      medium: ['Here\'s something you could experiment with...', 'Consider trying...'],
      high: ['I\'d invite you to explore...', 'What if you experimented with...'],
    },
    question: {
      low: ['What comes up for you?', 'How does that land?'],
      medium: ['What feels most important here?', 'What do you notice when you sit with that?'],
      high: ['If you look deeper, what\'s really at stake for you?', 'What would it mean if this were true?'],
    },
    boundary: {
      low: ['That\'s something only you can answer.', 'I can\'t decide that for you.'],
      medium: ['This is your territory to navigate.', 'That decision belongs to you.'],
      high: ['This touches something so personal that only you can hold it.', 'This is sacred ground that\'s yours alone.'],
    },
    redirect: {
      low: ['It might help to talk to someone about this.', 'There are resources for this.'],
      medium: ['A professional could really help here.', 'This deserves expert support.'],
      high: ['I want to be honest: this calls for specialized help.', 'What you\'re facing deserves proper professional support.'],
    },
    ground: {
      low: ['Take a breath.', 'Feel your feet.'],
      medium: ['Right now, just notice your breath.', 'Can you feel where your body meets the chair?'],
      high: ['Let\'s slow down. Feel the weight of your body. Notice the breath moving.', 'Before anything else, come back to this moment. Your breath. Your body.'],
    },
    hold: {
      low: ['I\'m here.', 'Take your time.'],
      medium: ['I\'m here with you.', 'There\'s no rush. I\'m here.'],
      high: ['I\'m not going anywhere. Take all the time you need.', 'I\'m holding this space with you. You\'re not alone in this.'],
    },
    name: {
      low: ['That\'s a pattern.', 'I notice something here.'],
      medium: ['There\'s something happening here that has a name...', 'What I\'m seeing is...'],
      high: ['Let me name what I\'m observing...', 'There\'s a dynamic at play here that\'s worth naming...'],
    },
    offer_frame: {
      low: ['One way to see this...', 'A lens on this...'],
      medium: ['Here\'s one way to look at it...', 'Consider this perspective...'],
      high: ['There\'s a frame that might illuminate this...', 'Let me offer a way of seeing this...'],
    },
    return_agency: {
      low: ['This is yours to decide.', 'What do you want to do?'],
      medium: ['The choice is entirely yours.', 'What feels right to you?'],
      high: ['I can\'t carry this for you—and I wouldn\'t want to. This is your decision, your life.', 'This is your call. What does your gut say?'],
    },
  },

  it: {
    acknowledge: {
      low: ['Ti ascolto.', 'Capisco.', 'Sì.'],
      medium: ['Sento quello che dici.', 'Ha senso.', 'Capisco cosa intendi.'],
      high: ['Sento davvero quello che stai condividendo.', 'Percepisco il peso di quello che dici.'],
    },
    mirror: {
      low: ['Quindi stai dicendo...', 'Sembra che...'],
      medium: ['Quello che sto sentendo è...', 'Mi sembra che tu stia provando...'],
      high: ['Da quello che capisco, stai vivendo...', 'Quello che emerge chiaramente è...'],
    },
    validate: {
      low: ['È comprensibile.', 'Ha senso.'],
      medium: ['È del tutto naturale che ti senta così.', 'Certo che ti senti così.'],
      high: ['Chiunque nella tua situazione si sentirebbe esattamente così.', 'Quello che provi è completamente valido e umano.'],
    },
    map: {
      low: ['Ci sono alcune cose qui...', 'Noto alcuni elementi...'],
      medium: ['Provo a mettere in ordine quello che vedo...', 'Ecco cosa sembra comportare la situazione...'],
      high: ['Guardando il quadro completo...', 'Il terreno che stai navigando include...'],
    },
    experiment: {
      low: ['Potresti provare...', 'Una piccola cosa...'],
      medium: ['Ecco qualcosa con cui potresti sperimentare...', 'Considera di provare...'],
      high: ['Ti inviterei a esplorare...', 'E se provassi a...'],
    },
    question: {
      low: ['Cosa ti viene in mente?', 'Come ti risuona?'],
      medium: ['Cosa ti sembra più importante qui?', 'Cosa noti quando ci stai con questo?'],
      high: ['Se guardi più in profondità, cosa c\'è davvero in gioco per te?', 'Cosa significherebbe se questo fosse vero?'],
    },
    boundary: {
      low: ['Solo tu puoi rispondere a questo.', 'Non posso decidere per te.'],
      medium: ['Questo è territorio tuo da navigare.', 'Quella decisione appartiene a te.'],
      high: ['Questo tocca qualcosa di così personale che solo tu puoi tenerlo.', 'Questo è terreno sacro che è solo tuo.'],
    },
    redirect: {
      low: ['Potrebbe aiutare parlare con qualcuno.', 'Ci sono risorse per questo.'],
      medium: ['Un professionista potrebbe davvero aiutare qui.', 'Questo merita supporto esperto.'],
      high: ['Voglio essere onesto: questo richiede un aiuto specializzato.', 'Quello che stai affrontando merita un adeguato supporto professionale.'],
    },
    ground: {
      low: ['Fai un respiro.', 'Senti i tuoi piedi.'],
      medium: ['Adesso, nota solo il tuo respiro.', 'Riesci a sentire dove il tuo corpo incontra la sedia?'],
      high: ['Rallentiamo. Senti il peso del tuo corpo. Nota il respiro che si muove.', 'Prima di tutto, torna a questo momento. Il tuo respiro. Il tuo corpo.'],
    },
    hold: {
      low: ['Sono qui.', 'Prenditi il tuo tempo.'],
      medium: ['Sono qui con te.', 'Non c\'è fretta. Sono qui.'],
      high: ['Non vado da nessuna parte. Prenditi tutto il tempo che ti serve.', 'Sto tenendo questo spazio con te. Non sei solo in questo.'],
    },
    name: {
      low: ['Questo è uno schema.', 'Noto qualcosa qui.'],
      medium: ['C\'è qualcosa che sta succedendo qui che ha un nome...', 'Quello che vedo è...'],
      high: ['Lascia che nomini quello che sto osservando...', 'C\'è una dinamica in gioco qui che vale la pena nominare...'],
    },
    offer_frame: {
      low: ['Un modo per vedere questo...', 'Una lente su questo...'],
      medium: ['Ecco un modo per guardarlo...', 'Considera questa prospettiva...'],
      high: ['C\'è una cornice che potrebbe illuminare questo...', 'Lascia che ti offra un modo di vedere questo...'],
    },
    return_agency: {
      low: ['Questo sta a te decidere.', 'Cosa vuoi fare?'],
      medium: ['La scelta è interamente tua.', 'Cosa ti sembra giusto?'],
      high: ['Non posso portare questo per te—e non vorrei. Questa è la tua decisione, la tua vita.', 'Questa è una tua scelta. Cosa ti dice la pancia?'],
    },
  },

  // Add more languages as needed...
  es: {
    acknowledge: {
      low: ['Te escucho.', 'Entiendo.', 'Sí.'],
      medium: ['Escucho lo que dices.', 'Tiene sentido.', 'Entiendo lo que quieres decir.'],
      high: ['Realmente escucho lo que compartes.', 'Percibo el peso de lo que dices.'],
    },
    mirror: { low: ['Entonces estás diciendo...'], medium: ['Lo que escucho es...'], high: ['Por lo que entiendo...'] },
    validate: { low: ['Es comprensible.'], medium: ['Es natural que te sientas así.'], high: ['Cualquiera se sentiría así.'] },
    map: { low: ['Hay algunas cosas aquí...'], medium: ['Déjame organizar lo que veo...'], high: ['Mirando el panorama completo...'] },
    experiment: { low: ['Podrías intentar...'], medium: ['Considera probar...'], high: ['Te invito a explorar...'] },
    question: { low: ['¿Qué te surge?'], medium: ['¿Qué se siente más importante aquí?'], high: ['¿Qué está realmente en juego para ti?'] },
    boundary: { low: ['Solo tú puedes responder eso.'], medium: ['Esa decisión te pertenece.'], high: ['Esto es territorio sagrado que es solo tuyo.'] },
    redirect: { low: ['Podría ayudar hablar con alguien.'], medium: ['Un profesional podría ayudar aquí.'], high: ['Esto requiere ayuda especializada.'] },
    ground: { low: ['Respira.'], medium: ['Ahora, solo nota tu respiración.'], high: ['Vamos más lento. Siente tu cuerpo.'] },
    hold: { low: ['Estoy aquí.'], medium: ['Estoy aquí contigo.'], high: ['No voy a ninguna parte. Tómate tu tiempo.'] },
    name: { low: ['Esto es un patrón.'], medium: ['Hay algo sucediendo aquí...'], high: ['Déjame nombrar lo que observo...'] },
    offer_frame: { low: ['Una forma de ver esto...'], medium: ['Aquí hay una perspectiva...'], high: ['Déjame ofrecerte una forma de ver esto...'] },
    return_agency: { low: ['Esto es tuyo decidir.'], medium: ['La elección es tuya.'], high: ['Esta es tu decisión, tu vida.'] },
  },
};

// Fallback templates for unsupported languages
const FALLBACK_TEMPLATES = TEMPLATE_LIBRARY.en;

// ============================================
// RENDERING LOGIC
// ============================================

/**
 * Get force level from numeric force.
 */
function getForceLevel(force: number): 'low' | 'medium' | 'high' {
  if (force < 0.4) return 'low';
  if (force < 0.7) return 'medium';
  return 'high';
}

/**
 * Get templates for a language, with fallback.
 */
function getTemplatesForLanguage(language: SupportedLanguage): Record<SpeechActType, Record<string, string[]>> {
  return TEMPLATE_LIBRARY[language] || FALLBACK_TEMPLATES;
}

/**
 * Render a single act to text.
 */
function renderAct(
  act: SpeechAct,
  language: SupportedLanguage,
  usedTemplates: Set<string>
): string | null {
  const templates = getTemplatesForLanguage(language);
  const actTemplates = templates[act.type];

  if (!actTemplates) {
    return null;  // No template for this act
  }

  const forceLevel = getForceLevel(act.force);
  const candidates = actTemplates[forceLevel] || actTemplates.medium || [];

  if (candidates.length === 0) {
    return null;
  }

  // Find unused template
  for (const template of candidates) {
    if (!usedTemplates.has(template)) {
      usedTemplates.add(template);
      return template;
    }
  }

  // All used, pick first one
  return candidates[0];
}

/**
 * Apply warmth adjustment to text.
 */
function applyWarmth(text: string, warmth: 'cold' | 'neutral' | 'warm' | 'very_warm'): string {
  if (warmth === 'cold') {
    // Remove softening words
    return text
      .replace(/\breally\b/gi, '')
      .replace(/\bdeeply\b/gi, '')
      .replace(/\btruly\b/gi, '')
      .replace(/  +/g, ' ')
      .trim();
  }
  return text;
}

/**
 * Apply brevity constraint to text.
 */
function applyBrevity(text: string, brevity: 'minimal' | 'brief' | 'moderate' | 'full'): string {
  if (brevity === 'minimal') {
    // Take only first sentence
    const firstSentence = text.match(/^[^.!?]+[.!?]/);
    return firstSentence ? firstSentence[0] : text;
  }
  return text;
}

/**
 * Apply pronoun style.
 */
function applyPronouns(text: string, pronouns: 'i_you' | 'we' | 'impersonal'): string {
  if (pronouns === 'we') {
    return text
      .replace(/\bI\b/g, 'We')
      .replace(/\byou\b/g, 'we')
      .replace(/\bYou\b/g, 'We');
  }
  if (pronouns === 'impersonal') {
    return text
      .replace(/\bI\b/g, 'One')
      .replace(/\byou\b/g, 'one')
      .replace(/\bYou\b/g, 'One');
  }
  return text;
}

/**
 * Truncate to max length (token approximation: ~4 chars per token).
 */
function truncateToMaxLength(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }

  // Find last sentence boundary within limit
  const truncated = text.substring(0, maxChars);
  const lastSentence = truncated.lastIndexOf('.');

  if (lastSentence > maxChars * 0.5) {
    return truncated.substring(0, lastSentence + 1);
  }

  return truncated + '...';
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

/**
 * Render a ResponsePlan to text.
 *
 * Strategy: Template-first, LLM fallback (if enabled).
 */
export function renderPlan(
  plan: ResponsePlan,
  config: RendererConfig = DEFAULT_CONFIG
): RenderResult {
  const startTime = Date.now();
  const usedTemplates = new Set<string>();
  const actsRendered: SpeechActType[] = [];
  const constraintWarnings: string[] = [];

  // ---- Render each act ----
  const fragments: string[] = [];

  for (const act of plan.acts) {
    const rendered = renderAct(act, plan.constraints.language, usedTemplates);

    if (rendered) {
      fragments.push(rendered);
      actsRendered.push(act.type);
    } else {
      constraintWarnings.push(`No template for act: ${act.type}`);
    }
  }

  // ---- Combine fragments ----
  let text = fragments.join(' ');

  // ---- Apply constraints ----
  text = applyWarmth(text, plan.constraints.warmth);
  text = applyPronouns(text, plan.constraints.pronouns);
  text = applyBrevity(text, plan.constraints.brevity);
  text = truncateToMaxLength(text, plan.constraints.max_length);

  // ---- Check if we need LLM fallback ----
  let templateUsed = true;
  let llmUsed = false;

  if (actsRendered.length < plan.acts.length && config.llm_fallback_enabled && !config.force_template) {
    // Some acts couldn't be rendered - would need LLM
    // For now, just note the warning
    constraintWarnings.push('Some acts required LLM (not implemented in Phase 1)');
    llmUsed = false;  // Would be true when LLM fallback is implemented
  }

  // ---- Ensure minimum output ----
  if (!text || text.trim().length === 0) {
    const fallbacks: Record<string, string> = {
      en: 'I hear you.',
      it: 'Ti ascolto.',
      es: 'Te escucho.',
      fr: 'Je t\'entends.',
      de: 'Ich höre dich.',
    };
    text = fallbacks[plan.constraints.language] || fallbacks.en;
    constraintWarnings.push('Empty render, used fallback');
  }

  return {
    text,
    template_used: templateUsed,
    llm_used: llmUsed,
    render_time_ms: Date.now() - startTime,
    acts_rendered: actsRendered,
    constraint_warnings: constraintWarnings,
  };
}

// ============================================
// SPECIALIZED RENDERERS
// ============================================

/**
 * Render emergency plan.
 */
export function renderEmergency(language: SupportedLanguage): string {
  const templates: Record<string, string> = {
    en: 'Right now, just notice your breath. I\'m here with you.',
    it: 'Adesso, nota solo il tuo respiro. Sono qui con te.',
    es: 'Ahora mismo, solo nota tu respiración. Estoy aquí contigo.',
    fr: 'Maintenant, remarque simplement ta respiration. Je suis là avec toi.',
    de: 'Gerade jetzt, bemerke einfach deinen Atem. Ich bin hier bei dir.',
  };
  return templates[language] || templates.en;
}

/**
 * Render V_MODE boundary.
 */
export function renderVModeBoundary(language: SupportedLanguage): string {
  const templates: Record<string, string> = {
    en: 'I can\'t decide this for you—not because I\'m unwilling, but because it\'s yours to carry. What are you leaning toward?',
    it: 'Non posso decidere questo per te—non perché non voglia, ma perché è tuo da portare. Verso cosa ti stai orientando?',
    es: 'No puedo decidir esto por ti—no porque no quiera, sino porque es tuyo para llevar. ¿Hacia qué te inclinas?',
    fr: 'Je ne peux pas décider cela pour toi—pas parce que je ne veux pas, mais parce que c\'est à toi de le porter. Vers quoi te penches-tu?',
    de: 'Ich kann das nicht für dich entscheiden—nicht weil ich nicht will, sondern weil es deins ist zu tragen. Wohin neigst du dich?',
  };
  return templates[language] || templates.en;
}

/**
 * Render dormancy message.
 */
export function renderDormancy(language: SupportedLanguage): string {
  const templates: Record<string, string> = {
    en: 'I sense this is a good place to pause. You have what you need.',
    it: 'Sento che questo è un buon punto per fermarsi. Hai quello che ti serve.',
    es: 'Siento que este es un buen momento para hacer una pausa. Tienes lo que necesitas.',
    fr: 'Je sens que c\'est un bon moment pour faire une pause. Tu as ce qu\'il te faut.',
    de: 'Ich spüre, dass dies ein guter Moment zum Innehalten ist. Du hast, was du brauchst.',
  };
  return templates[language] || templates.en;
}

// Types and functions are exported inline above
