import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
      <a
        routerLink="/"
        routerLinkActive="text-indigo-400 font-semibold"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex flex-col items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1">
        <span class="text-xl">📊</span>
        <span>Cockpit</span>
      </a>

      <a
        routerLink="/orders"
        routerLinkActive="text-indigo-400 font-semibold"
        class="flex flex-col items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1">
        <span class="text-xl">📦</span>
        <span>Pedidos</span>
      </a>

      <a
        routerLink="/risk"
        routerLinkActive="text-indigo-400 font-semibold"
        class="flex flex-col items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1">
        <span class="text-xl">🛡️</span>
        <span>Antifraude</span>
      </a>

      <a
        routerLink="/workers"
        routerLinkActive="text-indigo-400 font-semibold"
        class="flex flex-col items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1">
        <span class="text-xl">⚙️</span>
        <span>Workers</span>
      </a>

      <a
        routerLink="/settings"
        routerLinkActive="text-indigo-400 font-semibold"
        class="flex flex-col items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1">
        <span class="text-xl">🔧</span>
        <span>APIs</span>
      </a>
    </nav>
  `
})
export class BottomNavComponent {}
