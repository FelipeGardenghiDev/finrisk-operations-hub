import { Injectable, inject, signal } from '@angular/core';
import { SimulationStateService } from './simulation-state.service';
import { WorkerActivityLog, WorkerBatchSimulationPayload, WorkerBatchSimulationResult, WorkerStatus } from '../models/worker-event.model';

@Injectable({
  providedIn: 'root'
})
export class WorkerMonitorService {
  private state = inject(SimulationStateService);

  private webWorker: Worker | null = null;
  readonly isWorkerProcessing = signal<boolean>(false);
  readonly latestSimulationResult = signal<WorkerBatchSimulationResult | null>(null);

  constructor() {
    this.initWebWorker();
  }

  getWorkerStatuses(): WorkerStatus[] {
    return this.state.workerStatuses();
  }

  getActivityLogs(): WorkerActivityLog[] {
    return this.state.workerLogs();
  }

  private initWebWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        this.webWorker = new Worker(
          new URL('../../workers/risk-calculator.worker', import.meta.url),
          { type: 'module' }
        );

        this.webWorker.onmessage = ({ data }) => {
          if (data?.type === 'SIMULATION_COMPLETE') {
            const result: WorkerBatchSimulationResult = data.result;
            this.isWorkerProcessing.set(false);
            this.latestSimulationResult.set(result);

            this.state.addWorkerLog({
              workerType: 'ANGULAR_WEB_WORKER',
              level: 'SUCCESS',
              message: `Web Worker: Simulação Monte Carlo finalizada (${result.totalSimulated} cenários em ${result.durationMs}ms)`,
              payloadSnippet: `Bloqueios: ${result.blockedCount} | Suspeitas: ${result.suspiciousCount} | Cap. Protegido: R$ ${result.estimatedProtectedCapital.toLocaleString('pt-BR')}`,
              durationMs: result.durationMs
            });

            // Update angular worker status
            this.state.workerStatuses.update(list =>
              list.map(w => w.id === 'ANGULAR_WEB_WORKER' ? {
                ...w,
                state: 'IDLE',
                processedCount: w.processedCount + result.totalSimulated,
                lastExecutionTime: 'Agora mesmo',
                averageLatencyMs: result.durationMs
              } : w)
            );
          }
        };

        this.webWorker.onerror = (err) => {
          console.error('Erro no Angular Web Worker:', err);
          this.isWorkerProcessing.set(false);
        };
      } catch (err) {
        console.warn('Web Worker não pôde ser instanciado:', err);
      }
    }
  }

  runParallelStressSimulation(sampleSize: number = 1000): void {
    if (!this.webWorker) {
      console.warn('Web Worker não disponível.');
      return;
    }

    this.isWorkerProcessing.set(true);

    this.state.workerStatuses.update(list =>
      list.map(w => w.id === 'ANGULAR_WEB_WORKER' ? { ...w, state: 'PROCESSING' } : w)
    );

    this.state.addWorkerLog({
      workerType: 'ANGULAR_WEB_WORKER',
      level: 'INFO',
      message: `Web Worker: Despachando lote de ${sampleSize.toLocaleString('pt-BR')} transações sintéticas para thread secundária...`
    });

    const payload: WorkerBatchSimulationPayload = {
      sampleSize,
      baseAmount: 1850,
      fraudRatePercent: 8.5,
      enableNightWindowSim: true,
      enableBurstSim: true
    };

    this.webWorker.postMessage({
      type: 'RUN_STRESS_SIMULATION',
      payload
    });
  }
}
