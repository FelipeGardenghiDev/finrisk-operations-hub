import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { OrderService } from './order.service';
import { SimulationStateService } from './simulation-state.service';
import { CreateOrderDto } from '../models/order.model';

describe('OrderService', () => {
  let service: OrderService;
  let state: SimulationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        SimulationStateService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(OrderService);
    state = TestBed.inject(SimulationStateService);
    state.isDemoMode.set(true);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial orders in demo mode', async () => {
    const orders = await firstValueFrom(service.getOrders());
    expect(orders.length).toBeGreaterThanOrEqual(3);
    expect(orders[0].id).toBeDefined();
    expect(orders[0].totalAmount).toBeGreaterThan(0);
  });

  it('should create an order with calculated subtotals and add to state', async () => {
    const dto: CreateOrderDto = {
      customerName: 'Carlos Eduardo Teste',
      customerEmail: 'carlos.teste@finrisk.com',
      customerCpf: '12345678909',
      paymentMethod: 'CREDIT_CARD',
      items: [
        { productName: 'Terminal POS Inteligente', quantity: 2, unitPrice: 450.0 },
        { productName: 'Licença Anual Software', quantity: 1, unitPrice: 1200.0 }
      ]
    };

    const initialCount = state.orders().length;
    const created = await firstValueFrom(service.createOrder(dto));

    expect(created.id).toContain('ord-');
    expect(created.customerName).toBe('Carlos Eduardo Teste');
    expect(created.totalAmount).toBe(2100.0);
    expect(created.items.length).toBe(2);
    expect(created.items[0].subTotal).toBe(900.0);
    expect(created.items[1].subTotal).toBe(1200.0);
    expect(state.orders().length).toBe(initialCount + 1);
  });

  it('should retrieve existing order by id', async () => {
    const orders = state.orders();
    const target = orders[0];

    const found = await firstValueFrom(service.getOrderById(target.id));
    expect(found).toBeDefined();
    expect(found?.id).toBe(target.id);
    expect(found?.customerName).toBe(target.customerName);
  });

  it('should return undefined for non-existent order id', async () => {
    const found = await firstValueFrom(service.getOrderById('non-existent-id-999'));
    expect(found).toBeUndefined();
  });
});
