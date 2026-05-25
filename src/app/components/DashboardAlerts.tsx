import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';

const alerts = [
  {
    id: 'alert-low-stock',
    type: 'warning' as const,
    icon: <AlertTriangle size={15} />,
    message: '3 medicamentos están bajo el stock mínimo',
    action: 'Ver inventario',
    href: '/inventory-management',
  },
  {
    id: 'alert-expiry',
    type: 'danger' as const,
    icon: <Clock size={15} />,
    message: '2 lotes vencen en los próximos 15 días',
    action: 'Revisar',
    href: '/inventory-management',
  },
];

export default function DashboardAlerts() {
  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${
            alert.type === 'warning' ?'bg-warning-bg border-warning/30 text-warning' :'bg-danger-bg border-danger/30 text-danger'
          }`}
        >
          {alert.icon}
          <span className="flex-1">{alert.message}</span>
          <Link
            href={alert.href}
            className="flex items-center gap-1 text-xs underline underline-offset-2 hover:no-underline"
          >
            {alert.action}
            <ArrowRight size={12} />
          </Link>
        </div>
      ))}
    </div>
  );
}