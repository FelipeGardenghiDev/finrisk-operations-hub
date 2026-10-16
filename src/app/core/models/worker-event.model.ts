export type WorkerType = 'DOTNET_PAYMENT_WORKER' | 'JAVA_OUTBOX_POLLER' | 'ANGULAR_WEB_WORKER';

export interface WorkerStatus {
  id: WorkerType;
  name: string;
  technology: string;
  sourceRepo: string;
  pattern: string;
  state: 'IDLE' | 'PROCESSING' | 'ACTIVE' | 'ERROR';
  processedCount: number;
  lastExecutionTime: string;
  averageLatencyMs: number;
  pendingQueueDepth: number;
  description: string;
}

export interface WorkerActivityLog {
  id: string;
  timestamp: string;
  workerType: WorkerType;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR';
  message: string;
  payloadSnippet?: string;
  durationMs?: number;
}

export interface WorkerBatchSimulationPayload {
  sampleSize: number;
  baseAmount: number;
  fraudRatePercent: number;
  enableNightWindowSim: boolean;
  enableBurstSim: boolean;
}

export interface WorkerBatchSimulationResult {
  totalSimulated: number;
  avgRiskScore: number;
  approvedCount: number;
  suspiciousCount: number;
  blockedCount: number;
  estimatedProtectedCapital: number;
  highRiskTransactions: {
    cpf: string;
    amount: number;
    score: number;
    reason: string;
  }[];
  durationMs: number;
}
