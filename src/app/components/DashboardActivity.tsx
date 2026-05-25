import React from 'react';
import { ShoppingCart, Package, AlertTriangle, User } from 'lucide-react';
import Badge from '../../components/ui/Badge';

const activities = [
  {
    id: 'act-001',
    type: 'venta',
    icon: <ShoppingCart size={14} />,
    iconBg: 'bg-primary/10 text-primary',
    title: 'Factura #F-2026-0892 emitida',
    detail: 'Paracetamol 500mg × 2, Amoxicilina 500mg × 1',
    user: 'María Sánchez',
    time: 'hace 8 min',
    badge: { variant: 'facturada' as const, label: 'Facturada' },
  },
  {
    id: 'act-002',
    type: 'stock',
    icon: <AlertTriangle size={14} />,
    iconBg: 'bg-warning/10 text-warning',
    title: 'Stock bajo — Metformina 850mg',
    detail: 'Quedan 12 unidades (mínimo: 50)',
    user: 'Sistema',
    time: 'hace 22 min',
    badge: { variant: 'bajo-stock' as const, label: 'Bajo Stock' },
  },
  {
    id: 'act-003',
    type: 'venta',
    icon: <ShoppingCart size={14} />,
    iconBg: 'bg-primary/10 text-primary',
    title: 'Factura #F-2026-0891 emitida',
    detail: 'Losartán 50mg × 3, Atorvastatina 20mg × 1',
    user: 'Carlos Mendoza',
    time: 'hace 35 min',
    badge: { variant: 'facturada' as const, label: 'Facturada' },
  },
  {
    id: 'act-004',
    type: 'inventario',
    icon: <Package size={14} />,
    iconBg: 'bg-success/10 text-success',
    title: 'Ingreso de stock — Ibuprofeno 400mg',
    detail: '200 unidades agregadas — Lote L2026-441',
    user: 'Admin Farmacia',
    time: 'hace 1h 12min',
    badge: { variant: 'disponible' as const, label: 'Disponible' },
  },
  {
    id: 'act-005',
    type: 'usuario',
    icon: <User size={14} />,
    iconBg: 'bg-info/10 text-info',
    title: 'Nuevo usuario registrado',
    detail: 'Ana Torres — Rol: Vendedor',
    user: 'Admin Farmacia',
    time: 'hace 2h 45min',
    badge: { variant: 'vendedor' as const, label: 'Vendedor' },
  },
];

export default function DashboardActivity() {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="section-header">Actividad Reciente</h2>
        <span className="text-xs text-muted-foreground">Actualizado hace 2 min</span>
      </div>
      <div className="divide-y divide-border">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
            <div className={`p-2 rounded-lg flex-shrink-0 ${item.iconBg}`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <Badge variant={item.badge.variant} label={item.badge.label} />
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Por <span className="font-medium text-foreground">{item.user}</span> · {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}