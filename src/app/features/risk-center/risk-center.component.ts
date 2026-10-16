import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FraudRiskService } from '../../core/services/fraud-risk.service';
import { SimulationStateService } from '../../core/services/simulation-state.service';
import { FraudAnalysisResponse } from '../../core/models/fraud-risk.model';

@Component({
  selector: 'app-risk-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-20 lg:pb-6">
      
      <!-- Top Title -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
              Motor de Risco & Prevenção a Fraudes
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/30">
              Java 21 • Spring Boot 3 • Outbox Pattern
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Pipeline antifraude com Rule Engine desacoplado, validação de CPF (Módulo 11), detecção de anomalias e publicação transacional.
          </p>
        </div>
      </div>

      <!-- Simulator and Live Score Gauge (2-Column Grid) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Interactive Simulator Form (7 cols) -->
        <div class="lg:col-span-7 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span> Simulador de Transação em Tempo Real
            </h3>
            <span class="text-xs text-indigo-400 font-mono">POST /api/v1/fraud-analyses</span>
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">CPF do Titular</label>
                <input
                  type="text"
                  [(ngModel)]="simCpf"
                  placeholder="Ex: 987.654.321-00 (Blacklist)"
                  class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"/>
                <p class="text-[10px] text-slate-500 mt-0.5">Dica: CPFs iniciando em 987 acionam a Blacklist</p>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Valor da Operação (R$)</label>
                <input
                  type="number"
                  [(ngModel)]="simAmount"
                  placeholder="Ex: 12500"
                  class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"/>
                <p class="text-[10px] text-slate-500 mt-0.5">Valores > R$ 5.000 pontuam como Alto Valor</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Método de Pagamento</label>
                <select
                  [(ngModel)]="simPaymentMethod"
                  class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none">
                  <option value="PIX">PIX (Instantâneo)</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="BOLETO">Boleto Bancário</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">IP de Origem</label>
                <input
                  type="text"
                  [(ngModel)]="simIp"
                  placeholder="Ex: 189.44.12.9"
                  class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"/>
              </div>
            </div>

            <!-- Quick Scenario Presets -->
            <div class="pt-2 border-t border-slate-800">
              <span class="text-xs text-slate-400 font-medium">Cenários Prontos para Teste:</span>
              <div class="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  (click)="applyPreset('clean')"
                  class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                  🟢 Transação Segura (R$ 350)
                </button>
                <button
                  type="button"
                  (click)="applyPreset('suspicious')"
                  class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-medium border border-amber-500/20">
                  🟡 Suspeita Noturna (R$ 8.200)
                </button>
                <button
                  type="button"
                  (click)="applyPreset('fraud')"
                  class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 text-[11px] font-medium border border-rose-500/20">
                  🔴 Fraude / Blacklist (R$ 19.500)
                </button>
              </div>
            </div>

            <button
              (click)="triggerAnalysis()"
              class="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 mt-4">
              <span>Executar Pipeline de Risco (Java 21) ➔</span>
            </button>
          </div>
        </div>

        <!-- Right: Veredito & Termômetro Visual do RiskScore (5 cols) -->
        <div class="lg:col-span-5 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          
          <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Veredito do Rule Engine</h3>
            <span *ngIf="latestResult" class="text-[10px] text-slate-500 font-mono">
              ID: #{{ latestResult.analysisId.slice(0, 8) }}
            </span>
          </div>

          <div *ngIf="latestResult" class="space-y-4 my-auto">
            <!-- Score Gauge Meter -->
            <div class="text-center">
              <div class="relative inline-flex items-center justify-center">
                <div class="text-4xl sm:text-5xl font-black tracking-tight"
                  [ngClass]="{
                    'text-emerald-400': latestResult.decision === 'APPROVED',
                    'text-amber-400': latestResult.decision === 'SUSPICIOUS',
                    'text-rose-400': latestResult.decision === 'BLOCKED'
                  }">
                  {{ latestResult.riskScore }}
                  <span class="text-xl text-slate-500 font-normal">/100</span>
                </div>
              </div>
              <div class="mt-2">
                <span
                  class="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block"
                  [ngClass]="{
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40': latestResult.decision === 'APPROVED',
                    'bg-amber-500/10 text-amber-400 border border-amber-500/40': latestResult.decision === 'SUSPICIOUS',
                    'bg-rose-500/10 text-rose-400 border border-rose-500/40': latestResult.decision === 'BLOCKED'
                  }">
                  Decisão: {{ latestResult.decision }}
                </span>
              </div>
            </div>

            <!-- Progress Bar Barometer -->
            <div class="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
              <div
                class="h-full rounded-full transition-all duration-700"
                [style.width.%]="latestResult.riskScore"
                [ngClass]="{
                  'bg-gradient-to-r from-emerald-500 to-emerald-400': latestResult.decision === 'APPROVED',
                  'bg-gradient-to-r from-amber-500 to-amber-400': latestResult.decision === 'SUSPICIOUS',
                  'bg-gradient-to-r from-rose-600 to-rose-400': latestResult.decision === 'BLOCKED'
                }">
              </div>
            </div>

            <!-- Rules Breakdown List -->
            <div class="space-y-2 pt-2">
              <span class="text-xs font-semibold text-slate-300">Regras Disparadas:</span>
              <div *ngIf="latestResult.appliedRules.length === 0" class="text-xs text-slate-500 italic">
                Nenhuma violação detectada. Transação em conformidade.
              </div>
              <div *ngFor="let rule of latestResult.appliedRules" class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div class="flex items-center justify-between font-bold"
                  [ngClass]="rule.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'">
                  <span>{{ rule.name }}</span>
                  <span>+{{ rule.points }} pts</span>
                </div>
                <p class="text-[11px] text-slate-400 mt-0.5">{{ rule.description }}</p>
              </div>
            </div>
          </div>

          <div *ngIf="!latestResult" class="text-center py-12 text-slate-500 text-xs">
            Selecione um cenário ou preencha os dados e clique em executar para ver o veredito do motor Java.
          </div>

          <!-- Outbox & RabbitMQ note -->
          <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <span>📨</span>
            <span>Alertas de risco são enfileirados via <strong>Transactional Outbox</strong> e despachados para o <strong>RabbitMQ</strong>.</span>
          </div>

        </div>

      </div>

      <!-- Fila de Transações Auditadas com Ação Manual -->
      <div class="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="text-xs font-bold text-white uppercase tracking-wider">
            Auditoria Contínua & Fila de Transações Suspeitas
          </div>
          <span class="text-xs text-slate-400">
            {{ state.riskStats().totalAnalyzed }} transações analisadas
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th class="p-3.5">ID / Data</th>
                <th class="p-3.5">CPF Mascarado</th>
                <th class="p-3.5">Valor</th>
                <th class="p-3.5">Score</th>
                <th class="p-3.5">Decisão</th>
                <th class="p-3.5">Regras Violadas</th>
                <th class="p-3.5 text-right">Revisão Manual</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr *ngFor="let item of state.fraudAnalyses()" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-3.5 font-mono text-slate-400">
                  #{{ item.analysisId.slice(0, 8) }}
                </td>
                <td class="p-3.5 font-mono text-white">
                  {{ item.cpf }}
                </td>
                <td class="p-3.5 font-bold text-white">
                  R$ {{ item.amount.toFixed(2) }}
                </td>
                <td class="p-3.5 font-bold"
                  [ngClass]="{
                    'text-emerald-400': item.riskScore < 40,
                    'text-amber-400': item.riskScore >= 40 && item.riskScore < 80,
                    'text-rose-400': item.riskScore >= 80
                  }">
                  {{ item.riskScore }}/100
                </td>
                <td class="p-3.5">
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30': item.decision === 'APPROVED',
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30': item.decision === 'SUSPICIOUS',
                      'bg-rose-500/10 text-rose-400 border border-rose-500/30': item.decision === 'BLOCKED'
                    }">
                    {{ item.decision }}
                  </span>
                </td>
                <td class="p-3.5 text-slate-400">
                  {{ item.appliedRules.length > 0 ? item.appliedRules[0].name : 'Nenhuma' }}
                  <span *ngIf="item.appliedRules.length > 1" class="text-[10px] text-indigo-400 ml-1">
                    (+{{ item.appliedRules.length - 1 }})
                  </span>
                </td>
                <td class="p-3.5 text-right">
                  <div *ngIf="item.decision === 'SUSPICIOUS' && !item.reviewedManually" class="flex items-center justify-end gap-1.5">
                    <button
                      (click)="resolveManual(item.analysisId, 'APPROVED')"
                      class="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                      Aprovar
                    </button>
                    <button
                      (click)="resolveManual(item.analysisId, 'BLOCKED')"
                      class="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-semibold">
                      Bloquear
                    </button>
                  </div>
                  <span *ngIf="item.reviewedManually" class="text-[10px] text-slate-500 italic">
                    Revisado como {{ item.manualResolution }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class RiskCenterComponent {
  state = inject(SimulationStateService);
  riskService = inject(FraudRiskService);

  simCpf = '987.654.321-00';
  simAmount = 14500;
  simPaymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' = 'PIX';
  simIp = '189.44.12.9';

  latestResult: FraudAnalysisResponse | null = null;

  applyPreset(type: 'clean' | 'suspicious' | 'fraud'): void {
    if (type === 'clean') {
      this.simCpf = '342.981.042-88';
      this.simAmount = 350;
      this.simPaymentMethod = 'CREDIT_CARD';
      this.simIp = '177.18.29.102';
    } else if (type === 'suspicious') {
      this.simCpf = '554.891.203-44';
      this.simAmount = 8200;
      this.simPaymentMethod = 'PIX';
      this.simIp = '191.22.44.18';
    } else {
      this.simCpf = '987.654.321-00';
      this.simAmount = 19500;
      this.simPaymentMethod = 'PIX';
      this.simIp = '198.51.100.42';
    }
  }

  triggerAnalysis(): void {
    this.riskService.analyzeTransaction({
      transactionId: 'tx-' + Math.random().toString(36).substring(2, 9),
      cpf: this.simCpf,
      amount: this.simAmount,
      paymentMethod: this.simPaymentMethod,
      ipAddress: this.simIp,
      deviceFingerprint: 'fp-' + Math.random().toString(36).substring(2, 8),
      customerEmail: 'cliente@empresa.com'
    }).subscribe(res => {
      this.latestResult = res;
    });
  }

  resolveManual(analysisId: string, resolution: 'APPROVED' | 'BLOCKED'): void {
    this.riskService.resolveSuspicious(analysisId, resolution);
  }
}
