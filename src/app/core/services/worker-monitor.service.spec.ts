import { TestBed } from '@angular/core/testing';
import { WorkerMonitorService } from './worker-monitor.service';
import { SimulationStateService } from './simulation-state.service';

describe('WorkerMonitorService', () => {
  let service: WorkerMonitorService;
  let state: SimulationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkerMonitorService,
        SimulationStateService
      ]
    });

    service = TestBed.inject(WorkerMonitorService);
    state = TestBed.inject(SimulationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial worker statuses from state', () => {
    const statuses = service.getWorkerStatuses();
    expect(statuses.length).toBe(3);
    const ids = statuses.map(s => s.id);
    expect(ids).toContain('DOTNET_PAYMENT_WORKER');
    expect(ids).toContain('JAVA_OUTBOX_POLLER');
    expect(ids).toContain('ANGULAR_WEB_WORKER');
  });

  it('should return activity logs from state', () => {
    const logs = service.getActivityLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].id).toBeDefined();
    expect(logs[0].message).toBeDefined();
  });

  it('should have isWorkerProcessing initially set to false', () => {
    expect(service.isWorkerProcessing()).toBe(false);
  });

  it('should gracefully handle stress simulation invocation', () => {
    // Calling runParallelStressSimulation should not throw even if Web Worker is mocked or inactive in JSDOM
    expect(() => {
      service.runParallelStressSimulation(500);
    }).not.toThrow();
  });
});
