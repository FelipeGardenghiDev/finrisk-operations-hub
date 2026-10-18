import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { FraudRiskService } from './fraud-risk.service';
import { SimulationStateService } from './simulation-state.service';
import { FraudAnalysisRequest } from '../models/fraud-risk.model';

describe('FraudRiskService', () => {
  let service: FraudRiskService;
  let state: SimulationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FraudRiskService,
        SimulationStateService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(FraudRiskService);
    state = TestBed.inject(SimulationStateService);
    state.isDemoMode.set(true); // Test local deterministic pipeline
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should flag and block blacklist transactions in demo mode', async () => {
    const req: FraudAnalysisRequest = {
      transactionId: 'TX-TEST-001',
      cpf: '98765432100',
      amount: 150.0,
      paymentMethod: 'CREDIT_CARD',
      ipAddress: '192.168.1.50',
      deviceFingerprint: 'device-test',
      customerEmail: 'fraud@test.com'
    };

    const res = await firstValueFrom(service.analyzeTransaction(req));
    expect(res.decision).toBe('BLOCKED');
    expect(res.riskScore).toBeGreaterThanOrEqual(55);
    expect(res.appliedRules.some(r => r.ruleCode === 'BLACKLIST_CHECK')).toBe(true);
  });

  it('should trigger impossible travel critical rule when location is abroad', async () => {
    const req: FraudAnalysisRequest = {
      transactionId: 'TX-TEST-002',
      cpf: '12345678909',
      amount: 500.0,
      paymentMethod: 'PIX',
      ipAddress: '203.0.113.195',
      deviceFingerprint: 'device-test',
      customerEmail: 'user@test.com',
      location: 'Tokyo, Japan'
    };

    const res = await firstValueFrom(service.analyzeTransaction(req));
    expect(res.appliedRules.some(r => r.ruleCode === 'IMPOSSIBLE_TRAVEL')).toBe(true);
    expect(res.riskScore).toBeGreaterThanOrEqual(60);
  });

  it('should approve clean low-amount daytime transactions', async () => {
    const req: FraudAnalysisRequest = {
      transactionId: 'TX-TEST-003',
      cpf: '12345678909',
      amount: 85.0,
      paymentMethod: 'CREDIT_CARD',
      ipAddress: '177.100.50.2',
      deviceFingerprint: 'trusted-phone',
      customerEmail: 'good@customer.com'
    };

    const res = await firstValueFrom(service.analyzeTransaction(req));
    expect(res.decision).toBe('APPROVED');
    expect(res.riskScore).toBeLessThan(40);
  });
});

