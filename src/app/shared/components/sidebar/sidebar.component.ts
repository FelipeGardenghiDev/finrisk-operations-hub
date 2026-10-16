import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-900/40 p-4 shrink-0">
      
      <!-- Navigation Links -->
      <nav class="space-y-1.5 flex-1">
        <a
          routerLink="/"
          routerLinkActive="bg-indigo-600/15 text-indigo-300 border-indigo-500/50"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all border border-transparent">
          <span class="text-lg">📊</span>
          <span>Visão Geral (Cockpit)</span>
        </a>

        <a
          routerLink="/orders"
          routerLinkActive="bg-indigo-600/15 text-indigo-300 border-indigo-500/50"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all border border-transparent">
          <span class="text-lg">📦</span>
          <span>Gestão de Pedidos (.NET)</span>
        </a>

        <a
          routerLink="/risk"
          routerLinkActive="bg-indigo-600/15 text-indigo-300 border-indigo-500/50"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all border border-transparent">
          <span class="text-lg">🛡️</span>
          <span>Motor de Risco (Java)</span>
        </a>

        <a
          routerLink="/workers"
          routerLinkActive="bg-indigo-600/15 text-indigo-300 border-indigo-500/50"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all border border-transparent">
          <span class="text-lg">⚙️</span>
          <span>Workers & Filas</span>
        </a>

        <a
          routerLink="/settings"
          routerLinkActive="bg-indigo-600/15 text-indigo-300 border-indigo-500/50"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all border border-transparent">
          <span class="text-lg">🔧</span>
          <span>Configuração de APIs</span>
        </a>
      </nav>

      <!-- Architecture Card Footer -->
      <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 mt-auto">
        <div class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Microsserviços</span>
          <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <div class="text-xs space-y-1 text-slate-400">
          <div class="flex items-center justify-between">
            <span>C# .NET 8</span>
            <span class="text-[10px] text-indigo-400 font-mono">Porta 5000</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Java 21 Spring</span>
            <span class="text-[10px] text-indigo-400 font-mono">Porta 8080</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Angular 19 Worker</span>
            <span class="text-[10px] text-emerald-400 font-mono">Thread Ativa</span>
          </div>
        </div>
      </div>

    </aside>
  `
})
export class SidebarComponent {}
