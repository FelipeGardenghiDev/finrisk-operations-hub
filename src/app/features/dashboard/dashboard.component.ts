import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SimulationStateService } from '../../core/services/simulation-state.service';
import { WorkerMonitorService } from '../../core/services/worker-monitor.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 pb-20 lg:pb-6">
      
      <!-- Top Hero Welcome Banner -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Cockpit de Operações & Risco
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Visão Panorâmica do Ecossistema
            </h2>
            <p class="text-sm text-slate-300 mt-1 max-w-2xl">
              Monitoramento unificado de pedidos (.NET 8 Clean Arch + Dapper), regras de risco em tempo real (Java 21 Spring Boot) e background workers distribuídos.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <a
              routerLink="/orders"
              class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2">
              <span>+ Novo Pedido (.NET)</span>
            </a>
            <a
              routerLink="/risk"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 flex items-center gap-2">
              <span>🛡️ Testar Risco (Java)</span>
            </a>
          </div>
        </div>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Faturamento Aprovado -->
        <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Receita Aprovada</span>
            <span class="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">💵</span>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-bold text-white tracking-tight">
              R$ {{ state.totalRevenue().toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </div>
            <p class="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span>↑ .NET 8 CQRS</span>
              <span class="text-slate-500">• Invariantes garantidas</span>
            </p>
          </div>
        </div>

        <!-- Total de Pedidos -->
        <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Volume de Pedidos</span>
            <span class="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">📦</span>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-bold text-white tracking-tight">
              {{ state.totalOrdersCount() }} transações
            </div>
            <p class="text-xs text-indigo-400 mt-1 flex items-center gap-1 font-medium">
              <span>Fila Assíncrona</span>
              <span class="text-slate-500">• System.Threading.Channels</span>
            </p>
          </div>
        </div>

        <!-- Capital Protegido pelo Motor Antifraude -->
        <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Capital Protegido</span>
            <span class="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm">🛡️</span>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-bold text-white tracking-tight">
              R$ {{ state.riskStats().totalProtectedCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </div>
            <p class="text-xs text-violet-400 mt-1 flex items-center gap-1 font-medium">
              <span>Java 21 Spring</span>
              <span class="text-slate-500">• {{ state.riskStats().blockedCount }} fraudes bloqueadas</span>
            </p>
          </div>
        </div>

        <!-- Score Médio de Risco -->
        <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Score de Risco Médio</span>
            <span class="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">⚡</span>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-bold text-white tracking-tight">
              {{ state.riskStats().averageRiskScore }} / 100
            </div>
            <p class="text-xs text-amber-400 mt-1 flex items-center gap-1 font-medium">
              <span>Score VO</span>
              <span class="text-slate-500">• {{ state.riskStats().suspiciousCount }} suspeitas pendentes</span>
            </p>
          </div>
        </div>

      </div>

      <!-- Workers Pulse Bar -->
      <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="h-3 w-3 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">
              Status das Filas e Workers em Execução
            </h3>
            <p class="text-xs text-slate-400">
              PaymentProcessingWorker (.NET) • OutboxPublisherJob (Java) • RiskCalculator (Angular Web Worker)
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="triggerWorkerSimulation()"
            [disabled]="workerService.isWorkerProcessing()"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition-all flex items-center gap-2">
            <span>{{ workerService.isWorkerProcessing() ? 'Executando em thread paralela...' : '⚡ Testar Web Worker (1.000 cenários)' }}</span>
          </button>
          <a
            routerLink="/workers"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all">
            Ver Logs →
          </a>
        </div>
      </div>

      <!-- Split Columns: Pedidos Recentes & Transações de Risco Recentes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Pedidos Recentes (.NET 8) -->
        <div class="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📦</span>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Últimos Pedidos (.NET 8)</h3>
            </div>
            <a routerLink="/orders" class="text-xs text-indigo-400 hover:underline">Ver todos</a>
          </div>

          <div class="space-y-2.5">
            <div
              *ngFor="let order of state.orders().slice(0, 4)"
              class="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-white">{{ order.customerName }}</span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30': order.status === 'Paid',
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30': order.status === 'Processing',
                      'bg-slate-500/10 text-slate-400 border border-slate-500/30': order.status === 'Pending',
                      'bg-rose-500/10 text-rose-400 border border-rose-500/30': order.status === 'Failed'
                    }">
                    {{ order.status }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
                  #{{ order.id.slice(0, 10) }} • {{ order.paymentMethod }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-white">
                  R$ {{ order.totalAmount.toFixed(2) }}
                </div>
                <div class="text-[10px] text-slate-500">
                  {{ order.createdAt | date:'shortTime' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alertas de Risco & Fraude (Java 21) -->
        <div class="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">🛡️</span>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Auditoria de Risco (Java 21)</h3>
            </div>
            <a routerLink="/risk" class="text-xs text-indigo-400 hover:underline">Ir para Antifraude</a>
          </div>

          <div class="space-y-2.5">
            <div
              *ngFor="let analysis of state.fraudAnalyses().slice(0, 4)"
              class="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-white">CPF {{ analysis.cpf }}</span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30': analysis.decision === 'APPROVED',
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30': analysis.decision === 'SUSPICIOUS',
                      'bg-rose-500/10 text-rose-400 border border-rose-500/30': analysis.decision === 'BLOCKED'
                    }">
                    {{ analysis.decision }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  Score: <span class="font-bold text-slate-200">{{ analysis.riskScore }}/100</span> • 
                  {{ analysis.appliedRules.length }} regra(s) violada(s)
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-white">
                  R$ {{ analysis.amount.toFixed(2) }}
                </div>
                <div class="text-[10px] text-slate-500">
                  {{ analysis.analyzedAt | date:'shortTime' }}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent {
  state = inject(SimulationStateService);
  workerService = inject(WorkerMonitorService);

  triggerWorkerSimulation(): void {
    this.workerService.runParallelStressSimulation(1000);
  }
}
