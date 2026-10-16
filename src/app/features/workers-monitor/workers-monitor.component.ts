import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerMonitorService } from '../../core/services/worker-monitor.service';
import { SimulationStateService } from '../../core/services/simulation-state.service';

@Component({
  selector: 'app-workers-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-20 lg:pb-6">
      
      <!-- Title & Seniority Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
              Central de Workers & Filas Distribuídas
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Observabilidade Multi-Plataforma
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Monitoramento de serviços em segundo plano: background services em C#, scheduled jobs em Java e multi-threading no navegador com Web Workers.
          </p>
        </div>
      </div>

      <!-- 3 Workers Architecture Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let worker of workerService.getWorkerStatuses()"
          class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
          
          <div>
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {{ worker.technology }}
                </span>
                <h3 class="text-base font-bold text-white mt-0.5">
                  {{ worker.name }}
                </h3>
              </div>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                [ngClass]="{
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30': worker.state === 'ACTIVE',
                  'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse': worker.state === 'PROCESSING',
                  'bg-slate-500/10 text-slate-400 border border-slate-500/30': worker.state === 'IDLE'
                }">
                {{ worker.state }}
              </span>
            </div>

            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              {{ worker.description }}
            </p>
          </div>

          <div class="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
            <div class="flex items-center justify-between text-slate-400">
              <span>Padrão de Arquitetura:</span>
              <span class="font-mono text-slate-200 text-[11px]">{{ worker.pattern }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-400">
              <span>Repositório Origem:</span>
              <span class="font-mono text-indigo-400 text-[11px]">{{ worker.sourceRepo }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-400">
              <span>Total Processado:</span>
              <span class="font-bold text-white">{{ worker.processedCount.toLocaleString('pt-BR') }} eventos</span>
            </div>
            <div class="flex items-center justify-between text-slate-400">
              <span>Latência Média:</span>
              <span class="font-bold text-emerald-400">{{ worker.averageLatencyMs }} ms</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Angular Web Worker Stress Test Arena -->
      <div class="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-5 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span>⚡</span> Teste de Carga em Thread Secundária (Angular Web Worker)
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Processamento paralelo via Web Worker API: executa milhares de simulações Monte Carlo sem travar a renderização a 60 FPS da UI.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="runStressTest(1000)"
              [disabled]="workerService.isWorkerProcessing()"
              class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30">
              1.000 Transações
            </button>
            <button
              (click)="runStressTest(5000)"
              [disabled]="workerService.isWorkerProcessing()"
              class="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-600/30">
              5.000 Transações
            </button>
            <button
              (click)="runStressTest(15000)"
              [disabled]="workerService.isWorkerProcessing()"
              class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30">
              15.000 Transações
            </button>
          </div>
        </div>

        <!-- Latest Simulation Result Display -->
        <div *ngIf="workerService.latestSimulationResult() as res" class="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div class="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Tempo de CPU</span>
            <p class="text-base font-bold text-emerald-400 mt-0.5">{{ res.durationMs }} ms</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Total Avaliado</span>
            <p class="text-base font-bold text-white mt-0.5">{{ res.totalSimulated.toLocaleString('pt-BR') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Fraudes Bloqueadas</span>
            <p class="text-base font-bold text-rose-400 mt-0.5">{{ res.blockedCount }}</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Casos Suspeitos</span>
            <p class="text-base font-bold text-amber-400 mt-0.5">{{ res.suspiciousCount }}</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Capital Protegido</span>
            <p class="text-base font-bold text-indigo-400 mt-0.5">R$ {{ res.estimatedProtectedCapital.toLocaleString('pt-BR') }}</p>
          </div>
        </div>
      </div>

      <!-- Live Worker Activity Console -->
      <div class="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">
              Console de Eventos & Logs de Background
            </h3>
          </div>
          <span class="text-xs text-slate-500 font-mono">
            Últimos 50 eventos capturados
          </span>
        </div>

        <div class="p-4 space-y-2 max-h-96 overflow-y-auto font-mono text-xs divide-y divide-slate-800/40">
          <div *ngFor="let log of state.workerLogs()" class="pt-2 first:pt-0 flex items-start gap-3">
            <span class="text-slate-500 text-[11px] shrink-0">
              {{ log.timestamp | date:'HH:mm:ss.SSS' }}
            </span>
            <span
              class="text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0"
              [ngClass]="{
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': log.level === 'SUCCESS',
                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20': log.level === 'INFO',
                'bg-amber-500/10 text-amber-400 border border-amber-500/20': log.level === 'WARN',
                'bg-rose-500/10 text-rose-400 border border-rose-500/20': log.level === 'ERROR'
              }">
              {{ log.level }}
            </span>
            <div class="flex-1">
              <span class="text-slate-200">{{ log.message }}</span>
              <div *ngIf="log.payloadSnippet" class="text-[11px] text-slate-400 mt-0.5">
                {{ log.payloadSnippet }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class WorkersMonitorComponent {
  workerService = inject(WorkerMonitorService);
  state = inject(SimulationStateService);

  runStressTest(samples: number): void {
    this.workerService.runParallelStressSimulation(samples);
  }
}
