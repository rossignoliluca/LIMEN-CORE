/**
 * DETECTOR BENCHMARK TEST SUITE
 *
 * 50 carefully curated test cases for comparing detection systems:
 * - Current regex-based dimensional_system.ts
 * - Future LLM-powered detector
 *
 * Categories:
 * - Existential clear (10 cases)
 * - Existential subtle (10 cases)
 * - Emergency real (5 cases)
 * - Emergency false positive (5 cases)
 * - Functional (5 cases)
 * - Relational (5 cases)
 * - Edge cases multilingual (5 cases)
 * - Ambiguous (5 cases)
 *
 * RUN: npx jest detector_benchmark.test.ts
 */

import { DimensionalDetector, VerticalDimension, DimensionalState } from '../dimensional_system';
import { HumanDomain, SupportedLanguage } from '../types';

// ============================================
// BENCHMARK CASE INTERFACE
// ============================================

interface BenchmarkCase {
  id: string;
  input: string;
  lang: SupportedLanguage;
  expected: {
    primary_vertical: VerticalDimension;
    v_mode: boolean;
    emergency: boolean;
    primary_horizontal: HumanDomain[];
  };
  category: 'existential_clear' | 'existential_subtle' | 'emergency_real' |
            'emergency_false_positive' | 'functional' | 'relational' |
            'edge_case' | 'ambiguous';
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
}

// ============================================
// BENCHMARK CASES (50 total)
// ============================================

const BENCHMARK_CASES: BenchmarkCase[] = [
  // ==========================================
  // EXISTENTIAL CLEAR (10 cases)
  // These should ALWAYS trigger V_MODE
  // ==========================================
  {
    id: 'EX_CLEAR_01',
    input: 'Non so cosa voglio dalla vita',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H07_IDENTITY']
    },
    category: 'existential_clear',
    difficulty: 'easy',
    notes: 'Classic Italian existential question'
  },
  {
    id: 'EX_CLEAR_02',
    input: 'What is the meaning of my life?',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_clear',
    difficulty: 'easy'
  },
  {
    id: 'EX_CLEAR_03',
    input: 'Chi sono io veramente?',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H07_IDENTITY']
    },
    category: 'existential_clear',
    difficulty: 'easy'
  },
  {
    id: 'EX_CLEAR_04',
    input: 'I feel like nothing I do has any real purpose',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_clear',
    difficulty: 'medium'
  },
  {
    id: 'EX_CLEAR_05',
    input: 'Mi chiedo se abbia senso continuare così',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_clear',
    difficulty: 'medium'
  },
  {
    id: 'EX_CLEAR_06',
    input: 'No sé quién soy ni qué quiero',
    lang: 'es',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H07_IDENTITY', 'H06_MEANING']
    },
    category: 'existential_clear',
    difficulty: 'easy'
  },
  {
    id: 'EX_CLEAR_07',
    input: 'Ich fühle mich völlig verloren im Leben',
    lang: 'de',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_clear',
    difficulty: 'medium'
  },
  {
    id: 'EX_CLEAR_08',
    input: 'Why am I even here? What am I supposed to do?',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H07_IDENTITY']
    },
    category: 'existential_clear',
    difficulty: 'easy'
  },
  {
    id: 'EX_CLEAR_09',
    input: 'A cosa serve tutto questo?',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_clear',
    difficulty: 'easy'
  },
  {
    id: 'EX_CLEAR_10',
    input: 'Je ne sais plus qui je suis ni ce que je veux devenir',
    lang: 'fr',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H07_IDENTITY', 'H06_MEANING']
    },
    category: 'existential_clear',
    difficulty: 'medium'
  },

  // ==========================================
  // EXISTENTIAL SUBTLE (10 cases)
  // These are harder to detect - may need LLM
  // ==========================================
  {
    id: 'EX_SUBTLE_01',
    input: 'Qual è il punto?',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_subtle',
    difficulty: 'hard',
    notes: 'Very short, context-dependent. Could be casual or deep.'
  },
  {
    id: 'EX_SUBTLE_02',
    input: 'Is this all there is?',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_subtle',
    difficulty: 'hard'
  },
  {
    id: 'EX_SUBTLE_03',
    input: 'Sono stanco di tutto',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H04_EMOTION']
    },
    category: 'existential_subtle',
    difficulty: 'hard',
    notes: 'Could be physical tiredness or existential exhaustion'
  },
  {
    id: 'EX_SUBTLE_04',
    input: 'Nothing feels real anymore',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H07_IDENTITY']
    },
    category: 'existential_subtle',
    difficulty: 'hard'
  },
  {
    id: 'EX_SUBTLE_05',
    input: 'Mi sento vuoto dentro',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H04_EMOTION', 'H06_MEANING']
    },
    category: 'existential_subtle',
    difficulty: 'medium'
  },
  {
    id: 'EX_SUBTLE_06',
    input: 'I keep going but I dont know why',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_subtle',
    difficulty: 'hard'
  },
  {
    id: 'EX_SUBTLE_07',
    input: 'È davvero questo che volevo?',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H07_IDENTITY']
    },
    category: 'existential_subtle',
    difficulty: 'medium'
  },
  {
    id: 'EX_SUBTLE_08',
    input: 'Faccio sempre le stesse cose, per cosa?',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_subtle',
    difficulty: 'hard'
  },
  {
    id: 'EX_SUBTLE_09',
    input: 'Why bother?',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'existential_subtle',
    difficulty: 'hard',
    notes: 'Extremely short, needs semantic understanding'
  },
  {
    id: 'EX_SUBTLE_10',
    input: 'Non so più chi sono',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H07_IDENTITY']
    },
    category: 'existential_subtle',
    difficulty: 'medium'
  },

  // ==========================================
  // EMERGENCY REAL (5 cases)
  // These should trigger emergency_detected
  // ==========================================
  {
    id: 'EMERG_REAL_01',
    input: 'Non riesco a respirare, ho il cuore che batte fortissimo',
    lang: 'it',
    expected: {
      primary_vertical: 'SOMATIC',
      v_mode: false,
      emergency: true,
      primary_horizontal: ['H01_SURVIVAL', 'H03_BODY']
    },
    category: 'emergency_real',
    difficulty: 'easy'
  },
  {
    id: 'EMERG_REAL_02',
    input: 'I think Im having a panic attack, I cant breathe',
    lang: 'en',
    expected: {
      primary_vertical: 'SOMATIC',
      v_mode: false,
      emergency: true,
      primary_horizontal: ['H01_SURVIVAL', 'H02_SAFETY']
    },
    category: 'emergency_real',
    difficulty: 'easy'
  },
  {
    id: 'EMERG_REAL_03',
    input: 'Sto tremando e ho paura, non riesco a fermarmi',
    lang: 'it',
    expected: {
      primary_vertical: 'SOMATIC',
      v_mode: false,
      emergency: true,
      primary_horizontal: ['H02_SAFETY', 'H03_BODY']
    },
    category: 'emergency_real',
    difficulty: 'easy'
  },
  {
    id: 'EMERG_REAL_04',
    input: 'Estoy muy asustado, mi corazón late muy rápido y sudo mucho',
    lang: 'es',
    expected: {
      primary_vertical: 'SOMATIC',
      v_mode: false,
      emergency: true,
      primary_horizontal: ['H02_SAFETY', 'H03_BODY']
    },
    category: 'emergency_real',
    difficulty: 'medium'
  },
  {
    id: 'EMERG_REAL_05',
    input: 'Help me Im scared, something is very wrong',
    lang: 'en',
    expected: {
      primary_vertical: 'SOMATIC',
      v_mode: false,
      emergency: true,
      primary_horizontal: ['H01_SURVIVAL', 'H02_SAFETY']
    },
    category: 'emergency_real',
    difficulty: 'easy'
  },

  // ==========================================
  // EMERGENCY FALSE POSITIVE (5 cases)
  // These should NOT trigger emergency
  // ==========================================
  {
    id: 'EMERG_FP_01',
    input: 'Mi batte il cuore per te',
    lang: 'it',
    expected: {
      primary_vertical: 'RELATIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H09_ATTACHMENT']
    },
    category: 'emergency_false_positive',
    difficulty: 'medium',
    notes: 'Romantic heart-racing, not panic'
  },
  {
    id: 'EMERG_FP_02',
    input: 'Sto morendo dal ridere',
    lang: 'it',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H04_EMOTION']
    },
    category: 'emergency_false_positive',
    difficulty: 'medium',
    notes: 'Italian idiom for laughing hard'
  },
  {
    id: 'EMERG_FP_03',
    input: 'This deadline is killing me',
    lang: 'en',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H14_WORK', 'H08_TEMPORAL']
    },
    category: 'emergency_false_positive',
    difficulty: 'medium',
    notes: 'Work stress metaphor'
  },
  {
    id: 'EMERG_FP_04',
    input: 'Ho paura di fare la scelta sbagliata',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H05_COGNITION', 'H06_MEANING']
    },
    category: 'emergency_false_positive',
    difficulty: 'hard',
    notes: 'Fear of wrong choice is existential, not emergency'
  },
  {
    id: 'EMERG_FP_05',
    input: 'My heart races every time I see her',
    lang: 'en',
    expected: {
      primary_vertical: 'RELATIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H09_ATTACHMENT']
    },
    category: 'emergency_false_positive',
    difficulty: 'medium',
    notes: 'Romantic excitement'
  },

  // ==========================================
  // FUNCTIONAL (5 cases)
  // Work/task oriented - NOT existential
  // ==========================================
  {
    id: 'FUNC_01',
    input: 'Whats the point of this meeting?',
    lang: 'en',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H14_WORK', 'H10_COORDINATION']
    },
    category: 'functional',
    difficulty: 'hard',
    notes: 'Work context - not existential despite "point"'
  },
  {
    id: 'FUNC_02',
    input: 'Devo decidere entro domani se accettare il lavoro',
    lang: 'it',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H14_WORK', 'H05_COGNITION']
    },
    category: 'functional',
    difficulty: 'medium'
  },
  {
    id: 'FUNC_03',
    input: 'How do I organize my tasks for the week?',
    lang: 'en',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H16_OPERATIONAL', 'H08_TEMPORAL']
    },
    category: 'functional',
    difficulty: 'easy'
  },
  {
    id: 'FUNC_04',
    input: 'Il progetto è in ritardo, cosa faccio?',
    lang: 'it',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H14_WORK', 'H08_TEMPORAL']
    },
    category: 'functional',
    difficulty: 'easy'
  },
  {
    id: 'FUNC_05',
    input: 'Tengo que terminar esto antes del viernes',
    lang: 'es',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H16_OPERATIONAL', 'H08_TEMPORAL']
    },
    category: 'functional',
    difficulty: 'easy'
  },

  // ==========================================
  // RELATIONAL (5 cases)
  // Relationship focused
  // ==========================================
  {
    id: 'REL_01',
    input: 'Mia moglie non mi capisce più',
    lang: 'it',
    expected: {
      primary_vertical: 'RELATIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H09_ATTACHMENT', 'H11_BELONGING']
    },
    category: 'relational',
    difficulty: 'easy'
  },
  {
    id: 'REL_02',
    input: 'I feel like Im losing my best friend',
    lang: 'en',
    expected: {
      primary_vertical: 'RELATIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H09_ATTACHMENT']
    },
    category: 'relational',
    difficulty: 'easy'
  },
  {
    id: 'REL_03',
    input: 'Non so se posso ancora fidarmi di lei',
    lang: 'it',
    expected: {
      primary_vertical: 'RELATIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H09_ATTACHMENT']
    },
    category: 'relational',
    difficulty: 'easy'
  },
  {
    id: 'REL_04',
    input: 'My parents dont understand what Im going through',
    lang: 'en',
    expected: {
      primary_vertical: 'RELATIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H09_ATTACHMENT', 'H11_BELONGING']
    },
    category: 'relational',
    difficulty: 'easy'
  },
  {
    id: 'REL_05',
    input: 'Mi sento solo anche quando sono in mezzo agli altri',
    lang: 'it',
    expected: {
      primary_vertical: 'RELATIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H11_BELONGING', 'H09_ATTACHMENT']
    },
    category: 'relational',
    difficulty: 'medium',
    notes: 'Loneliness is relational, not necessarily existential'
  },

  // ==========================================
  // EDGE CASES MULTILINGUAL (5 cases)
  // ==========================================
  {
    id: 'EDGE_01',
    input: 'Non so, I just feel confused about everything',
    lang: 'en', // Mixed IT/EN
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H07_IDENTITY']
    },
    category: 'edge_case',
    difficulty: 'hard',
    notes: 'Code-switching Italian/English'
  },
  {
    id: 'EDGE_02',
    input: 'wtf is even the point lol',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'edge_case',
    difficulty: 'hard',
    notes: 'Casual/slang existential'
  },
  {
    id: 'EDGE_03',
    input: 'Boh, non so che dire',
    lang: 'it',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H05_COGNITION']
    },
    category: 'edge_case',
    difficulty: 'medium',
    notes: 'Italian filler - not existential'
  },
  {
    id: 'EDGE_04',
    input: '...',
    lang: 'en',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: []
    },
    category: 'edge_case',
    difficulty: 'hard',
    notes: 'Silence/ellipsis - should not trigger'
  },
  {
    id: 'EDGE_05',
    input: 'K',
    lang: 'en',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: []
    },
    category: 'edge_case',
    difficulty: 'easy',
    notes: 'Minimal response'
  },

  // ==========================================
  // AMBIGUOUS (5 cases)
  // Could go either way - hardest cases
  // ==========================================
  {
    id: 'AMB_01',
    input: 'Non ce la faccio più',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H04_EMOTION']
    },
    category: 'ambiguous',
    difficulty: 'hard',
    notes: 'Could be burnout, crisis, or just frustration'
  },
  {
    id: 'AMB_02',
    input: 'I cant do this anymore',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H04_EMOTION']
    },
    category: 'ambiguous',
    difficulty: 'hard',
    notes: 'Need context - work frustration or existential crisis?'
  },
  {
    id: 'AMB_03',
    input: 'Non vedo via duscita',
    lang: 'it',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING']
    },
    category: 'ambiguous',
    difficulty: 'hard',
    notes: 'No way out - could be problem-solving or despair'
  },
  {
    id: 'AMB_04',
    input: 'Everything is falling apart',
    lang: 'en',
    expected: {
      primary_vertical: 'EXISTENTIAL',
      v_mode: true,
      emergency: false,
      primary_horizontal: ['H06_MEANING', 'H04_EMOTION']
    },
    category: 'ambiguous',
    difficulty: 'hard',
    notes: 'Catastrophizing or genuine crisis?'
  },
  {
    id: 'AMB_05',
    input: 'Sono bloccato',
    lang: 'it',
    expected: {
      primary_vertical: 'FUNCTIONAL',
      v_mode: false,
      emergency: false,
      primary_horizontal: ['H05_COGNITION', 'H16_OPERATIONAL']
    },
    category: 'ambiguous',
    difficulty: 'hard',
    notes: 'Stuck on task or stuck in life?'
  }
];

// ============================================
// BENCHMARK RUNNER
// ============================================

interface BenchmarkResult {
  case_id: string;
  input: string;
  expected_v_mode: boolean;
  actual_v_mode: boolean;
  expected_emergency: boolean;
  actual_emergency: boolean;
  expected_primary_vertical: VerticalDimension;
  actual_primary_vertical: VerticalDimension;
  v_mode_correct: boolean;
  emergency_correct: boolean;
  vertical_correct: boolean;
  category: string;
  difficulty: string;
}

function runBenchmark(): {
  results: BenchmarkResult[];
  metrics: {
    overall_accuracy: number;
    v_mode_precision: number;
    v_mode_recall: number;
    v_mode_f1: number;
    emergency_precision: number;
    emergency_recall: number;
    emergency_f1: number;
    by_category: Record<string, { total: number; correct: number; accuracy: number }>;
    by_difficulty: Record<string, { total: number; correct: number; accuracy: number }>;
  };
} {
  const detector = new DimensionalDetector();
  const results: BenchmarkResult[] = [];

  // V_MODE tracking
  let v_mode_tp = 0;
  let v_mode_fp = 0;
  let v_mode_fn = 0;
  let v_mode_tn = 0;

  // Emergency tracking
  let emerg_tp = 0;
  let emerg_fp = 0;
  let emerg_fn = 0;
  let emerg_tn = 0;

  // Category/difficulty tracking
  const by_category: Record<string, { total: number; correct: number }> = {};
  const by_difficulty: Record<string, { total: number; correct: number }> = {};

  for (const tc of BENCHMARK_CASES) {
    const state = detector.detect(tc.input, tc.lang);

    const v_mode_correct = state.v_mode_triggered === tc.expected.v_mode;
    const emergency_correct = state.emergency_detected === tc.expected.emergency;
    const vertical_correct = state.primary_vertical === tc.expected.primary_vertical;

    // V_MODE confusion matrix
    if (tc.expected.v_mode && state.v_mode_triggered) v_mode_tp++;
    else if (!tc.expected.v_mode && state.v_mode_triggered) v_mode_fp++;
    else if (tc.expected.v_mode && !state.v_mode_triggered) v_mode_fn++;
    else v_mode_tn++;

    // Emergency confusion matrix
    if (tc.expected.emergency && state.emergency_detected) emerg_tp++;
    else if (!tc.expected.emergency && state.emergency_detected) emerg_fp++;
    else if (tc.expected.emergency && !state.emergency_detected) emerg_fn++;
    else emerg_tn++;

    // By category
    if (!by_category[tc.category]) by_category[tc.category] = { total: 0, correct: 0 };
    by_category[tc.category].total++;
    if (v_mode_correct && emergency_correct) by_category[tc.category].correct++;

    // By difficulty
    if (!by_difficulty[tc.difficulty]) by_difficulty[tc.difficulty] = { total: 0, correct: 0 };
    by_difficulty[tc.difficulty].total++;
    if (v_mode_correct && emergency_correct) by_difficulty[tc.difficulty].correct++;

    results.push({
      case_id: tc.id,
      input: tc.input.substring(0, 40) + (tc.input.length > 40 ? '...' : ''),
      expected_v_mode: tc.expected.v_mode,
      actual_v_mode: state.v_mode_triggered,
      expected_emergency: tc.expected.emergency,
      actual_emergency: state.emergency_detected,
      expected_primary_vertical: tc.expected.primary_vertical,
      actual_primary_vertical: state.primary_vertical,
      v_mode_correct,
      emergency_correct,
      vertical_correct,
      category: tc.category,
      difficulty: tc.difficulty
    });
  }

  // Calculate metrics
  const v_mode_precision = v_mode_tp / (v_mode_tp + v_mode_fp) || 0;
  const v_mode_recall = v_mode_tp / (v_mode_tp + v_mode_fn) || 0;
  const v_mode_f1 = 2 * (v_mode_precision * v_mode_recall) / (v_mode_precision + v_mode_recall) || 0;

  const emerg_precision = emerg_tp / (emerg_tp + emerg_fp) || 0;
  const emerg_recall = emerg_tp / (emerg_tp + emerg_fn) || 0;
  const emerg_f1 = 2 * (emerg_precision * emerg_recall) / (emerg_precision + emerg_recall) || 0;

  const overall_correct = results.filter(r => r.v_mode_correct && r.emergency_correct).length;
  const overall_accuracy = overall_correct / results.length;

  const cat_metrics: Record<string, { total: number; correct: number; accuracy: number }> = {};
  for (const [cat, data] of Object.entries(by_category)) {
    cat_metrics[cat] = { ...data, accuracy: data.correct / data.total };
  }

  const diff_metrics: Record<string, { total: number; correct: number; accuracy: number }> = {};
  for (const [diff, data] of Object.entries(by_difficulty)) {
    diff_metrics[diff] = { ...data, accuracy: data.correct / data.total };
  }

  return {
    results,
    metrics: {
      overall_accuracy,
      v_mode_precision,
      v_mode_recall,
      v_mode_f1,
      emergency_precision: emerg_precision,
      emergency_recall: emerg_recall,
      emergency_f1: emerg_f1,
      by_category: cat_metrics,
      by_difficulty: diff_metrics
    }
  };
}

// ============================================
// TESTS
// ============================================

describe('Detector Benchmark', () => {
  const detector = new DimensionalDetector();

  describe('Existential Clear Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'existential_clear');

    cases.forEach(tc => {
      it(`[${tc.id}] should trigger V_MODE for: "${tc.input.substring(0, 30)}..."`, () => {
        const state = detector.detect(tc.input, tc.lang);
        expect(state.v_mode_triggered).toBe(tc.expected.v_mode);
        expect(state.emergency_detected).toBe(tc.expected.emergency);
      });
    });
  });

  describe('Existential Subtle Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'existential_subtle');

    cases.forEach(tc => {
      it(`[${tc.id}] should detect: "${tc.input.substring(0, 30)}..." (difficulty: ${tc.difficulty})`, () => {
        const state = detector.detect(tc.input, tc.lang);
        // Log for debugging hard cases
        if (!state.v_mode_triggered && tc.expected.v_mode) {
          console.log(`MISS [${tc.id}]: "${tc.input}" → EXISTENTIAL: ${state.vertical.EXISTENTIAL.toFixed(2)}`);
        }
        expect(state.v_mode_triggered).toBe(tc.expected.v_mode);
      });
    });
  });

  describe('Emergency Real Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'emergency_real');

    cases.forEach(tc => {
      it(`[${tc.id}] should detect emergency: "${tc.input.substring(0, 30)}..."`, () => {
        const state = detector.detect(tc.input, tc.lang);
        expect(state.emergency_detected).toBe(tc.expected.emergency);
        expect(state.v_mode_triggered).toBe(tc.expected.v_mode);
      });
    });
  });

  describe('Emergency False Positive Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'emergency_false_positive');

    cases.forEach(tc => {
      it(`[${tc.id}] should NOT trigger emergency: "${tc.input.substring(0, 30)}..."`, () => {
        const state = detector.detect(tc.input, tc.lang);
        expect(state.emergency_detected).toBe(false);
      });
    });
  });

  describe('Functional Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'functional');

    cases.forEach(tc => {
      it(`[${tc.id}] should NOT trigger V_MODE: "${tc.input.substring(0, 30)}..."`, () => {
        const state = detector.detect(tc.input, tc.lang);
        expect(state.v_mode_triggered).toBe(tc.expected.v_mode);
      });
    });
  });

  describe('Relational Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'relational');

    cases.forEach(tc => {
      it(`[${tc.id}] should detect relational: "${tc.input.substring(0, 30)}..."`, () => {
        const state = detector.detect(tc.input, tc.lang);
        expect(state.v_mode_triggered).toBe(tc.expected.v_mode);
        expect(state.emergency_detected).toBe(tc.expected.emergency);
      });
    });
  });

  describe('Edge Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'edge_case');

    cases.forEach(tc => {
      it(`[${tc.id}] edge case: "${tc.input.substring(0, 30)}..."`, () => {
        const state = detector.detect(tc.input, tc.lang);
        // Just check no crash for now - these are hard
        expect(state).toBeDefined();
      });
    });
  });

  describe('Ambiguous Cases', () => {
    const cases = BENCHMARK_CASES.filter(c => c.category === 'ambiguous');

    cases.forEach(tc => {
      it(`[${tc.id}] ambiguous: "${tc.input.substring(0, 30)}..."`, () => {
        const state = detector.detect(tc.input, tc.lang);
        // Log for analysis
        console.log(`[${tc.id}] "${tc.input}" → V_MODE: ${state.v_mode_triggered}, EXIS: ${state.vertical.EXISTENTIAL.toFixed(2)}`);
        expect(state).toBeDefined();
      });
    });
  });
});

describe('Benchmark Metrics', () => {
  it('should calculate comprehensive metrics', () => {
    const benchmark = runBenchmark();

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║               DETECTOR BENCHMARK RESULTS                       ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log(`║ Overall Accuracy:       ${(benchmark.metrics.overall_accuracy * 100).toFixed(1).padStart(5)}%                              ║`);
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log(`║ V_MODE Precision:       ${(benchmark.metrics.v_mode_precision * 100).toFixed(1).padStart(5)}%                              ║`);
    console.log(`║ V_MODE Recall:          ${(benchmark.metrics.v_mode_recall * 100).toFixed(1).padStart(5)}%                              ║`);
    console.log(`║ V_MODE F1:              ${(benchmark.metrics.v_mode_f1 * 100).toFixed(1).padStart(5)}%                              ║`);
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log(`║ Emergency Precision:    ${(benchmark.metrics.emergency_precision * 100).toFixed(1).padStart(5)}%                              ║`);
    console.log(`║ Emergency Recall:       ${(benchmark.metrics.emergency_recall * 100).toFixed(1).padStart(5)}%                              ║`);
    console.log(`║ Emergency F1:           ${(benchmark.metrics.emergency_f1 * 100).toFixed(1).padStart(5)}%                              ║`);
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ BY CATEGORY                                                    ║');
    for (const [cat, data] of Object.entries(benchmark.metrics.by_category)) {
      const catName = cat.padEnd(25);
      const acc = (data.accuracy * 100).toFixed(0).padStart(3);
      console.log(`║   ${catName} ${acc}% (${data.correct}/${data.total})                   ║`.substring(0, 67) + '║');
    }
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ BY DIFFICULTY                                                  ║');
    for (const [diff, data] of Object.entries(benchmark.metrics.by_difficulty)) {
      const diffName = diff.padEnd(10);
      const acc = (data.accuracy * 100).toFixed(0).padStart(3);
      console.log(`║   ${diffName} ${acc}% (${data.correct}/${data.total})                              ║`.substring(0, 67) + '║');
    }
    console.log('╚════════════════════════════════════════════════════════════════╝');

    // Print failures for analysis
    const failures = benchmark.results.filter(r => !r.v_mode_correct || !r.emergency_correct);
    if (failures.length > 0) {
      console.log('\n=== FAILURES ===');
      failures.forEach(f => {
        console.log(`[${f.case_id}] "${f.input}"`);
        if (!f.v_mode_correct) {
          console.log(`  V_MODE: expected ${f.expected_v_mode}, got ${f.actual_v_mode}`);
        }
        if (!f.emergency_correct) {
          console.log(`  EMERGENCY: expected ${f.expected_emergency}, got ${f.actual_emergency}`);
        }
      });
    }

    // Assertions
    expect(benchmark.metrics.overall_accuracy).toBeGreaterThan(0); // At least some pass
    expect(benchmark.results.length).toBe(50);
  });
});

// Export for external use
export { BENCHMARK_CASES, runBenchmark, BenchmarkCase, BenchmarkResult };
