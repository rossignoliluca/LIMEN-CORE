/**
 * THOMPSON SAMPLER - Research Module (v5.0 Candidate)
 *
 * Online threshold optimization using Thompson Sampling.
 *
 * References:
 * - Thompson, W.R. (1933) "On the Likelihood that One Unknown Probability Exceeds Another"
 * - Agrawal & Goyal (2012) "Analysis of Thompson Sampling for the Multi-Armed Bandit"
 * - Li et al. (2024) "Feel-Good Thompson Sampling for Contextual Dueling Bandits"
 *
 * Key insight: The optimal gating threshold is unknown and may vary by:
 * - Time of day
 * - User behavior patterns
 * - System load
 *
 * Thompson Sampling balances exploration (trying new thresholds) with
 * exploitation (using thresholds that worked well).
 *
 * RESEARCH STATUS: Stub implementation
 * PROMOTION CRITERIA:
 * - Must converge to near-optimal threshold within 1000 queries
 * - Must handle non-stationary environments (threshold drift)
 * - Must not degrade performance during exploration
 */

// ============================================
// TYPES
// ============================================

export interface ThompsonConfig {
  /** Number of arms (threshold discretization) */
  n_arms: number;

  /** Minimum threshold */
  min_threshold: number;

  /** Maximum threshold */
  max_threshold: number;

  /** Prior alpha (success count) */
  prior_alpha: number;

  /** Prior beta (failure count) */
  prior_beta: number;

  /** Decay factor for non-stationarity */
  decay_factor: number;
}

export interface ArmState {
  /** Threshold value */
  threshold: number;

  /** Beta distribution alpha (successes) */
  alpha: number;

  /** Beta distribution beta (failures) */
  beta: number;

  /** Times this arm was selected */
  pulls: number;
}

export interface SamplingDecision {
  /** Selected threshold */
  threshold: number;

  /** Arm index */
  arm_index: number;

  /** Sampled value from Beta distribution */
  sampled_value: number;

  /** Is this exploration (random) or exploitation (best)? */
  is_exploration: boolean;
}

// ============================================
// STUB IMPLEMENTATION
// ============================================

export class ThompsonSampler {
  private config: ThompsonConfig;
  private arms: ArmState[] = [];
  private totalPulls: number = 0;

  constructor(config: Partial<ThompsonConfig> = {}) {
    this.config = {
      n_arms: 10,
      min_threshold: 0.3,
      max_threshold: 0.8,
      prior_alpha: 1,
      prior_beta: 1,
      decay_factor: 0.999,
      ...config,
    };

    this.initializeArms();
  }

  /**
   * Initialize arms with uniform threshold distribution.
   */
  private initializeArms(): void {
    const step = (this.config.max_threshold - this.config.min_threshold) /
                 (this.config.n_arms - 1);

    this.arms = [];
    for (let i = 0; i < this.config.n_arms; i++) {
      this.arms.push({
        threshold: this.config.min_threshold + i * step,
        alpha: this.config.prior_alpha,
        beta: this.config.prior_beta,
        pulls: 0,
      });
    }
  }

  /**
   * Sample from Beta distribution.
   * Uses Box-Muller approximation for simplicity.
   */
  private sampleBeta(alpha: number, beta: number): number {
    // Gamma(alpha) / (Gamma(alpha) + Gamma(beta))
    // Simple approximation using normal distribution for large alpha, beta
    if (alpha > 1 && beta > 1) {
      const mean = alpha / (alpha + beta);
      const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
      const std = Math.sqrt(variance);

      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      return Math.max(0, Math.min(1, mean + z * std));
    }

    // For small alpha, beta: use uniform and rejection sampling
    // Simplified: just use mean
    return alpha / (alpha + beta);
  }

  /**
   * Select threshold using Thompson Sampling.
   */
  select(): SamplingDecision {
    let bestArm = 0;
    let bestValue = -1;

    // Sample from each arm's Beta distribution
    const samples: number[] = [];
    for (let i = 0; i < this.arms.length; i++) {
      const arm = this.arms[i];
      const sample = this.sampleBeta(arm.alpha, arm.beta);
      samples.push(sample);

      if (sample > bestValue) {
        bestValue = sample;
        bestArm = i;
      }
    }

    this.totalPulls++;
    this.arms[bestArm].pulls++;

    // Determine if this is exploration
    // (arm wasn't the one with highest mean)
    const means = this.arms.map((a) => a.alpha / (a.alpha + a.beta));
    const bestMeanArm = means.indexOf(Math.max(...means));
    const isExploration = bestArm !== bestMeanArm;

    return {
      threshold: this.arms[bestArm].threshold,
      arm_index: bestArm,
      sampled_value: bestValue,
      is_exploration: isExploration,
    };
  }

  /**
   * Update arm with reward.
   *
   * @param armIndex - Which arm was used
   * @param success - Whether the outcome was successful
   */
  update(armIndex: number, success: boolean): void {
    if (armIndex < 0 || armIndex >= this.arms.length) return;

    const arm = this.arms[armIndex];

    // Apply decay to all arms (for non-stationarity)
    for (const a of this.arms) {
      a.alpha *= this.config.decay_factor;
      a.beta *= this.config.decay_factor;

      // Ensure minimums
      a.alpha = Math.max(a.alpha, this.config.prior_alpha);
      a.beta = Math.max(a.beta, this.config.prior_beta);
    }

    // Update the pulled arm
    if (success) {
      arm.alpha += 1;
    } else {
      arm.beta += 1;
    }
  }

  /**
   * Get current best threshold (exploitation only).
   */
  getBestThreshold(): number {
    let bestMean = -1;
    let bestThreshold = this.config.min_threshold;

    for (const arm of this.arms) {
      const mean = arm.alpha / (arm.alpha + arm.beta);
      if (mean > bestMean) {
        bestMean = mean;
        bestThreshold = arm.threshold;
      }
    }

    return bestThreshold;
  }

  /**
   * Get statistics for all arms.
   */
  getStats(): {
    arms: Array<{ threshold: number; mean: number; variance: number; pulls: number }>;
    total_pulls: number;
    best_threshold: number;
  } {
    const armStats = this.arms.map((arm) => {
      const mean = arm.alpha / (arm.alpha + arm.beta);
      const variance =
        (arm.alpha * arm.beta) /
        ((arm.alpha + arm.beta) ** 2 * (arm.alpha + arm.beta + 1));

      return {
        threshold: arm.threshold,
        mean,
        variance,
        pulls: arm.pulls,
      };
    });

    return {
      arms: armStats,
      total_pulls: this.totalPulls,
      best_threshold: this.getBestThreshold(),
    };
  }

  /**
   * Reset all arms to prior.
   */
  reset(): void {
    this.initializeArms();
    this.totalPulls = 0;
  }
}

export default ThompsonSampler;
