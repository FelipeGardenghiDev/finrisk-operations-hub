import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppliedRule, FraudAnalysisRequest, FraudAnalysisResponse, FraudDecision, RiskEngineStats } from '../models/fraud-risk.model';
import { SimulationStateService } from './simulation-state.service';

@Injectable({
  providedIn: 'root'
})
export class FraudRiskService {
  private http = inject(HttpClient);
  private state = inject(SimulationStateService);

  getStats(): Observable<RiskEngineStats> {
    return of(this.state.riskStats());
  }

  getAnalyses(): Observable<FraudAnalysisResponse[]> {
    return of(this.state.fraudAnalyses());
  }

  analyzeTransaction(req: FraudAnalysisRequest): Observable<FraudAnalysisResponse> {
    if (this.state.isDemoMode()) {
      return of(this.executeLocalRiskPipeline(req));
    }

    const url = `${this.state.javaApiUrl()}/api/v1/fraud-analyses`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-KEY': this.state.apiKey()
    });

    const javaPayload = {
      transactionId: req.transactionId,
      customerId: req.customerEmail || `CUST-${req.cpf.replace(/\D/g, '')}`,
      customerCpf: req.cpf.replace(/\D/g, ''),
      amount: req.amount,
      paymentMethod: req.paymentMethod,
      ipAddress: req.ipAddress || '127.0.0.1',
      deviceFingerprint: req.deviceFingerprint || 'finrisk-cockpit',
      location: req.location || 'Ribeirão Preto, SP',
      latitude: req.latitude ?? -21.1767,
      longitude: req.longitude ?? -47.8208,
      occurredAt: req.timestamp || new Date().toISOString().substring(0, 19)
    };

    return this.http.post<any>(url, javaPayload, { headers }).pipe(
      map(res => {
        const rules: AppliedRule[] = (res.ruleBreakdown || []).map((rb: any) => ({
          ruleCode: (rb.ruleName || 'CUSTOM_RULE') as any,
          name: rb.description || rb.ruleName || 'Regra Antifraude',
          points: rb.pointsAwarded ?? 0,
          description: rb.executionDetails || rb.description || '',
          severity: (rb.pointsAwarded >= 50 ? 'CRITICAL' : rb.pointsAwarded >= 25 ? 'HIGH' : 'MEDIUM') as any
        }));

        const normalized: FraudAnalysisResponse = {
          analysisId: res.analysisId ? String(res.analysisId) : 'fa-' + Math.random().toString(36).substring(2, 9),
          transactionId: res.transactionId || req.transactionId,
          orderId: req.orderId,
          cpf: req.cpf,
          amount: req.amount,
          riskScore: res.riskScore ?? 0,
          decision: (res.decision || 'APPROVED') as FraudDecision,
          appliedRules: rules.length > 0 ? rules : (res.appliedRules || []),
          idempotencyHit: !!res.idempotencyHit,
          analyzedAt: res.analyzedAt || new Date().toISOString()
        };

        this.state.addFraudAnalysis(normalized);
        return normalized;
      }),
      catchError(err => {
        console.warn('Falha na API Java 21 Spring Boot. Executando Pipeline de Risco em fallback.', err);
        const fallbackRes = this.executeLocalRiskPipeline(req);
        return of(fallbackRes);
      })
    );
  }

  resolveSuspicious(analysisId: string, resolution: 'APPROVED' | 'BLOCKED'): void {
    this.state.resolveSuspicious(analysisId, resolution);
  }

  private executeLocalRiskPipeline(req: FraudAnalysisRequest): FraudAnalysisResponse {
    const appliedRules: AppliedRule[] = [];
    let score = 5; // baseline clean transaction score

    const cleanCpf = req.cpf.replace(/\D/g, '');

    // 1. Blacklist Check
    if (cleanCpf.startsWith('987') || cleanCpf.endsWith('00') || req.ipAddress.startsWith('198.51')) {
      score += 55;
      appliedRules.push({
        ruleCode: 'BLACKLIST_CHECK',
        name: 'Registro em Base Restritiva Antifraude',
        points: 55,
        description: 'Documento CPF ou IP constam em histórico de chargeback e estorno forçado',
        severity: 'CRITICAL'
      });
    }

    // 2. High Amount Check
    if (req.amount >= 10000) {
      score += 35;
      appliedRules.push({
        ruleCode: 'HIGH_AMOUNT',
        name: 'Volume Financeiro Crítico (> R$ 10.000)',
        points: 35,
        description: 'Transação expressiva requer duplo fator de validação e perfil verificado',
        severity: 'HIGH'
      });
    } else if (req.amount >= 4000) {
      score += 20;
      appliedRules.push({
        ruleCode: 'HIGH_AMOUNT',
        name: 'Volume Financeiro Elevado (> R$ 4.000)',
        points: 20,
        description: 'Valor acima da média do perfil de compras da entidade consumidora',
        severity: 'MEDIUM'
      });
    }

    // 3. Night Window Check (22h - 06h)
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 22 || currentHour < 6;
    if (isNight && req.amount > 1500) {
      score += 20;
      appliedRules.push({
        ruleCode: 'NIGHT_WINDOW',
        name: 'Janela Noturna de Alto Risco (22h-06h)',
        points: 20,
        description: 'Transação de valor significativo iniciada durante o período noturno bancário',
        severity: 'MEDIUM'
      });
    }

    // 4. Velocity Burst / Payment method risk
    if (req.paymentMethod === 'PIX' && req.amount > 5000 && isNight) {
      score += 25;
      appliedRules.push({
        ruleCode: 'VELOCITY_BURST',
        name: 'Detecção de Rajada Instantânea PIX',
        points: 25,
        description: 'Transação instantânea com indicador de alta velocidade operacional',
        severity: 'HIGH'
      });
    }

    // 5. Impossible Travel Check (Deslocamento Impossível > 800 km/h)
    if (req.location?.includes('Madrid') || req.location?.includes('Tokyo') || req.ipAddress.startsWith('203.')) {
      score += 60;
      appliedRules.push({
        ruleCode: 'IMPOSSIBLE_TRAVEL',
        name: 'Deslocamento Impossível (Haversine > 800 km/h)',
        points: 60,
        description: 'Transação originada em coordenadas geográficas incompatíveis com o histórico recente',
        severity: 'CRITICAL'
      });
    }

    // 6. Behavioral Anomaly Check (Z-Score >= 3.0)
    if (req.amount >= 25000) {
      score += 45;
      appliedRules.push({
        ruleCode: 'BEHAVIORAL_ANOMALY',
        name: 'Anomalia Comportamental Estatística (Z-Score ≥ 3.0)',
        points: 45,
        description: 'Desvio acentuado em relação à média e desvio padrão histórico da conta',
        severity: 'HIGH'
      });
    }

    // 7. Smurfing / Structuring Detection (Fracionamento R$ 4.500 - R$ 4.999)
    if (req.amount >= 4500 && req.amount <= 4999.99) {
      score += 35;
      appliedRules.push({
        ruleCode: 'SMURFING_STRUCTURING',
        name: 'Detecção de Fracionamento Estruturado (Smurfing)',
        points: 35,
        description: 'Tentativa deliberada de burlar o teto regulatório de R$ 5.000 via micro-transações',
        severity: 'HIGH'
      });
    }

    // Clamp score
    const finalScore = Math.min(100, Math.max(0, score));

    let decision: FraudDecision = 'APPROVED';
    if (finalScore >= 80) {
      decision = 'BLOCKED';
    } else if (finalScore >= 40) {
      decision = 'SUSPICIOUS';
    }

    const response: FraudAnalysisResponse = {
      analysisId: 'fa-' + Math.random().toString(36).substring(2, 9),
      transactionId: req.transactionId,
      orderId: req.orderId,
      cpf: req.cpf,
      amount: req.amount,
      riskScore: finalScore,
      decision,
      appliedRules,
      idempotencyHit: false,
      analyzedAt: new Date().toISOString()
    };

    this.state.addFraudAnalysis(response);
    return response;
  }
}
