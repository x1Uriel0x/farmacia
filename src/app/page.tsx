'use client';

import React from 'react';
import AppLayout from '../components/AppLayout';
import DashboardMetrics from './components/DashboardMetrics';
import DashboardAlerts from './components/DashboardAlerts';
import DashboardCharts from './components/DashboardCharts';
import DashboardActivity from './components/DashboardActivity';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Panel Principal</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
               Farmacia Central
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-success font-medium bg-success-bg px-3 py-1.5 rounded-full border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              Sistema activo
            </span>
          </div>
        </div>

        {/* Alerts */}
        <DashboardAlerts />

        {/* KPI metrics */}
        <DashboardMetrics />

        {/* Charts row */}
        <DashboardCharts />

        {/* Activity feed */}
        <DashboardActivity />
      </div>
    </AppLayout>
  );
}
