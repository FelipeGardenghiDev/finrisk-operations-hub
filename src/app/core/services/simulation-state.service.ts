import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderStatus } from '../models/order.model';
import { FraudAnalysisResponse, RiskEngineStats } from '../models/fraud-risk.model';
import { WorkerActivityLog, WorkerStatus } from '../models/worker-event.model';

@Injectable({
  providedIn: 'root'
})
export class SimulationStateService {
  // Config Signals
  readonly isDemoMode = signal<boolean>(true);
  readonly dotnetApiUrl = signal<string>('http://localhost:5000');
  readonly javaApiUrl = signal<string>('http://localhost:8080');
  readonly apiKey = signal<string>('finrisk-dev-key-2026');

  // State Signals
  readonly orders = signal<Order[]>([]);
  readonly fraudAnalyses = signal<FraudAnalysisResponse[]>([]);
  readonly workerLogs = signal<WorkerActivityLog[]>([]);
  readonly workerStatuses = signal<WorkerStatus[]>([]);

  // Computed Metrics
  readonly totalOrdersCount = computed(() => this.orders().length);
  readonly totalRevenue = computed(() => 
    this.orders()
      .filter(o => o.status === 'Paid')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  );

  readonly riskStats = computed<RiskEngineStats>(() => {
    const list = this.fraudAnalyses();
    if (list.length === 0) {
      return {
        totalAnalyzed: 0,
        approvedCount: 0,
        suspiciousCount: 0,
        blockedCount: 0,
        totalProtectedCapital: 0,
        averageRiskScore: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const approved = list.filter(a => a.decision === 'APPROVED').length;
    const suspicious = list.filter(a => a.decision === 'SUSPICIOUS').length;
    const blocked = list.filter(a => a.decision === 'BLOCKED').length;
    const protectedCapital = list
      .filter(a => a.decision === 'BLOCKED')
      .reduce((sum, a) => sum + a.amount, 0);
    const avgScore = Math.round(list.reduce((sum, a) => sum + a.riskScore, 0) / list.length);

    return {
      totalAnalyzed: list.length,
      approvedCount: approved,
      suspiciousCount: suspicious,
      blockedCount: blocked,
      totalProtectedCapital: protectedCapital,
      averageRiskScore: avgScore,
      lastUpdated: new Date().toISOString()
    };
  });

  constructor() {
    this.initializeDefaultData();
    this.startSimulatedBackgroundWorkers();
  }

  toggleDemoMode(): void {
    this.isDemoMode.update(val => !val);
  }

  addWorkerLog(log: Omit<WorkerActivityLog, 'id' | 'timestamp'>): void {
    const newLog: WorkerActivityLog = {
      ...log,
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    this.workerLogs.update(prev => [newLog, ...prev.slice(0, 49)]); // keep 50 latest
  }

  addOrder(order: Order): void {
    this.orders.update(list => [order, ...list]);
    this.addWorkerLog({
      workerType: 'DOTNET_PAYMENT_WORKER',
      level: 'INFO',
      message: `Novo pedido #${order.id.slice(0, 8)} recebido e enfileirado no System.Threading.Channels (.NET 8)`,
      payloadSnippet: `R$ ${order.totalAmount.toFixed(2)} - ${order.customerName}`
    });

    // Simulate .NET BackgroundService payment processing worker
    if (this.isDemoMode()) {
      setTimeout(() => {
        this.updateOrderStatus(order.id, 'Processing');
        this.addWorkerLog({
          workerType: 'DOTNET_PAYMENT_WORKER',
          level: 'INFO',
          message: `PaymentProcessingWorker (.NET): Iniciando autorização gateway para #${order.id.slice(0, 8)}`,
          durationMs: 420
        });

        setTimeout(() => {
          const finalStatus: OrderStatus = order.riskScore && order.riskScore >= 80 ? 'Failed' : 'Paid';
          this.updateOrderStatus(order.id, finalStatus);
          this.addWorkerLog({
            workerType: 'DOTNET_PAYMENT_WORKER',
            level: finalStatus === 'Paid' ? 'SUCCESS' : 'ERROR',
            message: `PaymentProcessingWorker (.NET): Pedido #${order.id.slice(0, 8)} finalizado com estado '${finalStatus}'`,
            durationMs: 850
          });
        }, 2500);
      }, 1500);
    }
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    this.orders.update(list =>
      list.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    );
  }

  addFraudAnalysis(analysis: FraudAnalysisResponse): void {
    this.fraudAnalyses.update(list => [analysis, ...list]);

    const level = analysis.decision === 'BLOCKED' ? 'ERROR' : analysis.decision === 'SUSPICIOUS' ? 'WARN' : 'SUCCESS';
    this.addWorkerLog({
      workerType: 'JAVA_OUTBOX_POLLER',
      level,
      message: `OutboxPublisherJob (Java 21): Transação ${analysis.transactionId.slice(0, 8)} avaliada. Score: ${analysis.riskScore}/100 [${analysis.decision}]`,
      payloadSnippet: `CPF: ${analysis.cpf} | R$ ${analysis.amount.toFixed(2)}`
    });

    if (analysis.decision !== 'APPROVED') {
      this.addWorkerLog({
        workerType: 'JAVA_OUTBOX_POLLER',
        level: 'INFO',
        message: `Transactional Outbox: Evento de Alerta persistido na tabela outbox_events e enviado para fraud.exchange no RabbitMQ`,
        payloadSnippet: `Exchange: fraud.exchange | RoutingKey: fraud.alert.${analysis.decision.toLowerCase()}`
      });
    }
  }

  resolveSuspicious(analysisId: string, resolution: 'APPROVED' | 'BLOCKED'): void {
    this.fraudAnalyses.update(list =>
      list.map(a => {
        if (a.analysisId === analysisId) {
          return {
            ...a,
            reviewedManually: true,
            manualResolution: resolution,
            decision: resolution
          };
        }
        return a;
      })
    );

    this.addWorkerLog({
      workerType: 'JAVA_OUTBOX_POLLER',
      level: resolution === 'APPROVED' ? 'SUCCESS' : 'WARN',
      message: `Auditoria de Risco: Análise ${analysisId.slice(0, 8)} revisada manualmente como ${resolution}`
    });
  }

  private initializeDefaultData(): void {
    const initialOrders: Order[] = [
      {
        id: 'ord-8f92a101',
        customerName: 'Mariana Duarte Souza',
        customerEmail: 'mariana.souza@empresa.com.br',
        customerCpf: '342.981.042-88',
        totalAmount: 1450.00,
        status: 'Paid',
        paymentMethod: 'CREDIT_CARD',
        items: [
          { productName: 'Licença Enterprise FinRisk Cloud', quantity: 1, unitPrice: 1450.00, subTotal: 1450.00 }
        ],
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        riskScore: 12
      },
      {
        id: 'ord-3c48e99b',
        customerName: 'Lucas Rocha Almeida',
        customerEmail: 'lucas.almeida@gmail.com',
        customerCpf: '112.443.765-20',
        totalAmount: 8900.00,
        status: 'Processing',
        paymentMethod: 'PIX',
        items: [
          { productName: 'Módulo de Integração Pagamentos', quantity: 1, unitPrice: 8900.00, subTotal: 8900.00 }
        ],
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        riskScore: 58
      },
      {
        id: 'ord-91db404c',
        customerName: 'Renato Silveira Pinto',
        customerEmail: 'renato.silv@temp-mail.org',
        customerCpf: '987.654.321-00',
        totalAmount: 18200.00,
        status: 'Failed',
        paymentMethod: 'CREDIT_CARD',
        items: [
          { productName: 'Assinatura Infraestrutura Dedicada', quantity: 1, unitPrice: 18200.00, subTotal: 18200.00 }
        ],
        createdAt: new Date(Date.now() - 7200000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        riskScore: 94
      }
    ];

    const initialAnalyses: FraudAnalysisResponse[] = [
      {
        analysisId: 'fa-001',
        transactionId: 'tx-8f92a101',
        orderId: 'ord-8f92a101',
        cpf: '342.981.042-88',
        amount: 1450.00,
        riskScore: 12,
        decision: 'APPROVED',
        appliedRules: [],
        idempotencyHit: false,
        analyzedAt: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        analysisId: 'fa-002',
        transactionId: 'tx-3c48e99b',
        orderId: 'ord-3c48e99b',
        cpf: '112.443.765-20',
        amount: 8900.00,
        riskScore: 58,
        decision: 'SUSPICIOUS',
        appliedRules: [
          {
            ruleCode: 'HIGH_AMOUNT',
            name: 'Transação Acima de Limite Operacional',
            points: 35,
            description: 'Valor transacionado (R$ 8.900) excede o patamar diário sem histórico prévio',
            severity: 'MEDIUM'
          },
          {
            ruleCode: 'NIGHT_WINDOW',
            name: 'Janela Noturna de Risco (22h-06h)',
            points: 23,
            description: 'Transação PIX iniciada fora do horário comercial bancário',
            severity: 'LOW'
          }
        ],
        idempotencyHit: false,
        analyzedAt: new Date(Date.now() - 3600000 * 1).toISOString()
      },
      {
        analysisId: 'fa-003',
        transactionId: 'tx-91db404c',
        orderId: 'ord-91db404c',
        cpf: '987.654.321-00',
        amount: 18200.00,
        riskScore: 94,
        decision: 'BLOCKED',
        appliedRules: [
          {
            ruleCode: 'BLACKLIST_CHECK',
            name: 'CPF na Lista Restritiva Antifraude',
            points: 50,
            description: 'CPF identificado em ocorrências anteriores de contestação/chargeback',
            severity: 'CRITICAL'
          },
          {
            ruleCode: 'VELOCITY_BURST',
            name: 'Velocity Burst via Redis Sliding Window',
            points: 44,
            description: '5 tentativas consecutivas de pagamento registradas nos últimos 90 segundos',
            severity: 'HIGH'
          }
        ],
        idempotencyHit: false,
        analyzedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    const initialWorkers: WorkerStatus[] = [
      {
        id: 'DOTNET_PAYMENT_WORKER',
        name: 'PaymentProcessingWorker',
        technology: '.NET 8 / C# 12',
        sourceRepo: 'order-processing-api',
        pattern: 'System.Threading.Channels + BackgroundService',
        state: 'ACTIVE',
        processedCount: 1420,
        lastExecutionTime: 'Há 4 segundos',
        averageLatencyMs: 38,
        pendingQueueDepth: 2,
        description: 'Consome a fila assíncrona desacoplada de pedidos e executa autorização de pagamento em lote.'
      },
      {
        id: 'JAVA_OUTBOX_POLLER',
        name: 'OutboxPublisherJob',
        technology: 'Java 21 / Spring Boot 3',
        sourceRepo: 'fraud-detection-api',
        pattern: 'Transactional Outbox + RabbitMQ Poller',
        state: 'ACTIVE',
        processedCount: 894,
        lastExecutionTime: 'Há 12 segundos',
        averageLatencyMs: 14,
        pendingQueueDepth: 0,
        description: 'Garante entrega at-least-once de alertas de fraude publicando eventos atômicos para o broker.'
      },
      {
        id: 'ANGULAR_WEB_WORKER',
        name: 'RiskSimulationWorker',
        technology: 'Angular 19 / Web Worker API',
        sourceRepo: 'finrisk-operations-hub',
        pattern: 'Dedicated Worker Thread (Off-Main-Thread)',
        state: 'IDLE',
        processedCount: 18,
        lastExecutionTime: 'Pronto para simulação',
        averageLatencyMs: 8,
        pendingQueueDepth: 0,
        description: 'Executa cálculos matemáticos de projeção estatística e Monte Carlo em thread paralela a 60fps.'
      }
    ];

    this.orders.set(initialOrders);
    this.fraudAnalyses.set(initialAnalyses);
    this.workerStatuses.set(initialWorkers);

    this.addWorkerLog({
      workerType: 'DOTNET_PAYMENT_WORKER',
      level: 'INFO',
      message: 'Worker .NET 8 conectado com sucesso via BackgroundService'
    });
    this.addWorkerLog({
      workerType: 'JAVA_OUTBOX_POLLER',
      level: 'INFO',
      message: 'OutboxPublisherJob Java 21 inicializado e escutando tabela outbox_events'
    });
    this.addWorkerLog({
      workerType: 'ANGULAR_WEB_WORKER',
      level: 'INFO',
      message: 'Angular Web Worker compilado e alocado na thread secundária'
    });
  }

  private startSimulatedBackgroundWorkers(): void {
    // Pulse worker activities every 30s to simulate live background heartbeat
    setInterval(() => {
      this.workerStatuses.update(list =>
        list.map(w => ({
          ...w,
          processedCount: w.processedCount + (w.state === 'ACTIVE' ? Math.floor(Math.random() * 3) : 0),
          lastExecutionTime: 'Agora mesmo'
        }))
      );
    }, 20000);
  }
}
