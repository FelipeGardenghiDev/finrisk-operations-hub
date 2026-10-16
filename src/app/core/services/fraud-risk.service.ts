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

    return this.http.post<FraudAnalysisResponse>(url, req, { headers }).pipe(
      map(res => {
        this.state.addFraudAnalysis(res);
        return res;
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
