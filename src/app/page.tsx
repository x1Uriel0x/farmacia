'use client';

import React, { useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import DashboardMetrics from './components/DashboardMetrics';
import DashboardAlerts from './components/DashboardAlerts';
import DashboardCharts from './components/DashboardCharts';
import DashboardActivity from './components/DashboardActivity';

import { useRouter } from 'next/navigation';





export default function DashboardPage() {
  
  useEffect(() => {

    const usuario = localStorage.getItem('usuario');

    if (!usuario) {
      window.location.href = '/sign-up-login-screen';
    }

  }, []);

  const router = useRouter();

useEffect(() => {

  const usuario = localStorage.getItem('usuario');

  if (!usuario) {
    router.replace('/sign-up-login-screen');
  }

}, [router]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Panel Principal</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Domingo, 17 de mayo de 2026 — Farmacia Central
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
