import { TestBed } from '@angular/core/testing';
import { SimulationStateService } from './simulation-state.service';
import { Order } from '../models/order.model';
import { FraudAnalysisResponse } from '../models/fraud-risk.model';

describe('SimulationStateService', () => {
  let service: SimulationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimulationStateService]
    });
    service = TestBed.inject(SimulationStateService);
  });

  it('should initialize default state signals', () => {
    expect(service.isDemoMode()).toBe(true);
    expect(service.orders().length).toBeGreaterThan(0);
    expect(service.fraudAnalyses().length).toBeGreaterThan(0);
    expect(service.workerStatuses().length).toBe(3);
    expect(service.workerLogs().length).toBeGreaterThan(0);
  });

  it('should toggle demo mode correctly', () => {
    expect(service.isDemoMode()).toBe(true);
    service.toggleDemoMode();
    expect(service.isDemoMode()).toBe(false);
    service.toggleDemoMode();
    expect(service.isDemoMode()).toBe(true);
  });

  it('should compute total orders and revenue correctly', () => {
    const ordersCount = service.totalOrdersCount();
    expect(ordersCount).toBe(service.orders().length);

    const paidOrders = service.orders().filter(o => o.status === 'Paid');
    const expectedRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    expect(service.totalRevenue()).toBe(expectedRevenue);
  });

  it('should correctly compute risk stats based on fraud analyses', () => {
    const stats = service.riskStats();
    expect(stats.totalAnalyzed).toBe(service.fraudAnalyses().length);
    expect(stats.approvedCount + stats.suspiciousCount + stats.blockedCount).toBe(stats.totalAnalyzed);
    expect(stats.totalProtectedCapital).toBeGreaterThanOrEqual(0);
  });

  it('should add a new order and log worker event', () => {
    const initialLogsCount = service.workerLogs().length;
    const testOrder: Order = {
      id: 'ord-test-101',
      customerName: 'Cliente Teste Unitário',
      customerEmail: 'unit@test.com',
      customerCpf: '11122233344',
      totalAmount: 3200.0,
      status: 'Pending',
      paymentMethod: 'PIX',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    service.addOrder(testOrder);
    expect(service.orders()[0].id).toBe('ord-test-101');
    expect(service.workerLogs().length).toBeGreaterThan(initialLogsCount);
    expect(service.workerLogs()[0].workerType).toBe('DOTNET_PAYMENT_WORKER');
  });

  it('should update order status', () => {
    const orderId = service.orders()[0].id;
    service.updateOrderStatus(orderId, 'Paid');

    const updated = service.orders().find(o => o.id === orderId);
    expect(updated?.status).toBe('Paid');
  });

  it('should add fraud analysis and record outbox event log', () => {
    const initialAnalysesCount = service.fraudAnalyses().length;
    const newAnalysis: FraudAnalysisResponse = {
      analysisId: 'fa-test-999',
      transactionId: 'tx-test-999',
      cpf: '55566677788',
      amount: 4500.0,
      riskScore: 85,
      decision: 'BLOCKED',
      appliedRules: [],
      idempotencyHit: false,
      analyzedAt: new Date().toISOString()
    };

    service.addFraudAnalysis(newAnalysis);
    expect(service.fraudAnalyses().length).toBe(initialAnalysesCount + 1);
    expect(service.fraudAnalyses()[0].analysisId).toBe('fa-test-999');
    expect(service.workerLogs()[0].workerType).toBe('JAVA_OUTBOX_POLLER');
  });

  it('should manually resolve a suspicious transaction', () => {
    const suspiciousAnalysis = service.fraudAnalyses().find(a => a.decision === 'SUSPICIOUS');
    expect(suspiciousAnalysis).toBeDefined();

    if (suspiciousAnalysis) {
      service.resolveSuspicious(suspiciousAnalysis.analysisId, 'APPROVED');
      const resolved = service.fraudAnalyses().find(a => a.analysisId === suspiciousAnalysis.analysisId);
      expect(resolved?.decision).toBe('APPROVED');
      expect(resolved?.reviewedManually).toBe(true);
      expect(resolved?.manualResolution).toBe('APPROVED');
    }
  });
});
