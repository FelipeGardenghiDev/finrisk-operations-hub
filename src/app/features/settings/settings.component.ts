import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimulationStateService } from '../../core/services/simulation-state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-4xl pb-20 lg:pb-6">
      
      <!-- Title -->
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
          Configuração de APIs & Infraestrutura
        </h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Gerencie os endereços dos microsserviços, chaves de autenticação inter-serviços e modos de fallback.
        </p>
      </div>

      <!-- Environment Mode Card -->
      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">
              Modo de Operação
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Defina se a aplicação deve chamar as portas locais ou rodar em modo de demonstração auto-contido.
            </p>
          </div>

          <button
            (click)="state.toggleDemoMode()"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
            [ngClass]="state.isDemoMode() 
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-950/80 border-amber-500/40 text-amber-300'">
            {{ state.isDemoMode() ? 'Ativo: Modo Demo Cloud' : 'Ativo: Localhost APIs' }}
          </button>
        </div>

        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
          <p>
            💡 <strong class="text-slate-200">Por que existe o Modo Demo?</strong> Em deploys públicos (como na <strong>Vercel</strong>), o usuário que acessa não tem o .NET SDK nem o Java runtime instalados no computador dele. O Modo Demo garante que 100% das telas, formulários, cálculos de risco e workers funcionem interativamente sem erros de conexão.
          </p>
        </div>
      </div>

      <!-- Endpoints Form -->
      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">
          Endereços dos Microsserviços
        </h3>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">
              API de Pedidos (.NET 8 Clean Architecture)
            </label>
            <input
              type="text"
              [ngModel]="state.dotnetApiUrl()"
              (ngModelChange)="state.dotnetApiUrl.set($event)"
              placeholder="http://localhost:5000"
              class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:border-indigo-500 focus:outline-none"/>
            <span class="text-[11px] text-slate-500 mt-0.5 block">Endpoint padrão para Swagger e REST em C#</span>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">
              API de Antifraude (Java 21 Spring Boot 3)
            </label>
            <input
              type="text"
              [ngModel]="state.javaApiUrl()"
              (ngModelChange)="state.javaApiUrl.set($event)"
              placeholder="http://localhost:8080"
              class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:border-indigo-500 focus:outline-none"/>
            <span class="text-[11px] text-slate-500 mt-0.5 block">Endpoint padrão do Spring Boot REST Controller</span>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">
              Chave de Segurança Inter-Serviços (X-API-KEY)
            </label>
            <input
              type="text"
              [ngModel]="state.apiKey()"
              (ngModelChange)="state.apiKey.set($event)"
              class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:border-indigo-500 focus:outline-none"/>
            <span class="text-[11px] text-slate-500 mt-0.5 block">Cabeçalho exigido pelo Spring Security na API Java</span>
          </div>
        </div>
      </div>

      <!-- Links to Backend Repos -->
      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">
          Repositórios do Ecossistema no GitHub
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <a
            href="https://github.com/FelipeGardenghiDev/order-processing-api"
            target="_blank"
            rel="noopener noreferrer"
            class="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between">
            <div>
              <div class="font-bold text-white">📦 order-processing-api</div>
              <p class="text-[11px] text-slate-400 mt-0.5">.NET 8, EF Core, Dapper, Channels</p>
            </div>
            <span class="text-slate-500 text-lg">↗</span>
          </a>

          <a
            href="https://github.com/FelipeGardenghiDev/fraud-detection-api"
            target="_blank"
            rel="noopener noreferrer"
            class="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition-all flex items-center justify-between">
            <div>
              <div class="font-bold text-white">🛡️ fraud-detection-api</div>
              <p class="text-[11px] text-slate-400 mt-0.5">Java 21, Spring Boot, RabbitMQ, Outbox</p>
            </div>
            <span class="text-slate-500 text-lg">↗</span>
          </a>
        </div>
      </div>

    </div>
  `
})
export class SettingsComponent {
  state = inject(SimulationStateService);
}
