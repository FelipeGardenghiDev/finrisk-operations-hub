import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SimulationStateService } from '../../../core/services/simulation-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        
        <!-- Brand & Platform Identity -->
        <a routerLink="/" class="flex items-center gap-3 group">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div class="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <span class="text-indigo-400 font-black text-xl">F</span>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                FinRisk Operations
                <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Hub v1.0
                </span>
              </h1>
            </div>
            <p class="text-xs text-slate-400 hidden sm:block">
              .NET 8 CQRS • Java 21 Spring Boot • Angular 19 Signals
            </p>
          </div>
        </a>

        <!-- Controls: Demo Toggle & External Links -->
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Simulation Mode Badge / Switch -->
          <button
            (click)="state.toggleDemoMode()"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
            [ngClass]="state.isDemoMode() 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60' 
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'"
            title="Alternar entre modo simulação e localhost APIs">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                [ngClass]="state.isDemoMode() ? 'bg-emerald-400' : 'bg-amber-400'"></span>
              <span class="relative inline-flex rounded-full h-2 w-2"
                [ngClass]="state.isDemoMode() ? 'bg-emerald-500' : 'bg-amber-500'"></span>
            </span>
            <span class="hidden md:inline">{{ state.isDemoMode() ? 'Modo Demonstração (Vercel Cloud)' : 'Conectado a APIs Locais' }}</span>
            <span class="md:hidden">{{ state.isDemoMode() ? 'Demo Cloud' : 'APIs Locais' }}</span>
          </button>

          <!-- GitHub Source Code Link -->
          <a
            href="https://github.com/FelipeGardenghiDev"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center gap-2 text-xs font-medium">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span class="hidden sm:inline">GitHub</span>
          </a>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  state = inject(SimulationStateService);
}
