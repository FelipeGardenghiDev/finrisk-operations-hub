export type FraudDecision = 'APPROVED' | 'SUSPICIOUS' | 'BLOCKED';

export interface AppliedRule {
  ruleCode: 
    | 'BLACKLIST_CHECK' 
    | 'HIGH_AMOUNT' 
    | 'NIGHT_WINDOW' 
    | 'VELOCITY_BURST' 
    | 'IMPOSSIBLE_TRAVEL' 
    | 'BEHAVIORAL_ANOMALY' 
    | 'SMURFING_STRUCTURING';
  name: string;
  points: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FraudAnalysisRequest {
  transactionId: string;
  orderId?: string;
  cpf: string;
  amount: number;
  paymentMethod: 'CREDIT_CARD' | 'PIX' | 'DEBIT_CARD' | 'BOLETO';
  ipAddress: string;
  deviceFingerprint: string;
  customerEmail: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: string;
}

export interface FraudAnalysisResponse {
  analysisId: string;
  transactionId: string;
  orderId?: string;
  cpf: string;
  amount: number;
  riskScore: number; // 0 to 100
  decision: FraudDecision;
  appliedRules: AppliedRule[];
  idempotencyHit: boolean;
  analyzedAt: string;
  reviewedManually?: boolean;
  manualResolution?: 'APPROVED' | 'BLOCKED';
}

export interface RiskEngineStats {
  totalAnalyzed: number;
  approvedCount: number;
  suspiciousCount: number;
  blockedCount: number;
  totalProtectedCapital: number;
  averageRiskScore: number;
  lastUpdated: string;
}
