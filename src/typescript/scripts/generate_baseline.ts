/**
 * Generate Baseline Snapshot for Detector Benchmark
 *
 * Captures the current state of regex detector performance
 * as ground truth for future comparisons.
 *
 * Output: artifacts/detector_benchmark_baseline.json
 *
 * Run: npx ts-node scripts/generate_baseline.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { DimensionalDetector, DimensionalState } from '../src/dimensional_system';
import { BENCHMARK_CASES, BenchmarkCase } from '../src/benchmark_cases';

interface BaselineCaseResult {
  case_id: string;
  input: string;
  language: string;
  category: string;
  difficulty: string;

  // Expected (ground truth)
  expected: {
    primary_vertical: string;
    v_mode: boolean;
    emergency: boolean;
    primary_horizontal: string[];
  };

  // Actual detector output
  actual: {
    primary_vertical: string;
    v_mode_triggered: boolean;
    emergency_detected: boolean;
    vertical_scores: Record<string, number>;
    existential_score: number;
    confidence: number;
    cross_dimensional: boolean;
  };

  // Pass/fail
  pass: boolean;
  v_mode_correct: boolean;
  emergency_correct: boolean;
  vertical_correct: boolean;

  notes?: string;
}

interface BaselineSnapshot {
  meta: {
    generated_at: string;
    git_commit: string;
    detector_type: 'regex';
    total_cases: number;
    passed: number;
    failed: number;
  };

  metrics: {
    overall_accuracy: number;
    v_mode_precision: number;
    v_mode_recall: number;
    v_mode_f1: number;
    emergency_precision: number;
    emergency_recall: number;
    emergency_f1: number;
    by_category: Record<string, { total: number; passed: number; accuracy: number }>;
    by_difficulty: Record<string, { total: number; passed: number; accuracy: number }>;
  };

  cases: BaselineCaseResult[];

  failures: {
    existential_clear: string[];
    existential_subtle: string[];
    emergency_real: string[];
    emergency_false_positive: string[];
    functional: string[];
    relational: string[];
    edge_case: string[];
    ambiguous: string[];
  };
}

function getGitCommit(): string {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

function generateBaseline(): BaselineSnapshot {
  const detector = new DimensionalDetector();
  const results: BaselineCaseResult[] = [];

  // Tracking metrics
  let v_mode_tp = 0, v_mode_fp = 0, v_mode_fn = 0, v_mode_tn = 0;
  let emerg_tp = 0, emerg_fp = 0, emerg_fn = 0, emerg_tn = 0;

  const by_category: Record<string, { total: number; passed: number }> = {};
  const by_difficulty: Record<string, { total: number; passed: number }> = {};
  const failures: Record<string, string[]> = {
    existential_clear: [],
    existential_subtle: [],
    emergency_real: [],
    emergency_false_positive: [],
    functional: [],
    relational: [],
    edge_case: [],
    ambiguous: [],
  };

  for (const tc of BENCHMARK_CASES) {
    const state: DimensionalState = detector.detect(tc.input, tc.lang);

    const v_mode_correct = state.v_mode_triggered === tc.expected.v_mode;
    const emergency_correct = state.emergency_detected === tc.expected.emergency;
    const vertical_correct = state.primary_vertical === tc.expected.primary_vertical;
    const pass = v_mode_correct && emergency_correct;

    // Confusion matrices
    if (tc.expected.v_mode && state.v_mode_triggered) v_mode_tp++;
    else if (!tc.expected.v_mode && state.v_mode_triggered) v_mode_fp++;
    else if (tc.expected.v_mode && !state.v_mode_triggered) v_mode_fn++;
    else v_mode_tn++;

    if (tc.expected.emergency && state.emergency_detected) emerg_tp++;
    else if (!tc.expected.emergency && state.emergency_detected) emerg_fp++;
    else if (tc.expected.emergency && !state.emergency_detected) emerg_fn++;
    else emerg_tn++;

    // Category/difficulty tracking
    if (!by_category[tc.category]) by_category[tc.category] = { total: 0, passed: 0 };
    by_category[tc.category].total++;
    if (pass) by_category[tc.category].passed++;
    else failures[tc.category]?.push(tc.id);

    if (!by_difficulty[tc.difficulty]) by_difficulty[tc.difficulty] = { total: 0, passed: 0 };
    by_difficulty[tc.difficulty].total++;
    if (pass) by_difficulty[tc.difficulty].passed++;

    results.push({
      case_id: tc.id,
      input: tc.input,
      language: tc.lang,
      category: tc.category,
      difficulty: tc.difficulty,
      expected: {
        primary_vertical: tc.expected.primary_vertical,
        v_mode: tc.expected.v_mode,
        emergency: tc.expected.emergency,
        primary_horizontal: tc.expected.primary_horizontal,
      },
      actual: {
        primary_vertical: state.primary_vertical,
        v_mode_triggered: state.v_mode_triggered,
        emergency_detected: state.emergency_detected,
        vertical_scores: state.vertical,
        existential_score: state.vertical.EXISTENTIAL,
        confidence: state.integration?.phi ?? 0,
        cross_dimensional: state.cross_dimensional,
      },
      pass,
      v_mode_correct,
      emergency_correct,
      vertical_correct,
      notes: tc.notes,
    });
  }

  // Calculate metrics
  const v_mode_precision = v_mode_tp / (v_mode_tp + v_mode_fp) || 0;
  const v_mode_recall = v_mode_tp / (v_mode_tp + v_mode_fn) || 0;
  const v_mode_f1 = 2 * (v_mode_precision * v_mode_recall) / (v_mode_precision + v_mode_recall) || 0;

  const emerg_precision = emerg_tp / (emerg_tp + emerg_fp) || 0;
  const emerg_recall = emerg_tp / (emerg_tp + emerg_fn) || 0;
  const emerg_f1 = 2 * (emerg_precision * emerg_recall) / (emerg_precision + emerg_recall) || 0;

  const passed = results.filter(r => r.pass).length;
  const failed = results.length - passed;
  const overall_accuracy = passed / results.length;

  const cat_metrics: Record<string, { total: number; passed: number; accuracy: number }> = {};
  for (const [cat, data] of Object.entries(by_category)) {
    cat_metrics[cat] = { ...data, accuracy: data.passed / data.total };
  }

  const diff_metrics: Record<string, { total: number; passed: number; accuracy: number }> = {};
  for (const [diff, data] of Object.entries(by_difficulty)) {
    diff_metrics[diff] = { ...data, accuracy: data.passed / data.total };
  }

  return {
    meta: {
      generated_at: new Date().toISOString(),
      git_commit: getGitCommit(),
      detector_type: 'regex',
      total_cases: results.length,
      passed,
      failed,
    },
    metrics: {
      overall_accuracy,
      v_mode_precision,
      v_mode_recall,
      v_mode_f1,
      emergency_precision: emerg_precision,
      emergency_recall: emerg_recall,
      emergency_f1: emerg_f1,
      by_category: cat_metrics,
      by_difficulty: diff_metrics,
    },
    cases: results,
    failures: failures as BaselineSnapshot['failures'],
  };
}

// Main execution
const baseline = generateBaseline();

// Write to file
const outputPath = path.join(__dirname, '..', 'artifacts', 'detector_benchmark_baseline.json');
fs.writeFileSync(outputPath, JSON.stringify(baseline, null, 2));

// Print summary
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║           BASELINE SNAPSHOT GENERATED                          ║');
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log(`║ Git Commit:  ${baseline.meta.git_commit.substring(0, 12)}                                   ║`);
console.log(`║ Generated:   ${baseline.meta.generated_at.substring(0, 19)}                        ║`);
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log(`║ Total Cases: ${baseline.meta.total_cases.toString().padStart(3)}                                              ║`);
console.log(`║ Passed:      ${baseline.meta.passed.toString().padStart(3)}  (${(baseline.metrics.overall_accuracy * 100).toFixed(1)}%)                                  ║`);
console.log(`║ Failed:      ${baseline.meta.failed.toString().padStart(3)}                                              ║`);
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log(`║ V_MODE   Precision: ${(baseline.metrics.v_mode_precision * 100).toFixed(1).padStart(5)}%  Recall: ${(baseline.metrics.v_mode_recall * 100).toFixed(1).padStart(5)}%  F1: ${(baseline.metrics.v_mode_f1 * 100).toFixed(1).padStart(5)}% ║`);
console.log(`║ EMERGENCY Precision: ${(baseline.metrics.emergency_precision * 100).toFixed(1).padStart(5)}%  Recall: ${(baseline.metrics.emergency_recall * 100).toFixed(1).padStart(5)}%  F1: ${(baseline.metrics.emergency_f1 * 100).toFixed(1).padStart(5)}% ║`);
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log('║ Failures by Category:                                          ║');
for (const [cat, ids] of Object.entries(baseline.failures)) {
  if (ids.length > 0) {
    console.log(`║   ${cat.padEnd(25)} ${ids.length.toString().padStart(2)} failures                    ║`);
  }
}
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log(`║ Output: artifacts/detector_benchmark_baseline.json             ║`);
console.log('╚════════════════════════════════════════════════════════════════╝');
