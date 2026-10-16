import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { FraudRiskService } from '../../core/services/fraud-risk.service';
import { SimulationStateService } from '../../core/services/simulation-state.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 pb-20 lg:pb-6">
      
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gestão de Pedidos & Checkout B2B
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              .NET 8 Clean Architecture
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Persistência transacional com EF Core, queries ultrarrápidas via Dapper e filas assíncronas em memória.
          </p>
        </div>

        <button
          (click)="showCreateModal = true"
          class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
          <span>+ Criar Novo Pedido</span>
        </button>
      </div>

      <!-- Orders Stats Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span class="text-[11px] text-slate-400 uppercase font-medium">Total Pedidos</span>
          <p class="text-lg font-bold text-white mt-1">{{ state.orders().length }}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span class="text-[11px] text-emerald-400 uppercase font-medium">Pagos</span>
          <p class="text-lg font-bold text-white mt-1">{{ countByStatus('Paid') }}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span class="text-[11px] text-amber-400 uppercase font-medium">Em Fila / Processando</span>
          <p class="text-lg font-bold text-white mt-1">{{ countByStatus('Processing') + countByStatus('Pending') }}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span class="text-[11px] text-rose-400 uppercase font-medium">Recusados / Falha</span>
          <p class="text-lg font-bold text-white mt-1">{{ countByStatus('Failed') }}</p>
        </div>
      </div>

      <!-- Orders List / Table Container -->
      <div class="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Histórico Transacional de Pedidos
          </div>
          <span class="text-xs text-slate-500">
            Atualizado em tempo real via Signals
          </span>
        </div>

        <!-- Desktop Table View (Hidden on Mobile) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th class="p-3.5">ID / Data</th>
                <th class="p-3.5">Cliente</th>
                <th class="p-3.5">CPF</th>
                <th class="p-3.5">Itens / Resumo</th>
                <th class="p-3.5">Pagamento</th>
                <th class="p-3.5">Valor Total</th>
                <th class="p-3.5">Status (.NET)</th>
                <th class="p-3.5 text-right">Ação Antifraude</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr *ngFor="let order of state.orders()" class="hover:bg-slate-800/30 transition-colors">
                <td class="p-3.5 font-mono text-slate-300">
                  <div class="font-bold">#{{ order.id.slice(0, 10) }}</div>
                  <div class="text-[10px] text-slate-500">{{ order.createdAt | date:'short' }}</div>
                </td>
                <td class="p-3.5">
                  <div class="font-semibold text-white">{{ order.customerName }}</div>
                  <div class="text-[11px] text-slate-400">{{ order.customerEmail }}</div>
                </td>
                <td class="p-3.5 font-mono text-slate-300">
                  {{ order.customerCpf }}
                </td>
                <td class="p-3.5 text-slate-300">
                  <span *ngIf="order.items.length > 0">{{ order.items[0].productName }}</span>
                  <span *ngIf="order.items.length > 1" class="text-[10px] text-indigo-400 ml-1">
                    (+{{ order.items.length - 1 }} itens)
                  </span>
                </td>
                <td class="p-3.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {{ order.paymentMethod }}
                  </span>
                </td>
                <td class="p-3.5 font-bold text-white">
                  R$ {{ order.totalAmount.toFixed(2) }}
                </td>
                <td class="p-3.5">
                  <span
                    class="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30': order.status === 'Paid',
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30': order.status === 'Processing',
                      'bg-slate-500/10 text-slate-400 border border-slate-500/30': order.status === 'Pending',
                      'bg-rose-500/10 text-rose-400 border border-rose-500/30': order.status === 'Failed'
                    }">
                    {{ order.status }}
                  </span>
                </td>
                <td class="p-3.5 text-right">
                  <button
                    (click)="inspectWithJavaRisk(order)"
                    class="px-2.5 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium transition-all">
                    Avaliar com Java 🛡️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View (Visible only on Mobile) -->
        <div class="md:hidden divide-y divide-slate-800/60 p-2">
          <div *ngFor="let order of state.orders()" class="p-3.5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono text-slate-400">#{{ order.id.slice(0, 10) }}</span>
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

            <div>
              <div class="text-sm font-bold text-white">{{ order.customerName }}</div>
              <div class="text-xs text-slate-400">CPF: {{ order.customerCpf }}</div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
              <span class="text-slate-400">{{ order.paymentMethod }}</span>
              <span class="font-bold text-white text-sm">R$ {{ order.totalAmount.toFixed(2) }}</span>
            </div>

            <button
              (click)="inspectWithJavaRisk(order)"
              class="w-full py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold text-center mt-1">
              Avaliar Risco com Java Spring 🛡️
            </button>
          </div>
        </div>

      </div>

      <!-- Modal: Criar Novo Pedido com Reactive Forms -->
      <div *ngIf="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 class="text-lg font-bold text-white">Criar Novo Pedido B2B</h3>
              <p class="text-xs text-slate-400">Despacha comando para OrderProcessing.Application (.NET 8)</p>
            </div>
            <button (click)="showCreateModal = false" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <form [formGroup]="orderForm" (ngSubmit)="submitOrder()" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente</label>
              <input
                type="text"
                formControlName="customerName"
                placeholder="Ex: Carlos Eduardo Silveira"
                class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"/>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  formControlName="customerEmail"
                  placeholder="carlos@empresa.com"
                  class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">CPF (Módulo 11)</label>
                <input
                  type="text"
                  formControlName="customerCpf"
                  placeholder="123.456.789-00"
                  class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"/>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Método de Pagamento</label>
              <select
                formControlName="paymentMethod"
                class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none">
                <option value="CREDIT_CARD">Cartão de Crédito</option>
                <option value="PIX">PIX Instantâneo</option>
                <option value="DEBIT_CARD">Cartão de Débito</option>
                <option value="BOLETO">Boleto Bancário</option>
              </select>
            </div>

            <!-- Dynamic Items Array -->
            <div class="space-y-2 pt-2 border-t border-slate-800">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-300">Itens do Pedido</span>
                <button
                  type="button"
                  (click)="addItem()"
                  class="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold">
                  + Adicionar Item
                </button>
              </div>

              <div formArrayName="items" class="space-y-2">
                <div *ngFor="let item of items.controls; let i = index" [formGroupName]="i" class="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <input
                    type="text"
                    formControlName="productName"
                    placeholder="Descrição do Produto"
                    class="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"/>
                  <input
                    type="number"
                    formControlName="quantity"
                    min="1"
                    class="w-14 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs text-center"/>
                  <input
                    type="number"
                    formControlName="unitPrice"
                    min="1"
                    class="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs text-right"/>
                  <button
                    type="button"
                    *ngIf="items.length > 1"
                    (click)="removeItem(i)"
                    class="text-rose-400 hover:text-rose-300 text-xs px-1">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- Total Preview -->
            <div class="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between text-xs font-bold text-white">
              <span>Valor Total Calculado:</span>
              <span class="text-sm text-indigo-300">R$ {{ calculatedTotal().toFixed(2) }}</span>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="showCreateModal = false"
                class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="orderForm.invalid"
                class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold">
                Confirmar & Processar Pedido (.NET)
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  `
})
export class OrdersComponent implements OnInit {
  state = inject(SimulationStateService);
  orderService = inject(OrderService);
  riskService = inject(FraudRiskService);
  fb = inject(FormBuilder);

  showCreateModal = false;
  orderForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      customerName: ['Henrique Bastos', [Validators.required]],
      customerEmail: ['henrique.bastos@tech.com.br', [Validators.required, Validators.email]],
      customerCpf: ['223.554.887-12', [Validators.required]],
      paymentMethod: ['CREDIT_CARD', [Validators.required]],
      items: this.fb.array([
        this.createItemFormGroup('Serviço Cloud Gateway Pro', 1, 3490.00)
      ])
    });
  }

  createItemFormGroup(name: string = '', qty: number = 1, price: number = 100): FormGroup {
    return this.fb.group({
      productName: [name, [Validators.required]],
      quantity: [qty, [Validators.required, Validators.min(1)]],
      unitPrice: [price, [Validators.required, Validators.min(0.01)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup('Item Adicional', 1, 500));
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  calculatedTotal(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const q = ctrl.get('quantity')?.value || 0;
      const p = ctrl.get('unitPrice')?.value || 0;
      return sum + (q * p);
    }, 0);
  }

  countByStatus(status: string): number {
    return this.state.orders().filter(o => o.status === status).length;
  }

  submitOrder(): void {
    if (this.orderForm.invalid) return;

    this.orderService.createOrder(this.orderForm.value).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.initForm();
      }
    });
  }

  inspectWithJavaRisk(order: Order): void {
    this.riskService.analyzeTransaction({
      transactionId: 'tx-' + order.id,
      orderId: order.id,
      cpf: order.customerCpf,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      ipAddress: '187.64.12.98',
      deviceFingerprint: 'dev-fp-' + Math.random().toString(36).substring(2, 8),
      customerEmail: order.customerEmail
    }).subscribe(res => {
      alert(`🛡️ Análise Java Concluída!\nScore: ${res.riskScore}/100\nDecisão: ${res.decision}\nRegras Violadas: ${res.appliedRules.length}`);
    });
  }
}
