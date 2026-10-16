import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateOrderDto, Order } from '../models/order.model';
import { SimulationStateService } from './simulation-state.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private state = inject(SimulationStateService);

  getOrders(): Observable<Order[]> {
    if (this.state.isDemoMode()) {
      return of(this.state.orders());
    }

    const url = `${this.state.dotnetApiUrl()}/api/orders`;
    return this.http.get<Order[]>(url).pipe(
      catchError(err => {
        console.warn('Falha na API .NET 8 local. Alternando temporariamente para estado em memória.', err);
        return of(this.state.orders());
      })
    );
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    const total = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newOrder: Order = {
      id: 'ord-' + Math.random().toString(36).substring(2, 10),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerCpf: dto.customerCpf,
      totalAmount: total,
      status: 'Pending',
      paymentMethod: dto.paymentMethod,
      items: dto.items.map(item => ({
        ...item,
        id: 'item-' + Math.random().toString(36).substring(2, 8),
        subTotal: item.quantity * item.unitPrice
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.state.isDemoMode()) {
      this.state.addOrder(newOrder);
      return of(newOrder);
    }

    const url = `${this.state.dotnetApiUrl()}/api/orders`;
    return this.http.post<Order>(url, dto).pipe(
      map(res => {
        this.state.addOrder(res);
        return res;
      }),
      catchError(err => {
        console.warn('Erro ao chamar .NET API real. Usando fallback de simulação.', err);
        this.state.addOrder(newOrder);
        return of(newOrder);
      })
    );
  }

  getOrderById(id: string): Observable<Order | undefined> {
    const local = this.state.orders().find(o => o.id === id);
    if (this.state.isDemoMode() || local) {
      return of(local);
    }

    const url = `${this.state.dotnetApiUrl()}/api/orders/${id}`;
    return this.http.get<Order>(url).pipe(
      catchError(() => of(undefined))
    );
  }
}
