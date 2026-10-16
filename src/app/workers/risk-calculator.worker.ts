/// <reference lib="webworker" />
import { WorkerBatchSimulationPayload, WorkerBatchSimulationResult } from '../core/models/worker-event.model';

addEventListener('message', ({ data }: { data: { type: string; payload: WorkerBatchSimulationPayload } }) => {
  if (data?.type === 'RUN_STRESS_SIMULATION') {
    const startTime = performance.now();
    const { sampleSize, baseAmount, fraudRatePercent, enableNightWindowSim, enableBurstSim } = data.payload;

    let totalScore = 0;
    let approved = 0;
    let suspicious = 0;
    let blocked = 0;
    let protectedCapital = 0;
    const highRiskSamples: WorkerBatchSimulationResult['highRiskTransactions'] = [];

    // Simulate intensive Monte Carlo transaction evaluation
    for (let i = 0; i < sampleSize; i++) {
      const isRandomAnomaly = Math.random() * 100 < fraudRatePercent;
      const isNight = enableNightWindowSim && Math.random() < 0.25;
      const isBurst = enableBurstSim && Math.random() < 0.15;
      
      const multiplier = isRandomAnomaly ? (1.5 + Math.random() * 8) : (0.5 + Math.random() * 1.5);
      const amount = Math.round(baseAmount * multiplier * 100) / 100;

      let score = Math.floor(Math.random() * 20); // baseline noise

      if (isRandomAnomaly) score += 40;
      if (amount > 5000) score += 30;
      if (isNight) score += 20;
      if (isBurst) score += 25;

      // Clamp 0-100
      score = Math.min(100, Math.max(0, score));
      totalScore += score;

      const cpfMock = `${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}-${Math.floor(10 + Math.random() * 89)}`;

      if (score >= 80) {
        blocked++;
        protectedCapital += amount;
        if (highRiskSamples.length < 5) {
          highRiskSamples.push({
            cpf: cpfMock,
            amount,
            score,
            reason: isRandomAnomaly ? 'Blacklist Pattern & Anomaly' : 'High Value Night Transaction'
          });
        }
      } else if (score >= 40) {
        suspicious++;
      } else {
        approved++;
      }
    }

    const durationMs = Math.round(performance.now() - startTime);

    const result: WorkerBatchSimulationResult = {
      totalSimulated: sampleSize,
      avgRiskScore: Math.round(totalScore / sampleSize),
      approvedCount: approved,
      suspiciousCount: suspicious,
      blockedCount: blocked,
      estimatedProtectedCapital: Math.round(protectedCapital),
      highRiskTransactions: highRiskSamples,
      durationMs
    };

    postMessage({ type: 'SIMULATION_COMPLETE', result });
  }
});
