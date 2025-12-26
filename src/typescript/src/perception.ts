/**
 * ENOQ L1 PERCEPTION
 * 
 * Transforms raw input into structured Field State.
 * Does NOT generate response. Only perceives.
 */

import { 
  FieldState, 
  DomainActivation, 
  Domain,
  HumanDomain,
  Arousal, 
  Valence, 
  GoalType,
  Flag,
  Coherence
} from './types';

// ============================================
// MARKER DEFINITIONS
// ============================================

interface DomainMarkers {
  domain: HumanDomain;
  lexical: RegExp[];
  weight: number;  // base weight for this domain
}

const DOMAIN_MARKERS: DomainMarkers[] = [
  {
    domain: 'H01_SURVIVAL',
    lexical: [
      /\b(dying|can'?t breathe|emergency|danger|kill|suicide|harm myself)\b/i,
      /\b(won'?t survive|need help now|desperate)\b/i
    ],
    weight: 1.0
  },
  {
    domain: 'H02_SAFETY',
    lexical: [
      /\b(not safe|unsafe|scared|worried about|afraid|terrified)\b/i,
      /\b(can'?t trust|unpredictable|unstable)\b/i
    ],
    weight: 0.9
  },
  {
    domain: 'H03_BODY',
    lexical: [
      /\b(body|chest|stomach|head|tired|exhausted|tense|pain|ache)\b/i,
      /\b(can'?t sleep|heart racing|shaking|trembling|nauseous)\b/i
    ],
    weight: 0.7
  },
  {
    domain: 'H04_EMOTION',
    lexical: [
      /\b(feel|feeling|felt|sad|angry|happy|anxious|depressed|frustrated)\b/i,
      /\b(overwhelmed|stressed|upset|hurt|lonely|scared|worried)\b/i,
      /\b(merda|cazzo|incazzato|triste|ansioso|stressato)\b/i  // Italian
    ],
    weight: 0.8
  },
  {
    domain: 'H05_COGNITION',
    lexical: [
      /\b(think|thought|thinking|confused|can'?t decide|don'?t know)\b/i,
      /\b(understand|figure out|make sense|logic|reason)\b/i
    ],
    weight: 0.6
  },
  {
    domain: 'H06_MEANING',
    lexical: [
      /\b(meaning|purpose|why|point|worth|matter|sense of)\b/i,
      /\b(what'?s the point|why bother|existential)\b/i
    ],
    weight: 0.8
  },
  {
    domain: 'H07_IDENTITY',
    lexical: [
      /\b(I am|I'?m not|who am I|myself|my identity|the real me)\b/i,
      /\b(don'?t know who|lost myself|not myself)\b/i
    ],
    weight: 0.8
  },
  {
    domain: 'H08_TEMPORAL',
    lexical: [
      /\b(deadline|urgent|hurry|rush|time pressure|running out of time)\b/i,
      /\b(his problem|her problem|their problem|my responsibility)\b/i,
      /\b(scadenza|urgente|fretta|poco tempo)\b/i  // Italian
    ],
    weight: 0.7
  },
  {
    domain: 'H09_ATTACHMENT',
    lexical: [
      /\b(partner|husband|wife|girlfriend|boyfriend|mother|father|friend|dad|mom)\b/i,
      /\b(relationship|miss|lost|left me|broke up|divorce)\b/i,
      /\b(died|death|passed away|gone|morto|morta|perso)\b/i,
      /\b(moglie|marito|fidanzata|fidanzato|relazione|papà|mamma)\b/i  // Italian
    ],
    weight: 0.8
  },
  {
    domain: 'H10_COORDINATION',
    lexical: [
      /\b(expected|supposed to|agreed|said they would)\b/i,
      /\b(miscommunication|misunderstanding|doesn'?t listen|doesn'?t understand me)\b/i,
      /\b(turns it into|always does this|every time I try)\b/i,
      /\b(dice che|vuole che|non capisce|non mi ascolta)\b/i  // Italian
    ],
    weight: 0.7
  },
  {
    domain: 'H11_BELONGING',
    lexical: [
      /\b(fit in|belong|outsider|excluded|they all|the group)\b/i,
      /\b(nobody likes|alone|isolated|don'?t belong)\b/i
    ],
    weight: 0.7
  },
  {
    domain: 'H12_HIERARCHY',
    lexical: [
      /\b(boss|control|power|authority|dominated|powerless)\b/i,
      /\b(can'?t do anything|no choice|have to|forced to)\b/i,
      /\b(capo|controllare|costretto)\b/i  // Italian
    ],
    weight: 0.7
  },
  {
    domain: 'H13_CREATION',
    lexical: [
      /\b(decide|decision|choose|choice|option|should I|what to do)\b/i,
      /\b(quit|leave|stay|take the job|move|change)\b/i,
      /\b(mollare|lasciare|restare|cambiare)\b/i  // Italian
    ],
    weight: 0.7
  },
  {
    domain: 'H14_WORK',
    lexical: [
      /\b(work|job|career|office|project|task|meeting|deadline)\b/i,
      /\b(colleague|team|manager|report|deliverable)\b/i,
      /\b(lavoro|progetto|ufficio|riunione|collega)\b/i  // Italian
    ],
    weight: 0.6
  },
  {
    domain: 'H15_LEGAL',
    lexical: [
      /\b(contract|legal|lawyer|sue|rights|law|court)\b/i,
      /\b(company|organization|system|market|industry|politics)\b/i,
      /\b(contratto|avvocato|legale|diritti)\b/i  // Italian
    ],
    weight: 0.5
  },
  {
    domain: 'H16_OPERATIONAL',
    lexical: [
      /\b(how to|help me|can you|please|need to|want to)\b/i,
      /\b(legacy|future generations|leave behind|remember me)\b/i
    ],
    weight: 0.4
  }
];

// ============================================
// AROUSAL DETECTION
// ============================================

function detectArousal(message: string): Arousal {
  const lowMarkers = /\b(whatever|don'?t care|numb|nothing matters|boh|meh)\b/i;
  const highMarkers = /\b(!!|CAPS|can'?t|NOW|help|emergency|AIUTO)\b|[A-Z]{3,}|!{2,}/;
  
  const messageUpper = message.replace(/[a-z]/g, '').length;
  const messageTotal = message.replace(/[^a-zA-Z]/g, '').length;
  const capsRatio = messageTotal > 0 ? messageUpper / messageTotal : 0;
  
  if (capsRatio > 0.5 || highMarkers.test(message)) {
    return 'high';
  }
  if (lowMarkers.test(message)) {
    return 'low';
  }
  return 'medium';
}

// ============================================
// VALENCE DETECTION
// ============================================

function detectValence(message: string): Valence {
  const positive = /\b(happy|excited|grateful|love|good|great|amazing|wonderful)\b/i;
  const negative = /\b(sad|angry|frustrated|upset|hate|terrible|awful|merda|cazzo|schifo)\b/i;
  
  const hasPositive = positive.test(message);
  const hasNegative = negative.test(message);
  
  if (hasPositive && hasNegative) return 'mixed';
  if (hasPositive) return 'positive';
  if (hasNegative) return 'negative';
  return 'neutral';
}

// ============================================
// GOAL DETECTION
// ============================================

function detectGoal(message: string, domains: DomainActivation[]): GoalType {
  const wordCount = message.trim().split(/\s+/).length;
  
  // Very short messages need more context
  if (wordCount <= 3 && !/\?/.test(message)) {
    // Unless it's clearly a greeting or cry for help
    if (/\b(help|aiuto|sos)\b/i.test(message)) {
      return 'regulate';
    }
    return 'wait';  // need more info before acting
  }
  
  // Information request (how to, what is, explain)
  if (/\b(how do I|how to|what is|can you explain|tell me about|come si fa|cos'è)\b/i.test(message)) {
    return 'inform';
  }
  
  // Delegation = someone asking us to decide
  if (/\b(tu che dici|dimmi tu|what do you think|should I|tell me what|you decide|cosa devo fare)\b/i.test(message)) {
    return 'decide';  // but also flag delegation
  }
  
  // Regulation need
  if (/\b(help|can'?t cope|overwhelmed|aiuto|non ce la faccio)\b/i.test(message)) {
    return 'regulate';
  }
  
  // Decision
  if (/\b(should I|decide|choice|option|or should I|devo|dovrei)\b/i.test(message)) {
    return 'decide';
  }
  
  // Processing emotion
  const topDomain = domains[0]?.domain;
  if (topDomain === 'H04_EMOTION' || topDomain === 'H09_ATTACHMENT') {
    return 'process';
  }
  
  // Exploration
  if (/\b(understand|figure out|make sense|wondering|capire)\b/i.test(message)) {
    return 'explore';
  }
  
  return 'unclear';
}

// ============================================
// FLAG DETECTION
// ============================================

function detectFlags(message: string, arousal: Arousal): Flag[] {
  const flags: Flag[] = [];
  
  // Crisis - expanded patterns
  if (/\b(suicide|kill myself|end it|harm myself|want to die|hurt myself|self[- ]?harm|don'?t want to live|better off dead)\b/i.test(message) ||
      /\b(farmi del male|suicid|ammazzarmi|farla finita|morire|non voglio più vivere)\b/i.test(message)) {
    flags.push('crisis');
  }
  
  // High arousal
  if (arousal === 'high') {
    flags.push('high_arousal');
  }
  
  // Shutdown
  if (arousal === 'low' && /\b(numb|nothing|don'?t care|whatever)\b/i.test(message)) {
    flags.push('shutdown');
  }
  
  // Delegation attempt
  if (/\b(tu che dici|dimmi tu|you tell me|what should I|decide for me|you choose|cosa devo fare|cosa faccio|tell me what to do)\b/i.test(message)) {
    flags.push('delegation_attempt');
  }
  
  return flags;
}

// ============================================
// COHERENCE DETECTION
// ============================================

function detectCoherence(message: string): Coherence {
  // Very short or very long = potentially low coherence
  const wordCount = message.split(/\s+/).length;
  
  if (wordCount < 3) return 'low';
  if (wordCount > 200) return 'low';
  
  // Fragmented sentences
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
  
  if (avgSentenceLength < 3) return 'low';
  
  return 'high';
}

// ============================================
// TEMPORAL DETECTION
// ============================================

function detectTemporal(message: string): { past_salience: number; future_salience: number } {
  const pastMarkers = /\b(was|were|used to|remember|back then|yesterday|last)\b/i;
  const futureMarkers = /\b(will|going to|tomorrow|next|future|plan|if I)\b/i;
  
  return {
    past_salience: pastMarkers.test(message) ? 0.7 : 0.2,
    future_salience: futureMarkers.test(message) ? 0.7 : 0.2
  };
}

// ============================================
// MAIN PERCEPTION FUNCTION
// ============================================

export function perceive(message: string, conversationHistory: string[] = []): FieldState {
  // Detect domain activations
  const activations: DomainActivation[] = [];
  
  for (const markers of DOMAIN_MARKERS) {
    let totalScore = 0;
    const evidence: string[] = [];
    
    for (const regex of markers.lexical) {
      const matches = message.match(regex);
      if (matches) {
        totalScore += markers.weight;
        evidence.push(matches[0]);
      }
    }
    
    if (totalScore > 0) {
      activations.push({
        domain: markers.domain,
        salience: Math.min(totalScore, 1.0),
        confidence: Math.min(totalScore * 0.8, 0.95),  // never 100% confident
        evidence
      });
    }
  }
  
  // Sort by salience, take top 5
  activations.sort((a, b) => b.salience - a.salience);
  const topDomains = activations.slice(0, 5);
  
  // If no domains detected, default to COGNITION
  if (topDomains.length === 0) {
    topDomains.push({
      domain: 'H05_COGNITION',
      salience: 0.3,
      confidence: 0.3,
      evidence: ['default - no specific markers']
    });
  }
  
  // Detect other field properties
  const arousal = detectArousal(message);
  const valence = detectValence(message);
  const coherence = detectCoherence(message);
  const flags = detectFlags(message, arousal);
  const temporal = detectTemporal(message);
  const goal = detectGoal(message, topDomains);
  
  // Loop detection (simplified - would need conversation history)
  const loopCount = 0;  // TODO: implement with history
  
  // Calculate global uncertainty
  const avgConfidence = topDomains.reduce((sum, d) => sum + (d.confidence || 0.5), 0) / topDomains.length;
  const uncertainty = 1 - avgConfidence;
  
  // Language detection
  const language = detectLanguage(message);
  
  return {
    domains: topDomains,
    arousal,
    valence,
    coherence,
    temporal,
    goal,
    loop_count: loopCount,
    flags,
    uncertainty,
    language,
  };
}

// ============================================
// LANGUAGE DETECTION
// ============================================

function detectLanguage(message: string): 'en' | 'it' | 'mixed' {
  const italianMarkers = [
    /\b(ciao|come|stai|sono|cosa|perché|perche|che|non|mi|ti|si|ci|lo|la|il|gli|le|un|una|del|della|nel|nella)\b/i,
    /\b(oggi|domani|ieri|sempre|mai|molto|poco|bene|male|grazie|prego|scusa)\b/i,
    /\b(voglio|posso|devo|faccio|vado|vengo|prendo|metto|dico|penso|sento|capisco)\b/i,
    /\b(aiuto|aiutami|dimmi|fammi|parlami)\b/i,
  ];
  
  const englishMarkers = [
    /\b(the|a|an|is|are|was|were|have|has|had|do|does|did|will|would|could|should)\b/i,
    /\b(I|you|he|she|it|we|they|my|your|his|her|its|our|their)\b/i,
    /\b(what|why|how|when|where|who|which)\b/i,
    /\b(help|tell|show|give|take|make|get|want|need|feel|think|know)\b/i,
  ];
  
  let italianScore = 0;
  let englishScore = 0;
  
  for (const pattern of italianMarkers) {
    if (pattern.test(message)) italianScore++;
  }
  
  for (const pattern of englishMarkers) {
    if (pattern.test(message)) englishScore++;
  }
  
  if (italianScore > 0 && englishScore > 0) {
    return italianScore > englishScore ? 'it' : englishScore > italianScore ? 'en' : 'mixed';
  }
  
  if (italianScore > 0) return 'it';
  if (englishScore > 0) return 'en';
  
  return 'en'; // default
}

// ============================================
// EXPORTS
// ============================================

export default perceive;
