import React from 'react';
import { Package, ShoppingCart, FileText } from 'lucide-react';

type EmptyEntity = 'producto' | 'venta' | 'factura';

interface EmptyStateProps {
  entity: EmptyEntity;
  onAction?: () => void;
  actionLabel?: string;
  message?: string;
}

const entityConfig: Record<EmptyEntity, { icon: React.ReactNode; title: string; description: string }> = {
  producto: {
    icon: <Package size={40} className="text-muted-foreground" />,
    title: 'No hay productos registrados',
    description: 'Agrega medicamentos al inventario para comenzar a gestionar tu stock y realizar ventas.',
  },
  venta: {
    icon: <ShoppingCart size={40} className="text-muted-foreground" />,
    title: 'No hay ventas registradas',
    description: 'Las ventas aparecerán aquí una vez que se emitan facturas a clientes.',
  },
  factura: {
    icon: <FileText size={40} className="text-muted-foreground" />,
    title: 'No hay facturas emitidas',
    description: 'Las facturas generadas en el módulo de ventas aparecerán en este historial.',
  },
};

export default function EmptyState({ entity, onAction, actionLabel, message }: EmptyStateProps) {
  const config = entityConfig[entity];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 p-4 rounded-full bg-muted">{config.icon}</div>
      <h3 className="text-base font-semibold text-foreground mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message ?? config.description}</p>
      {onAction && actionLabel && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}