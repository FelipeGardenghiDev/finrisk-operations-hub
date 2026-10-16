import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OrdersComponent } from './features/orders/orders.component';
import { RiskCenterComponent } from './features/risk-center/risk-center.component';
import { WorkersMonitorComponent } from './features/workers-monitor/workers-monitor.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'Cockpit | FinRisk Operations Hub' },
  { path: 'orders', component: OrdersComponent, title: 'Pedidos .NET | FinRisk Operations Hub' },
  { path: 'risk', component: RiskCenterComponent, title: 'Antifraude Java | FinRisk Operations Hub' },
  { path: 'workers', component: WorkersMonitorComponent, title: 'Workers & Filas | FinRisk Operations Hub' },
  { path: 'settings', component: SettingsComponent, title: 'APIs & Config | FinRisk Operations Hub' },
  { path: '**', redirectTo: '' }
];
